'use strict';
const Timer = require('easytimer.js');
const timer = new Timer();

timer.start({
  precision: 'seconds',
  startValues: {
    seconds: 100,
  },
  target: {
    seconds: 1000,
  },
});

timer.addEventListener('secondsUpdated', function(e) {
  console.log(`TIMER (user id):: ${timer.getTimeValues().toString()}`);
});

console.log('timer: ', JSON.stringify(timer, undefined, 2));




