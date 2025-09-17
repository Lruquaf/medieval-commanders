# 🚀 Railway Production Email Setup Guide

This guide shows how to set up email functionality for your Medieval Commanders app on Railway with **modern, free email services**.

## 📧 What This Sets Up

Your Railway app will automatically send:

1. **✅ Proposal Approval Emails** - When admins approve user proposals
2. **❌ Proposal Rejection Emails** - When admins reject user proposals  
3. **🔔 Admin Notifications** - When new proposals are submitted

## 🏆 Recommended: Resend (Best for Railway)

**Why Resend for Railway?**
- ✅ **3,000 free emails/month** (100/day)
- ✅ **Simple setup** - just one API key
- ✅ **Excellent deliverability**
- ✅ **Modern API** - built for developers
- ✅ **Scales well** - $20/month for 50k emails

### Step-by-Step Setup:

#### 1. Get Resend API Key

1. Go to [resend.com](https://resend.com) and sign up
2. Click "API Keys" in dashboard
3. Click "Create API Key"
4. Copy the API key (starts with `re_`)

#### 2. Configure Railway Environment Variables

1. Go to your **Railway dashboard**
2. Select your **backend service** (Medieval Commanders)
3. Click **"Variables"** tab
4. Add these variables one by one:

```bash
# Email Service Configuration
EMAIL_SERVICE=resend
RESEND_API_KEY=re_your_api_key_here

# Email Settings
EMAIL_FROM=Medieval Commanders <noreply@yourdomain.com>
DEFAULT_ADMIN_EMAIL=admin@yourdomain.com
```

**🔥 Important Notes:**
- Replace `yourdomain.com` with your actual domain
- For testing: You can use `EMAIL_FROM=Medieval Commanders <onboarding@resend.dev>`
- Keep the `EMAIL_SERVICE=resend` exactly as shown

#### 3. Deploy to Railway

Your app will automatically use the new email service on next deployment.

**To trigger a new deployment:**
```bash
# Option 1: Push to your connected GitHub repo
git add .
git commit -m "Add email service configuration"
git push

# Option 2: Deploy directly
railway up
```

## 🥈 Alternative: Brevo (More Free Emails)

**Why Brevo?**
- ✅ **9,000 free emails/month** (300/day)
- ✅ **Higher free tier**
- ✅ **Good deliverability**
- ✅ **European provider** (GDPR compliant)

### Brevo Setup:

#### 1. Get Brevo Credentials

1. Go to [brevo.com](https://brevo.com) and sign up
2. Go to **SMTP & API** > **API Keys**
3. Click **"Create a new API Key"**
4. Copy the API key

#### 2. Configure Railway Environment Variables

```bash
# Email Service Configuration
EMAIL_SERVICE=brevo
BREVO_API_KEY=your_brevo_api_key_here
BREVO_SMTP_USER=your-email@example.com

# Email Settings  
EMAIL_FROM=Medieval Commanders <noreply@yourdomain.com>
DEFAULT_ADMIN_EMAIL=admin@yourdomain.com
```

**Note:** `BREVO_SMTP_USER` should be your Brevo account email.

## 🔧 Railway Environment Variables Summary

**For Resend (Recommended):**
```bash
EMAIL_SERVICE=resend
RESEND_API_KEY=re_your_api_key_here
EMAIL_FROM=Medieval Commanders <noreply@yourdomain.com>
DEFAULT_ADMIN_EMAIL=admin@yourdomain.com
```

**For Brevo (Higher volume):**
```bash
EMAIL_SERVICE=brevo
BREVO_API_KEY=your_brevo_api_key_here
BREVO_SMTP_USER=your-email@example.com
EMAIL_FROM=Medieval Commanders <noreply@yourdomain.com>
DEFAULT_ADMIN_EMAIL=admin@yourdomain.com
```

## 🧪 Testing Your Setup

1. **Deploy your app** with the new environment variables
2. **Check deployment logs** in Railway dashboard
3. **Look for email service confirmation** in logs:
   ```
   ✅ Resend configured successfully
   ✅ RESEND_API_KEY is set (Recommended choice!)
   ```
4. **Test in your app:**
   - Go to your Railway app URL
   - Submit a test proposal
   - Check admin panel for new proposal
   - Approve/reject to trigger emails

## 🔍 Troubleshooting

### ❌ "Email service not configured"

**Check Railway Variables:**
1. Go to Railway dashboard
2. Backend service > Variables tab
3. Verify all email variables are set
4. Check for typos in variable names

### ❌ "RESEND_API_KEY is not set"

**Fix:**
1. Double-check the API key in Railway dashboard
2. Make sure variable name is exactly `RESEND_API_KEY`
3. API key should start with `re_`

### ❌ Emails not being sent

**Debug Steps:**
1. Check Railway deployment logs for errors
2. Verify API key is valid in Resend/Brevo dashboard
3. Check spam folder for test emails
4. Verify `EMAIL_FROM` format is correct

### 📧 Testing Email Format

**For development/testing:**
```bash
EMAIL_FROM=Medieval Commanders <onboarding@resend.dev>  # Resend
EMAIL_FROM=Medieval Commanders <test@brevo.com>         # Brevo
```

**For production with your domain:**
```bash
EMAIL_FROM=Medieval Commanders <noreply@yourdomain.com>
```

## 🎯 Deployment Checklist

- [ ] ✅ Choose email service (Resend or Brevo)
- [ ] 🔑 Get API key from provider
- [ ] ⚙️ Add environment variables to Railway
- [ ] 🚀 Deploy/redeploy your app  
- [ ] 📋 Check deployment logs for email service confirmation
- [ ] 🧪 Test with a real proposal submission
- [ ] 📧 Verify emails are received

## 🎉 You're Done!

Your Railway app now has **production-ready email functionality** with:

- ✅ **Free tier** (3,000-9,000 emails/month)
- ✅ **Professional deliverability**
- ✅ **Automatic email notifications**
- ✅ **Beautiful HTML templates**
- ✅ **Scalable solution**

**Next Steps:**
1. Test email functionality thoroughly
2. Monitor email delivery in your provider dashboard
3. Scale up your plan when you need more emails
4. Set up your domain for better deliverability (optional)

**Questions?** Check the deployment logs in Railway dashboard first - they'll show you exactly what's happening with the email service configuration.
