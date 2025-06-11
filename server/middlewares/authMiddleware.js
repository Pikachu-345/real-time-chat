const jwt = require('jsonwebtoken');
const asyncHandler = require('express-async-handler'); // For simplifying async error handling
const User = require('../models/User');
const keys = require('../config/keys');

const protect = asyncHandler(async (req, res, next) => {
    let token;

    if (req.cookies.token) {
        token = req.cookies.token;
    }
    // if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    //     token = req.headers.authorization.split(' ')[1];
    // }

    if (!token) {
        res.status(401);
        throw new Error('Not authorized, no token');
    }

    try {
        const decoded = jwt.verify(token, keys.jwtSecret);

        req.user = await User.findById(decoded.id).select('-password');
        if (!req.user) {
            res.status(404);
            throw new Error('User not found');
        }
        next();
    } catch (error) {
        console.error(error);
        res.status(401);
        throw new Error('Not authorized, token failed');
    }
});

module.exports = { protect };