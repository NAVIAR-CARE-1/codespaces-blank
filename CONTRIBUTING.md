# Contributing to NAVIAR CONSULT

This guide covers setup, development workflow, testing, and deployment for NAVIAR CONSULT.

## Quick Start

### Prerequisites
- Node.js 18+ (20.x recommended)
- Docker & Docker Compose
- PostgreSQL 15+ (if running without Docker)
- Git

### Local Development with Docker

```bash
# Clone repository
git clone <repository-url>
cd codespaces-blank

# Create environment file
cp .env.example .env

# Start services (PostgreSQL, app, MailHog)
docker-compose up -d

# Initialize database
docker-compose exec app npm run db:init

# View logs
docker-compose logs -f app

# Access application
# API: http://localhost:5000
# MailHog: http://localhost:8025
```

### Local Development Without Docker

```bash
# Install dependencies
npm install

# Create environment file
cp .env.example .env

# Configure .env with your database details
# Set DATABASE_URL=postgres://user:pass@localhost:5432/naviar_consult

# Initialize database
npm run db:init

# Start development server
npm run dev

# In another terminal, watch for changes
npm run dev
```

## Project Structure

```
.
├── server.js                 # Express application entry point
├── db.js                     # Database connection pool
├── auth.js                   # Authentication & authorization
├── config.js                 # Configuration management
├── utils.js                  # Utility functions
├── notifications.js          # Email & notifications service
│
├── billing-routes.js         # Subscription & payment endpoints
├── documents-routes.js       # Document management endpoints
├── usage-routes.js           # Usage monitoring endpoints
├── analytics-routes.js       # Analytics endpoints
├── calendly-routes.js        # Calendly integration endpoints
├── whereby-routes.js         # Whereby video conferencing endpoints
├── sap-routes.js             # SAP SuccessFactors HR endpoints
├── visma-routes.js           # Visma accounting endpoints
│
├── billing.js                # Subscription & payment service
├── documents.js              # Document management service
├── usage.js                  # Usage monitoring service
├── analytics.js              # Analytics service
├── calendly.js               # Calendly integration service
├── whereby.js                # Whereby integration service
├── sap-successfactors.js     # SAP SuccessFactors integration service
├── visma.js                  # Visma integration service
│
├── schema.sql                # PostgreSQL schema
├── server.test.js            # Integration tests
├── Dockerfile                # Production Docker image
├── docker-compose.yml        # Local development environment
├── .github/workflows/ci-cd.yml # GitHub Actions pipeline
│
└── docs/
    ├── API.md                # REST API documentation
    ├── README.md             # System architecture
    └── DEPLOYMENT.md         # Production deployment guide
```

## Development Workflow

### 1. Create Feature Branch

```bash
git checkout -b feature/your-feature-name
# or
git checkout -b fix/your-bug-fix
```

### 2. Make Changes

Edit files and test locally:

```bash
# Run linter
npm run lint

# Fix linting issues automatically
npm run lint -- --fix

# Format code
npm run format

# Run tests
npm run test

# Run tests in watch mode
npm run test:watch
```

### 3. Commit Changes

```bash
git add .
git commit -m "feat: add new feature

Description of changes and why.
"
```

Follow conventional commits:
- `feat:` for new features
- `fix:` for bug fixes
- `docs:` for documentation
- `test:` for tests
- `refactor:` for code refactoring
- `perf:` for performance improvements
- `chore:` for maintenance

### 4. Push and Create PR

```bash
git push origin feature/your-feature-name
```

Then create a pull request on GitHub. CI/CD will automatically run.

## Testing

### Run All Tests

```bash
npm run test
```

### Run Specific Test

```bash
npm run test -- server.test.js
```

### Watch Mode

```bash
npm run test:watch
```

### Coverage Report

```bash
npm run test -- --coverage
```

Coverage thresholds:
- Statements: 80%
- Branches: 75%
- Functions: 80%
- Lines: 80%

## Code Quality

### Linting

```bash
npm run lint
```

ESLint rules enforce:
- 2-space indentation
- Single quotes
- No trailing commas
- No console.log in production code
- No var declarations

### Formatting

```bash
npm run format
```

Prettier enforces consistent code style across the project.

### Audit Dependencies

```bash
npm audit
```

Security vulnerabilities should be addressed before merging.

## Database Migrations

### Create Migration

```bash
# Manually edit schema.sql with new changes
# Then:
npm run db:reset  # Development only - drops all data!
```

### Safe Migration in Production

1. Create new migration file with timestamp: `migrations/YYYYMMDDHHMMSS_description.sql`
2. Test in staging environment first
3. Review with team
4. Execute in production during maintenance window

## Environment Variables

Copy `.env.example` to `.env` and configure:

```bash
# Server
NODE_ENV=development
PORT=5000

# Database
DB_HOST=localhost
DB_PORT=5432
DB_USER=naviar
DB_PASSWORD=secret123
DB_NAME=naviar_consult

# JWT
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=7d

# Encryption
ENCRYPTION_ALGORITHM=aes-256-cbc
ENCRYPTION_KEY=0123456789abcdef0123456789abcdef
ENCRYPTION_IV=fedcba9876543210

# Third-party APIs
STRIPE_SECRET_KEY=sk_test_...
CALENDLY_API_KEY=...
WHEREBY_API_KEY=...
SAP_API_KEY=...
VISMA_API_KEY=...

# Email
SMTP_HOST=localhost
SMTP_PORT=1025

# CORS
CORS_ORIGIN=http://localhost:3000
```

## Docker Commands

```bash
# Start services
docker-compose up -d

# Stop services
docker-compose down

# View logs
docker-compose logs -f app

# Execute command in container
docker-compose exec app npm run lint

# Build image
docker build -t naviar-consult .

# Run image
docker run -p 5000:5000 naviar-consult
```

## Debugging

### Console Logging

```bash
# View app logs with Docker
docker-compose logs -f app

# View PostgreSQL logs
docker-compose logs -f postgres
```

### Node Debugger

```bash
# Start with debugger
node --inspect server.js

# Connect Chrome DevTools to chrome://inspect
```

### Database Queries

```bash
# Connect to PostgreSQL
docker-compose exec postgres psql -U naviar naviar_consult

# Or with psql directly
psql postgres://naviar:secret123@localhost:5432/naviar_consult
```

## Performance

### Profile Application

```bash
node --prof server.js
node --prof-process isolate-*.log > profile.txt
```

### Monitor Memory

```bash
# Start with memory profiling
node --max-old-space-size=4096 server.js
```

### Database Optimization

- Add indexes for frequently queried columns
- Use EXPLAIN ANALYZE for slow queries
- Monitor connection pool usage
- Archive old records regularly

## Security Checklist

Before committing:
- [ ] No secrets or API keys in code
- [ ] No console.log with sensitive data
- [ ] SQL queries use parameterized queries
- [ ] Input validation on all endpoints
- [ ] Authentication required for protected routes
- [ ] CORS properly configured
- [ ] Helmet headers set
- [ ] HTTPS enforced in production
- [ ] Passwords hashed with bcrypt
- [ ] Sensitive data encrypted at rest

## Deployment

### Staging

1. Merge to `develop` branch
2. GitHub Actions automatically deploys to staging
3. Test in staging environment
4. Create PR to `main` branch

### Production

1. Merge to `main` branch
2. GitHub Actions runs full CI/CD pipeline
3. Creates Docker image and pushes to registry
4. Deploys to production environment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed production guide.

## Troubleshooting

### Port Already in Use

```bash
# Find process using port
lsof -i :5000

# Kill process
kill -9 <PID>

# Or change PORT in .env
```

### Database Connection Error

```bash
# Check PostgreSQL is running
docker-compose ps

# Check logs
docker-compose logs postgres

# Verify DATABASE_URL is correct
```

### Node Modules Issues

```bash
# Clean install
rm -rf node_modules package-lock.json
npm install
```

### Docker Build Issues

```bash
# Clear cache
docker system prune -a

# Rebuild
docker-compose build --no-cache
```

## Getting Help

1. Check existing issues/PRs on GitHub
2. Review API documentation in [API.md](./API.md)
3. Check deployment guide in [DEPLOYMENT.md](./DEPLOYMENT.md)
4. Review README for system architecture in [README.md](./README.md)

## Code Review Guidelines

When reviewing PRs:
- [ ] Code follows project style guide
- [ ] Tests are included and passing
- [ ] No security vulnerabilities
- [ ] Documentation updated if needed
- [ ] Commits follow conventional format
- [ ] No merge conflicts

## Release Process

1. Update version in `package.json`
2. Create release notes
3. Tag commit: `git tag v1.0.0`
4. Push tag: `git push origin v1.0.0`
5. GitHub Actions creates release automatically

## License

NAVIAR CONSULT © 2026. All rights reserved.
