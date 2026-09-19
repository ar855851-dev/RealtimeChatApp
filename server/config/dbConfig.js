const mongoose = require('mongoose');


mongoose.connect(process.env.CONN_STRING);

const db = mongoose.connection;

db.on('connected', () => {
    console.log('DB connection Successful');
});

db.on('error', () => {
    console.log('DB connection Failed');
})

module.exports = db;