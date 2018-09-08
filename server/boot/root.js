'use strict';


module.exports = function (server) {
  // Install a `/` route that returns server status
  var router = server.loopback.Router();
  router.get('/', server.loopback.status());
  server.use(router);


  console.log('here 001')

  // 9/3/2018
  // at boot that will get all the request
  // check for pending and valid requests
  // countdown timer on every request
  // then when countdown finish, update the certain request status to expired
  //


  // or I think much easier is
  // async await setTimeout or Interval
  // then perform check on Request to match if valid until date has already passed the current date
  // if true, then change the status to expired

  // seems like setinterval is not gonna work


  // maybe try recursion



};
