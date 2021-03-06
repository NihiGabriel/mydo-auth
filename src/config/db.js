const mongoose = require('mongoose');
const colors = require('colors');

const nats = require('../events/nats');

const CountryFound = require('../events/listeners/country-found');
const ItemAbandoned = require('../events/listeners/item-abandoned');
const ItemCompleted = require('../events/listeners/item-completed');
const ItemNudged = require('../events/listeners/item-nudged');
const ReminderCompleted = require('../events/listeners/reminder-completed');
const ReminderSend = require('../events/listeners/reminder-send');
const TodoCompleted = require('../events/listeners/todo-completed');

const options = {
    useNewUrlParser: true,
    useCreateIndex: true,
    autoIndex: true,
    keepAlive: true,
    poolSize: 10,
    bufferMaxEntries: 0,
    connectTimeoutMS: 10000,
    socketTimeoutMS: 45000,
    family: 4, // Use IPv4, skip trying IPv6
    useFindAndModify: false,
    useUnifiedTopology: true,
}

// const connectNats = async () => {
    
//     if(!process.env.NATS_CLUSTER_ID){
//         throw new Error(`NATS_CLUSTER_ID must be defined`);
//     }

//     if(!process.env.NATS_URI){
//         throw new Error(`NATS_URI must be defined`); 
//     }

//     // connect to Nats
//     await nats.connect(process.env.NATS_CLUSTER_ID, 'sog-auth-service', process.env.NATS_URI);

//     process.on(`SIGINT`, () => nats.client.close());  //sigint is to watch for intercept or interruptions
//     process.on(`SIGTERM`, () => nats.client.close()); // close server if there is an interruption

//     nats.client.on('close', () => {
//         console.log('NATS connection closed');
//         process.exit();
//     })
// }

// const listenNats = async () => {

//     // connect to nats
//     await new CountryFound(nats.client).listen();
//     await new ItemAbandoned(nats.client).listen();
//     await new ItemCompleted(nats.client).listen();
//     await new ItemNudged(nats.client).listen();
//     await new ReminderCompleted(nats.client).listen();
//     await new ReminderSend(nats.client).listen();
//     await new TodoCompleted(nats.client).listen();
// }

const connectDB = async () => {

    // connects to nats
    await connectNats();

    listenNats();

    const dbconn = await mongoose.connect(process.env.MONGODB_URI, options)
    console.log(`Database Connected: ${dbconn.connection.host}`.cyan.underline.bold)

}

module.exports = connectDB;