const { asyncHandler } = require('@nijisog/todo_common');

const NotifyHelper = require('../middleware/notify.mw');
const Notification = require('../models/Notification.model')

exports.pushEvent = asyncHandler(async (req, res, next) => {

    const headers = {
        'Content-Type': 'text/event-stream',
        'Connection': 'keep-alive',
        'Cache-Control': 'no-cache'
    }
    res.writeHead(200, headers)

    const all = await Notification.find({});
    const notify = new NotifyHelper(res);
    notify.push(all);
});