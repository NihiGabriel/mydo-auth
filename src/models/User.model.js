const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
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

UserSchema.pre('save', async function(next){

    if(!this.isModified('password')){
        return next();
    }
    
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
})

UserSchema.methods.getSignedJwtToken = function () {
    return jwt.sign(
        { id: this._id, email: this.email, roles: this.roles}, 
        process.env.JWT_SECRET, 
        { expiresIn: process.env.JWT_EXPIRE }
    )
}

UserSchema.methods.matchPassword = async function (pass) {
    return await bcrypt.compare(pass, this.password)
}

// generate reset password token
UserSchema.methods.getResetPasswordToken = function () {

    const resetToken = crypto.randomBytes(20).toString('hex')

    // hash the token generated
    this.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex')

    // set the expiry time/date
    this.getResetPasswordTokenExpire = Date.now() + 10 * 60 * 1000 // 10 minutes

    return resetToken;
}

UserSchema.methods.getActivationToken = function () {
    const activateToken = crypto.randomBytes(20).toString('hex')

    // hash the token generated
    this.activationToken = crypto.createHash('sha256').update(activateToken).digest('hex')

    // set the expiry time/date
    this.activationTokenExpire = Date.now() + 10 * 60 * 1000 // 10 minutes

    return activateToken;
}

// Find out if user has a role
UserSchema.methods.hasRole = (role, roles) => {
    let flag = false;
    for (let i = 0; i < roles.length; i++) {
      if (roles[i].toString() === role.toString()) {
        flag = true;
        break;
      }
    }
  
    return flag;
  };

UserSchema.methods.findByEmail= async (email) => {
    return await this.findOne({ email: email });
};

UserSchema.methods.getFuulName = async() => {
    return this.firstName + ' ' + this.lastName
};

module.exports = mongoose.model('user', UserSchema);