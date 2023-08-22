const mongoose = require('mongoose');
require('dotenv').consfig();
mongoose.connect(process.env.MONGO_URL);

const db = mongoose.connection;
db.on('error',console.error.bind(console,'error while connecting to database'))
db.once('open',function(){
    console.log('successfully connected to the database');
})

module.exports = db;