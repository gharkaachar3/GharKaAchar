const mongoose = require('mongoose');

 async function Main(){
    try{
        await mongoose.connect( process.env.DB_CONNECT_STRING );
        console.log('connected to the MongoDb')
    }
    catch(error){
        console.log(error.message);
    }
}

module.exports = Main ; 