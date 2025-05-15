// middleware/authenticateToken.js
const jwt = require("jsonwebtoken");
const SECRET_KEY = process.env.JWT_SECRET;

const authenticateToken = (req, res, next) => {
    console.log('AuthenticateToken middleware - checking auth header');
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
  
    if (!token) {
      console.log('No token provided');
      return res.status(401).json({ error: "Access denied. No token provided" });
    }
  
    jwt.verify(token, SECRET_KEY, (err, decoded) => {
      if (err) {
        console.log('Token verification failed:', err.message);
        return res.status(403).json({ error: "Invalid or expired token" });
      }
  
      console.log('Token decoded successfully:', decoded);
      req.user = {
        id: decoded.id,
        role_id: decoded.role_id,
        role: decoded.role.toLowerCase()
      };
      next();
    });
};

const requireRole = (allowedRoles) => {
    return (req, res, next) => {
        if (!req.user || !req.user.role) {
            return res.status(401).json({ error: "Authentication required" });
        }

        const userRole = req.user.role.toLowerCase();
        const rolesArray = Array.isArray(allowedRoles) 
            ? allowedRoles.map(r => r.toLowerCase())
            : [allowedRoles.toLowerCase()];

        if (!rolesArray.includes(userRole)) {
            return res.status(403).json({ 
                error: "Insufficient permissions",
                details: `Required role: ${allowedRoles}`
            });
        }

        next();
    };
};

module.exports = { authenticateToken, requireRole }; // Only authentication exports