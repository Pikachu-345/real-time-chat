const errorHandler = (err, req, res, next) => {
    let statusCode = err.statusCode || 500;
    let message = err.message || 'Server Error';

    // Mongoose bad ObjectId
    if (err.name === 'CastError') {
        message = `Resource not found with id of ${err.value}`;
        statusCode = 404;
    }

    // Mongoose duplicate key error
    if (err.code === 11000) {
        message = `Duplicate field value entered`;
        statusCode = 400;
    }

    // Mongoose validation error
    if (err.name === 'ValidationError') {
        message = Object.values(err.errors).map(val => val.message).join(', ');
        statusCode = 400;
    }

    // JWT expired error
    if (err.name === 'TokenExpiredError') {
        message = 'Token expired, please log in again';
        statusCode = 401;
    }

    // JWT malformed error
    if (err.name === 'JsonWebTokenError') {
        message = 'Not authorized, token failed';
        statusCode = 401;
    }

    res.status(statusCode).json({
        success: false,
        message: message,
        // In development, you might want to send the full error stack
        // stack: process.env.NODE_ENV === 'production' ? null : err.stack
    });
};

module.exports = errorHandler;