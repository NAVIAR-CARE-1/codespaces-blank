// Utility functions for common operations

/**
 * Validate email format
 * @param {string} email - Email address
 * @returns {boolean} True if valid email
 */
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validate UUID format
 * @param {string} uuid - UUID string
 * @returns {boolean} True if valid UUID
 */
const isValidUUID = (uuid) => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
};

/**
 * Validate date format (YYYY-MM-DD)
 * @param {string} dateStr - Date string
 * @returns {boolean} True if valid date
 */
const isValidDate = (dateStr) => {
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(dateStr)) return false;

  const date = new Date(dateStr);
  return date instanceof Date && !isNaN(date);
};

/**
 * Paginate query results
 * @param {number} page - Page number (1-indexed)
 * @param {number} perPage - Items per page
 * @returns {object} Pagination metadata
 */
const getPagination = (page = 1, perPage = 20) => {
  const p = Math.max(1, parseInt(page) || 1);
  const limit = Math.max(1, Math.min(100, parseInt(perPage) || 20));
  const offset = (p - 1) * limit;

  return { page: p, limit, offset };
};

/**
 * Format pagination response
 * @param {array} data - Query results
 * @param {number} total - Total record count
 * @param {number} page - Current page
 * @param {number} limit - Items per page
 * @returns {object} Formatted pagination response
 */
const formatPaginatedResponse = (data, total, page, limit) => {
  const totalPages = Math.ceil(total / limit);

  return {
    data,
    pagination: {
      page,
      perPage: limit,
      total,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1,
    },
  };
};

/**
 * Parse query filters from request
 * @param {object} query - Query parameters
 * @param {array} allowedFields - Fields that can be filtered
 * @returns {object} Parsed filters
 */
const parseFilters = (query, allowedFields = []) => {
  const filters = {};

  allowedFields.forEach(field => {
    if (query[field] !== undefined && query[field] !== '') {
      filters[field] = query[field];
    }
  });

  return filters;
};

/**
 * Build WHERE clause for SQL query
 * @param {object} filters - Filter conditions
 * @returns {object} SQL WHERE clause and parameters
 */
const buildWhereClause = (filters) => {
  const conditions = [];
  const values = [];
  let paramIndex = 1;

  Object.entries(filters).forEach(([field, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      conditions.push(`${field} = $${paramIndex}`);
      values.push(value);
      paramIndex++;
    }
  });

  const whereClause = conditions.length > 0
    ? `WHERE ${conditions.join(' AND ')}`
    : '';

  return { whereClause, values };
};

/**
 * Calculate days between two dates
 * @param {Date|string} startDate - Start date
 * @param {Date|string} endDate - End date (default: today)
 * @returns {number} Number of days
 */
const daysBetween = (startDate, endDate = new Date()) => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const msPerDay = 1000 * 60 * 60 * 24;

  return Math.floor((end - start) / msPerDay);
};

/**
 * Format date for display (ISO 8601)
 * @param {Date|string} date - Date to format
 * @returns {string} Formatted date (YYYY-MM-DD)
 */
const formatDate = (date) => {
  const d = new Date(date);
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${month}-${day}`;
};

/**
 * Generate unique ID (simple implementation)
 * @returns {string} Unique ID
 */
const generateId = () => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Sanitize object for response (remove sensitive fields)
 * @param {object} obj - Object to sanitize
 * @param {array} fieldsToOmit - Fields to remove
 * @returns {object} Sanitized object
 */
const sanitize = (obj, fieldsToOmit = ['password', 'passwordHash', 'secret', 'token']) => {
  if (!obj || typeof obj !== 'object') return obj;

  const sanitized = { ...obj };
  fieldsToOmit.forEach(field => {
    delete sanitized[field];
  });

  return sanitized;
};

/**
 * Build response object
 * @param {*} data - Response data
 * @param {string} message - Optional message
 * @param {object} meta - Optional metadata
 * @returns {object} Formatted response
 */
const buildResponse = (data, message = null, meta = {}) => {
  const response = { data };
  if (message) response.message = message;
  if (Object.keys(meta).length > 0) response.meta = meta;
  return response;
};

/**
 * Build error response object
 * @param {string} error - Error message
 * @param {number} statusCode - HTTP status code
 * @param {string} detail - Optional error detail
 * @returns {object} Formatted error response
 */
const buildErrorResponse = (error, statusCode = 400, detail = null) => {
  const response = { error, statusCode };
  if (detail) response.detail = detail;
  return response;
};

module.exports = {
  isValidEmail,
  isValidUUID,
  isValidDate,
  getPagination,
  formatPaginatedResponse,
  parseFilters,
  buildWhereClause,
  daysBetween,
  formatDate,
  generateId,
  sanitize,
  buildResponse,
  buildErrorResponse,
};
