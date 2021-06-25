const express = require('express');
const {
    register,
    login
 } = require('../../../controllers/auth.controller')

 const router = express.Router();
 const { protect, authorize} = require('../../../middleware/auth.mw');

 router.post('/register', register);
 router.post('/login', login);

 module.exports = router;