// backend/middleware/auth.js

const jwt = require('jsonwebtoken');

exports.protect = (req, res, next) => {
  let token;

  // 1. Check if token exists in the Authorization header (Bearer token)
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      
      // 2. Verify the token using the secret key
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');

      // 3. Attach user info (id and role) to the request object
      req.userId = decoded.id; 
      req.role = decoded.role; 

      next(); // Proceed to the next middleware/controller

    } catch (error) {
      console.error('Token verification failed:', error.message);
      return res.status(401).json({ success: false, message: 'Not authorized, token failed.' });
    }
  }

  if (!token) {
    return res.status(401).json({ success: false, message: 'Not authorized, no token.' });
  }
};

exports.restrictTo = (...roles) => {
    return (req, res, next) => {
        // Check if the user's role is included in the allowed roles list
        if (!roles.includes(req.role)) {
            return res.status(403).json({ success: false, message: 'Forbidden: You do not have permission for this resource.' });
        }
        next();
    };
};