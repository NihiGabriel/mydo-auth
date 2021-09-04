const express = require('express');


const router = express.Router();

const authRoutes = require('./routers/auth.router')
const emailRoutes = require('./routers/email.router');
const notifyRoutes = require('./routers/notify.router');

router.use('/auth', authRoutes);
router.use('/emails', emailRoutes);
router.use('/notify', notifyRoutes);

module.exports = router;

