#!/usr/bin/env node

// Test script for email service
// Usage: node test-email.js

const emailService = require('./emailService');

async function testEmailService() {
    console.log('🧪 Testing Email Service...');
    console.log('================================');
    
    // Check if email service is configured
    if (!emailService.isConfigured) {
        console.log('❌ Email service is not configured');
        console.log('Please set the following environment variables:');
        console.log('- EMAIL_SERVICE (sendgrid, ses, mailgun, smtp, gmail, or ethereal)');
        console.log('- Required credentials for your chosen service');
        console.log('- EMAIL_FROM');
        console.log('- DEFAULT_ADMIN_EMAIL');
        process.exit(1);
    }
    
    console.log('✅ Email service is configured');
    console.log(`📧 Service: ${process.env.EMAIL_SERVICE || 'not set'}`);
    console.log(`📧 From: ${process.env.EMAIL_FROM || 'not set'}`);
    console.log(`📧 Admin: ${process.env.DEFAULT_ADMIN_EMAIL || 'not set'}`);
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
            <p><strong>Service:</strong> ${process.env.EMAIL_SERVICE || 'not set'}</p>
            <p><strong>Timestamp:</strong> ${new Date().toISOString()}</p>
            <p>Best regards,<br>Medieval Commanders System</p>
        </div>
    `;
    
    const text = `Email Service Test - This is a test email from the Medieval Commanders Collection app. Service: ${process.env.EMAIL_SERVICE || 'not set'}, Timestamp: ${new Date().toISOString()}`;
    
    try {
        const result = await emailService.sendEmail(testEmail, subject, html, text);
        
        if (result.success) {
            console.log('✅ Test email sent successfully!');
            console.log(`📧 Message ID: ${result.messageId}`);
            
            // For Ethereal Email, show preview URL
            if (process.env.EMAIL_SERVICE === 'ethereal' || process.env.NODE_ENV === 'development') {
                console.log('🔗 Check the console above for the email preview URL');
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
    console.log('1. Check your email inbox for the test emails');
    console.log('2. If using Ethereal Email, check the console for preview URLs');
    console.log('3. Verify all email types are working correctly');
    console.log('4. Set up your production email service if testing locally');
}

// Run the test
testEmailService().catch(console.error);
