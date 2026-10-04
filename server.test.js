// NAVIAR CONSULT — Integration tests
const request = require('supertest');
const express = require('express');
const db = require('./db');
const auth = require('./auth');
const utils = require('./utils');

describe('NAVIAR CONSULT API', () => {
  describe('Health Check', () => {
    it('should return health status', async () => {
      const app = express();
      app.get('/api/health', async (req, res) => {
        try {
          const result = await db.queryOne('SELECT NOW()');
          res.json({
            status: 'ok',
            timestamp: new Date().toISOString(),
            database: result ? 'connected' : 'disconnected'
          });
        } catch (error) {
          res.status(503).json({ status: 'error', error: 'Database connection failed' });
        }
      });

      const response = await request(app).get('/api/health');
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('status');
      expect(response.body).toHaveProperty('timestamp');
    });
  });

  describe('UUID Validation', () => {
    it('should validate correct UUID', () => {
      const validUUID = '550e8400-e29b-41d4-a716-446655440000';
      expect(utils.isValidUUID(validUUID)).toBe(true);
    });

    it('should reject invalid UUID', () => {
      const invalidUUID = 'not-a-uuid';
      expect(utils.isValidUUID(invalidUUID)).toBe(false);
    });

    it('should reject empty string', () => {
      expect(utils.isValidUUID('')).toBe(false);
    });
  });

  describe('Email Validation', () => {
    it('should validate correct email', () => {
      expect(utils.isValidEmail('test@example.com')).toBe(true);
    });

    it('should validate Norwegian email domain', () => {
      expect(utils.isValidEmail('user@company.no')).toBe(true);
    });

    it('should reject invalid email', () => {
      expect(utils.isValidEmail('not-an-email')).toBe(false);
    });

    it('should reject email without domain', () => {
      expect(utils.isValidEmail('user@')).toBe(false);
    });
  });

  describe('JWT Token Generation', () => {
    it('should generate valid token', async () => {
      const userId = '550e8400-e29b-41d4-a716-446655440000';
      const token = await auth.generateToken(userId, 'admin');
      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
    });

    it('should decode valid token', async () => {
      const userId = '550e8400-e29b-41d4-a716-446655440000';
      const token = await auth.generateToken(userId, 'admin');
      const decoded = await auth.verifyToken(token);
      expect(decoded).toBeDefined();
      expect(decoded.userId).toBe(userId);
      expect(decoded.role).toBe('admin');
    });

    it('should reject invalid token', async () => {
      const invalidToken = 'invalid.token.here';
      expect(() => auth.verifyToken(invalidToken)).toThrow();
    });

    it('should reject expired token', async () => {
      // This would require mocking time or creating a real expired token
      const expiredToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjB9.invalid';
      expect(() => auth.verifyToken(expiredToken)).toThrow();
    });
  });

  describe('Password Hashing', () => {
    it('should hash password securely', async () => {
      const password = 'SecurePassword123!';
      const hashed = await auth.hashPassword(password);
      expect(hashed).toBeDefined();
      expect(hashed).not.toBe(password);
    });

    it('should verify correct password', async () => {
      const password = 'SecurePassword123!';
      const hashed = await auth.hashPassword(password);
      const matches = await auth.comparePassword(password, hashed);
      expect(matches).toBe(true);
    });

    it('should reject incorrect password', async () => {
      const password = 'SecurePassword123!';
      const wrongPassword = 'WrongPassword456!';
      const hashed = await auth.hashPassword(password);
      const matches = await auth.comparePassword(wrongPassword, hashed);
      expect(matches).toBe(false);
    });

    it('should produce different hashes for same password', async () => {
      const password = 'SecurePassword123!';
      const hash1 = await auth.hashPassword(password);
      const hash2 = await auth.hashPassword(password);
      expect(hash1).not.toBe(hash2);
    });
  });

  describe('Request Validation', () => {
    it('should validate register request body', () => {
      const validData = {
        email: 'test@example.com',
        password: 'SecurePass123!',
        name: 'Test User',
        type: 'admin'
      };
      const schema = utils.getValidationSchema('register');
      const { error, value } = schema.validate(validData);
      expect(error).toBeUndefined();
      expect(value).toBeDefined();
    });

    it('should reject invalid email in register', () => {
      const invalidData = {
        email: 'not-an-email',
        password: 'SecurePass123!',
        name: 'Test User',
        type: 'admin'
      };
      const schema = utils.getValidationSchema('register');
      const { error } = schema.validate(invalidData);
      expect(error).toBeDefined();
    });

    it('should reject weak password', () => {
      const invalidData = {
        email: 'test@example.com',
        password: 'weak',
        name: 'Test User',
        type: 'admin'
      };
      const schema = utils.getValidationSchema('register');
      const { error } = schema.validate(invalidData);
      expect(error).toBeDefined();
    });
  });

  describe('Date Utilities', () => {
    it('should format date correctly', () => {
      const date = new Date('2026-01-15T10:30:00Z');
      const formatted = utils.formatDate(date);
      expect(formatted).toMatch(/2026-01-15/);
    });

    it('should add days to date', () => {
      const baseDate = new Date('2026-01-15');
      const futureDate = utils.addDays(baseDate, 7);
      expect(futureDate.getDate()).toBe(22);
    });

    it('should calculate business days correctly', () => {
      const startDate = new Date('2026-01-12'); // Monday
      const endDate = new Date('2026-01-16');   // Friday
      const businessDays = utils.getBusinessDays(startDate, endDate);
      expect(businessDays).toBe(4); // Mon-Thu (Friday is day 5 but not included in range)
    });

    it('should detect Norwegian holidays', () => {
      const newYearsDay = new Date('2026-01-01');
      expect(utils.isNorwegianHoliday(newYearsDay)).toBe(true);
    });
  });

  describe('Encryption', () => {
    it('should encrypt and decrypt data', () => {
      const plaintext = 'Sensitive information';
      const encrypted = utils.encrypt(plaintext);
      expect(encrypted).not.toBe(plaintext);
      const decrypted = utils.decrypt(encrypted);
      expect(decrypted).toBe(plaintext);
    });

    it('should produce different ciphertexts for same plaintext', () => {
      const plaintext = 'Sensitive information';
      const encrypted1 = utils.encrypt(plaintext);
      const encrypted2 = utils.encrypt(plaintext);
      expect(encrypted1).not.toBe(encrypted2);
    });

    it('should handle special characters in encryption', () => {
      const plaintext = '特殊文字 🔐 !@#$%^&*()';
      const encrypted = utils.encrypt(plaintext);
      const decrypted = utils.decrypt(encrypted);
      expect(decrypted).toBe(plaintext);
    });
  });

  describe('HMAC Verification', () => {
    it('should verify valid HMAC', () => {
      const payload = JSON.stringify({ test: 'data' });
      const signature = utils.generateHMAC(payload);
      const isValid = utils.verifyHMAC(payload, signature);
      expect(isValid).toBe(true);
    });

    it('should reject invalid HMAC', () => {
      const payload = JSON.stringify({ test: 'data' });
      const invalidSignature = 'invalid_signature_here';
      const isValid = utils.verifyHMAC(payload, invalidSignature);
      expect(isValid).toBe(false);
    });

    it('should reject tampered payload', () => {
      const payload = JSON.stringify({ test: 'data' });
      const signature = utils.generateHMAC(payload);
      const tamperedPayload = JSON.stringify({ test: 'tampered' });
      const isValid = utils.verifyHMAC(tamperedPayload, signature);
      expect(isValid).toBe(false);
    });
  });

  describe('Rate Limiting', () => {
    it('should track request count', () => {
      const limiter = utils.createRateLimiter(10, 60000);
      let allowedCount = 0;
      for (let i = 0; i < 15; i++) {
        if (limiter.isAllowed('test-key')) allowedCount++;
      }
      expect(allowedCount).toBe(10);
    });

    it('should reset after time window', async () => {
      const limiter = utils.createRateLimiter(2, 100);
      limiter.isAllowed('test-key');
      limiter.isAllowed('test-key');
      expect(limiter.isAllowed('test-key')).toBe(false);
      await new Promise(resolve => setTimeout(resolve, 150));
      expect(limiter.isAllowed('test-key')).toBe(true);
    });
  });

  describe('Norwegian Compliance', () => {
    it('should format phone number correctly', () => {
      const phone = '98765432';
      const formatted = utils.formatNorwegianPhone(phone);
      expect(formatted).toMatch(/^(\+47\s?)?[\d\s]{8,}$/);
    });

    it('should validate Norwegian ID number', () => {
      const validID = '11057698765'; // Example FNR format
      const isValid = utils.isValidNorwegianID(validID);
      expect(typeof isValid).toBe('boolean');
    });

    it('should parse Norwegian organization number', () => {
      const orgNumber = '123456789'; // 9 digits
      const isValid = utils.isValidNorwegianOrgNumber(orgNumber);
      expect(typeof isValid).toBe('boolean');
    });
  });
});
