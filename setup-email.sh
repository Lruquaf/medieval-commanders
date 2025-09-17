#!/bin/bash

echo "📧 Medieval Commanders - Email Service Setup"
echo "============================================"
echo ""

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Please run this script from the project root directory (where package.json is)"
    exit 1
fi

echo "🔍 Checking current email configuration..."

# Go to server directory
cd server

# Check for existing config
if [ -f ".env.local" ]; then
    echo "📄 Found existing .env.local file"
    if grep -q "EMAIL_SERVICE" .env.local; then
        echo "✅ Email service already configured in .env.local"
        current_service=$(grep "EMAIL_SERVICE" .env.local | cut -d'=' -f2)
        echo "📧 Current service: $current_service"
    else
        echo "⚠️  .env.local exists but no EMAIL_SERVICE found"
    fi
else
    echo "📝 No .env.local file found"
fi

echo ""
echo "🎯 Email Service Options:"
echo "1. Ethereal (Testing) - No setup required, fake emails with preview URLs"
echo "2. Resend (Recommended) - 3,000 free emails/month, modern API"
echo "3. Brevo (Alternative) - 9,000 free emails/month, good for high volume"
echo ""

read -p "Choose option (1-3) or press Enter for testing mode: " choice

case $choice in
    1|"")
        echo "🧪 Setting up Ethereal (Testing Mode)..."
        cat > .env.local << EOF
# Database
DATABASE_URL="file:./dev.db"

# Email Configuration - Ethereal (Testing)
EMAIL_SERVICE=ethereal

# Email sender information
EMAIL_FROM="Medieval Commanders <test@ethereal.email>"

# Default admin email
DEFAULT_ADMIN_EMAIL="admin@test.com"
EOF
        echo "✅ Ethereal configured! No API keys needed."
        ;;
    2)
        echo "🚀 Setting up Resend..."
        echo ""
        echo "📋 Steps to get Resend API key:"
        echo "1. Go to https://resend.com and sign up"
        echo "2. Get your API key from the dashboard"
        echo "3. Enter it below"
        echo ""
        read -p "Enter your Resend API key: " api_key
        read -p "Enter your sender email (e.g., noreply@yourdomain.com): " from_email
        read -p "Enter admin email (e.g., admin@yourdomain.com): " admin_email
        
        cat > .env.local << EOF
# Database
DATABASE_URL="file:./dev.db"

# Email Configuration - Resend (Recommended)
EMAIL_SERVICE=resend
RESEND_API_KEY=$api_key

# Email sender information
EMAIL_FROM="Medieval Commanders <$from_email>"

# Default admin email
DEFAULT_ADMIN_EMAIL="$admin_email"
EOF
        echo "✅ Resend configured!"
        ;;
    3)
        echo "📮 Setting up Brevo..."
        echo ""
        echo "📋 Steps to get Brevo API key:"
        echo "1. Go to https://brevo.com and sign up"
        echo "2. Go to SMTP & API > API Keys"
        echo "3. Create a new API key"
        echo "4. Enter it below"
        echo ""
        read -p "Enter your Brevo API key: " api_key
        read -p "Enter your Brevo account email: " smtp_user
        read -p "Enter your sender email (e.g., noreply@yourdomain.com): " from_email
        read -p "Enter admin email (e.g., admin@yourdomain.com): " admin_email
        
        cat > .env.local << EOF
# Database
DATABASE_URL="file:./dev.db"

# Email Configuration - Brevo (Alternative)
EMAIL_SERVICE=brevo
BREVO_API_KEY=$api_key
BREVO_SMTP_USER=$smtp_user

# Email sender information
EMAIL_FROM="Medieval Commanders <$from_email>"

# Default admin email
DEFAULT_ADMIN_EMAIL="$admin_email"
EOF
        echo "✅ Brevo configured!"
        ;;
    *)
        echo "❌ Invalid choice. Defaulting to Ethereal testing mode..."
        cat > .env.local << EOF
# Database
DATABASE_URL="file:./dev.db"

# Email Configuration - Ethereal (Testing)
EMAIL_SERVICE=ethereal

# Email sender information
EMAIL_FROM="Medieval Commanders <test@ethereal.email>"

# Default admin email
DEFAULT_ADMIN_EMAIL="admin@test.com"
EOF
        ;;
esac

echo ""
echo "🧪 Testing email configuration..."
echo ""

# Test the email service
if node test-email-unified.js; then
    echo ""
    echo "🎉 Email service setup completed successfully!"
    echo ""
    echo "📝 Next steps:"
    echo "1. Start your server: npm run dev"
    echo "2. Test the admin panel: http://localhost:5001/admin"
    echo "3. Submit a test proposal to see emails in action"
    echo ""
    if grep -q "ethereal" .env.local; then
        echo "💡 Using Ethereal? Check console for preview URLs when emails are sent!"
    fi
    echo ""
    echo "📖 For more details, see: NEW_EMAIL_SETUP_GUIDE.md"
else
    echo ""
    echo "❌ Email test failed. Please check your configuration."
    echo "💡 Try running: node test-email-unified.js"
    echo "📖 See NEW_EMAIL_SETUP_GUIDE.md for troubleshooting"
fi
