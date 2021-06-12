const fs = require('fs')
const colors = require('colors')

const Role = require('../../models/Role.model');

// read in the user.json file
const roles = JSON.parse(
    fs.readFileSync(`${__dirname.split('config')[0]}_data/roles.json`, 'utf-8')
)

exports.seedRoles = async () => {
    try {
        // fetch all data in table
        const u = await Role.find({});

        if (u && u.length > 0) return;

        const seed = await Role.create(roles);

        if (seed) {
            console.log('role seeded successfully'.green.inverse)
        }
    } catch (err) {
        console.log(`Error: ${err}`.red.inverse);     
    }
}