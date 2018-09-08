'use strict';

module.exports = function(Container) {

 Container.afterRemote('upload',function(ctx,unused,next){
     console.log('Container after remote hook')
     console.log('Container Context: ',ctx.res)

     // update user picture Model?
     // or Maybe just have the app capture the fileName, then that is what needs to be written in the picture
     next()
 })

};
