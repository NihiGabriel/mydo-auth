const { Listener, Subjects} = require('@nijisog/todo_common');
const QueueGroupName = require('../groupName');

const Country = require('../../models/Country.model');
const User = require('../../models/User.model');
const nats = require('../nats');

class CountryFoundListener extends Listener {
    
    subject = Subjects.CountryFound;
    queueGroupName = QueueGroupName.Resource;

    constructor(client){
        super(client);
    }

    async onMessage(data, msg){
         
        // get the message data
        const { _id, country } = data;
        const { name, code2, code3, states, capital, region, subRegion, flag, phoneCode, currencyCode, currencyImage } = country

        const user = await User.findOne({ _id: _id });

        if(user){
            
            const cData = await Country.create({

                name, 
                code2, 
                code3, 
                states, 
                capital, 
                region, 
                subRegion, 
                flag, 
                phoneCode, 
                currencyCode, 
                currencyImage 

            });

            user.country = cData._id;
            await user.save();
        }

        msg.ack();
    }
}

module.exports = CountryFoundListener