# Scotch Doubles Tournament Platform - Production Deployment Guide

## 🚀 Deployment Options for 24/7 Availability

### Option 1: Vercel (Recommended - Easiest)

**Why Vercel:**
- Built specifically for Next.js applications
- Automatic deployments from GitHub
- Global CDN with edge functions
- 99.99% uptime SLA
- Free tier available, paid plans start at $20/month

**Setup Steps:**
1. **Connect GitHub Repository**
   - Go to [vercel.com](https://vercel.com)
   - Sign up with GitHub account
   - Import your `ScotchDoublesChip` repository

2. **Configure Build Settings**
   - Framework Preset: Next.js
   - Build Command: `npm run build`
   - Output Directory: `.next`
   - Root Directory: `apps/public`

3. **Environment Variables**
   - Add your email credentials (Gmail SMTP)
   - Set production SMTP settings
   - Configure any other API keys

4. **Custom Domain** (Optional)
   - Add your domain (e.g., scotchdoubles.com)
   - Vercel provides SSL automatically

**Estimated Cost:** $0-20/month depending on usage

---

### Option 2: Netlify

**Why Netlify:**
- Great for static sites and serverless functions
- Automatic HTTPS and global CDN
- Easy form handling and authentication
- 99.99% uptime

**Setup Steps:**
1. Connect your GitHub repository
2. Build settings: `npm run build && npm run export`
3. Publish directory: `out`
4. Configure environment variables
5. Set up custom domain

**Estimated Cost:** $0-19/month

---

### Option 3: AWS (Most Scalable)

**Why AWS:**
- Enterprise-grade infrastructure
- Multiple availability zones
- Can handle massive scale
- Full control over architecture

**Setup Options:**
- **AWS Amplify**: Similar to Vercel, easier setup
- **EC2 + Load Balancer**: Full control, more complex
- **ECS with Fargate**: Container-based deployment

**Estimated Cost:** $20-100+/month depending on usage

---

### Option 4: DigitalOcean App Platform

**Why DigitalOcean:**
- Simple deployment process
- Predictable pricing
- Good performance
- Built-in monitoring

**Setup:**
1. Connect GitHub repository
2. Choose Node.js app type
3. Configure environment variables
4. Deploy to multiple regions

**Estimated Cost:** $12-25/month

---

## 🎯 Recommended Deployment Strategy

### For Your Tournament Platform, I Recommend:

**Phase 1: Start with Vercel**
- Deploy immediately to Vercel (free tier)
- Use your custom domain
- Set up email with Gmail SMTP
- Monitor usage and performance

**Phase 2: Scale if Needed**
- If you exceed Vercel limits, migrate to:
  - **AWS Amplify** (similar experience, more scalable)
  - **DigitalOcean App Platform** (predictable costs)

---

## 📋 Pre-Deployment Checklist

### 1. Database Setup
```bash
# You'll need a production database
# Options:
- Supabase (PostgreSQL) - Free tier available
- PlanetScale (MySQL) - Serverless database
- MongoDB Atlas - Document database
- Firebase Firestore - Google's database
```

### 2. Email Service Setup
```bash
# Production email options:
- Resend (3,000 emails/month free)
- SendGrid (100 emails/day free)
- Amazon SES (very cost-effective)
- Gmail SMTP (for small scale)
```

### 3. Environment Variables
```bash
# Production .env variables needed:
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
FROM_EMAIL="Scotch Doubles" <noreply@yourdomain.com>
DATABASE_URL=your-production-database-url
NEXT_PUBLIC_APP_URL=https://yourdomain.com
```

### 4. Domain Setup
- Purchase domain (GoDaddy, Namecheap, etc.)
- Point DNS to your hosting provider
- SSL certificate (automatically handled by most platforms)

---

## 🛠️ Quick Deployment (Next Steps)

**Want to deploy right now?**

1. **Push to GitHub**: Make sure your code is in a GitHub repository
2. **Go to Vercel.com**: Sign up with GitHub
3. **Import Repository**: Select your ScotchDoublesChip repo
4. **Configure**: Set root directory to `apps/public`
5. **Deploy**: Click deploy button
6. **Custom Domain**: Add your domain in settings

**Total time to live website: ~10 minutes**

---

## 💰 Cost Breakdown (Monthly)

| Service | Free Tier | Paid Plans | Best For |
|---------|-----------|------------|----------|
| **Vercel** | 100GB bandwidth, 6,000 build minutes | $20+ | Small to medium sites |
| **Netlify** | 100GB bandwidth, 300 build minutes | $19+ | Static sites |
| **AWS Amplify** | 1GB storage, 15GB bandwidth | $15+ | High scalability |
| **DigitalOcean** | No free tier | $12+ | Predictable costs |

**Domain:** $10-15/year
**Email Service:** $0-10/month (depending on volume)

---

## 🔧 Maintenance & Monitoring

### Uptime Monitoring
- **UptimeRobot** (free): Monitors your site every 5 minutes
- **Pingdom**: More advanced monitoring
- **Built-in platform monitoring**: Most platforms provide this

### Automatic Updates
- Enable automatic deployments from your `main` branch
- Set up staging environment for testing
- Use branch previews for feature testing

### Backup Strategy
- Database: Automated daily backups (most services include this)
- Code: GitHub serves as your backup
- User data: Regular exports/backups

---

## 🚨 Emergency Procedures

### Scheduled Maintenance
1. Create a maintenance page
2. Schedule during low-usage hours (typically 2-6 AM local time)
3. Notify users 24-48 hours in advance
4. Keep maintenance under 30 minutes when possible

### Incident Response
1. Status page (can use services like Statuspage.io)
2. Communication channels (email, social media)
3. Rollback procedures
4. Incident post-mortems

---

## ✅ Next Immediate Steps

1. **Choose a deployment platform** (I recommend starting with Vercel)
2. **Set up a production database** (Supabase is great for PostgreSQL)
3. **Configure production email** (Gmail SMTP for testing, Resend for production)
4. **Purchase your domain name**
5. **Deploy and test**

Would you like me to help you deploy to Vercel right now, or do you have questions about any of these options?