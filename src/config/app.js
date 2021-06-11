const { config } = require('dotenv');
const express = require('express');

// get environment variables
config();

// define express app
const app = express();

module.exports = app;