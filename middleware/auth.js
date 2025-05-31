const jwt = require('jsonwebtoken');
const JWT_SECRET = 'jibon_onk_kothin';

const authMiddleware = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            return res.status(401).json({
                success: false,
                message: 'No token provided'
            });
        }
        const token = authHeader.split(' ')[1]; 
        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'Invalid token format'
            });
        }
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded;
        next();
        
    } catch (error) {
        return res.status(401).json({
            success: false,
            message: 'Invalid token',
            error: error.message
        });
    }
};

module.exports = authMiddleware;