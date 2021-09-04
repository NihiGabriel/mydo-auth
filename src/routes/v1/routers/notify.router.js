const express = require('express');
const {
    pushEvent
 } = require('../../../controllers/notify.controller')

 const router = express.Router({ mergeParams: true });
 const { protect, authorize} = require('../../../middleware/auth.mw');

 const roles = ["superadmin", "admin"];
 const allRoles = ["superadmin", "admin", "user"]

 router.get('/events', pushEvent);

 module.exports = router;