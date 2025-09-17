#!/bin/bash

echo "🚀 Deploying Medieval Commanders to Railway with Email Service"
echo "=============================================================="

# Check if we're in the right directory
if [ ! -f "railway.json" ]; then
    echo "❌ Error: Please run this script from the project root directory"
    exit 1
fi

# Check if Railway CLI is installed
if ! command -v railway &> /dev/null; then
    echo "❌ Railway CLI is not installed. Installing..."
    npm install -g @railway/cli
    echo "✅ Railway CLI installed"
fi

# Check if user is logged in to Railway
if ! railway whoami &> /dev/null; then
    echo "❌ Please login to Railway first:"
    echo "   railway login"
    exit 1
fi

echo "👤 Logged in as: $(railway whoami)"
echo ""

# Check current Railway environment variables
echo "🔍 Checking current Railway configuration..."
railway variables --json > /tmp/railway_vars.json 2>/dev/null || echo "{}" > /tmp/railway_vars.json

# Check for email service configuration
email_service=$(railway variables get EMAIL_SERVICE 2>/dev/null || echo "")
resend_key=$(railway variables get RESEND_API_KEY 2>/dev/null || echo "")
brevo_key=$(railway variables get BREVO_API_KEY 2>/dev/null || echo "")

echo ""
echo "📧 Current Email Service Configuration:"
if [ -z "$email_service" ]; then
    echo "❌ EMAIL_SERVICE: Not set"
    echo ""
    echo "🛠️  Email Service Setup Required!"
    echo "Choose your email service:"
    echo "1. Resend (Recommended) - 3,000 free emails/month"
    echo "2. Brevo - 9,000 free emails/month"  
    echo "3. Skip email setup for now"
    echo ""
    read -p "Enter your choice (1-3): " choice
    
    case $choice in
        1)
            echo ""
            echo "🏆 Setting up Resend..."
            echo "📋 Steps:"
            echo "1. Go to https://resend.com and sign up"
            echo "2. Get your API key from the dashboard"
            echo "3. Enter it below"
            echo ""
            read -p "Enter your Resend API key (starts with re_): " api_key
            read -p "Enter your sender email (e.g., noreply@yourdomain.com): " from_email
            read -p "Enter admin email (e.g., admin@yourdomain.com): " admin_email
            
            echo "Setting Railway variables..."
            railway variables set EMAIL_SERVICE=resend
            railway variables set RESEND_API_KEY="$api_key"
            railway variables set EMAIL_FROM="Medieval Commanders <$from_email>"
            railway variables set DEFAULT_ADMIN_EMAIL="$admin_email"
            echo "✅ Resend configured!"
            ;;
        2)
            echo ""
            echo "📮 Setting up Brevo..."
            echo "📋 Steps:"
            echo "1. Go to https://brevo.com and sign up"
            echo "2. Go to SMTP & API > API Keys"
            echo "3. Create a new API key"
            echo "4. Enter details below"
            echo ""
            read -p "Enter your Brevo API key: " api_key
            read -p "Enter your Brevo account email: " smtp_user
            read -p "Enter your sender email (e.g., noreply@yourdomain.com): " from_email
            read -p "Enter admin email (e.g., admin@yourdomain.com): " admin_email
            
            echo "Setting Railway variables..."
            railway variables set EMAIL_SERVICE=brevo
            railway variables set BREVO_API_KEY="$api_key"
            railway variables set BREVO_SMTP_USER="$smtp_user"
            railway variables set EMAIL_FROM="Medieval Commanders <$from_email>"
            railway variables set DEFAULT_ADMIN_EMAIL="$admin_email"
            echo "✅ Brevo configured!"
            ;;
        3)
            echo "⏭️  Skipping email setup..."
            ;;
        *)
            echo "❌ Invalid choice. Skipping email setup..."
            ;;
    esac
else
    echo "✅ EMAIL_SERVICE: $email_service"
    case $email_service in
        "resend")
            if [ -n "$resend_key" ]; then
                echo "✅ RESEND_API_KEY: Set"
            else
                echo "❌ RESEND_API_KEY: Not set"
            fi
            ;;
        "brevo")
            if [ -n "$brevo_key" ]; then
                echo "✅ BREVO_API_KEY: Set"
            else
                echo "❌ BREVO_API_KEY: Not set"
            fi
            ;;
    esac
fi

echo ""
echo "📦 Installing dependencies and deploying..."

# Go to server directory and install dependencies
cd server
npm install

# Install email service packages
if [ "$email_service" = "resend" ] || [ "$(railway variables get EMAIL_SERVICE 2>/dev/null)" = "resend" ]; then
    echo "📦 Installing Resend package..."
    npm install resend
fi

echo "✅ Dependencies installed"
cd ..

echo ""
echo "🚀 Deploying to Railway..."
railway up

if [ $? -eq 0 ]; then
    echo ""
    echo "🎉 Deployment successful!"
    echo ""
    echo "✅ Your app is now deployed with email functionality!"
    echo ""
    echo "🔗 Next steps:"
    echo "1. Check Railway dashboard for deployment status"
    echo "2. Test email functionality in your app"
    echo "3. Submit a test proposal to verify emails work"
    echo ""
    echo "📖 For troubleshooting, see: RAILWAY_EMAIL_SETUP.md"
else
    echo ""
    echo "❌ Deployment failed. Check the logs above for errors."
    echo "💡 Common fixes:"
    echo "1. Check environment variables in Railway dashboard"
    echo "2. Verify API keys are correct"
    echo "3. Check deployment logs in Railway dashboard"
    exit 1
fi
