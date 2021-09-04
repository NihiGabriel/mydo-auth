const express = require('express');
const {
    sendWelcomeEmail,
    sendActivationEmail,
    sendForgotEmail,
    sendEmailVerification   
 } = require('../../../controllers/email.controller')

 const router = express.Router({ mergeParams: true });

 router.post('/send-welcome', sendWelcomeEmail);
 router.post('/send-activation', sendActivationEmail);
 router.post('/send-forgot-password', sendForgotEmail);
 router.post('/send-email-verification', sendEmailVerification);

 module.exports = router;