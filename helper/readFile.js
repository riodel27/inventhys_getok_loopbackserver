const fs = require('fs')

// example of reading and writing file to be uploaded in the server

fs.readFile(__dirname + "/sample.png",(err,data) => {
    if(err) {
        console.log(err)
    } else {
        console.log(data)
        let base64Image = new Buffer(data, 'binary')
        fs.writeFile(__dirname  + '/images/cloneSample.png',base64Image,'binary',(err) => {
            if(err){
                console.log(err)
            } else {
                console.log('Success cloning image')
            }
        })
    }
})

