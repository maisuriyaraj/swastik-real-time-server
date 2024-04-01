const mongoose  = require('mongoose');
require('dotenv').config()

mongoose.connect(process.env.MONGO_CONNECTION).then(()=>{
    console.log("MONGO CONNETCED");
}).catch(err=>{
    console.log(err)
})