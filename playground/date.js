const moment = require('moment')

console.log('moment: ', moment().format())


// // computation for the valid until
// let validationDuration = {
//     days:1,
//     hours:1,
//     minutes:0
// }
// console.log('validation duration: ',validationDuration)
// // assuming the moment() = dateMake or date validated? [+] validation duration
// let validUntil = moment().add(validationDuration)
// console.log('Valid until: ', validUntil)


// 9/3/2018
// how to create a back worker on loopback to always check the valid Until property if 
// it exceeds the date, for expired status?? 



// 9/4/2018
var Timer = require('easytimer.js');

/*
var timerOne  = new Timer();

// console.log('Timer instance: ', timerInstance)
timerOne.start({precision: 'seconds', startValues: {seconds: 90}, target: {seconds: 120}});

timerOne.addEventListener('secondsUpdated', function (e) {
    console.log('TIMER ONE', timerOne.getTimeValues().toString())
});

timerOne.addEventListener('targetAchieved', function (e) {
    console.log('TIMER ONE: COMPLETE, change status to expired')
});

var timerTwo  = new Timer();

// console.log('Timer instance: ', timerInstance)


timerTwo.start({precision: 'seconds', startValues: {seconds: 90}, target: {seconds: 120}});

timerTwo.addEventListener('secondsUpdated', function (e) {
    console.log('TIMER TWO:', timerTwo.getTimeValues().toString())
});

timerTwo.addEventListener('targetAchieved', function (e) {
    console.log('TIMER TWO: COMPLETE, change status to expired')
});
*/


//STEPS 
// 1 . get requests valid
let data = [{
    id: "5b8644bd27cb9c2f14e7f8f7",
    "requestorUserId": "5b8643b227cb9c2f14e7f8f5",
    "requestorUserName": "User Two",
    "recepientUserId": "5b84fee2ea5c6e3cc0a38553",
    "recepientUserName": "User One",
    "isAnonymous": true,
    "validationDuration": "1h",
    dateMake: "2018-08-29T06:52:59.217Z",
    dateValid: "2018-09-05T06:52:59.217Z",
    "settings": [],
    "status": "Valid",
    endTimeSimulation: 1536050805580
  },
  {
    id: "5b86673a7889f1236c6941e9",
    "requestorUserId": "5b8643b227cb9c2f14e7f8f5",
    "requestorUserName": "User Two",
    "recepientUserId": "5b84fee2ea5c6e3cc0a38553",
    "recepientUserName": "User One",
    "isAnonymous": true,
    "validationDuration": "1h",
    dateMake: "2018-08-29T06:52:59.217Z",
    dateValid: "2018-09-03T06:52:59.217Z",
    "settings": [],
    "status": "Valid",
    endTimeSimulation: 1536050805600
  }
]

// 2. MAP and perform the timer on every requests

// data.map((request) => {
//   console.log('request: ', request)
  timer = new Timer()
  // let currentTimeStamp = moment().valueOf()
  // let dateValidTimeStamp = moment(`${request.dateValid}`).valueOf()



  // if(dateValidTimeStamp <= currentTimeStamp){
  //     console.log('This request was way past the date valid date, change this status to expired already!', dateValidTimeStamp)
  //     console.log('request id: ', request.id)

  //     // catch request here that is way past the date valid
  //     // change status to expired
  // }

  timer.start({
    precision: 'seconds',
    startValues: {
      seconds: 1536140580
    },
    target: {
      seconds: 1536140640
    }
  })

  timer.addEventListener('secondsUpdated', function (e) {
    console.log(`TIMER (user id): : ${timer.getTimeValues().toString()}`)
  });

  timer.addEventListener('targetAchieved', function (e) {
    console.log(`TIMER (user id) complete: `)
    // when server is running and some of the request here meets the date valid,
    // change the status to expired
  });
// })



/* for propert test simulation */
// create a request using the moment date
// date make
// date valid


// console.log('moment time: ', moment().format())
// let sampleValidDate = "2018-09-05T17:29:56+08:00"
// console.log('moment timestamp: ', moment(`${sampleValidDate}`).valueOf())


console.log(moment("2018-09-05T09:43:00.000Z").valueOf())
console.log(moment("2018-09-05T09:43:00.000Z").unix())

console.log(moment("2018-09-05T09:44:00.000Z").valueOf())
console.log(moment("2018-09-05T09:44:00.000Z").unix())