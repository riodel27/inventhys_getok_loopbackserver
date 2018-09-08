'use strict';

/**IMPLEMENT ACL security layer later on */

const moment = require('moment');
var Timer = require('easytimer.js');
const app = require('../../server/server');
module.exports = function(Request) {
  const axios = require('axios');
  //Custom endpoints to get all requests, incoming or outgoing for every user.

  Request.GetAllRequests = id => {
    return new Promise(async (res, rej) => {
      try {
        const getOkUser = app.models.getOkUser;

        let requests = await Request.find({
          where: {
            or: [
              {
                requestorUserId: id,
              },
              {
                recepientUserId: id,
              },
            ],
          },
        });

        const allRequests = await Promise.all(
          requests.map(async req => {
            const requestDetails = await Request.findOne({
              where: {
                id: req.id,
              },
            });

            const recepient = await getOkUser.findOne({
              where: {
                id: req.recepientUserId,
              },
            });

            const requestor = await getOkUser.findOne({
              where: {
                id: req.requestorUserId,
              },
            });

            // this condition will know if the current user logged in is the requestor, means it is an outgoing request
            if (id === req.requestorUserId.toString()) {
              // This means that the current user logged in is the requestor of the request. Means an outgoing request
              const contacts = requestor.contacts;
              const isContactPresent = contacts.filter(
                con => con.userId.toString() === req.recepientUserId.toString()
              );
              let inTheContactSince =
                isContactPresent <= 0
                  ? 'Not yet in the contacts'
                  : isContactPresent[0].inTheContactSince;

              return {
                status: req.status,
                requestMethod: 'Outgoing',
                userId: req.recepientUserId,
                // recepientUserId: req.recepientUserId,
                username: req.recepientUserName,
                photo: recepient.picture,
                requestId: req.id,
                requestDetails,
                inTheContactSince,
              };
            } else {
              // This means that the current user logged in is the recepient of the request. Means an incoming request
              const contacts = recepient.contacts;
              const isContactPresent = contacts.filter(
                con => con.userId.toString() === req.requestorUserId.toString()
              );
              let inTheContactSince =
                isContactPresent <= 0
                  ? 'Not yet in the contacts'
                  : isContactPresent[0].inTheContactSince;

              return {
                status: req.status,
                requestMethod: 'Incoming',
                userId: req.requestorUserId,
                // requestorUserId: req.requestorUserId,
                username: req.requestorUserName,
                photo: requestor.picture,
                requestId: req.id,
                requestDetails,
                inTheContactSince,
              };
            }
          })
        );

        // console.log('requests: ', JSON.stringify(allRequests, undefined, 2))
        res(allRequests);
      } catch (error) {
        console.log('error getting all requests: ', error);
        rej(error);
      }
    });
  };

  // this has no acl security layer yet
  // API endpoints : localhost:3000/api/Requests/getallrequests/${userID}
  Request.remoteMethod('GetAllRequests', {
    accepts: {
      arg: 'id',
      type: 'string',
      required: true,
    },
    http: {
      path: '/getallrequests/:id',
      verb: 'get',
    },
    returns: {
      arg: 'response',
      type: 'Object',
    },
  });

  /*
  	IMPORTANT
  	I think this is not here. Since by default adding a new request is pending
  	Then it should be a custom end point API when performig update, means the recepeint already approved/validated the request
  	That's when the timer will start for the count down
  	transfer later on.\
  */
  Request.observe('after save', function(ctx, next) {
    // console.log('After save/post/create: ', ctx.instance)
    // console.log('After save/post/create is new instance?: ', ctx.isNewInstance)

    if (ctx.isNewInstance) {
      console.log('new request addded');
      console.log('after save if ctx is new instance to true');
      // console.log('ctx: ', ctx.instance)
      // console.log('ctx: ', ctx)
    } else {
      console.log('after save if ctx is new instance to false');
      // if it's not a new instance, then presumably it's an UPDATE request.
      // console.log('ctx data: ', ctx.data)
      // console.log('ctx where: ', ctx.where)

      // 9/8/2018 -> this timer should stop if it will be modifed.

      // forget this whole timer
      // just have a background process to get the request every minute
      // then check those request if there is already a requeset way past the valid until date
      // if there is change the status to expired

      // maybe recursion?
      /*
      let timer = new Timer();

      let currentTimeStamp = moment().unix();
      let requestValidDateTimeStamp = moment(ctx.data.validUntil).unix();

      timer.start({
        precision: 'seconds',
        startValues: {
          seconds: currentTimeStamp,
        },
        target: {
          seconds: requestValidDateTimeStamp,
        },
      });

      timer.addEventListener('secondsUpdated', function(e) {
        console.log(
          `TIMER (user id): ${
            ctx.where.id
          }: ${timer.getTimeValues().toString()}`
        );

        // constant checked on database
        // and see if something has been modified on this request timer
        // ctx.where.id = request id
        console.log('ctx data: ', JSON.stringify(ctx.data, undefined, 2));
        console.log('ctx where: ', JSON.stringify(ctx.where, undefined, 2));

        // findOne = request id
        // if(!true) - stop timer

        Request.findOne(
          {
            where: {
              id: ctx.where.id,
            },
          },
          (err, res) => {
            if (err) {
              console.log('request has been modified, sto stop this timer!!!');
              timer.stop();
            }
            console.log('request is still not modified');
          }
        );
      });

      timer.addEventListener('targetAchieved', function(e) {
        console.log(`TIMER (user id) complete: ${ctx.where.id}`);
        // when server is running and some of the request here meets the date valid,change the status to expired

        Request.update(
          {
            id: ctx.where.id,
          },
          {
            status: 'Expired',
          },
          (err, res) => {
            if (err) {
              console.log('error updating status to expired');
            } else {
              console.log(
                `change status of request id: ${
                  ctx.where.id
                } to expired -> ${res}`
              );
            }
          }
        );
      });
      */
    }
    next();
  });

  /*
  	 9/4/2018 - POST API
  	 custom API endpoint for send/post new request (using phone number : means it is not in the contacts)
  	 localhost:3000/api/Requests/sendrequest/5b852062ee0c87427cc3ebc9
  	 localhost:3000/api/Requests/sendrequest/${requestor user id}

  	 body param(send):
  		{
  			"isAnonymous":true,
  			"validationDuration":{
  						"days" : 0,
  						"hours" : 0,
  						"minutes" : 2
  				},
          "phoneNumber":"Seven"
          or
          "userId": ...
      }

      body param(modify)
      {
        "isAnonymous": true,
        "validationDuration": {
        	"days":2,
        	"hours":2,
        	"minutes":2
        },
        "settings":[
        		{
        			"settingName":"One",
        			"settingValue":true
        		},
        		{
        			"settingName":"Two",
        			"settingValue":true
        		}
        	],
        "requestId":"5b93c481aabc3035d413e20d",
        "inTheContactSince":"2018-09-08T18:58:13+08:00"
      }
  */
  Request.SendRequest = (id, body) => {
    const getOkUser = app.models.getOkUser;
    const history = app.models.History;
    const userInitiatorId = id;
    return new Promise(async (res, rej) => {
      try {
        if (body.hasOwnProperty('requestId')) {
          // This is the modify request function

          const requestor = await getOkUser.findOne({
            where: {
              id: userInitiatorId,
            },
          });

          const modifiedRequest = await Request.findOne({
            where: {
              id: body.requestId,
            },
          });

          const userIdsInvolved = [
            modifiedRequest.requestorUserId.toString(),
            modifiedRequest.recepientUserId.toString(),
          ];

          const setRecepientId = userIdsInvolved.filter(
            id => id.toString() !== requestor.id.toString()
          );

          const recepient = await getOkUser.findOne({
            where: {
              id: setRecepientId[0],
            },
          });

          const newRequestData = {
            requestorUserId: requestor.id,
            requestorUserName: requestor.username,
            recepientUserId: recepient.id,
            recepientUserName: recepient.username,
            isAnonymous: body.isAnonymous,
            validationDuration: body.validationDuration,
            dateMake: moment().format(),
            settings: body.settings,
            status: 'Pending',
          };

          const postNewRequest = await Request.create(newRequestData);

          const modifiedRequestData = {
            historyStatus: 'Modified',
            dateArchived: moment().format(),
            details: {
              data: modifiedRequest,
            },
          };

          const archiveModifiedRequest = await history.create(
            modifiedRequestData
          );

          const removeModifiedRequest = await Request.destroyById(
            body.requestId
          );

          const archiveNewRequestData = {
            historyStatus: 'Pending',
            dateArchived: moment().format(),
            details: {
              data: postNewRequest,
            },
          };
          const archiveNewRequestResult = await history.create(
            archiveNewRequestData
          );

          res('Success sending request!');
        } else {
          // means this is a send new request and NOT modify request

          const isGetOkUserByPhoneNumber = await getOkUser.findOne({
            where: {
              phoneNumber: body.phoneNumber,
            },
          });

          const isGetOkUserByUserId = await getOkUser.findOne({
            where: {
              id: body.userId,
            },
          });

          const requestor = await getOkUser.findOne({
            where: {
              id: userInitiatorId,
            },
          });

          if (body.hasOwnProperty('phoneNumber')) {
            const recepient = isGetOkUserByPhoneNumber;
            if (isGetOkUserByPhoneNumber) {
              // phone number provided is an existing get ok user account
              const recepientContacts = recepient.contacts;
              const contactMatchingUserInitiatorId = recepientContacts.filter(
                contact =>
                  contact.userId.toString() === userInitiatorId.toString()
              );

              const isExistingContact = contactMatchingUserInitiatorId.length
                ? true
                : false;

              if (!isExistingContact) {
                // not an existing contact
                const contacts = [
                  {
                    userId: userInitiatorId,
                    inTheContactSince: moment().format(),
                    status: 'active',
                  },
                  ...recepientContacts,
                ];

                const updateContactList = await getOkUser.update(
                  {
                    id: recepient.id,
                  },
                  {
                    contacts: contacts,
                  }
                );

                const requestorContacts = requestor.contacts;
                const contactMatchingRecepientId = requestorContacts.filter(
                  contact =>
                    contact.userId.toString() === recepient.id.toString()
                );

                const isExistingOnRequestorContacts = contactMatchingRecepientId.length
                  ? true
                  : false;

                if (!isExistingOnRequestorContacts) {
                  const contacts = [
                    {
                      userId: recepient.id,
                      inTheContactSince: moment().format(),
                      status: 'active',
                    },
                    ...requestorContacts,
                  ];

                  const updateContactList = await getOkUser.update(
                    {
                      id: userInitiatorId,
                    },
                    {
                      contacts: contacts,
                    }
                  );
                }
              }
            } else {
              throw new Error(
                'Phone number provided is not a registered get ok user'
              );
            }

            const RequestToSave = {
              requestorUserId: requestor.id,
              requestorUserName: requestor.username,
              recepientUserId: recepient.id,
              recepientUserName: recepient.username,
              isAnonymous: body.isAnonymous,
              validationDuration: body.validationDuration,
              dateMake: moment().format(),
              settings: body.settings,
              status: 'Pending',
            };
            const postRequest = await Request.create(RequestToSave);
            const archiveNewRequest = {
              historyStatus: 'Pending',
              dateArchived: moment().format(),
              details: {
                data: postRequest,
              },
            };
            const archiveResult = await history.create(archiveNewRequest);
            res('Success sending request');
          } else {
            const recepient = isGetOkUserByUserId;
            const RequestToSave = {
              requestorUserId: requestor.id,
              requestorUserName: requestor.username,
              recepientUserId: recepient.id,
              recepientUserName: recepient.username,
              isAnonymous: body.isAnonymous,
              validationDuration: body.validationDuration,
              dateMake: moment().format(),
              settings: body.settings,
              status: 'Pending',
            };
            const createRequestResponse = await Request.create(RequestToSave);
            const archiveNewRequest = {
              historyStatus: 'Pending',
              dateArchived: moment().format(),
              details: {
                data: createRequestResponse,
              },
            };
            const archiveResult = await history.create(archiveNewRequest);
            res('Success sending request');
          }
        }
      } catch (error) {
        console.log(error);
        rej(error);
      }
    });
  };

  Request.remoteMethod('SendRequest', {
    accepts: [
      {
        arg: 'id',
        type: 'string',
        required: true,
      },
      {
        arg: 'body',
        type: 'object',
        required: true,
        http: {
          source: 'body',
        },
      },
    ],
    http: {
      path: '/sendrequest/:id',
      verb: 'post',
    },
    returns: {
      arg: 'response',
      type: 'Object',
    },
  });

  /*
  	9/5/2018 - PUT API
  	localhost:3000/api/Requests/isapproverequest/5b8cebdb61d8e52260a59881
  	localhost:3000/api/Requests/isapproverequest/${user id}
  	body param: 
  	
  	{
  		"ans":true,
  		"requestId":"5b8e70b94dc4ec3d28b3cc85"
  	}
  	
  	PUT -> update status if recepient accepted request
  	PUT -> update status if I(is the recepient) accepted a request
  */
  Request.isApproveRequest = (initiatorId, body) => {
    console.log('user id: ', initiatorId);
    console.log('body arg: ', body);
    const getOkUser = app.models.getOkUser;
    const history = app.models.History;
    return new Promise(async (res, rej) => {
      try {
        if (body.ans) {
          // means accpet(valid)

          const matchingRequest = await Request.findOne({
            where: {
              id: body.requestId,
            },
          });

          const requestorId = matchingRequest.requestorUserId;

          const recepient = await getOkUser.findOne({
            where: {
              id: initiatorId,
            },
          });

          const requestor = await getOkUser.findOne({
            where: {
              id: requestorId,
            },
          });

          const updateRequestResponse = await Request.update(
            {
              id: body.requestId,
            },
            {
              status: 'valid',
              validated: moment().format(),
              validUntil: moment()
                .add(matchingRequest.validationDuration)
                .format(),
            }
          );

          const updatedRequest = await Request.findOne({
            where: {
              id: body.requestId,
            },
          });

          // store to history
          const archiveUpdatedRequestData = {
            historyStatus: 'validated',
            dateArchived: moment().format(),
            details: {
              data: updatedRequest,
            },
          };

          const archiveUpdatedRequestResponse = await history.create(
            archiveUpdatedRequestData
          );

          console.log(
            'archive update request response: ',
            JSON.stringify(archiveUpdatedRequestResponse, undefined, 2)
          );

          res('Request Validated!');
        } else {
          // means denied
          console.log('denied request');
          const updateRequest = await Request.update(
            {
              id: body.requestId,
            },
            {
              status: 'declined',
            }
          );
          console.log(
            'update request to declined: ',
            JSON.stringify(updateRequest, undefined, 2)
          );

          const updatedRequest = await Request.findOne({
            where: {
              id: body.requestId,
            },
          });

          const archiveUpdatedRequestData = {
            historyStatus: 'declined',
            dateArchived: moment().format(),
            details: {
              data: updatedRequest,
            },
          };
          const archiveUpdatedRequestResponse = await history.create(
            archiveUpdatedRequestData
          );
          console.log(
            'archive updated denied request response: ',
            JSON.stringify(archiveUpdatedRequestResponse, undefined, 2)
          );

          const removeDeclinedRequestResponse = await Request.destroyById(
            body.requestId
          );

          console.log(
            'remove declines request response: ',
            JSON.stringify(removeDeclinedRequestResponse, undefined, 2)
          );

          res(updateRequest);
        }
      } catch (error) {
        console.log(error);
        rej(error);
      }
    });
  };

  /*
  arguments will be user id(logged in) 
  body arguments: answer(true | false), request id
  update status base on boolean answer
  */
  Request.remoteMethod('isApproveRequest', {
    accepts: [
      {
        arg: 'id',
        type: 'string',
        required: true,
      },
      {
        arg: 'body',
        type: 'object',
        required: true,
        http: {
          source: 'body',
        },
      },
    ],
    http: {
      path: '/isapproverequest/:id',
      verb: 'put',
    },
    returns: {
      arg: 'requests',
      type: 'Object',
    },
  });

  /**
   * API POST create new request. If modify request is initiated from the mobile application. Which means that the modified(id) request will be moved in to the History and then create a new request.
   * Modify Request
   * Pending
   * Valid
   * Declined
   * Expired
   *
   *
   */

  /**
   * 9/7/2018
   * API GET for all history - localhost:3000/api/Requests/getallhistory/5b910e8837b0c7412099dfd5
   *                           localhost:3000/api/Requests/getallhistory/${user id}
   * API GET for certain history information
   * [
   * {
   *  photo,
   *  username
   * },
   * {
   * photo,
   * username
   * }
   * ]
   */

  // MOVE THIS TO history.js model
  Request.getAllHistory = id => {
    const getOkUser = app.models.getOkUser;
    const history = app.models.History;
    console.log('user id: ', id);

    return new Promise(async (res, rej) => {
      // steps
      // 1. populate list of history that involved the user id : incoming or outgoing
      const allhistory = await history.find();
      //console.log('history: ', JSON.stringify(allhistory,undefined,2))
      //const formatHistory = allhistory.map((item) => item.details.data)
      const historyById = allhistory.filter(
        history =>
          history.details.data.requestorUserId.toString() === id.toString() ||
          history.details.data.recepientUserId.toString() === id.toString()
      );
      // console.log('history by id: ', JSON.stringify(historyById,undefined,2))
      console.log('history by id length: ', historyById.length);

      const historyListByUserId = await Promise.all(
        historyById.map(async history => {
          // 1 requestor
          const requestor = await getOkUser.findOne({
            where: {
              id: history.details.data.requestorUserId,
            },
          });

          // 2 recepient
          const recepient = await getOkUser.findOne({
            where: {
              id: history.details.data.recepientUserId,
            },
          });

          if (id === history.details.data.requestorUserId.toString()) {
            // this means that the current user logged in is the requestor, means it is an outgoing request
            const contacts = requestor.contacts;
            const isContactPresent = contacts.filter(
              con =>
                con.userId.toString() ===
                history.details.data.recepientUserId.toString()
            );
            const inTheContactSince =
              isContactPresent.length <= 0
                ? 'Not yet in the contacts'
                : isContactPresent[0].inTheContactSince;

            return {
              status: history.historyStatus,
              requestMethod: 'Outgoing',
              userId: history.details.data.recepientUserId,
              username: history.details.data.recepientUserName,
              photo: recepient.picture,
              requestId: history.details.data.id,
              requestDetails: history.details.data,
              inTheContactSince,
            };
          } else {
            // this means that the current user logged in is the recepient of the request, means an incoming request
            const contacts = recepient.contacts;
            const isContactPresent = contacts.filter(
              con =>
                con.userId.toString() ===
                history.details.data.requestorUserId.toString()
            );
            let inTheContactSince =
              isContactPresent.length <= 0
                ? 'Not yet in the contacts'
                : isContactPresent[0].inTheContactSince;

            return {
              status: history.historyStatus,
              requestMethod: 'Incoming',
              userId: history.details.data.requestorUserId,
              // requestorUserId: req.requestorUserId,
              username: history.details.data.requestorUserName,
              photo: requestor.picture,
              requestId: history.details.data.id,
              requestDetails: history.details.data,
              inTheContactSince,
            };
          }
        })
      );

      console.log(
        'history lists: ',
        JSON.stringify(historyListByUserId, undefined, 2)
      );
      res(historyListByUserId);
    });
  };

  Request.remoteMethod('getAllHistory', {
    accepts: {
      arg: 'id',
      type: 'string',
      required: true,
    },
    http: {
      path: '/getallhistory/:id',
      verb: 'get',
    },
    returns: {
      arg: 'response',
      type: 'Object',
    },
  });
};
