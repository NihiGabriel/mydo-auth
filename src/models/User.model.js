const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema(
    {

        firstName: {
            type: String
        },

        lastName: {
            type: String
        },

        email: {
            type: String,
            required: [true, 'Email is required'],
            unique: [true, 'Email already exist'],
            match: [
                /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
                'a valid email is required',
            ],
        },

        phoneNumber: {
            type: String
        },

        password: {
            type: String,
            required: [true, 'Password is required'],
            minLenght: 8,
            select: false,
            match: [
                /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[^\w\s]).{8,}$/,
                'Password must contain at least 8 characters, 1 lowercase letter, 1 uppercase letter, 1 special character and 1 number',
            ]
        },

        isActivated: {
            type: Boolean,
            default: false,
        },

        isActive: {
            type: Boolean,
            default: true,
        },

        isAdmin: {
            type: Boolean,
            default: false,
        },

        superUser: {
            type: Boolean,
            default: false,
        },

        activationToken : String,
        activationTokenExpire: Date,
        resetPasswordToken: String,
        resetPasswordTokenExpire: Date,

        roles: [
            {
                type: mongoose.Schema.ObjectId,
                ref: 'Role'
            }
        ],

        country: {
            type: mongoose.Schema.ObjectId,
            ref: 'Country'
        }


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
);

UserSchema.set('toJSON', {getters: true, virtuals: true});

UserSchema.methods.findByEmail= async (email) => {
    return await this.findOne({ email: email });
};

UserSchema.methods.getFuulName = async() => {
    return this.firstName + ' ' + this.lastName
};

module.exports = mongoose.model('user', UserSchema);