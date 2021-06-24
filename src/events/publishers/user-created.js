const { Publisher, Subjects } = require('@nijisog/todo_common');

class UserCreatedPublisher extends Publisher {
    
    subject = Subjects.UserCreated;

    constructor(client){
        super(client)
    }
}

module.exports = UserCreatedPublisher;