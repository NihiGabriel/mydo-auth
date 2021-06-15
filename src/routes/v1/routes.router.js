const express = require('express');


const router = express.Router();

const authRoutes = require('./routers/auth.router')

router.use('/auth', authRoutes);

module.exports = router;

