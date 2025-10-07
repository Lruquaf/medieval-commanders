# Production Deployment Guide - Email & Birth/Death Year Features

This guide covers the safe deployment of the Medieval Commanders Collection with email notifications and birth/death year features.

## 🚀 Quick Deployment

### Option 1: Automated Safe Deployment
```bash
./deploy-safe-production.sh
```

### Option 2: Manual Step-by-Step
Follow the detailed steps below.

## 📋 Pre-Deployment Checklist

### ✅ Code Status
- [x] Email service implemented (`server/emailService.js`)
- [x] Birth/death year fields added to all schemas
- [x] Frontend forms updated with birth/death year inputs
- [x] Admin panel includes email management
- [x] Database migrations ready
- [x] All dependencies installed

### ✅ Required Environment Variables
Set these in your Railway dashboard:

#### Core Configuration
```
NODE_ENV=production
PORT=5001
FRONTEND_URL=https://your-netlify-app.netlify.app
DATABASE_URL=your-railway-postgres-url
```

#### Email Service Configuration
Choose ONE of the following email services:

##### Option 1: SendGrid (Recommended)
```
EMAIL_SERVICE=sendgrid
SENDGRID_API_KEY=your-sendgrid-api-key
EMAIL_FROM=Medieval Commanders <noreply@medievalcommanders.com>
DEFAULT_ADMIN_EMAIL=admin@medievalcommanders.com
```

##### Option 2: AWS SES
```
EMAIL_SERVICE=ses
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
EMAIL_FROM=Medieval Commanders <noreply@medievalcommanders.com>
DEFAULT_ADMIN_EMAIL=admin@medievalcommanders.com
```

##### Option 3: Mailgun
```
EMAIL_SERVICE=mailgun
MAILGUN_API_KEY=your-mailgun-api-key
MAILGUN_DOMAIN=your-mailgun-domain
EMAIL_FROM=Medieval Commanders <noreply@medievalcommanders.com>
DEFAULT_ADMIN_EMAIL=admin@medievalcommanders.com
```

##### Option 4: Custom SMTP
```
EMAIL_SERVICE=smtp
SMTP_HOST=smtp.your-provider.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-smtp-username
SMTP_PASS=your-smtp-password
EMAIL_FROM=Medieval Commanders <noreply@medievalcommanders.com>
DEFAULT_ADMIN_EMAIL=admin@medievalcommanders.com
```

## 🔧 Step-by-Step Deployment

### Step 1: Prepare Environment
1. **Railway Dashboard**: Go to your project
2. **Environment Variables**: Add all required variables above
3. **Database**: Ensure PostgreSQL service is running

### Step 2: Deploy Backend
```bash
# Install Railway CLI if not already installed
npm install -g @railway/cli

# Login to Railway
railway login

# Navigate to server directory
cd server

# Install dependencies
npm install

# Generate Prisma client
npx prisma generate --schema=../prisma/schema.prisma

# Deploy to Railway
railway up
```

### Step 3: Run Database Migration
```bash
# Run migration to add birth/death year fields
railway run npx prisma db push --schema=../prisma/schema.prisma
```

### Step 4: Update Frontend
1. **Netlify Dashboard**: Go to your site settings
2. **Environment Variables**: Update `VITE_API_URL` with your new Railway URL
3. **Redeploy**: Trigger a new deployment

### Step 5: Test Deployment
1. **Health Check**: Visit `https://your-app.railway.app/api/health`
2. **Admin Panel**: Test login and email settings
3. **Proposal Form**: Submit a test proposal
4. **Email Notifications**: Check if emails are sent

## 📧 Email Service Setup

### SendGrid (Recommended)
1. Create account at [SendGrid](https://sendgrid.com)
2. Generate API key in Settings > API Keys
3. Verify sender identity
4. Add API key to Railway environment variables

### AWS SES
1. Create AWS account
2. Set up SES in your preferred region
3. Verify domain or email address
4. Create IAM user with SES permissions
5. Add credentials to Railway environment variables

### Mailgun
1. Create account at [Mailgun](https://mailgun.com)
2. Add and verify domain
3. Get API key from dashboard
4. Add credentials to Railway environment variables

## 🗄️ Database Migration Details

The migration adds two new optional fields to both `cards` and `proposals` tables:
- `birthDate` (DateTime, nullable)
- `deathDate` (DateTime, nullable)

These fields are:
- ✅ Backward compatible (nullable)
- ✅ Safe for existing data
- ✅ Already included in all schema files

## 🧪 Testing Checklist

### Email Functionality
- [ ] Admin receives notification when new proposal is submitted
- [ ] User receives approval email when proposal is approved
- [ ] User receives rejection email when proposal is rejected
- [ ] Admin can update email address in settings
- [ ] Email templates render correctly

### Birth/Death Year Features
- [ ] Admin can add birth/death years when creating cards
- [ ] Admin can edit birth/death years in existing cards
- [ ] Users can add birth/death years in proposals
- [ ] Birth/death years display correctly in card gallery
- [ ] Birth/death years are optional (not required)

### General Functionality
- [ ] All existing features work as before
- [ ] No data loss during migration
- [ ] Performance is maintained
- [ ] CORS configuration works
- [ ] Image uploads work correctly

## 🔍 Troubleshooting

### Common Issues

#### Email Not Sending
1. Check environment variables are set correctly
2. Verify email service credentials
3. Check Railway logs for errors
4. Test with Ethereal Email first (set `EMAIL_SERVICE=ethereal`)

#### Database Migration Fails
1. Check if fields already exist
2. Verify database connection
3. Check Prisma schema is correct
4. Run migration manually: `railway run npx prisma db push`

#### CORS Errors
1. Verify `FRONTEND_URL` is set correctly
2. Check Netlify URL matches exactly
3. Restart Railway service after env var changes

#### Frontend Not Loading
1. Check `VITE_API_URL` in Netlify
2. Verify Railway service is running
3. Check browser console for errors

### Debug Commands
```bash
# Check Railway service status
railway status

# View logs
railway logs

# Test database connection
railway run npx prisma db push --schema=../prisma/schema.prisma

# Test email service
railway run node -e "require('./emailService').sendEmail('test@example.com', 'Test', 'Test email')"
```

## 📊 Monitoring

### Key Metrics to Monitor
1. **Email Delivery Rate**: Check email service dashboard
2. **API Response Time**: Monitor Railway metrics
3. **Database Performance**: Check PostgreSQL metrics
4. **Error Rates**: Monitor Railway logs

### Log Monitoring
```bash
# View real-time logs
railway logs --follow

# View specific service logs
railway logs --service your-service-name
```

## 🔒 Security Considerations

1. **Environment Variables**: Never commit sensitive data
2. **Email Credentials**: Use app passwords for Gmail
3. **API Keys**: Rotate regularly
4. **Database Access**: Use connection pooling
5. **CORS**: Restrict to your domain only

## 📈 Performance Optimization

1. **Email Queuing**: Consider implementing email queues for high volume
2. **Database Indexing**: Add indexes for frequently queried fields
3. **Caching**: Implement Redis for session management
4. **CDN**: Use Cloudinary for image optimization

## 🆘 Support

If you encounter issues:
1. Check Railway logs first
2. Verify all environment variables
3. Test with minimal configuration
4. Check email service status
5. Review this guide for common solutions

## 🎉 Success!

Once deployed successfully, your Medieval Commanders Collection will have:
- ✅ Professional email notifications
- ✅ Historical birth/death year tracking
- ✅ Enhanced admin panel
- ✅ Improved user experience
- ✅ Production-ready architecture

Your app is now ready to handle real users and provide a complete medieval commander collection experience!
