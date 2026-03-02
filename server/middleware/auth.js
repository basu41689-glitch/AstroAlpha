// Backend Middleware - Authentication
// JWT verification and user authentication

export const authMiddleware = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }
    
    // TODO: Verify JWT token
    // const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // req.user = decoded;
    
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

export const isAdmin = (req, res, next) => {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
};

export const validateRequest = (schema) => {
  return (req, res, next) => {
    try {
      // TODO: Validate request body against schema
      next();
    } catch (error) {
      res.status(400).json({ error: 'Invalid request data' });
    }
  };
};
