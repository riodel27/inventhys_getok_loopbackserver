'use strict';

module.exports = function (app, cb) {
  /*
   * The `app` object provides access to a variety of LoopBack resources such as
   * models (e.g. `app.models.YourModelName`) or data sources (e.g.
   * `app.datasources.YourDataSource`). See
   * https://loopback.io/doc/en/lb3/Working-with-LoopBack-objects.html
   * for more info.
   */


  setTimeout(function () {
    console.log('Hello world');

    const Request = app.models.Request

    Request.find({
      where: {
        requestorUserId: '5b8643b227cb9c2f14e7f8f5'
      }
    }, function (err, req) {
        console.log(req)
    });

  }, 3000);

  // 9/4/2018
  // Asynchornous process here for getting all requests(VALID)
  // Do count down timer, for the date until valid for those requests
  // change status if already past date valid to expired

  // STEPS
  // 1. Get all Request with "VALID" status - []
  // 2. Perform timer for each requests - how?
  


  process.nextTick(cb); // Remove if you pass `cb` to an async function yourself
};
