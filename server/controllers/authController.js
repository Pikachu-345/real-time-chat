const asyncHandler = require('express-async-handler');
const User = require('../models/User');
const generateToken = require('../utils/jwt');

// Helper function to set JWT in an HTTP-only cookie
const sendTokenResponse = (user, statusCode, res) => {
    const token = generateToken(user._id);

    const options = {
        expires: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000), 
        httpOnly: true, 
        secure: true, 
        sameSite: 'None'
    };
    
    // If using http (development), don't set secure
    // if (process.env.NODE_ENV === 'development') {
    //     options.secure = false;
    // }
    
    res.status(statusCode)
        .cookie('token', token, options) 
        .json({
            success: true,
            token, // You can still send the token in the body if your frontend needs it for initial setup, but the cookie is primary.
            user: {
                _id: user._id,
                username: user.username,
                email: user.email,
                fullname: user.fullname
            },
        });
};


// @desc    Register user
// @route   POST /api/auth/signup
// @access  Public
const registerUser = asyncHandler(async (req, res) => {
    const { username, email, fullname, password } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) {
        res.status(400); // Bad request
        throw new Error('User with that email already exists');
    }

    // Create user
    const user = await User.create({
        username,
        email,
        fullname,
        password,
    });

    if (user) {
        // Send token via cookie
        sendTokenResponse(user, 201, res);
    } else {
        res.status(400);
        throw new Error('Invalid user data');
    }
});

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
const loginUser = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        res.status(400);
        throw new Error('Please enter all fields');
    }

    // Check for user
    const user = await User.findOne({ email }).select('+password'); // Select password explicitly

    if (!user) {
        res.status(401); 
        throw new Error('Invalid credentials');
    }

    // Check if password matches
    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
        res.status(401);
        throw new Error('Invalid credentials');
    }

    // Send token via cookie
    sendTokenResponse(user, 200, res);
});

// @desc    Log user out / clear cookie
// @route   POST /api/auth/logout
// @access  Private (or Public, depends on your preference)
const logoutUser = asyncHandler(async (req, res) => {
    res.cookie('token', 'none', {
        expires: new Date(Date.now() + 10 * 1000), // Expires in 10 seconds
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production'
    });

    res.status(200).json({
        success: true,
        message: 'Logged out successfully',
    });
});

// @desc    Get current user profile (example of a protected route)
// @route   GET /api/auth/me
// @access  Private
const getMe = asyncHandler(async (req, res) => {
    // req.user is set by the protect middleware
    res.status(200).json({
        success: true,
        user: req.user,
    });
});


module.exports = {
    registerUser,
    loginUser,
    logoutUser,
    getMe,
};