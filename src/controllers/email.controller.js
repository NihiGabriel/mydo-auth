const ErrorResponse = require('../utils/errorResponse.util');
const { asyncHandler } = require('@nijisog/todo_common')
const { sendGrid } = require('../utils/email.util');
const { generate } = require('../utils/random.util');
const User = require('../models/User.model');

// @desc    Send welcome email to user
// @route   POST /api/identity/v1/emails/send-welcome
// @access  Public
exports.sendWelcomeEmail = asyncHandler(async (req, res, next) => {

    const { email, callback } = req.body;

    const user = await User.findOne({ email: email });

    if(!user){
        return next(new ErrorResponse('Not Found', 404, ['Email does not exist']))
    }

    try {
        
        let emailData = {

            template: 'welcome',
            email: email,
            preHeaderText: 'We are glad you signed up',
            emailTitle: 'Welcome To Todo',
            emailSalute: `Hi Champ`,
            bodyOne: 'Welcome to todo. We are glad you signed up. please login to your dashboard using the button below',
            buttonUrl: `${callback}/login`,
            buttonText: 'Login To Dashboard',
            fromName: 'Ope from Todo'
        }

        await sendGrid(emailData);

        res.status(200).json({
            error: false,
            errors: [],
            data: [],
            message: `Email sent to ${email} successfully`,
            status: 200
        })


    } catch (err) {
        return next(
            new ErrorResponse('Error', 500, ['There was an error, please try again'])
        )
    }
})

// @desc    Send Activation email to user
// @route   POST /api/identity/v1/emails/send-activation
// @access  Public
exports.sendActivationEmail = asyncHandler(async (req, res, next) => {

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
    const user = await User.findOne({ email: email });

    if(!user){
        return next(new ErrorResponse('Not Found', 404, ['Email does not exist']))
    }

    try {

        const activationToken =  user.getActivationToken();
        await user.save({ validateBeforeSave: false });

        const activationUrl =  `${callback}/${activationToken}`;
        
        let emailData = {

            template: 'welcome',
            email: email,
            preHeaderText: 'Activate your account',
            emailTitle: 'Activate your account',
            emailSalute: `Hi Champ`,
            bodyOne: 'Please confirm that you own this email by clicking the button below',
            buttonUrl: `${activationUrl}`,
            buttonText: 'Activate Account',
            fromName: 'Todo'
        }

        await sendGrid(emailData);

        user.isActivated = false;
        user.activationToken = activationToken;
        user.activationTokenExpire = Date.now() + 5 * 60 * 1000 // 5 minutes

        await user.save();

        res.status(200).json({
            error: false,
            errors: [],
            data: [],
            message: `Email sent to ${email} successfully`,
            status: 200
        })


    } catch (err) {
        return next(
            new ErrorResponse('Error', 500, ['There was an error, please try again'])
        )
    }
})


// @desc    Send Forgot email to user
// @route   POST /api/identity/v1/emails/send-forgot-password
// @access  Public
exports.sendForgotEmail = asyncHandler(async (req, res, next) => {

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

// @desc    Send email Verification to user
// @route   POST /api/identity/v1/emails/send-email-verification
// @access  Public
exports.sendEmailVerification = asyncHandler(async (req, res, next) => {

    const { email } = req.body;

    const user = await User.findOne({ email: email });

    if(!user){
        return next(new ErrorResponse('Not Found', 404, ['Email does not exist'])) 
    }

    try {

        const mailCode = await generate(6, false);
        
        let emailData = {

            template: 'email-verify',
            email: email,
            preHeaderText: 'Email Verification',
            emailTitle: 'Verify your email',
            emailSalute: `Hi Champ`,
            bodyOne: 'Use the code below to verify your email',
            bodyTwo: `${mailCode}`,
            fromName: 'Todo'
        }

        await sendGrid(emailData);

        user.emailCode = mailCode;
        user.emailCodeExpire = Date.now() + 1 * 60 * 1000 // 1 minute
        await user.save();

        res.status(200).json({
            error: false,
            errors: [],
            data: [],
            message: `Email sent to ${email} successfully`,
            status: 200
        })


    } catch (err) {
        return next(
            new ErrorResponse('Error', 500, ['There was an error, please try again'])
        )
    }
})