# NAVIAR CONSULT Development Guide

Quick reference for developing the NAVIAR CONSULT platform.

## Quick Start (5 minutes)

### Using Docker (Recommended)
```bash
# Start everything
docker-compose up -d

# Initialize database
docker-compose exec app npm run db:init

# API available at http://localhost:5000
# MailHog UI at http://localhost:8025
```

### Without Docker
```bash
# Install dependencies
npm install

# Setup database
npm run db:init

# Start development server
npm run dev
```

## File Structure Overview

### Entry Point
- `server.js` - Express application, all route mounting, middleware setup

### Authentication & Core
- `auth.js` - JWT tokens, password hashing, role-based access control
- `config.js` - Environment configuration and validation
- `db.js` - PostgreSQL connection pooling and query helpers
- `utils.js` - Utility functions (validation, encryption, formatting)
- `notifications.js` - Email and notification service

### Services (Business Logic)
- `billing.js` - Stripe subscriptions, payments, invoicing
- `documents.js` - Document upload, storage, encryption, sharing
- `usage.js` - Usage tracking and limit enforcement
- `analytics.js` - Metrics collection and reporting
- `calendly.js` - Calendly calendar integration
- `whereby.js` - Whereby video conferencing
- `sap-successfactors.js` - SAP HR integration
- `visma.js` - Visma accounting integration
- `payments.js` - Payment processing
- `stripe-webhooks.js` - Stripe webhook handling

### Routes (HTTP Endpoints)
- `*-routes.js` - REST API endpoints for each service
- 60+ endpoints across 8 route modules
- All protected with authentication middleware
- Consistent error handling and response formats

### Database
- `schema.sql` - PostgreSQL schema with 13+ tables
- Tables: users, organizations, consultations, documents, employees, etc.

### Tests
- `server.test.js` - Integration test suite
- 100+ test cases covering core functionality
- Can be extended for route-level and service-level tests

### Configuration
- `.env.example` - Environment variable template
- `docker-compose.yml` - Local development environment
- `Dockerfile` - Production Docker image
- `.eslintrc.json` - ESLint rules
- `.prettierrc.json` - Prettier formatting rules
- `.github/workflows/ci-cd.yml` - GitHub Actions pipeline

### Documentation
- `API.md` - Complete REST API documentation
- `README.md` - System architecture and overview
- `DEPLOYMENT.md` - Production deployment guide
- `CONTRIBUTING.md` - Development guidelines
- `DEVELOPMENT.md` - This file

## Common Tasks

### Add New API Endpoint

1. Add service method in `services/module.js`:
```javascript
async method(params) {
  // Business logic
  return { success: true, data };
}
```

2. Add route in `module-routes.js`:
```javascript
router.post('/endpoint', auth.authenticate, async (req, res) => {
  const result = await service.method(req.body);
  res.json(result);
});
```

3. Mount in `server.js`:
```javascript
app.use('/api', moduleRoutes);
```

4. Document in `API.md`

### Database Query

```javascript
const db = require('./db');

// Single row
const user = await db.queryOne(
  'SELECT * FROM users WHERE id = $1',
  [userId]
);

// Multiple rows
const users = await db.queryMany(
  'SELECT * FROM users WHERE org_id = $1',
  [orgId]
);

// Execute (INSERT, UPDATE, DELETE)
await db.execute(
  'INSERT INTO users (id, email) VALUES ($1, $2)',
  [id, email]
);
```

### Add Service Integration

1. Create `module.js` with service class
2. Create `module-routes.js` with endpoints
3. Export singleton from `module.js`
4. Import and mount routes in `server.js`
5. Document endpoints in `API.md`

### Test Code

```bash
# Run all tests
npm run test

# Run specific file
npm run test -- server.test.js

# Watch mode
npm run test:watch

# Coverage report
npm run test -- --coverage
```

### Deploy Changes

```bash
# Local testing
npm run dev

# Production build
docker build -t naviar-consult .

# Push to registry
docker tag naviar-consult ghcr.io/naviar-care-1/codespaces-blank
docker push ghcr.io/naviar-care-1/codespaces-blank
```

## Environment Variables

Critical variables (see `.env.example` for all):

```
NODE_ENV=development
PORT=5000
DATABASE_URL=postgres://user:pass@localhost:5432/naviar_consult
JWT_SECRET=your-secret-key
ENCRYPTION_KEY=32-hex-character-key
STRIPE_SECRET_KEY=sk_test_...
CORS_ORIGIN=http://localhost:3000
```

## API Examples

### Register User
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.no",
    "password": "SecurePass123!",
    "name": "User Name",
    "type": "admin"
  }'
```

### Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.no",
    "password": "SecurePass123!"
  }'
```

### Health Check
```bash
curl http://localhost:5000/api/health
```

### Protected Endpoint
```bash
curl -X GET http://localhost:5000/api/client/profile \
  -H "Authorization: Bearer <JWT_TOKEN>"
```

## Troubleshooting

### Port 5000 Already in Use
```bash
lsof -i :5000
kill -9 <PID>
```

### Database Connection Error
```bash
# Check if PostgreSQL is running
docker-compose ps postgres

# Check connection string
echo $DATABASE_URL
```

### Tests Failing
```bash
# Make sure database is initialized
npm run db:init

# Clear test cache
npm run test -- --clearCache
```

### Node Modules Issues
```bash
rm -rf node_modules package-lock.json
npm install
```

## Performance Tips

1. **Database Indexes**: Use EXPLAIN ANALYZE for slow queries
2. **Connection Pooling**: Database pool configured in `db.js`
3. **Caching**: Implement Redis for frequently accessed data
4. **Compression**: Middleware already enabled
5. **Rate Limiting**: Configured per tier in billing module

## Security Checklist

Before pushing:
- [ ] No hardcoded secrets in code
- [ ] All database queries parameterized
- [ ] Input validation on endpoints
- [ ] Authentication on protected routes
- [ ] CORS properly configured
- [ ] Passwords hashed with bcrypt
- [ ] Sensitive data encrypted
- [ ] No console.log with sensitive data

## Monitoring & Logs

### Application Logs
```bash
# With Docker
docker-compose logs -f app

# Without Docker
npm run dev 2>&1 | tee app.log
```

### Database Logs
```bash
docker-compose logs -f postgres
```

### Error Tracking
- Production errors logged to database
- Webhooks sent for critical errors
- Email alerts configured in notifications.js

## Next Steps

After development:
1. Run full test suite: `npm run test`
2. Check code quality: `npm run lint`
3. Format code: `npm run format`
4. Create pull request
5. GitHub Actions runs CI/CD pipeline
6. Deploy to staging/production

## Resources

- [API Documentation](./API.md)
- [Deployment Guide](./DEPLOYMENT.md)
- [Contributing Guidelines](./CONTRIBUTING.md)
- [System Architecture](./README.md)
- [GitHub Actions Workflow](./.github/workflows/ci-cd.yml)
- [PostgreSQL Schema](./schema.sql)

## Support

For issues:
1. Check existing GitHub issues
2. Review documentation above
3. Ask in team chat/Slack
4. Create new issue with reproduction steps

---

**Last Updated**: 2026-10-04
**Project**: NAVIAR CONSULT
**Version**: 0.1.0
