const crypto = require('crypto');
const ErrorResponse = require('../utils/errorResponse.util');
const { asyncHandler, strIncludesEs6, strToArrayEs6, strIncludes } = require('@nijisog/todo_common');

// models
const Role = require('../models/Role.model');
const User = require('../models/User.model');

const nats = require('../events/nats');
const UserCreated = require('../events/publishers/user-created');
const { sendGrid } = require('../utils/email.util');
const { generate } = require('../utils/random.util');

// @desc    Register User
// @route   POST /api/identity/v1/auth/register
// access   Public
exports.register = asyncHandler(async (req, res, next)=> {
    const { email, password, phoneNumber, callback } = req.body;

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
    try {
        // welcome email
        let emailData = {

            template: 'welcome',
            email: email,
            preHeaderText: 'We are glad you signed up',
            emailTitle: 'Welcome To Todo',
            emailSalute: `Hi Champ`,
            bodyOne: 'Welcome to todo. We are glad you signed up. please login to your dashboard using the button below',
            buttonUrl: `${process.env.WEB_URL}/login`,
            buttonText: 'Login To Dashboard',
            fromName: 'Todo'
        }

        await sendGrid(emailData);
        
        // activation email
            const activateToken = user.getActivationToken();
            await user.save({ validateBeforeSave: false });

            const activateUrl =`${callback}/${activateToken}`;
            
            let activateData = {
                template: 'welcome',
                email: email,
                preHeaderText: 'Account activation',
                emailTitle: 'Activate your account',
                emailSalute: `Hi Champ,`,
                bodyOne:'we need to know you own this email, please click the button below to activate your account',
                buttonUrl: `${activateUrl}`,
                buttonText: 'Activate Account',
                fromName: 'Todo'
            };
        
            await sendGrid(activateData);
                
            } catch (error) {
                return next(new ErrorResponse('Error', 500, ['Email could not be sent']));

            }
	
            const u = await User.findById(user._id).populate([{
                path: 'roles',
                select: '_id name'
        }]);

        // publish new event to nats
        await new UserCreated(nats.client).publish(u);

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
    const isMatch = await user.matchPassword(password);

    if(!isMatch) {
        return next(new ErrorResponse('Invalid credentials', 401, ['Invalid credentials']));
    }

    const message = 'Login Successful'
    sendTokenResponse(user, message, 200, res);
});

// @desc    Login User With Verification
// @route   POST /api/identity/v1/auth/login-verify
// access   Public
exports.loginWithVerification = asyncHandler(async (req, res, next) => {
    const { email, password, code } = req.body;

    if(!email || !password){
        return next(new ErrorResponse('Error!', 400, ['Email is required', 'Password is required']))
    }

    const user = await User.findOne({ email: email}).select('+password');

    if(!user){
        return next(new ErrorResponse('Invalid credentials', 401, ['Invalid credentials']))
    }

    const isMatched = await user.matchPassword(password);

    if(!isMatched || (user && !isMatched)){
        if(user.loginLimit < 3){
            user.loginLimit = user.increaseLoginLimit();
            await user.save();
        }

        if(user.loginLimit >= 3 && !user.checkLockedStatus()){ 
            user.isLocked = true;
            await user.save();

            return next(new ErrorResponse('Forbidden!', 403, ['Account currently locked for 24 hours']));
        }

        if(user.loginLimit === 3 && user.checkLockedStatus()){
            return next(new ErrorResponse('Forbidden!', 403, ['Account currently locked for 24 hours']));
        }

        return next(new ErrorResponse('Invalid credentials', 401, ['Invalid credentials']))
    }
    
    if(!code){
        const mailCode = await generate(6, false);

        let emailData = {
            template: 'email-verify',
            email: email,
            preHeaderText: 'Verify your email',
            emailTitle: 'Email verification',
            emailSalute: 'Hi Champ,',
            bodyOne: 'Please verify your email using the code below',
            bodyTwo: `${mailCode}`,
            fromName: 'ToDo'
        }

        await sendGrid(emailData);

        user.emailCode = mailCode;
        user.emailCodeExpire = Date.now() + 1 * 60 * 1000 // 1 minute
        await user.save();

        res.status(206).json({
            error: true,
            errors: ['email verification is required'],
            data: null,
            message: 'email verification is required',
            status: 206
        })
    }

    if(code){
        const codeMatched = await User.findOne({ emailCode: code, emailCodeExpire: {$gt: Date.now() }})

        if(!codeMatched){
            return next(new ErrorResponse('verification code expired', 400, ['Invalid verification code']))
        }

        const isMatched = user.matchPassword(password);

        if(!isMatched){
            if(user.loginLimit < 3){
            user.loginLimit = user.increaseLoginLimit();
            await user.save();
        }

        if(user.loginLimit >= 3 && !user.checkLockedStatus()){
            user.isLocked = true;
            await user.save();

            return next(new ErrorResponse('Forbidden!', 403, ['Account currently locked for 24 hours']));
        }

        return next(new ErrorResponse('Invalid credentials', 401, ['Invalid credentials']))

        }

        user.emailCode = undefined;
        user.emailCodeExpire = undefined;
        user.loginLimit = 0;
        user.isLocked = false;

        await user.save();

        const message = 'Login successful';
        sendTokenResponse(user, message, 200, res)
    }
})

// @desc    Forgot Password
// @route   POST /api/identity/v1/auth/forgot-password
// access   Public
exports.forgotPassword = asyncHandler(async (req, res, next) => {
    const { email, callback } = req.body;

    if (!email && !callback){
        return next(new ErrorResponse('Error!', 400, ['email is required', 'callback is required']))
    }

    if(!email){
        return next(new ErrorResponse('Error!', 400, ['email is required']))
    }

    if(!callback){
        return next(new ErrorResponse('Error!', 400, ['callback is required']))

    }
    
    const user = await User.findOne({email : email})

    if(!user){
        return next(new ErrorResponse('Error!', 404, ['Cannot find user']))
    }

    const resetToken = user.getResetPasswordToken();
    await user.save({ validateBeforeSave: false })

    try {
       const resetUrl = callback + '/' + resetToken;
       
       let emailData = {

          template: 'welcome',
          email: user.email,
          preHeaderText: 'Change your password',
          emailTitle: 'Reset your password',
          emailSalute: 'Hi Champ,',
          bodyOne: 'You are receiving this email because you (or someone else) has requested a password reset. Click the button below to change your password or ignore this email if this wasn/t you',
          buttonUrl: `${resetUrl}`,
          buttonText: 'Change Password',
          fromName: 'ToDo'
       }

       await sendGrid(emailData);
       
       res.status(200).json({
           error: false,
           errors: [],
           data: null,
           message: 'successful',
           status: 200
       })
    } catch (err) {
        user.resetPasswordToken = undefined;
        user.resetPasswordTokenExpire = undefined;
        
        await user.save({ validateBeforeSave : false })

        return next(new ErrorResponse('Error', 500 ['Could not send email, please try again'])); 
    }
})

// @desc    Reset Password
// @route   PUT /api/identity/v1/auth/reset-password/:resettoken
// access   Public
exports.resetPassword = asyncHandler(async (req, res, next) => {
    const token = req.params.resettoken;
    const { password } = req.body;

    if(!password){
        return next(new ErrorResponse('Error', 400, ['Password is required']))
    }

    const hashed = crypto
    .createHash('sha256') 
    .update(token)
    .digest('hex')

    const user = await User.findOne({ resetPasswordToken: hashed, resetPasswordTokenExpire: { $gt: Date.now() }});   

    if(!user){ 
        return next(new ErrorResponse('Error!', 404, ['Invalid token'])) 
    }

    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordTokenExpire = undefined;
    
    await user.save();

    res.status(200).json({
        error: false,
        errors: [],
        data: null,
        message: 'successful',
        status: 200
    })
})

// @desc    Activate Account
// @route   PUT /api/identity/v1/auth/activate/:activatetoken
// access   Public
exports.activateAccount = asyncHandler(async (req, res, next) => {
    const token = req.params.activatetoken

    const hashedToken = crypto
    .createHash('sha256')
    .update(token)
    .digest('hex')

    const user = await User.findOne({ activationToken: hashedToken, activationTokenExpire: { $gt: Date.now() }});

    if(!user){
        return next(new ErrorResponse('Error!', 404, ['Invalid token']))
    }

    user.isActivated = true;
    user.activationToken = undefined;
    user.activationTokenExpire = undefined;

    await user.save();

    res.status(200).json({
        error: false,
        errors: [],
        data: null,
        message: 'activation successful',
        status: 200
    })
})

// @desc    Get logged in user
// @route   PUT /api/identity/v1/auth/user/:id
// access   Private | superadmin, admin, user
exports.getUser = asyncHandler(async (req, res, next) => {
    const user = await User.findById(req.params.id)

    if(!user){
        return next(new ErrorResponse('Error!', 404, ['user does not exist']))
    }

    res.status(200).json({
        error: false,
        errors: [],
        data: user,
        message: 'successful',
        status: 200
    })
})

// @desc    Attach role to a user
// @route   PUT /api/identity/v1/auth/attach-role/:id
// access   Private | Superadmin
exports.attachRole = asyncHandler(async (req, res, next) => {
    // find roles
    let roleNames, roleIds = [];

    const { roles } = req.body;

    if(typeof(roles !== 'string')){
        return next(new ErrorResponse('Error', 400, ['Expected roles to be a string separated by comma or spaces']))
    }

    const user = await User.findById(req.params.id);

    if(!user){
        return next(new ErrorResponse('Error!', 404, ['User does not exist']));
    }

    if(strIncludesEs6(roles, ',')){
        roleNames = strToArrayEs6(roles, ',');
    }else if(strIncludesEs6(roles, ' ')){
        roleNames = strToArrayEs6(roles, ' ');
    }else{
        roleNames = [];
        roleNames.push(roles);
    }

    // check if rolenames exist
    for(let j = 0; j < roleNames.length; j++){
        let role = await Role.findByName(roleNames[j]);

        if(!role){
            return next(new ErrorResponse('Cannot find role', 404, ['Role does not exist']))
        }

        roleIds.push(role._id);
    }

    // check if user already has the role
    for(let m = 0; m < roleIds.length; m++){
        if(!user.hasRole(roleIds[m], user.roles)){
            continue; 
        }else{
            return next(new ErrorResponse('Error', 400, ['User is already attached to one of the roles specified']))
        }
    }

    user.roles = user.roles.concat(roleIds);
    await user.save();

    res.status(200).json({
        error: false,
        errors: [],
        data: null,
        message: 'attached roles successfully',
        status: 200
    })
})

// @desc    Detach role from a user
// @route   PUT /api/identity/v1/auth/detach-role/:id
// access   Private | Superadmin
exports.detachRole = asyncHandler(async (req, res, next) => {

    let uRoles = [];
    let flag = true;

    const { roleName } = req.body;
    if(!roleName || typeof(roleName) !== 'string'){
        return next(new ErrorResponse('Error', 400, ['role is required and expected to be a string']))
    }

    const role = await Role.findByName(roleName);

    if(!role){
        return next(new ErrorResponse('Error', 404, ['Role does not exist']))
    }

    const user = await User.findById(req.params.id);
    
    if(!user){
        return next(new ErrorResponse('Error', 404, ['User does not exist']))
    }

    for(let i = 0; i < user.roles.length; i++){
        if(user.roles[i].toString() === role._id.toString()){
            flag = true;
            uRoles = user.roles.filter((r) => r.toString() !== role._id.toString())
        }else{
            flag = false;
            continue;
      }
    }

    if(!flag){
        return next(new ErrorResponse('Error', 404, ['User does not have the role specified']))
    }

    user.roles = uRoles;
    await user.save();

    res.status(200).json({
        error: false,
        errors: [],
        data: null,
        message: 'Role detached successfully',
        status: 200
    })
})
 
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