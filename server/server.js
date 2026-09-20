const dotenv = require('dotenv');
dotenv.config({ path: './config.env' });

const dbconfig = require('./config/dbConfig');

const server = require('./app');


const port = process.env.PORT_NUMBER || 5000;

server.listen(port, '0.0.0.0', () => {
    console.log(`listening to requests on port`+ port); 
});