// Configuration management for NAVIAR platform
// Centralized settings for environment, database, and services

require('dotenv').config();

module.exports = {
  // Environment
  env: process.env.NODE_ENV || 'development',
  isDev: process.env.NODE_ENV !== 'production',
  isProd: process.env.NODE_ENV === 'production',

  // Server
  port: process.env.PORT || 3000,
  host: process.env.HOST || 'localhost',

  // Database
  database: {
    url: process.env.DATABASE_URL || 'postgresql://user:password@localhost:5432/naviar',
    pool: {
      min: 2,
      max: 10,
    },
    debug: process.env.DB_DEBUG === 'true',
  },

  // Authentication
  jwt: {
    secret: process.env.JWT_SECRET || 'your-secret-key-change-in-production',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '30d',
  },

  // Session
  session: {
    secret: process.env.SESSION_SECRET || 'session-secret-change-in-production',
    cookieMaxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  },

  // CORS
  cors: {
    origin: process.env.CORS_ORIGIN || ['http://localhost:3000', 'http://localhost:3001'],
    credentials: true,
  },

  // OAuth (for future integration with Azure AD, etc.)
  oauth: {
    azureAd: {
      clientId: process.env.AZURE_AD_CLIENT_ID,
      clientSecret: process.env.AZURE_AD_CLIENT_SECRET,
      tenantId: process.env.AZURE_AD_TENANT_ID,
    },
  },

  // File Storage
  storage: {
    type: process.env.STORAGE_TYPE || 'local', // 'local', 's3', 'vercel'
    s3: {
      region: process.env.AWS_REGION,
      bucket: process.env.AWS_BUCKET,
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
  },

  // Email Configuration
  email: {
    from: process.env.EMAIL_FROM || 'noreply@naviar.no',
    provider: process.env.EMAIL_PROVIDER || 'sendgrid', // 'sendgrid', 'resend', 'smtp'
    sendgrid: {
      apiKey: process.env.SENDGRID_API_KEY,
    },
    resend: {
      apiKey: process.env.RESEND_API_KEY,
    },
  },

  // Logging
  logging: {
    level: process.env.LOG_LEVEL || 'info',
    format: process.env.LOG_FORMAT || 'json',
  },

  // Feature Flags
  features: {
    enableStripe: process.env.ENABLE_STRIPE !== 'false',
    enableAnalytics: process.env.ENABLE_ANALYTICS !== 'false',
    enableNotifications: process.env.ENABLE_NOTIFICATIONS !== 'false',
  },
};
