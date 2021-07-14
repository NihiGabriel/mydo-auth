const express = require('express');
const {
    register,
    login,
    loginWithVerification,
    forgotPassword,
    resetPassword,
    activateAccount
 } = require('../../../controllers/auth.controller')

 const router = express.Router();
 const { protect, authorize} = require('../../../middleware/auth.mw');

 router.post('/register', register);
 router.post('/login', login);
 router.post('/login-verify', loginWithVerification);
 router.post('/forgot-password', forgotPassword);
 router.put('/reset-password/:resettoken', resetPassword); 
 router.put('/activate/:activatetoken', activateAccount)

 module.exports = router;