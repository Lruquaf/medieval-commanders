#!/usr/bin/env node

// Test script for unified email service
// Usage: 
//   EMAIL_SERVICE=ethereal node test-email-unified.js
//   EMAIL_SERVICE=resend RESEND_API_KEY=your_key node test-email-unified.js
//   EMAIL_SERVICE=brevo BREVO_API_KEY=your_key node test-email-unified.js

const emailService = require('./emailService-unified');

async function testEmailService() {
    console.log('🧪 Testing Unified Email Service...');
    console.log('========================================');
    console.log(`📧 Using service: ${process.env.EMAIL_SERVICE || 'not set (will default to ethereal)'}`);
    console.log('');
    
    // Wait a moment for service to initialize
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Check if email service is configured
    if (!emailService.isConfigured) {
        console.log('❌ Email service is not configured');
        console.log('Please set the following environment variables:');
        console.log('');
        console.log('For Resend (Recommended):');
        console.log('  EMAIL_SERVICE=resend');
        console.log('  RESEND_API_KEY=your_resend_api_key');
        console.log('  EMAIL_FROM="Your App <noreply@yourdomain.com>"');
        console.log('');
        console.log('For Brevo (Sendinblue):');
        console.log('  EMAIL_SERVICE=brevo');
        console.log('  BREVO_API_KEY=your_brevo_api_key');
        console.log('  BREVO_SMTP_USER=your-email@example.com');
        console.log('  EMAIL_FROM="Your App <noreply@yourdomain.com>"');
        console.log('');
        console.log('For Testing (no config needed):');
        console.log('  EMAIL_SERVICE=ethereal');
        console.log('');
        process.exit(1);
    }
    
    console.log('✅ Email service is configured');
    console.log(`📧 Service: ${emailService.service || 'unknown'}`);
    console.log(`📧 From: ${process.env.EMAIL_FROM || 'default'}`);
    console.log('');
    
    // Test sending a simple email
    console.log('📤 Sending test email...');
    
    const testEmail = process.env.TEST_EMAIL || 'test@example.com';
    const subject = 'Medieval Commanders - Email Service Test';
    const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #8B4513;">Email Service Test</h2>
            <p>This is a test email from the Medieval Commanders Collection app.</p>
            <p>If you receive this email, your email service is working correctly!</p>
            <p><strong>Service:</strong> ${emailService.service || 'unknown'}</p>
            <p><strong>Timestamp:</strong> ${new Date().toISOString()}</p>
            <p>Best regards,<br>Medieval Commanders System</p>
        </div>
    `;
    
    const text = `Email Service Test - This is a test email from the Medieval Commanders Collection app. Service: ${emailService.service || 'unknown'}, Timestamp: ${new Date().toISOString()}`;
    
    try {
        const result = await emailService.sendEmail(testEmail, subject, html, text);
        
        if (result.success) {
            console.log('✅ Test email sent successfully!');
            console.log(`📧 Message ID: ${result.messageId}`);
            
            // For Ethereal Email, show preview URL
            if (result.previewUrl) {
                console.log('🔗 Email preview URL:', result.previewUrl);
            }
        } else {
            console.log('❌ Failed to send test email');
            console.log(`Error: ${result.error}`);
        }
    } catch (error) {
        console.log('❌ Error sending test email');
        console.log(`Error: ${error.message}`);
    }
    
    console.log('');
    console.log('🧪 Testing proposal approval email...');
    
    // Test proposal approval email
    const testProposal = {
        name: 'Test Commander',
        email: testEmail,
        tier: 'Legendary',
        description: 'This is a test proposal for email testing purposes.',
        createdAt: new Date()
    };
    
    try {
        const approvalResult = await emailService.sendProposalApprovalEmail(testProposal);
        
        if (approvalResult.success) {
            console.log('✅ Proposal approval email sent successfully!');
            if (approvalResult.previewUrl) {
                console.log('🔗 Email preview URL:', approvalResult.previewUrl);
            }
        } else {
            console.log('❌ Failed to send proposal approval email');
            console.log(`Error: ${approvalResult.error}`);
        }
    } catch (error) {
        console.log('❌ Error sending proposal approval email');
        console.log(`Error: ${error.message}`);
    }
    
    console.log('');
    console.log('🧪 Testing admin notification email...');
    
    // Test admin notification email
    const adminEmail = process.env.DEFAULT_ADMIN_EMAIL || 'admin@medievalcommanders.com';
    
    try {
        const adminResult = await emailService.sendNewProposalNotificationEmail(adminEmail, testProposal);
        
        if (adminResult.success) {
            console.log('✅ Admin notification email sent successfully!');
            if (adminResult.previewUrl) {
                console.log('🔗 Email preview URL:', adminResult.previewUrl);
            }
        } else {
            console.log('❌ Failed to send admin notification email');
            console.log(`Error: ${adminResult.error}`);
        }
    } catch (error) {
        console.log('❌ Error sending admin notification email');
        console.log(`Error: ${error.message}`);
    }
    
    console.log('');
    console.log('🎉 Email service test completed!');
    console.log('');
    console.log('Next steps:');
    console.log('1. Check your email inbox for the test emails (if using real service)');
    console.log('2. If using Ethereal, check the preview URLs above');
    console.log('3. Verify all email types are working correctly');
    console.log('4. Update your production environment variables');
    console.log('');
    console.log('Service comparison:');
    console.log('- Ethereal: Testing only, shows preview URLs');
    console.log('- Resend: 3,000 emails/month free, modern API');
    console.log('- Brevo: 300 emails/day free, reliable delivery');
}

// Run the test
testEmailService().catch(console.error);
