const mongoose = require('mongoose');
const slugify = require('slugify')

const RoleSchema = new mongoose.Schema(
    {

        name: {
            type: String
        },
        description: {
            types: String
        },
        slug: {
            type: String
        },

        users: [
            {
                type: mongoose.Schema.ObjectId,
                ref: 'Users'
            }
        ]

    },

    {

        timestamps: true,
        versionKey: '_version',
        toJSON: {
            transform(doc, ret){
                ret.id = ret._id;
            }
        }

    }
)

RoleSchema.set('toJSON', {getters: true, virtuals: true});

RoleSchema.pre('save', function(next) {
    this.slug = slugify(this.name, {lower: true});

    next();
});

RoleSchema.statics.getAllRoles = function (){
    return this.findOne({});
}

RoleSchema.statics.findByName = async function(name){
    return await this.findOne({ name: name });
}

RoleSchema.methods.getRoleName = async function(){
    return this.name({});
}
 
module.exports = mongoose.model('Role', RoleSchema)