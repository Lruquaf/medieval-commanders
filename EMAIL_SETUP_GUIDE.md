# Email Notifications Setup Guide

This guide explains how to set up email notifications for the Medieval Commanders Collection app, both for local development and production deployment.

## Features Added

✅ **Proposal Approval/Rejection Emails**: Users receive email notifications when their proposals are approved or rejected
✅ **Admin Notification Emails**: Admins receive email notifications when new proposals are submitted
✅ **Admin Settings**: Admins can update their email address through the admin panel
✅ **Local & Production Support**: Separate configurations for development and production environments

## Local Development Setup

### 1. Environment Configuration

Create a `.env.local` file in the `server/` directory:

```bash
# Database
DATABASE_URL="file:./dev.db"

# Email Configuration for Local Development
# Option 1: Ethereal Email (recommended for testing)
EMAIL_SERVICE=ethereal

# Option 2: Gmail (requires app password)
# EMAIL_SERVICE=gmail
# EMAIL_USER=your-email@gmail.com
# EMAIL_PASS=your-app-password

# Option 3: Mailtrap (for testing)
# EMAIL_SERVICE=mailtrap
# MAILTRAP_USER=your-mailtrap-username
# MAILTRAP_PASS=your-mailtrap-password

# Email sender information
EMAIL_FROM="Medieval Commanders <noreply@medievalcommanders.com>"

# Default admin email
DEFAULT_ADMIN_EMAIL="admin@medievalcommanders.com"
```

### 2. Database Migration

The admin table has been added to the database schema. Run the following commands:

```bash
cd server
npx prisma generate --schema=./schema.prisma
npx prisma db push --schema=./schema.prisma
```

### 3. Start the Application

```bash
# Terminal 1: Start the backend server
cd server
EMAIL_SERVICE=ethereal EMAIL_FROM="Medieval Commanders <noreply@medievalcommanders.com>" DEFAULT_ADMIN_EMAIL="admin@medievalcommanders.com" npm run dev:local

# Terminal 2: Start the frontend
cd ../
npm run dev
```

### 4. Test Email Functionality

1. **Access the admin panel**: Go to `http://localhost:5173/admin`
2. **Login**: Use `admin` / `admin123`
3. **Go to Settings tab**: Update the admin email address
4. **Submit a proposal**: Go to `http://localhost:5173/create-proposal` and submit a test proposal
5. **Check email notifications**: 
   - Admin should receive a notification about the new proposal
   - Approve/reject the proposal to send emails to the proposer

### 5. Email Testing with Ethereal

When using Ethereal Email for testing:
- Emails are not actually sent
- Check the console for preview URLs
- Example: `Email preview URL: https://ethereal.email/message/...`

## Production Setup

### 1. Environment Configuration

Create environment variables for your production deployment:

```bash
# Database
DATABASE_URL="your-production-database-url"

# Email Configuration for Production
# Option 1: SendGrid
EMAIL_SERVICE=sendgrid
SENDGRID_API_KEY=your-sendgrid-api-key

# Option 2: AWS SES
EMAIL_SERVICE=ses
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key

# Option 3: Custom SMTP
EMAIL_SERVICE=smtp
SMTP_HOST=smtp.your-provider.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-smtp-username
SMTP_PASS=your-smtp-password

# Email sender information
EMAIL_FROM="Medieval Commanders <noreply@medievalcommanders.com>"

# Default admin email
DEFAULT_ADMIN_EMAIL="admin@medievalcommanders.com"
```

### 2. Database Migration

For production, update the appropriate schema file and run migrations:

```bash
# For Railway deployment
npx prisma generate --schema=./prisma/schema.railway.prisma
npx prisma db push --schema=./prisma/schema.railway.prisma

# For other production deployments
npx prisma generate --schema=./prisma/schema.production.prisma
npx prisma db push --schema=./prisma/schema.production.prisma
```

## Email Service Providers

### Ethereal Email (Testing)
- **Best for**: Local development and testing
- **Setup**: No configuration needed
- **Features**: Creates fake email accounts, provides preview URLs
- **Limitations**: Emails are not actually sent

### Gmail (Development)
- **Best for**: Local development with real emails
- **Setup**: 
  1. Enable 2-factor authentication
  2. Generate an app password
  3. Use the app password in `EMAIL_PASS`
- **Features**: Real email delivery
- **Limitations**: Rate limits, requires Google account

### SendGrid (Production)
- **Best for**: Production applications
- **Setup**: 
  1. Create SendGrid account
  2. Generate API key
  3. Set `EMAIL_SERVICE=sendgrid` and `SENDGRID_API_KEY`
- **Features**: Reliable delivery, analytics, templates
- **Cost**: Free tier available

### AWS SES (Production)
- **Best for**: AWS-based applications
- **Setup**: 
  1. Create AWS account
  2. Set up SES
  3. Configure IAM credentials
- **Features**: High deliverability, cost-effective
- **Cost**: Pay per email sent

### Custom SMTP (Production)
- **Best for**: Using existing email infrastructure
- **Setup**: Configure with your SMTP provider
- **Features**: Full control over email delivery
- **Requirements**: SMTP server access

## Admin Panel Features

### Settings Tab
- **Email Management**: Update admin email address
- **Real-time Updates**: Changes take effect immediately
- **Validation**: Email format validation
- **Success/Error Feedback**: Clear status messages

### Email Notifications
- **New Proposals**: Admin receives notification when proposals are submitted
- **Proposal Status**: Users receive emails when proposals are approved/rejected
- **Professional Templates**: Styled HTML emails with proposal details

## Troubleshooting

### Common Issues

1. **Email service not configured**
   - Check environment variables
   - Verify `EMAIL_SERVICE` is set correctly
   - Ensure all required credentials are provided

2. **Connection refused errors**
   - Check internet connection
   - Verify SMTP settings
   - Try different email service provider

3. **Emails not being sent**
   - Check console logs for error messages
   - Verify email addresses are valid
   - Test with Ethereal Email first

4. **Database errors**
   - Run database migrations
   - Check database connection
   - Verify schema is up to date

### Testing Commands

```bash
# Test email service directly
cd server
EMAIL_SERVICE=ethereal node test-email.js

# Test with Gmail
EMAIL_SERVICE=gmail EMAIL_USER=your-email@gmail.com EMAIL_PASS=your-app-password node test-email.js
```

## Security Considerations

1. **Environment Variables**: Never commit email credentials to version control
2. **App Passwords**: Use app-specific passwords for Gmail
3. **API Keys**: Rotate API keys regularly
4. **Rate Limiting**: Implement rate limiting for email sending
5. **Validation**: Always validate email addresses before sending

## Monitoring

1. **Email Delivery**: Monitor email delivery rates
2. **Error Logs**: Check server logs for email errors
3. **User Feedback**: Monitor user complaints about missing emails
4. **Performance**: Track email sending performance

## Support

For issues or questions:
1. Check the console logs for error messages
2. Verify environment configuration
3. Test with Ethereal Email first
4. Check email service provider documentation
