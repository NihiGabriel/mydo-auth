const mongoose = require('mongoose');

const NotificationSchema = new mongoose.Schema(
    {
        refId: {
            type: String,
        },

        body: {
            type: String
        },

        status: {
            type: String,
            enum: ['new', 'read'],
            default: 'new'
        },

        sender: {
            name: String,
            id: {
                type: mongoose.Schema.ObjectId,
                ref: 'User'
            }
        },

        recipients: [
             {
                type: mongoose.Schema.ObjectId,
                ref: 'User'
            }
        ],

    },
    {
        timestamps: true,
        versionKey: '_version',
        toJSON: {
            transform(doc, ret){
                ret.id = ret._id
            }
        }
    }
)

NotificationSchema.set('toJSON', {getters: true, virtuals: true});

NotificationSchema.pre('save', function(next){
    next();
});

module.exports = mongoose.model('Notification', NotificationSchema);