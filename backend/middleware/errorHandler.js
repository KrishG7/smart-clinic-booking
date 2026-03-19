/**
 * Error Handler Middleware
 * Centralized error handling for the Express application
 */

function errorHandler(err, req, res, next) {
    console.error('Error:', err);

    // Default error values
    let statusCode = err.statusCode || 500;
    let message = err.message || 'Internal Server Error';

    // Handle specific error types
    if (err.name === 'ValidationError') {
        statusCode = 400;
        message = 'Validation failed: ' + err.message;
    }

    if (err.name === 'JsonWebTokenError') {
        statusCode = 401;
        message = 'Invalid authentication token';
    }

    if (err.name === 'TokenExpiredError') {
        statusCode = 401;
        message = 'Authentication token has expired';
    }

    if (err.code === 'ER_DUP_ENTRY') {
        statusCode = 409;
        message = 'A record with this information already exists';
    }

    if (err.code === 'ER_NO_REFERENCED_ROW_2') {
        statusCode = 400;
        message = 'Referenced record not found';
    }

    // Send error response
    res.status(statusCode).json({
        success: false,
        message,
        ...(process.env.NODE_ENV === 'development' && {
            stack: err.stack,
            details: err.details
        })
    });
}

module.exports = errorHandler;
