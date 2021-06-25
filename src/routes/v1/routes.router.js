const express = require('express');


const router = express.Router();

const authRoutes = require('./routers/auth.router')
const emailRoutes = require('./routers/email.router');

router.use('/auth', authRoutes);
router.use('/emails', emailRoutes);

module.exports = router;

