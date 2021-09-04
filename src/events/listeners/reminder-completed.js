const { Listener, Subjects } = require('@nijisog/todo_common');
const QueueGroupName = require('../groupName');

const User = require('../../models/User.model');
const Notification = require('../../models/Notification.model');
const { generate } = require('../../utils/random.util');

class ReminderCompletedListener extends Listener{

    subject = Subjects.ReminderCompleted;
    queueGroupName = QueueGroupName.Todo;

    constructor(client){
        super(client);
    }

    async onMessage(data, msg){

        const ref = await generate(8, false);
        const superadmin = await User.findOne({ email: 'superadmin@gmail.com' });

        const rem = data;
        const user = await User.findById(rem.user);

        const notif = await Notification.create({
            refId: ref,
            body: `Your todo item ${rem.item.title} is due by ${rem.item.dueDate} ${rem.item.dueTime}`,
            status: 'new',
            sender: {
                name: 'Todo',
                Id: superadmin._id
            },
            recipients: [`${superadmin._id}`, `${user._id}`]
        });

        msg.ack();
    }
}

module.exports = ReminderCompletedListener;