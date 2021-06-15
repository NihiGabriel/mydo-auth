const crypto = require('crypto');
const ErrorResponse = require('../utils/errorResponse.util');
const { asyncHandler, strIncludesEs6, strToArrayEs6 } = require('@nijisog/todo_common');

const Role = require('../models/Role.model');
const User = require('../models/User.model');

// @desc    Register User
// @route   POST /api/identity/v1/auth/register
// access   Public
exports.register = asyncHandler(async (req, res, next)=> {
    const { email, password, phoneNumber } = req.body;

    const role = await Role.findByName('user');

    if (!role){
        return next(new ErrorResponse('Error', 500, ['An error occured. Please contact support']));
    }

    // validate email
    const isExisting = await User.findOne({ email: email});

    if(isExisting){
        return next(new ErrorResponse('Email already exist', 400, ['Email already exist. Please use another email']));
    }

    if(!phoneNumber){ 
        return next(new ErrorResponse('Phone number is required', 400, ['Phone number is required']));
    }

    // create user
    const user = await User.create({ 
        email: email,
        password: password,
        phoneNumber: phoneNumber,
        isAdmin: false,
        isActive: true,
        superUser: false,
    });

    // Attach the 'user' role to the new user
    const data = { roles: [role._id]};

    const update = await User.findByIdAndUpdate(user._id, data, {
        new: true,
        runValidators: false
    });

    if(update){
        // todo: send welcome and activation email

        const u = await User.findById(user._id).populate([{
            path: 'roles',
            select: '_id name'
        }]);

        res.status(200).json({
            error: false,
            errors: [],
            data: u,
            message: 'Successful',
            status: 200
        })
    } else {
        return next(new ErrorResponse('Error', 500, ['Could not fetch role to user']));
    }
});

// @desc    Login User
// @route   POST /api/identity/v1/auth/login
// access   Public
exports.login = asyncHandler(async (req, res, next) => {
    const { email, password } = req.body;

    // validate email and password
    if(!email || !password ){
        return next(new ErrorResponse('Please provide an email and password', 400, ['Please provide an email and password']))
    }

    // check if user is existing
    const user = await User.findOne({ email: email }).select('+password');

    if(!user){
        return next(new ErrorResponse('Invalid credentials', 401, ['Invalid credentials']));
    }

    // match password
    const isMatch = user.matchPassword(password);

    if(!isMatch) {
        return next(new ErrorResponse('Invalid credentials', 401, ['Invalid credentials']));
    }

    const message = 'Login Successful'
    sendTokenResponse(user, message, 200, res);
});

const sendTokenResponse = async (user, message, statusCode, res) => {

    const token = user.getSignedJwtToken()

    const options = {
        expires: new Date(Date.now() + (process.env.JWT_COOKIE_EXPIRE * 60 * 1000)),
        httpOnly: true 
    }

       // make cookie work for https
       if(process.env.NODE_ENV === 'production'){
        options.secure = true;
    }

    const u = await User.findById(user._id);

    res.status(statusCode).cookie('token', token, options).json({ // 'token', the name of the cookie you want to save
        error: false,
        errors: [],
        token: token,
        data: u,
        message: message,
        status: statusCode
    })

}