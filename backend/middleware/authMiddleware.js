/**
 * Auth Middleware
 * JWT token verification and role-based access control
 */

const { verifyToken } = require('../config/auth');

/**
 * Authenticate a request by verifying the JWT token
 */
function authenticate(req, res, next) {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                success: false,
                message: 'Access denied. No token provided.'
            });
        }

        const token = authHeader.split(' ')[1];
        const decoded = verifyToken(token);

        // Attach user info to request
        req.user = {
            id: decoded.id,
            phone: decoded.phone,
            role: decoded.role,
            name: decoded.name
        };

        next();
    } catch (error) {
        return res.status(401).json({
            success: false,
            message: 'Invalid or expired token'
        });
    }
}

/**
 * Authorize based on user roles
 * @param  {...string} roles - Allowed roles
 */
function authorize(...roles) {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'Authentication required'
            });
        }

        if (!roles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: `Access denied. Required role: ${roles.join(' or ')}`
            });
        }

        next();
    };
}

module.exports = { authenticate, authorize };
