const nodemailer = require('nodemailer');

class EmailService {
  constructor() {
    this.transporter = null;
    this.isConfigured = false;
    this.init();
  }

  init() {
    // Check if EMAIL_SERVICE is set to determine configuration
    if (process.env.EMAIL_SERVICE === 'ethereal') {
      this.setupEtherealEmail();
    } else if (process.env.EMAIL_SERVICE === 'gmail' || process.env.EMAIL_SERVICE === 'mailtrap') {
      this.setupLocalEmail();
    } else if (process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'local') {
      this.setupLocalEmail();
    } else {
      // For production, use real SMTP or email service
      this.setupProductionEmail();
    }
  }

  setupLocalEmail() {
    // For local development, you can use:
    // 1. Gmail with app password
    // 2. Mailtrap for testing
    // 3. Ethereal Email for testing (creates fake accounts)
    
    if (process.env.EMAIL_SERVICE === 'gmail') {
      this.transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS // Use app password for Gmail
        }
      });
      this.isConfigured = true;
    } else if (process.env.EMAIL_SERVICE === 'mailtrap') {
      this.transporter = nodemailer.createTransport({
        host: 'smtp.mailtrap.io',
        port: 2525,
        auth: {
          user: process.env.MAILTRAP_USER,
          pass: process.env.MAILTRAP_PASS
        }
      });
      this.isConfigured = true;
    } else {
      // Default to Ethereal Email for testing
      this.setupEtherealEmail();
    }
  }

  async setupEtherealEmail() {
    try {
      // Create a test account
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
      this.isConfigured = true;
      console.log('Ethereal Email configured for testing');
      console.log('Test account:', testAccount.user);
    } catch (error) {
      console.error('Failed to setup Ethereal Email:', error);
      this.isConfigured = false;
    }
  }

  setupProductionEmail() {
    // For production, configure with your preferred email service
    // Examples: SendGrid, AWS SES, Mailgun, etc.
    
    if (process.env.EMAIL_SERVICE === 'sendgrid') {
      this.transporter = nodemailer.createTransport({
        service: 'SendGrid',
        auth: {
          user: 'apikey',
          pass: process.env.SENDGRID_API_KEY
        }
      });
      this.isConfigured = true;
    } else if (process.env.EMAIL_SERVICE === 'ses') {
      this.transporter = nodemailer.createTransport({
        SES: {
          region: process.env.AWS_REGION || 'us-east-1',
          accessKeyId: process.env.AWS_ACCESS_KEY_ID,
          secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
        }
      });
      this.isConfigured = true;
    } else if (process.env.EMAIL_SERVICE === 'mailgun') {
      this.transporter = nodemailer.createTransport({
        host: 'smtp.mailgun.org',
        port: 587,
        secure: false,
        auth: {
          user: process.env.MAILGUN_USER || `postmaster@${process.env.MAILGUN_DOMAIN}`,
          pass: process.env.MAILGUN_API_KEY
        }
      });
      this.isConfigured = true;
    } else {
      // Default SMTP configuration
      this.transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT || 587,
        secure: process.env.SMTP_SECURE === 'true',
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS
        }
      });
      this.isConfigured = true;
    }
  }

  async sendEmail(to, subject, html, text = '') {
    if (!this.isConfigured || !this.transporter) {
      console.error('Email service not configured');
      return { success: false, error: 'Email service not configured' };
    }

    try {
      const mailOptions = {
        from: process.env.EMAIL_FROM || 'noreply@medievalcommanders.com',
        to,
        subject,
        text,
        html
      };

      const info = await this.transporter.sendMail(mailOptions);
      
      // For Ethereal Email, log the preview URL
      if (process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'local') {
        const previewUrl = nodemailer.getTestMessageUrl(info);
        if (previewUrl) {
          console.log('Email preview URL:', previewUrl);
        }
      }

      return { success: true, messageId: info.messageId };
    } catch (error) {
      console.error('Failed to send email:', error);
      return { success: false, error: error.message };
    }
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
