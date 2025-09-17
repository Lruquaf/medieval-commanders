const nodemailer = require('nodemailer');

class EmailService {
  constructor() {
    this.transporter = null;
    this.isConfigured = false;
    this.init();
  }

  init() {
    // Sadece Gmail kullan
    this.setupGmail();
  }

  setupGmail() {
    console.log('🔧 Setting up Gmail email service...');
    console.log('Gmail config check:', {
      user: process.env.EMAIL_USER ? 'SET' : 'NOT SET',
      pass: process.env.EMAIL_PASS ? 'SET' : 'NOT SET',
      from: process.env.EMAIL_FROM ? 'SET' : 'NOT SET'
    });

    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      console.error('❌ Gmail configuration incomplete. EMAIL_USER and EMAIL_PASS are required.');
      this.isConfigured = false;
      return;
    }

    // ChatGPT'nin önerdiği gelişmiş Gmail konfigürasyonu
    this.transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      // Tercihen 465 deneyin; olmazsa 587'ye geçin:
      port: 465,
      secure: true, // 465 için true
      requireTLS: true,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS // App Password
      },
      tls: { minVersion: 'TLSv1.2' },
      connectionTimeout: 10000,
      greetingTimeout: 10000,
      socketTimeout: 10000,
      logger: true,
      debug: true
    });
    
    this.isConfigured = true;
    console.log('✅ Gmail transporter created successfully');
  }

  async sendEmail(to, subject, html, text = '') {
    if (!this.isConfigured || !this.transporter) {
      console.error('Email service not configured');
      return { success: false, error: 'Email service not configured' };
    }

    // Log email configuration for debugging
    console.log('📧 Email service configuration:');
    console.log('- Service: gmail');
    console.log('- User:', process.env.EMAIL_USER);
    console.log('- From:', process.env.EMAIL_FROM);
    console.log('- To:', to);
    console.log('- Subject:', subject);

    try {
      const mailOptions = {
        from: process.env.EMAIL_FROM || process.env.EMAIL_USER, // ⭐
        to,
        subject,
        text,
        html
      };

      console.log('📤 Sending email...');
      const info = await this.transporter.sendMail(mailOptions);
      console.log('✅ Email sent successfully:', info.messageId);
      
      return { success: true, messageId: info.messageId };
    } catch (error) {
      console.error('❌ Failed to send email:', error.message);
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