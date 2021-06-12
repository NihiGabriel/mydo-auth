const ErrorResponse = require('../utils/errorResponse.util');
const jwt = require('jsonwebtoken');
const User = require('../models/User.model');

const { asyncHandler, protect: AuthCheck, Authorize } = require('@nijisog/todo_common');

exports.protect = asyncHandler(async (req, res, next) => {
    try {
        
        let authCheck;
        await AuthCheck(req, process.env.JWT_SECRET).then((resp) => {
            authCheck = resp || null;
        });

        // make sure token exists
        if(authCheck === null){
            return next(new ErrorResponse('Invalid token', 401, ['User not authorize to access this route']))
        }

        req.user = await User.findOne({ _id: authCheck.id });

        if(req.user){
            return next();
        }else{
            return next(new ErrorResponse('Invalid token', 401, ['User not authorize to access this route']));
        }

    } catch (err) {
        console.log(error);
        return next(new ErrorResponse('Error', 401, ['user is not authorize to access this route']));
    }
});

// Grant access to specific roles
// Roles are strings of arrays. E.g ['superadmin', 'admin']
exports.authorize = (roles) => {

    let authPermit;
    return asyncHandler(async (req, res, next) => {

        const user = req.user;

        if(!user){
            return next(new ErrorResponse('Unauthorized!', 401, ['User is not signed in']));
        }

        await Authorize(roles, user.roles).then((resp) => {
            authPermit = resp;
        })

        if(!authPermit){
            return next(new ErrorResponse('Unauthorized!', 401, ['user is not authorize to access this route']))
        }else{
            return next();
        }

    })
}