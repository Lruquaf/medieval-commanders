# 📧 Modern Email Service Setup Guide (2024)

This guide shows you how to set up a **free, modern, and reliable email service** for your Medieval Commanders Collection app. We've replaced the complex Gmail OAuth setup with **much simpler, more reliable options**.

## 🎯 What Email Does

Your app sends these emails automatically:

1. **📩 Proposal Approval/Rejection** - Users get notified when their commander proposals are approved or rejected
2. **🔔 Admin Notifications** - Admins get alerts when new proposals are submitted  
3. **✨ Professional Templates** - Beautiful HTML emails with proposal details

## 🚀 Quick Start (Testing)

**Want to test immediately?** No setup required:

```bash
cd server
EMAIL_SERVICE=ethereal node test-email-unified.js
```

This uses Ethereal (fake emails with preview URLs). Perfect for development!

## 🏆 Recommended: Resend (Best Choice)

**Why Resend?**
- ✅ **3,000 free emails/month** (100/day)
- ✅ **Modern, developer-friendly API**
- ✅ **Excellent deliverability**
- ✅ **Simple setup** (just one API key)
- ✅ **Scales well** ($20/month for 50k emails)

### Setup Steps:

1. **Sign up at [resend.com](https://resend.com)**
2. **Get your API key** from the dashboard
3. **Create `.env.local` in `server/` folder:**

```bash
# Database
DATABASE_URL="file:./dev.db"

# Email Configuration - Resend (Recommended)
EMAIL_SERVICE=resend
RESEND_API_KEY=re_your_api_key_here

# Email sender information
EMAIL_FROM="Medieval Commanders <noreply@yourdomain.com>"

# Default admin email
DEFAULT_ADMIN_EMAIL="admin@yourdomain.com"
```

4. **Test it:**
```bash
cd server
node test-email-unified.js
```

**For testing without domain:** Use `EMAIL_FROM="Medieval Commanders <onboarding@resend.dev>"`

## 🥈 Alternative: Brevo (More Free Emails)

**Why Brevo?**
- ✅ **300 free emails/day** (9,000/month) 
- ✅ **More generous free tier**
- ✅ **Good deliverability**
- ✅ **European provider** (good for GDPR)

### Setup Steps:

1. **Sign up at [brevo.com](https://brevo.com)** (formerly Sendinblue)
2. **Go to SMTP & API > API Keys**
3. **Create a new API key**
4. **Create `.env.local` in `server/` folder:**

```bash
# Database
DATABASE_URL="file:./dev.db"

# Email Configuration - Brevo (Alternative)
EMAIL_SERVICE=brevo
BREVO_API_KEY=your_brevo_api_key_here
BREVO_SMTP_USER=your-email@example.com

# Email sender information  
EMAIL_FROM="Medieval Commanders <noreply@yourdomain.com>"

# Default admin email
DEFAULT_ADMIN_EMAIL="admin@yourdomain.com"
```

5. **Test it:**
```bash
cd server
node test-email-unified.js
```

## 🧪 Testing Option: Ethereal

**Perfect for development** - No setup required, shows preview URLs instead of sending real emails.

```bash
# Database
DATABASE_URL="file:./dev.db"

# Email Configuration - Testing Only
EMAIL_SERVICE=ethereal

# Email sender information (optional for testing)
EMAIL_FROM="Medieval Commanders <test@ethereal.email>"

# Default admin email
DEFAULT_ADMIN_EMAIL="admin@test.com"
```

## 🛠️ Installation & Testing

1. **Install dependencies** (if not already installed):
```bash
cd server
npm install resend  # Only if using Resend
```

2. **Test your email service:**
```bash
# Test with your chosen service
node test-email-unified.js

# Or test specific service
EMAIL_SERVICE=resend RESEND_API_KEY=your_key node test-email-unified.js
EMAIL_SERVICE=brevo BREVO_API_KEY=your_key node test-email-unified.js
EMAIL_SERVICE=ethereal node test-email-unified.js
```

3. **Start your app:**
```bash
# Start backend
npm run dev

# In another terminal, start frontend
cd ..
npm run dev
```

## 📊 Service Comparison

| Service | Free Tier | Ease of Setup | Deliverability | Best For |
|---------|-----------|---------------|----------------|----------|
| **Resend** | 3,000/month | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | Production |
| **Brevo** | 9,000/month | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | High volume |
| **Ethereal** | Unlimited | ⭐⭐⭐⭐⭐ | N/A (testing) | Development |

## 🔧 Troubleshooting

### Common Issues:

**❌ "Email service not configured"**
- Check your environment variables
- Make sure `EMAIL_SERVICE` is set correctly
- Verify API keys are valid

**❌ "Failed to load Resend"**
- Run: `npm install resend`
- Check internet connection

**❌ "Authentication failed"**
- Verify API key is correct
- For Brevo: Check `BREVO_SMTP_USER` matches your account email

**❌ Emails not received**
- Check spam folder
- For testing: Look for preview URLs in console
- Verify email addresses are valid

### Debug Commands:

```bash
# Test email service directly
EMAIL_SERVICE=ethereal node test-email-unified.js

# Test with specific email
TEST_EMAIL=your-email@example.com EMAIL_SERVICE=ethereal node test-email-unified.js

# Check environment variables
node -e "console.log(process.env.EMAIL_SERVICE, process.env.RESEND_API_KEY ? 'API_KEY_SET' : 'NO_API_KEY')"
```

## 🎯 Using in Your App

The email service automatically:

1. **Sends admin notifications** when users submit proposals
2. **Sends approval/rejection emails** when you approve/reject proposals in admin panel
3. **Uses the configured service** (Resend, Brevo, or Ethereal)

No code changes needed - just set your environment variables!

## 🚀 Production Deployment

For production, use **Resend** or **Brevo** (not Ethereal). Set these environment variables on your hosting platform:

**For Railway/Netlify/Vercel:**
```bash
EMAIL_SERVICE=resend
RESEND_API_KEY=your_production_api_key
EMAIL_FROM="Medieval Commanders <noreply@yourdomain.com>"
DEFAULT_ADMIN_EMAIL="admin@yourdomain.com"
```

## 🆚 Old vs New Setup

**❌ Old Complex Setup:**
- Gmail OAuth2 with client ID, client secret, refresh tokens
- Multiple configuration files
- Complex troubleshooting

**✅ New Simple Setup:**
- Just one API key
- Automatic service switching
- Built-in testing mode
- Better error messages

## 🎉 You're Done!

Your email service is now:
- ✅ **Modern and reliable**
- ✅ **Free to start** (3,000-9,000 emails/month)
- ✅ **Easy to test** (Ethereal mode)
- ✅ **Production ready** (Resend/Brevo)
- ✅ **Automatically works** with your app

**Questions?** Run the test script first: `EMAIL_SERVICE=ethereal node test-email-unified.js`
