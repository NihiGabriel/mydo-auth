const ErrorResponse = require('../utils/errorResponse.util');
const { asyncHandler } = require('@nijisog/todo_common')
const { sendGrid } = require('../utils/email.util');
const { generate } = require('../utils/random.util');
const User = require('../models/User.model');

// @desc    Send welcome email to user
// @route   POST /api/identity/v1/emails/send-welcome
// @access  Public
exports.sendWelcomeEmail = asyncHandler(async (req, res, next) => {

    const { email } = req.body;

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
            buttonUrl: `${process.env.WEB_URL}/login`,
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

    const { email } = req.body;

    const user = await User.findOne({ email: email });

    if(!user){
        return next(new ErrorResponse('Not Found', 404, ['Email does not exist']))
    }

    try {

        const activationToken =  user.getActivationToken();
        await user.save({ validateBeforeSave: false });

        const activationUrl =  `${process.env.WEB_URL}/activate/${activationToken}`;
        
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

    const { email } = req.body;

    const user = await User.findOne({ email: email });

    if(!user){
        return next(new ErrorResponse('Not Found', 404, ['Email does not exist']))
    }

    try {

        const resetToken =  user.getResetPasswordToken();
        await user.save({ validateBeforeSave: false });

        const resetUrl =  `${process.env.WEB_URL}/reset-password/${resetToken}`;
        
        let emailData = {

            template: 'welcome',
            email: email,
            preHeaderText: 'Reset your password',
            emailTitle: 'Change Password',
            emailSalute: `Hi Champ`,
            bodyOne: 'You or someone requested a reset password link from your account. Please use the button below to change your password or ignore if it is not you',
            buttonUrl: `${resetUrl}`,
            buttonText: 'Change Password',
            fromName: 'Todo'
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