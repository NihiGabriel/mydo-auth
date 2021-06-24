const mongoose = require('mongoose');
const { seedData } = require('../src/config/seeds/seeder.seed');

// execute before running all test
beforeAll(async() => {

    const options ={ 
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
        useUnifiedTopology: true
    }

    const dbConn = await mongoose.connect(process.env.MONGODB_TEST_URI, options);
    console.log(`Test database connected: ${dbConn.connection.host}`.cyan.underline.bold);

    // await seedData();
});

// execute before running each test
beforeEach(async() => {
    jest.useFakeTimers();
    jest.setTimeout(30000);
});

// execute after all
afterAll(async() => {
    
});