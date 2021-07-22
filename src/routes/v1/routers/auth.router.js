const express = require('express');
const {
    register,
    login,
    loginWithVerification,
    forgotPassword,
    resetPassword,
    activateAccount,
    attachRole,
    getUser
 } = require('../../../controllers/auth.controller')

 const router = express.Router();
 const { protect, authorize} = require('../../../middleware/auth.mw');

 const roles = ["superadmin", "admin"];
 const allRoles = ["superadmin", "admin", "user"]

 router.post('/register', register);
 router.post('/login', login);
 router.post('/login-verify', loginWithVerification);
 router.post('/forgot-password', forgotPassword);
 router.put('/reset-password/:resettoken', resetPassword); 
 router.put('/activate/:activatetoken', activateAccount);
 router.put('/attach-role/:id', attachRole);
 router.get('/user/:id', protect, authorize(allRoles), getUser);

 module.exports = router;