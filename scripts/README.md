# 🔧 Scripts

Automation scripts for development, deployment, backup, and maintenance operations.

## 📁 **Directory Structure**

### **🔄 /backup/**

Database backup and restore operations:

- `create-backup.sh` - Automated database backups with compression and cloud storage
- `restore-backup.sh` - Safe database restoration with pre-restore safety backups
- `cleanup-backups.sh` - Automated cleanup of old backups

### **🚀 /deployment/**

Deployment scripts for different environments:

- `deploy-staging.sh` - Staging environment deployment with safety checks
- `deploy-production.sh` - Production deployment with comprehensive verification
- `verify-deployment.sh` - Post-deployment health checks and validation
- `rollback-deployment.sh` - Emergency rollback procedures

### **🛠️ /development/**

Development environment setup and maintenance:

- `setup-dev-environment.sh` - Complete development environment setup
- `reset-dev-environment.sh` - Clean reset of development environment
- `update-dependencies.sh` - Automated dependency updates
- `git-hooks/` - Git hooks for code quality enforcement

### **⚙️ /maintenance/**

System maintenance and monitoring:

- `health-check.sh` - System health monitoring
- `log-rotation.sh` - Log file management
- `performance-monitor.sh` - Performance monitoring and alerts
- `security-scan.sh` - Security vulnerability scanning

## 🎯 **Key Features**

### **🛡️ Safety First**

- **Pre-deployment Backups** - Automatic backups before any deployment
- **Rollback Procedures** - Quick emergency rollback capabilities
- **Environment Validation** - Comprehensive environment checks before operations
- **Safety Confirmations** - Required confirmations for destructive operations

### **🔄 Automated Operations**

- **Database Management** - Automated backups, migrations, and seeding
- **Deployment Pipeline** - Full CI/CD integration with safety checks
- **Environment Setup** - One-command development environment setup
- **Monitoring** - Automated health checks and alerting

### **📊 Multi-Environment Support**

- **Development** - Local development with mock services
- **Staging** - Production-like environment for testing
- **Production** - Full production deployment with monitoring

## 🚀 **Quick Reference**

### **Development Setup**

```bash
# Complete development environment setup
./scripts/development/setup-dev-environment.sh

# Start all development servers
./start-dev.sh

# Stop all development servers
./stop-dev.sh
```

### **Database Operations**

```bash
# Create backup (development)
./scripts/backup/create-backup.sh development manual

# Create backup (production)
./scripts/backup/create-backup.sh production daily

# Restore from backup
./scripts/backup/restore-backup.sh development backup_file.sql.gz
```

### **Deployment**

```bash
# Deploy to staging
./scripts/deployment/deploy-staging.sh

# Deploy to production (requires additional confirmations)
./scripts/deployment/deploy-production.sh

# Verify deployment
./scripts/deployment/verify-deployment.sh production
```

### **Maintenance**

```bash
# System health check
./scripts/maintenance/health-check.sh production

# Security scan
./scripts/maintenance/security-scan.sh

# Performance monitoring
./scripts/maintenance/performance-monitor.sh
```

## 🔒 **Security Features**

### **Access Control**

- **Environment-specific Credentials** - Separate credentials for each environment
- **Role-based Permissions** - Different access levels for different operations
- **Audit Logging** - Complete audit trail of all operations

### **Data Protection**

- **Encrypted Backups** - All backups are compressed and encrypted
- **Secure Transmission** - All data transfers use secure protocols
- **Access Logging** - Complete logging of all data access

## 📋 **Usage Guidelines**

1. **Always Test First** - Run operations in development/staging before production
2. **Create Backups** - Always create backups before destructive operations
3. **Verify Results** - Use verification scripts to confirm successful operations
4. **Monitor Logs** - Check logs for any warnings or errors
5. **Document Changes** - Update documentation for any script modifications

## 🛠️ **Script Dependencies**

### **Required Tools**

- **Bash 4.0+** - Shell script execution
- **PostgreSQL Client** - Database operations
- **AWS CLI** - Cloud storage operations (production)
- **jq** - JSON processing
- **curl** - HTTP operations and notifications

### **Environment Variables**

Each script requires specific environment variables for different environments. See individual script headers for detailed requirements.

## 📞 **Emergency Procedures**

### **Production Issues**

1. **Immediate Rollback**: `./scripts/deployment/rollback-deployment.sh`
2. **Database Restore**: `./scripts/backup/restore-backup.sh production latest`
3. **Health Check**: `./scripts/maintenance/health-check.sh production`
4. **Alert Team**: Automated Slack notifications for all critical operations

### **Data Recovery**

- **Automated Backups** - Multiple daily backups with retention policies
- **Point-in-time Recovery** - Database transaction log backups
- **Cross-region Replication** - Backup replication across multiple regions
- **Disaster Recovery** - Complete disaster recovery procedures

All scripts include comprehensive error handling, logging, and notification systems to ensure reliable operations and quick issue resolution.

