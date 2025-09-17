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
      case 'sendgrid':
        this.setupSendGrid();
        break;
      case 'brevo':
      case 'sendinblue':
        this.setupBrevo();
        break;
      case 'ethereal':
        this.setupEthereal();
        break;
      case 'mailersend':
        this.setupMailerSend();
        break;
      default:
        this.setupEthereal(); // Default to Ethereal for testing
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

  setupSendGrid() {
    console.log('🔧 Setting up SendGrid email service...');
    
    if (!process.env.SENDGRID_API_KEY) {
      console.error('❌ SendGrid configuration incomplete. SENDGRID_API_KEY is required.');
      this.isConfigured = false;
      return;
    }

    this.transporter = nodemailer.createTransporter({
      service: 'SendGrid',
      auth: {
        user: 'apikey',
        pass: process.env.SENDGRID_API_KEY
      }
    });
    
    this.service = 'sendgrid';
    this.isConfigured = true;
    console.log('✅ SendGrid configured successfully');
  }

  setupBrevo() {
    console.log('🔧 Setting up Brevo (Sendinblue) email service...');
    
    if (!process.env.BREVO_API_KEY) {
      console.error('❌ Brevo configuration incomplete. BREVO_API_KEY is required.');
      this.isConfigured = false;
      return;
    }

    this.transporter = nodemailer.createTransport({
      host: 'smtp-relay.brevo.com',
      port: 587,
      secure: false,
      auth: {
        user: process.env.BREVO_SMTP_USER || process.env.EMAIL_FROM?.split('<')[1]?.split('>')[0] || 'your-email@example.com',
        pass: process.env.BREVO_API_KEY
      }
    });
    
    this.service = 'brevo';
    this.isConfigured = true;
    console.log('✅ Brevo configured successfully');
  }

  setupMailerSend() {
    console.log('🔧 Setting up MailerSend email service...');
    
    if (!process.env.MAILERSEND_API_KEY) {
      console.error('❌ MailerSend configuration incomplete. MAILERSEND_API_KEY is required.');
      this.isConfigured = false;
      return;
    }

    this.transporter = nodemailer.createTransport({
      host: 'smtp.mailersend.net',
      port: 587,
      secure: false,
      auth: {
        user: 'MS_SMTP',
        pass: process.env.MAILERSEND_API_KEY
      }
    });
    
    this.service = 'mailersend';
    this.isConfigured = true;
    console.log('✅ MailerSend configured successfully');
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

  async sendProposalApprovalEmail(proposal) {
    const subject = 'Your Commander Proposal Has Been Approved!';
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #8B4513;">Congratulations!</h2>
        <p>Dear ${proposal.name},</p>
        <p>Great news! Your commander proposal for <strong>${proposal.name}</strong> has been approved and is now part of our collection.</p>
        
        <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #8B4513; margin-top: 0;">Proposal Details:</h3>
          <p><strong>Tier:</strong> ${proposal.tier}</p>
          <p><strong>Description:</strong> ${proposal.description}</p>
        </div>
        
        <p>Thank you for contributing to our Medieval Commanders Collection!</p>
        <p>Best regards,<br>The Medieval Commanders Team</p>
      </div>
    `;

    const text = `Congratulations! Your commander proposal for ${proposal.name} has been approved and is now part of our collection. Tier: ${proposal.tier}, Description: ${proposal.description}`;

    return await this.sendEmail(proposal.email, subject, html, text);
  }

  async sendProposalRejectionEmail(proposal) {
    const subject = 'Commander Proposal Update';
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #8B4513;">Proposal Update</h2>
        <p>Dear ${proposal.name},</p>
        <p>Thank you for your submission. After careful review, we have decided not to include your commander proposal for <strong>${proposal.name}</strong> in our collection at this time.</p>
        
        <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #8B4513; margin-top: 0;">Proposal Details:</h3>
          <p><strong>Tier:</strong> ${proposal.tier}</p>
          <p><strong>Description:</strong> ${proposal.description}</p>
        </div>
        
        <p>We encourage you to submit other commander proposals in the future. Thank you for your interest in our Medieval Commanders Collection!</p>
        <p>Best regards,<br>The Medieval Commanders Team</p>
      </div>
    `;

    const text = `Thank you for your submission. After careful review, we have decided not to include your commander proposal for ${proposal.name} in our collection at this time. Tier: ${proposal.tier}, Description: ${proposal.description}`;

    return await this.sendEmail(proposal.email, subject, html, text);
  }

  async sendNewProposalNotificationEmail(adminEmail, proposal) {
    const subject = 'New Commander Proposal Submitted';
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #8B4513;">New Proposal Alert</h2>
        <p>Hello Admin,</p>
        <p>A new commander proposal has been submitted and requires your review.</p>
        
        <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #8B4513; margin-top: 0;">Proposal Details:</h3>
          <p><strong>Commander Name:</strong> ${proposal.name}</p>
          <p><strong>Submitter Email:</strong> ${proposal.email}</p>
          <p><strong>Tier:</strong> ${proposal.tier}</p>
          <p><strong>Description:</strong> ${proposal.description}</p>
          <p><strong>Submitted:</strong> ${new Date(proposal.createdAt).toLocaleString()}</p>
        </div>
        
        <p>Please log into the admin panel to review and approve or reject this proposal.</p>
        <p>Best regards,<br>Medieval Commanders System</p>
      </div>
    `;

    const text = `New commander proposal submitted by ${proposal.name} (${proposal.email}). Tier: ${proposal.tier}, Description: ${proposal.description}. Please review in the admin panel.`;

    return await this.sendEmail(adminEmail, subject, html, text);
  }
}

module.exports = new EmailService();