const mongoose = require('mongoose');
const slugify = require('slugify');

const PermissionSchema = new mongoose.Schema(
    {
        name: {
            type: String,
        },
        descriptionm: {
            type: String
        },
        slug: String,

        users: [
            {
                type: mongoose.Schema.ObjectId,
                ref: 'User'
            }
        ]
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

PermissionSchema.set('toJSON', {getters: true, virtuals: true});

PermissionSchema.pre('save', function(next){
    this.slug = slugify(this.name, {lower: true});
    next();
});

module.exports = mongoose.model('Permission', PermissionSchema);