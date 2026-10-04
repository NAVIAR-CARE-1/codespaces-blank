// Authentication middleware and utilities
// JWT token generation, verification, and user validation

const jwt = require('jsonwebtoken');
const config = require('./config');

/**
 * Generate JWT token
 * @param {object} payload - Data to encode in token
 * @param {string} expiresIn - Token expiration time (default: from config)
 * @returns {string} JWT token
 */
const generateToken = (payload, expiresIn = config.jwt.expiresIn) => {
  return jwt.sign(payload, config.jwt.secret, { expiresIn });
};

/**
 * Generate refresh token (longer expiration)
 * @param {string} userId - User ID
 * @returns {string} Refresh token
 */
const generateRefreshToken = (userId) => {
  return jwt.sign(
    { userId, type: 'refresh' },
    config.jwt.secret,
    { expiresIn: config.jwt.refreshExpiresIn }
  );
};

/**
 * Verify and decode JWT token
 * @param {string} token - JWT token to verify
 * @returns {object|null} Decoded token or null if invalid
 */
const verifyToken = (token) => {
  try {
    return jwt.verify(token, config.jwt.secret);
  } catch (error) {
    console.error('[AUTH] Token verification failed:', error.message);
    return null;
  }
};

/**
 * Middleware: Verify JWT token in Authorization header
 * Sets req.user if token is valid
 */
const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      error: 'Unauthorized',
      message: 'Missing or invalid authorization header'
    });
  }

  const token = authHeader.slice(7); // Remove 'Bearer ' prefix
  const decoded = verifyToken(token);

  if (!decoded) {
    return res.status(401).json({
      error: 'Unauthorized',
      message: 'Invalid or expired token'
    });
  }

  req.user = decoded;
  next();
};

/**
 * Middleware: Verify user role
 * Usage: authorize('admin', 'org-admin')
 */
const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        error: 'Forbidden',
        message: `This action requires one of these roles: ${allowedRoles.join(', ')}`
      });
    }

    next();
  };
};

/**
 * Middleware: Verify organization access
 * Ensures user belongs to the requested organization
 */
const requireOrgAccess = (req, res, next) => {
  const orgId = req.params.orgId || req.body.orgId;

  if (!req.user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  // Super-admin can access any organization
  if (req.user.role === 'admin') {
    return next();
  }

  // Organization admin can only access their own organization
  if (req.user.orgId !== orgId) {
    return res.status(403).json({
      error: 'Forbidden',
      message: 'You do not have access to this organization'
    });
  }

  next();
};

/**
 * Hash password (placeholder - should use bcrypt in production)
 * @param {string} password - Plain text password
 * @returns {string} Hashed password
 */
const hashPassword = (password) => {
  // TODO: Implement bcrypt hashing
  // return await bcrypt.hash(password, 10);
  return Buffer.from(password).toString('base64');
};

/**
 * Compare password with hash (placeholder)
 * @param {string} password - Plain text password
 * @param {string} hash - Hashed password
 * @returns {boolean} True if passwords match
 */
const comparePassword = (password, hash) => {
  // TODO: Implement bcrypt comparison
  // return await bcrypt.compare(password, hash);
  return Buffer.from(password).toString('base64') === hash;
};

module.exports = {
  generateToken,
  generateRefreshToken,
  verifyToken,
  authenticate,
  authorize,
  requireOrgAccess,
  hashPassword,
  comparePassword,
};
