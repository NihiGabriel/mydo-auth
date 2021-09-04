const { Listener, Subjects } = require('@nijisog/todo_common');
const QueueGroupName = require('../groupName');

const User = require('../../models/User.model');
const Notification = require('../../models/Notification.model');
const { generate } = require('../../utils/random.util');

class TodoCompletedListener extends Listener{

    subject = Subjects.TodoCompleted;
    queueGroupName = QueueGroupName.Todo;

    constructor(client){
        super(client);
    }

    async onMessage(data, msg){

        const ref = await generate(8, false);
        const superadmin = await User.findOne({ email: 'superadmin@gmail.com' });

        const todo = data;
        const user = await User.findById(todo.user);

        const notif = await Notification.create({
            refId: ref,
            body: `Your todo list ${todo.title} has been marked completed`,
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

module.exports = TodoCompletedListener;