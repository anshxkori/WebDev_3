const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
  let token = null;

  // Check Authorization header (Bearer <token> or direct token)
  if (req.headers.authorization) {
    if (req.headers.authorization.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    } else {
      token = req.headers.authorization;
    }
  } else if (req.headers['x-access-token']) {
    token = req.headers['x-access-token'];
  } else if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
  }

  // If no token is provided, return 403 Forbidden as per assignment screenshot Fig 2 / Fig 4
  if (!token) {
    return res.status(403).json({ message: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'supersecret_jwt_key_lab4_secure_connect_platform_2026');
    req.user = decoded; // { id, username, email, role }
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid or expired token', error: error.message });
  }
};

// Role-based access control (RBAC) middleware for extra security demonstration
const requireRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Forbidden: Insufficient privileges' });
    }
    next();
  };
};

module.exports = {
  authMiddleware,
  requireRole,
};
