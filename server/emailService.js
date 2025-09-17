const nodemailer = require('nodemailer');

class EmailService {
  constructor() {
    this.transporter = null;
    this.service = null;
    this.resend = null;
    this.isConfigured = false;
    this.init();
  }

  init() {
    const emailService = process.env.EMAIL_SERVICE?.toLowerCase();
    
    switch (emailService) {
      case 'resend':
        this.setupResend();
        break;
      case 'ethereal':
        this.setupEthereal();
        break;
      default:
        this.setupResend(); // Default to Resend
        break;
    }
  }

  async setupResend() {
    console.log('🔧 Setting up Resend email service...');
    
    if (!process.env.RESEND_API_KEY) {
      console.error('❌ Resend configuration incomplete. RESEND_API_KEY is required.');
      this.isConfigured = false;
      return;
    }

    console.log('🔑 Resend API Key present:', !!process.env.RESEND_API_KEY);
    console.log('🔑 Resend API Key length:', process.env.RESEND_API_KEY ? process.env.RESEND_API_KEY.length : 0);
    console.log('🔑 Resend API Key starts with:', process.env.RESEND_API_KEY ? process.env.RESEND_API_KEY.substring(0, 8) + '...' : 'N/A');

    try {
      // Dynamically import Resend (it's an ES module)
      const { Resend } = await import('resend');
      this.resend = new Resend(process.env.RESEND_API_KEY);
      this.service = 'resend';
      this.isConfigured = true;
      console.log('✅ Resend configured successfully');
    } catch (error) {
      console.error('❌ Failed to load Resend:', error.message);
      console.log('📦 Make sure you have installed resend: npm install resend');
      this.isConfigured = false;
    }
  }


  async setupEthereal() {
    console.log('🔧 Setting up Ethereal email service (for testing)...');
    
    try {
      // Create Ethereal test account
      const testAccount = await nodemailer.createTestAccount();
      
      this.transporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass
        }
      });
      
      this.service = 'ethereal';
      this.isConfigured = true;
      console.log('✅ Ethereal configured successfully');
      console.log('📧 Ethereal credentials:', { user: testAccount.user, pass: testAccount.pass });
    } catch (error) {
      console.error('❌ Failed to setup Ethereal:', error.message);
      this.isConfigured = false;
    }
  }

  async sendEmail(to, subject, html, text = '') {
    if (!this.isConfigured) {
      console.error('Email service not configured');
      return { success: false, error: 'Email service not configured' };
    }

    console.log(`📧 Sending email via ${this.service}:`);
    console.log('- To:', to);
    console.log('- Subject:', subject);
    console.log('- From:', process.env.EMAIL_FROM);

    try {
      if (this.service === 'resend' && this.resend) {
        return await this.sendViaResend(to, subject, html, text);
      } else if (this.transporter) {
        return await this.sendViaNodemailer(to, subject, html, text);
      } else {
        throw new Error('No email transporter available');
      }
    } catch (error) {
      console.error(`❌ Failed to send email via ${this.service}:`, error.message);
      return { success: false, error: error.message };
    }
  }

  async sendViaResend(to, subject, html, text) {
    try {
      console.log('📧 Resend API call details:');
      console.log('- From:', process.env.EMAIL_FROM || 'Medieval Commanders <onboarding@resend.dev>');
      console.log('- To:', to);
      console.log('- Subject:', subject);
      console.log('- API Key present:', !!process.env.RESEND_API_KEY);
      
      const result = await this.resend.emails.send({
        from: process.env.EMAIL_FROM || 'Medieval Commanders <onboarding@resend.dev>',
        to: [to],
        subject: subject,
        html: html,
        text: text || undefined
      });

      console.log('📧 Resend API Response:', JSON.stringify(result, null, 2));
      
      // Check different possible response formats
      if (result && result.id) {
        console.log('✅ Email sent successfully via Resend (direct id):', result.id);
        return { success: true, messageId: result.id };
      } else if (result && result.data && result.data.id) {
        console.log('✅ Email sent successfully via Resend (data.id):', result.data.id);
        return { success: true, messageId: result.data.id };
      } else if (result && result.success) {
        console.log('✅ Email sent successfully via Resend (success flag):', result);
        return { success: true, messageId: result.messageId || 'unknown' };
      } else {
        console.error('❌ Resend API returned unexpected response format:', result);
        console.error('❌ Response keys:', Object.keys(result || {}));
        console.error('❌ Response type:', typeof result);
        return { success: false, error: 'Unexpected response format from Resend API: ' + JSON.stringify(result) };
      }
    } catch (error) {
      console.error('❌ Resend API error:', error);
      console.error('❌ Error details:', {
        message: error.message,
        status: error.status,
        statusCode: error.statusCode,
        response: error.response ? JSON.stringify(error.response, null, 2) : 'No response data'
      });
      return { success: false, error: error.message };
    }
  }

  async sendViaNodemailer(to, subject, html, text) {
    const mailOptions = {
      from: process.env.EMAIL_FROM || 'Medieval Commanders <test@ethereal.email>',
      to,
      subject,
      text,
      html
    };

    const info = await this.transporter.sendMail(mailOptions);
    
    // For Ethereal, show preview URL
    if (this.service === 'ethereal') {
      console.log('🔗 Email preview URL:', nodemailer.getTestMessageUrl(info));
    }
    
    console.log(`✅ Email sent successfully via ${this.service}:`, info.messageId);
    return { success: true, messageId: info.messageId, previewUrl: nodemailer.getTestMessageUrl(info) };
  }


  async sendNewProposalNotificationEmail(adminEmail, proposal) {
    const subject = 'New Commander Proposal Submitted';
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #8B4513; text-align: center;">New Proposal Alert</h2>
        <p>Hello Admin,</p>
        <p>A new commander proposal has been submitted and requires your review.</p>
        
        <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #8B4513;">
          <h3 style="color: #8B4513; margin-top: 0;">Proposal Details:</h3>
          <p><strong>Commander Name:</strong> ${proposal.name}</p>
          <p><strong>Submitter Email:</strong> ${proposal.email}</p>
          <p><strong>Tier:</strong> ${proposal.tier}</p>
          <p><strong>Description:</strong> ${proposal.description}</p>
          <p><strong>Submitted:</strong> ${new Date(proposal.createdAt).toLocaleString()}</p>
        </div>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="https://medieval-commnaders.netlify.app/admin" 
             style="background-color: #8B4513; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
            Review Proposal
          </a>
        </div>
        
        <p style="text-align: center; color: #666; font-size: 14px;">
          Best regards,<br>Medieval Commanders System
        </p>
      </div>
    `;

    const text = `New commander proposal submitted by ${proposal.name} (${proposal.email}). Tier: ${proposal.tier}, Description: ${proposal.description}. Please review in the admin panel at https://medieval-commnaders.netlify.app/admin`;

    return await this.sendEmail(adminEmail, subject, html, text);
  }
}

module.exports = new EmailService();