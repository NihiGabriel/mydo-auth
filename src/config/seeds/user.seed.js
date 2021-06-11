const fs = require('fs')
const colors = require('colors')

const User = require('../../models/User.model');

// read in the user.json file
const users = JSON.parse(
    fs.readFileSync(`${__dirname.split('config')[0]}_data/users.json`, 'utf-8')
)

exports.seedUsers = async () => {
    try {
        // fetch all data in table
        const u = await User.find({});

        if (u && u.length > 0) return;

        const seed = await User.create(users);

        if (seed) {
            console.log('user seeded successfully'.green.inverse)
        }
    } catch (err) {
        console.log(`Error: ${err}`.red.inverse);     
    }
}