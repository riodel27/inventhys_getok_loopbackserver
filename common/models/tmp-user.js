'use strict';

module.exports = function (Tmpuser) {
  // Tmpuser.modifyUser = (updatedData,bodyData, cb) => {
  //   console.log('dataxxx: ', updatedData)
  //   console.log('Body data: ', bodyData)
  //   let userId = updatedData.userId
  //   console.log('user ID: ', userId)

  //     Tmpuser.update({
  //     "id": "5b84fee2ea5c6e3cc0a38553"
  //   }, {
  //       "username": "UPDATED TEST ONE AGAIN",
  //       "firstName": "bla bla"
  //   },function(err,result){
  //     if(err) {
  //       console.log('Error result: ', err)
  //     }
  //      console.log('Success result: ',result)
  //   })

  //   cb(null, {
  //     "test": "test"
  //   })
  // }

  // Tmpuser.remoteMethod('modifyUser', {
  //   accepts: [ 
  //     {
  //       arg: 'id',
  //       type: 'string',
  //       required: true
  //     },
  //     {
  //       arg: 'body',
  //       type: 'object',
  //       required: true,
  //       http:{
  //         source:'body'
  //       }
  //     }
  //   ],
  //   http: {
  //     path: '/modifyUser/:id',
  //     verb: 'put'
  //   },
  //   returns: {
  //     arg: 'userAllInformation',
  //     type: 'Object'
  //   }
  // })


  // Add Contact
  // 1. find match number
  // 2. Add key value pair of user in to the contacts of the user.
  // custom end points to receive the userId and the phone number to be added as contacts

  Tmpuser.addContact = async (userId, data, cb) => {
    console.log('user id: ', userId)
    console.log('phone number: ', data.phoneNumber)

    // find phone number in all users

    try {
      // find the user that matches the phone number
      const userMatchedPhoneNumber = await Tmpuser.findOne({
        where: {
          phoneNumber: data.phoneNumber
        },
      });
      // find the user that initiate the add contact
      const user = await Tmpuser.findOne({
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
      const updatedUserWithNewContacts = await Tmpuser.update({
        id: userId
      }, {
        contacts: contacts
      });

      console.log(
        'updated user with new contact: ',
        updatedUserWithNewContacts
      );
      // success updating the contacts DB
      cb(null, updatedUserWithNewContacts);
    } catch (error) {
      console.log('Error adding contacts: ', error);
      cb(error, null);
    }
  }

  Tmpuser.remoteMethod('addContact', {
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


  // Additional custom API[GET]: return a user that is matched with the phone number wanted to add as a contact

  // custom API[POST] : 



  // 9/3/2018 - GET API to Obtain information about a contact (public ex: username, photo) - request data should be the user/contact ID
  Tmpuser.getContactInformation = (userId,data) => {
    return new Promise((resolve,reject) => {
      console.log('user id: ', userId)
      console.log('data parameter: ', data.contactUserId)

      // find the contact user id
      // return contact public info ex. username, photo

      // from the react native. There will be two api
      // 1 API is to get the client info such us username, photo(name)...
      // 2 API is download the photo from the container and with the user of the photo(name) from the first API.
      resolve(data)
    })
  }


  Tmpuser.remoteMethod('getContactInformation',{
    accepts:[
      {
        arg:'id',
        type:'string',
        required:true
      },{
        arg:'data',
        type:'object',
        required:true
      }
    ],
    http:{
      path:'/getcontactinformation/:data/:id',
      verb:'get'
    },
    returns:{
      arg:'response',
      type:'Object'
    }
  })


  // 9/3/2018 - GET list of all contacts
  Tmpuser.getAllContactsInformation = (id) => {
    return new Promise((res,rej) => { 
      console.log('user id', id)
      // perform find all contacts of user id
      // perform another find of individual contacts user id, that returns their individual public information
      // return the list of contact public information
      res(id)
    })
  }

  Tmpuser.remoteMethod('getAllContactsInformation',{
    accepts:{
      arg:'id',
      type:'string',
      required:true
    },
    http:{
      path:'/getlistofcontacts/:id',
      verb:'get'
    },
    returns:{
      arg:'response',
      type:'Object'
    }
  })

};
