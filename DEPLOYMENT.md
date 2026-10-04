# NAVIAR CONSULT - Production Deployment Guide

## Pre-Deployment Checklist

### Security
- [ ] All API keys and secrets stored in environment variables
- [ ] Database password is strong and unique
- [ ] HTTPS/TLS certificates installed
- [ ] CORS origins properly configured (whitelist only trusted domains)
- [ ] Rate limiting enabled for production
- [ ] CSRF protection enabled
- [ ] Helmet security headers configured
- [ ] SQL injection prevention verified (parameterized queries)
- [ ] XSS protection enabled in all responses

### Compliance
- [ ] Norwegian tax information verified and configured
- [ ] Company business number and VAT number set
- [ ] Privacy policy published
- [ ] Terms of service published
- [ ] Data retention policies documented
- [ ] GDPR consent flow implemented
- [ ] Audit logging enabled

### Infrastructure
- [ ] PostgreSQL database backed up
- [ ] Database replica/failover configured (production)
- [ ] Server certificates installed
- [ ] Firewall rules configured
- [ ] Load balancer configured (if multi-server)
- [ ] Monitoring and alerting set up
- [ ] Log aggregation configured

### Testing
- [ ] All tests passing
- [ ] Load testing completed
- [ ] Security scanning completed
- [ ] SQL injection testing completed
- [ ] Cross-browser testing completed

## Database Setup

### 1. Create PostgreSQL Database

```bash
# Connect to PostgreSQL
psql -U postgres

# Create database and user
CREATE DATABASE naviar_consult;
CREATE USER naviar_admin WITH PASSWORD 'secure_password_here';
ALTER ROLE naviar_admin SET client_encoding TO 'utf8';
ALTER ROLE naviar_admin SET default_transaction_isolation TO 'read committed';
ALTER ROLE naviar_admin SET default_transaction_deferrable TO on;
ALTER ROLE naviar_admin SET timezone TO 'Europe/Oslo';
GRANT ALL PRIVILEGES ON DATABASE naviar_consult TO naviar_admin;

# Exit psql
\q
```

### 2. Load Schema

```bash
psql -U naviar_admin -d naviar_consult < schema.sql
```

### 3. Verify Tables

```bash
psql -U naviar_admin -d naviar_consult -c "\dt"
```

Should show 13+ tables created successfully.

## Environment Configuration

### 1. Production .env File

Create `/app/.env` with production values:

```bash
NODE_ENV=production
PORT=3000
HOST=0.0.0.0

DATABASE_URL=postgresql://naviar_admin:password@db.example.com:5432/naviar_consult
DB_HOST=db.example.com
DB_PORT=5432
DB_USER=naviar_admin
DB_PASSWORD=your_secure_password
DB_NAME=naviar_consult

JWT_SECRET=your_very_long_random_jwt_secret_minimum_32_characters
JWT_REFRESH_SECRET=your_very_long_random_refresh_secret_minimum_32_characters
JWT_EXPIRY=24h
JWT_REFRESH_EXPIRY=7d

CORS_ORIGIN=https://app.naviar-consult.no,https://www.naviar-consult.no
STRIPE_SECRET_KEY=sk_live_your_actual_stripe_key
STRIPE_WEBHOOK_SECRET=whsec_your_actual_webhook_secret
STRIPE_PUBLIC_KEY=pk_live_your_actual_public_key

SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=noreply@naviar-consult.no
SMTP_PASSWORD=your_gmail_app_password
SMTP_FROM=NAVIAR CONSULT <noreply@naviar-consult.no>

ENABLE_CALENDLY=true
CALENDLY_API_KEY=your_actual_calendly_key

ENABLE_WHEREBY=true
WHEREBY_API_KEY=your_actual_whereby_key

ENABLE_SAP_SF=true
SAP_SF_API_KEY=your_actual_sap_sf_key

ENABLE_VISMA=true
VISMA_API_KEY=your_actual_visma_key

ENCRYPTION_KEY=your_32_character_encryption_key_exactly_32_chars
ENCRYPTION_ALGORITHM=aes-256-cbc
ENCRYPTION_IV=your_16_character_iv_exactly_16_chars

TZ=Europe/Oslo
LOG_LEVEL=info
HTTPS_ONLY=true
SECURE_COOKIES=true
```

### 2. Secret Management

Use environment variable management:
- **AWS:** AWS Secrets Manager or Parameter Store
- **Azure:** Azure Key Vault
- **GCP:** Google Cloud Secret Manager
- **Docker:** Docker secrets
- **Kubernetes:** Kubernetes secrets

**Never commit .env to version control!**

## Deployment Methods

### Option 1: Docker Deployment

#### 1. Create Dockerfile

```dockerfile
FROM node:18-alpine

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci --only=production

# Copy application
COPY . .

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/api/health', (r) => {if (r.statusCode !== 200) throw new Error(r.statusCode)})"

# Expose port
EXPOSE 3000

# Start application
CMD ["node", "server.js"]
```

#### 2. Build and Push Image

```bash
docker build -t naviar-consult:1.0.0 .
docker tag naviar-consult:1.0.0 docker.io/naviar/naviar-consult:latest
docker push docker.io/naviar/naviar-consult:latest
```

#### 3. Run Container

```bash
docker run -d \
  --name naviar-consult \
  -p 3000:3000 \
  --env-file .env.production \
  --restart always \
  naviar-consult:latest
```

### Option 2: Kubernetes Deployment

#### 1. Create ConfigMap for non-sensitive config

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: naviar-config
namespace: production
data:
  NODE_ENV: production
  PORT: "3000"
  CORS_ORIGIN: "https://app.naviar-consult.no"
  TZ: Europe/Oslo
```

#### 2. Create Secrets for sensitive data

```bash
kubectl create secret generic naviar-secrets \
  --from-literal=JWT_SECRET=$(openssl rand -base64 32) \
  --from-literal=DATABASE_URL=postgresql://... \
  --from-literal=STRIPE_SECRET_KEY=sk_live_... \
  -n production
```

#### 3. Create Deployment

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: naviar-consult
  namespace: production
spec:
  replicas: 3
  selector:
    matchLabels:
      app: naviar-consult
  template:
    metadata:
      labels:
        app: naviar-consult
    spec:
      containers:
      - name: naviar-consult
        image: docker.io/naviar/naviar-consult:latest
        imagePullPolicy: Always
        ports:
        - containerPort: 3000
          name: http
        envFrom:
        - configMapRef:
            name: naviar-config
        - secretRef:
            name: naviar-secrets
        livenessProbe:
          httpGet:
            path: /api/health
            port: http
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /api/health
            port: http
          initialDelaySeconds: 5
          periodSeconds: 5
        resources:
          requests:
            cpu: 100m
            memory: 256Mi
          limits:
            cpu: 500m
            memory: 512Mi
---
apiVersion: v1
kind: Service
metadata:
  name: naviar-consult
  namespace: production
spec:
  selector:
    app: naviar-consult
  ports:
  - port: 80
    targetPort: 3000
    name: http
  type: LoadBalancer
```

### Option 3: Traditional Server Deployment

#### 1. Update System

```bash
sudo apt update && sudo apt upgrade -y
```

#### 2. Install Node.js

```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs
```

#### 3. Clone Repository

```bash
cd /opt
sudo git clone https://github.com/NAVIAR-CARE-1/codespaces-blank.git naviar-consult
cd naviar-consult
```

#### 4. Install Dependencies

```bash
npm ci --only=production
```

#### 5. Configure Environment

```bash
sudo cp .env.example .env.production
sudo nano .env.production  # Edit with actual values
```

#### 6. Create systemd Service

```ini
# /etc/systemd/system/naviar-consult.service
[Unit]
Description=NAVIAR CONSULT API Server
After=network.target postgresql.service

[Service]
Type=simple
User=naviar
WorkingDirectory=/opt/naviar-consult
EnvironmentFile=/opt/naviar-consult/.env.production
ExecStart=/usr/bin/node server.js
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
```

#### 7. Enable and Start Service

```bash
sudo systemctl daemon-reload
sudo systemctl enable naviar-consult
sudo systemctl start naviar-consult
```

#### 8. Verify Service

```bash
sudo systemctl status naviar-consult
```

## SSL/TLS Configuration

### Using Let's Encrypt with Nginx

#### 1. Install Certbot

```bash
sudo apt install certbot python3-certbot-nginx -y
```

#### 2. Create SSL Certificate

```bash
sudo certbot certonly --nginx -d api.naviar-consult.no
```

#### 3. Auto-Renewal

```bash
sudo systemctl enable certbot.timer
sudo systemctl start certbot.timer
```

### Configure Nginx Reverse Proxy

```nginx
upstream naviar_backend {
    server localhost:3000;
}

server {
    listen 80;
    server_name api.naviar-consult.no;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name api.naviar-consult.no;

    ssl_certificate /etc/letsencrypt/live/api.naviar-consult.no/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/api.naviar-consult.no/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;

    location / {
        proxy_pass http://naviar_backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

## Monitoring & Alerting

### Application Health Monitoring

```bash
# Check health endpoint
curl https://api.naviar-consult.no/api/health
```

### Log Monitoring

```bash
# Tail application logs
sudo journalctl -u naviar-consult -f

# Search logs
sudo journalctl -u naviar-consult --grep="ERROR"
```

### Database Monitoring

```bash
# Check database connections
psql -U naviar_admin -d naviar_consult -c "SELECT datname, count(*) FROM pg_stat_activity GROUP BY datname;"

# Check table sizes
psql -U naviar_admin -d naviar_consult -c "SELECT schemaname, tablename, pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) FROM pg_tables ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;"
```

### Backup Strategy

#### Automated Backups

```bash
#!/bin/bash
# /opt/scripts/backup.sh

BACKUP_DIR="/backups/naviar"
DATE=$(date +%Y%m%d_%H%M%S)
DB_NAME="naviar_consult"
DB_USER="naviar_admin"

mkdir -p $BACKUP_DIR

# Database backup
pg_dump -U $DB_USER $DB_NAME | gzip > $BACKUP_DIR/db_$DATE.sql.gz

# Keep only last 30 days
find $BACKUP_DIR -name "db_*.sql.gz" -mtime +30 -delete

echo "Backup completed: $BACKUP_DIR/db_$DATE.sql.gz"
```

Schedule with cron:
```bash
0 2 * * * /opt/scripts/backup.sh
```

## Post-Deployment

### 1. Verify Deployment

```bash
# Check if server is running
curl https://api.naviar-consult.no/api/health

# Expected response:
# {"status":"ok","timestamp":"2026-01-15T10:00:00Z","database":"connected"}
```

### 2. Test Key Endpoints

```bash
# Health check
curl https://api.naviar-consult.no/api/health

# Plans listing (no auth required)
curl https://api.naviar-consult.no/api/plans

# Auth test (should fail without credentials)
curl https://api.naviar-consult.no/api/orgs/test-id
```

### 3. Monitor Initial Traffic

Watch logs and metrics for the first few hours after deployment.

### 4. Documentation

- Create runbook for common operations
- Document escalation procedures
- Set up on-call rotation

## Rollback Procedure

If deployment fails:

```bash
# Using Docker
docker rollback naviar-consult

# Using systemd
sudo systemctl stop naviar-consult
sudo git checkout previous-stable-version
npm ci --only=production
sudo systemctl start naviar-consult

# Using Kubernetes
kubectl rollout undo deployment/naviar-consult -n production
```

## Performance Tuning

### Database Connection Pool

Adjust in config.js:
```javascript
const pool = new Pool({
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});
```

### Node.js Clustering

For multi-core servers, use clustering (requires load balancer).

### Caching Strategy

Implement Redis for session and query caching in future versions.

## Compliance Verification

### GDPR Checklist
- [ ] Data Processing Agreement in place
- [ ] Privacy policy published
- [ ] Cookie consent implemented
- [ ] Data retention enforced
- [ ] Right to erasure implemented
- [ ] Data portability available

### Norwegian Compliance
- [ ] Tax information verified
- [ ] Employee records retention: 7 years
- [ ] Financial records retention: 10 years
- [ ] Absence tracking compliant with "Arbeidsmiljøloven"

## Support & Escalation

- **L1 Support:** Check health endpoint, review logs
- **L2 Support:** Database investigation, connection issues
- **L3 Support:** Code debugging, business logic issues
- **Critical:** Production manager on-call

---

**Last Updated:** 2026-01-15
**Deployment Version:** 1.0.0
**Estimated Setup Time:** 2-4 hours
