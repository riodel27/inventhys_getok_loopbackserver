'use strict';

const axios = require('axios')

module.exports = function (Getokuser) {

  Getokuser.observe('before save', function (ctx, next) {
    // console.log('Before save/post/create: ',ctx.instance)
    // console.log('Before save/post/create is new instance?: ',ctx.isNewInstance)
    next();
  })


  Getokuser.observe('after save', function (ctx, next) {
    // console.log('After save/post/create: ',ctx.instance)
    // console.log('After save/post/create is new instance?: ',ctx.isNewInstance)
    // prod URL:  http://35.204.244.39/api/Containers
    if (ctx.isNewInstance) {
      let userId = ctx.instance.id
      axios({
        method: 'post',
        url: 'http://localhost:3000/api/Containers',
        data: {
          name: `pics-${userId}`
        }
      }).then(function (response) {
        console.log('Create storage folder response: ', response.status)
      }).catch(function (error) {
        console.log('Create storage folder error: ', error)
      })

    } else {
      console.log('Do nothing')
    }

    next();
  })


  Getokuser.userInformation = function (id, cb) {
    console.log('ID: ', id)
    Getokuser.findOne({
      where: {
        id: id
      }
    }, function (err, user) {

      let userInfo = {
        username: user.username,
        firtName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phoneNumber: user.phoneNumber
      }
      cb(null, userInfo)
    })
  }

  Getokuser.userParameters = function (id, cb) {
    console.log('ID: ', id)
    Getokuser.findOne({
      where: {
        id: id
      }
    }, function (err, user) {

      let userParameters = {
        username: user.username,
        picture: user.picture,
        isAnonymous: user.isAnonymous,
        duration: user.validationDuration,
        timeBeforeLock: user.timeBeforeLock,
        settings: user.settings,
        notifications: user.isAllowPushNotifications
      }
      cb(null, userParameters)
    })
  }

  // data updated should always have the user id included in the updated object data to perform modify or update.
  Getokuser.modifyUser = (userId, bodyData, cb) => {
    console.log('user ID: ', userId)
    console.log('Body data: ', bodyData)


    // Is this where I should handle the fs writing of the image?
    // Then provide the directory path in to the GetOkUser Model.

    // picture property = 

    //body format
    /*
    {
      "username": "UPDATED TEST ONE AGAIN",
      "firstName": "bla bla",
       ...
    }
    */

    Getokuser.update({
      "id": userId
    }, bodyData, function (err, result) {
      if (err) {
        console.log('Error result: ', err)
      }
      console.log('Success result: ', result)
      cb(null, {
        "status": 200
      })
    })
  }

  Getokuser.remoteMethod('userInformation', {
    accepts: {
      arg: 'id',
      type: 'string',
      required: true
    },
    http: {
      path: '/userinformation/:id',
      verb: 'get'
    },
    returns: {
      arg: 'userInformation',
      type: 'Object'
    }
  })

  Getokuser.remoteMethod('userParameters', {
    accepts: {
      arg: 'id',
      type: 'string',
      required: true
    },
    http: {
      path: '/userParameters/:id',
      verb: 'get'
    },
    returns: {
      arg: 'userParameters',
      type: 'Object'
    }
  })

  // sample api : localhost:3000/api/getOkUsers/modifyUser/5b7d386c7747483aa004909e?access_token=TlYTlHoXvFPqyvxMlFfgFE53nwgzd9wJI82J85jGjfvS2KDfSeayaHY2j046gre2
  Getokuser.remoteMethod('modifyUser', {
    accepts: [{
        arg: 'id',
        type: 'string',
        required: true
      },
      {
        arg: 'body',
        type: 'object',
        required: true,
        http: {
          source: 'body'
        }
      }
    ],
    http: {
      path: '/modifyUser/:id',
      verb: 'put'
    },
    returns: {
      arg: 'response',
      type: 'Object'
    }
  })



  // partial summary when updating  user parameters on mobile app
  // specifically on picture
  // 1. POST/when there is a picture to upload. API : localhost:3000/api/Containers/`pics-${userId}`/upload then image body(form-data), select file 
  // 2. PUT/Update user info with json data. API : localhost:3000/api/getOkUsers/modifyUser/5b7d386c7747483aa004909e?access_token=TlYTlHoXvFPqyvxMlFfgFE53nwgzd9wJI82J85jGjfvS2KDfSeayaHY2j046gre2  then body {"username":"string", "picture":"image picture that have been uploaded earlier", ...}


  // 1. When there is no picture to upload, then presumably in the JSON data, there will be no  picture filled in the picture property
  // 2. PUT/Update user info with json data. API : localhost:3000/api/getOkUsers/modifyUser/5b7d386c7747483aa004909e?access_token=TlYTlHoXvFPqyvxMlFfgFE53nwgzd9wJI82J85jGjfvS2KDfSeayaHY2j046gre2  then body {"username":"string", ...}



  // getting the user infor including the picture
  // download user info/parameters:  35.204.244.39/api/getOkUsers/userparameters/5b7d3f1f18f78e1396cc32aa?access_token=C4jUNthKyA3ytdFtSJ2flZDpmtjUJcVJJruqAYYpeJqAAcn9ergHH5tQNmzvCeKi
  // image download api: http://localhost:3000/api/Containers/`pics-${userId}`/download/${userparameters.picture}



  // 9/3/2018
  // this might not be needed
  //GET contact information API : localhost:3000/api/getOkUsers/getcontactinformation/{"contactUserId":"312312312"}/5b7d386c7747483aa004909e?access_token=NY4CDHzyBdNhOFmc5qXBcsQSylvA3zhBECmfT4DeS6gzdcU72SewOZDlIU43xmFb
  // format: localhost:3000/api/getOkUsers/getcontactinformation/${contact object data parameter}/${userId}?access_token=...
  Getokuser.getContactInformation = (userId, data) => {
    return new Promise((resolve, reject) => {
      console.log('user id: ', userId)
      console.log('data parameter: ', data.contactUserId)




      resolve(data)
    })
  }

  Getokuser.remoteMethod('getContactInformation', {
    accepts: [{
      arg: 'id',
      type: 'string',
      required: true
    }, {
      arg: 'data',
      type: 'object',
      required: true
    }],
    http: {
      path: '/getcontactinformation/:data/:id',
      verb: 'get'
    },
    returns: {
      arg: 'response',
      type: 'Object'
    }
  })

  // 9/3/2018
  // Add contacts API for get-ok-users
  // localhost:3000/api/getOkUsers/addContact/5b8cebdb61d8e52260a59881?access_token=q24BsPisiDip0NK5CS2gJOrpjUFQIqAJKRhsRdlgG9sTPIzEU1yyGV0WJ8GXW9vG
  // format: localhost:3000/api/getOkUsers/addContact/${userId}?access_token=${}
  // body parameter
  /*
  {
    "phoneNumber":"two"
  }
  */
  Getokuser.addContact = (userId, data) => {
    return new Promise(async (res, rej) => {
      try {
        console.log('user id: ', userId)
        console.log('phone number: ', data.phoneNumber)

        // find the user that matches the phone number
        const userMatchedPhoneNumber = await Getokuser.findOne({
          where: {
            phoneNumber: data.phoneNumber
          },
        });
        // find the user that initiate the add contact
        const user = await Getokuser.findOne({
          where: {
            id: userId
          }
        });
        //get the list of contacts
        let currentContacts = user.contacts;
        // pushes the new contact to the list of user contacts
        const contacts = currentContacts.concat({
          userId: userMatchedPhoneNumber.id,
        });
        // update the user contacts in the DB
        const updatedUserWithNewContacts = await Getokuser.update({
          id: userId
        }, {
          contacts: contacts
        });

        console.log(
          'updated user with new contact: ',
          updatedUserWithNewContacts
        );
        // success updating the contacts DB
        res(updatedUserWithNewContacts)
      } catch (error) {
        console.log('Error adding contacts: ', error);
        rej(error)
      }
    })
  }


  Getokuser.remoteMethod('addContact', {
    accepts: [{
        arg: 'id',
        type: 'string',
        required: true
      },
      {
        arg: 'data',
        type: 'object',
        required: true,
        http: {
          source: 'body'
        }
      }
    ],
    http: {
      path: '/addContact/:id',
      verb: 'post'
    },
    returns: {
      arg: 'response',
      type: 'Object'
    }
  })

  /*
    9/5/2018 - API GET all contact public information [username, photo]
    localhost:3000/api/getOkUsers/getallcontacts/5b8cebdb61d8e52260a59881?access_token=nNJHElKxKtFddBq3zMu1hAtdWKjFlQl4yYo7DAa13kkL3g76dAkG09iJADflccUf
    localhost:3000/api/getOkUsers/getallcontacts/${user id}?access_token=${token}
    - api get list of contacts
    - ex:
     [ 
       {
         photo
         username
       },
       {
         photo
         username
       },
       {
         photo
         username
       }
     ]

     // There should be another API provided for the mobile app to download the images from the loopback container
  */
  Getokuser.getAllContacts = (id) => {
    return new Promise(async (res, rej) => {
      console.log('user id: ', id)
      try {
        const user = await Getokuser.findOne({
          where: {
            id: id
          }
        })

        // console.log('user: ', JSON.stringify(user,undefined,2))
        const contacts = user.contacts

        let contactsPublicInformation = await Promise.all(contacts.map(async (contact) => {
          const contactUserId = contact.userId
          const contactInfo = await Getokuser.findOne({
            where: {
              id: contactUserId
            }
          })

          return {
            id: contactInfo.id,
            username: contactInfo.username,
            photo: contactInfo.picture,
            inTheContactSince: contact.inTheContactSince
          }
        }))

        console.log('contacts public information: ', JSON.stringify(contactsPublicInformation, undefined, 2))

        res(contactsPublicInformation)
      } catch (error) {
        console.log('error getting all list public information, pic , uname...')
        rej(error)
      }
    })
  }
  Getokuser.remoteMethod('getAllContacts', {
    accepts: {
      arg: 'id',
      type: 'string',
      required: true
    },
    http: {
      path: '/getallcontacts/:id',
      verb: 'get'
    },
    returns: {
      arg: 'response',
      type: 'Object'
    }
  })


  /*
    9/6/2018
    - API GET user(1) public information. username, picture,isAnonymous,validation duration,settings,in the contact since
    - localhost:3000/api/getOkUsers/getusercontactinformation/5b852062ee0c87427cc3ebc9/5b8cebdb61d8e52260a59881?access_token=sMyDESRNU5bwnp0ov8rzHkEIAMg3xlBKHNhMdufW26yheZsRGVV0iX8hOzi8Mazf
    - localhost:3000/api/getOkUsers/getusercontactinformation/${user contact id}/${user id}?access_token=${token}
  */

  Getokuser.getUserPublicInformation = (id, userContactId) => {
    return new Promise(async (res, rej) => {
      console.log('user id: ', id)
      console.log('user contact id: ', userContactId)

      try {
        // find user contact id public information
        const userContact = await Getokuser.findOne({
          where: {
            id: userContactId
          }
        })

        const user = await Getokuser.findOne({
          where: {
            id: id
          }
        })

        const userContacts = user.contacts
        const getContactMatchingUserContactId = userContacts.filter(contact => contact.userId.toString() === userContactId.toString())
        const [userContactInfo] = getContactMatchingUserContactId
        const {
          inTheContactSince
        } = userContactInfo

        const {
          username,
          picture,
          isAnonymous,
          validationDuration,
          settings,
          id: userId
        } = userContact

        const userContactPublicInformation = {
          id: userId,
          username,
          picture,
          isAnonymous,
          validationDuration,
          settings,
          inTheContactSince
        }

        console.log('user contact public information: ', userContactPublicInformation)

        res(userContactPublicInformation)
      } catch (error) {
        console.log('error getting user contact public information: ', error)
        rej(error)
      }
    })
  }
  Getokuser.remoteMethod('getUserPublicInformation', {
    accepts: [{
      arg: 'id',
      type: 'string',
      required: true
    }, {
      arg: 'userContactId',
      type: 'string',
      required: true
    }],
    http: {
      path: '/getusercontactinformation/:userContactId/:id',
      verb: 'get'
    },
    returns: {
      arg: 'response',
      type: 'Object'
    }
  })
};
