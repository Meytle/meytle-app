/**
 * Email Service using Resend
 * Handles welcome emails and verification emails
 */

const { Resend } = require('resend');
const crypto = require('crypto');
const logger = require('./logger');

// Initialize Resend with API key
const resend = new Resend(process.env.RESEND_API_KEY);

// Combined Welcome + Verification Email Template
const getCombinedWelcomeVerificationTemplate = (userName, userRole, verificationLink) => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Welcome to Meytle - Verify Your Email</title>
      <style>
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
          background-color: #f8f9fa;
        }
        .container {
          background: white;
          border-radius: 10px;
          padding: 30px;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        .header {
          text-align: center;
          margin-bottom: 30px;
        }
        .logo {
          font-size: 28px;
          font-weight: bold;
          color: #8b5cf6;
          margin-bottom: 10px;
        }
        .welcome-title {
          color: #1f2937;
          font-size: 24px;
          margin-bottom: 20px;
        }
        .content {
          margin-bottom: 30px;
        }
        .role-badge {
          display: inline-block;
          background: linear-gradient(135deg, #8b5cf6, #ec4899);
          color: white;
          padding: 8px 16px;
          border-radius: 20px;
          font-size: 14px;
          font-weight: 600;
          margin: 10px 0;
        }
        .verify-button {
          display: inline-block;
          background: linear-gradient(135deg, #8b5cf6, #ec4899);
          color: white;
          padding: 15px 40px;
          text-decoration: none;
          border-radius: 8px;
          font-weight: 600;
          font-size: 16px;
          margin: 25px 0;
        }
        .footer {
          text-align: center;
          margin-top: 30px;
          padding-top: 20px;
          border-top: 1px solid #e5e7eb;
          color: #6b7280;
          font-size: 14px;
        }
        .highlight {
          background: #fef3c7;
          padding: 15px;
          border-radius: 8px;
          border-left: 4px solid #f59e0b;
          margin: 20px 0;
        }
        .link-fallback {
          background: #f3f4f6;
          padding: 15px;
          border-radius: 8px;
          margin: 20px 0;
          word-break: break-all;
          font-family: monospace;
          font-size: 12px;
        }
        .warning {
          background: #fef2f2;
          padding: 15px;
          border-radius: 8px;
          border-left: 4px solid #ef4444;
          margin: 20px 0;
          color: #dc2626;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="logo">Meytle</div>
          <h1 class="welcome-title">Welcome to Meytle! 🎉</h1>
        </div>

        <div class="content">
          <p>Hi <strong>${userName}</strong>,</p>

          <p>Welcome to Meytle! We're thrilled to have you join our community.</p>

          <div style="text-align: center;">
            <span class="role-badge">${userRole === 'companion' ? '✨ Companion Account' : '👤 Client Account'}</span>
          </div>

          ${userRole === 'companion'
            ? `<p>As a <strong>Companion</strong>, you're one step away from:</p>
               <ul>
                 <li>Creating your professional profile</li>
                 <li>Setting your availability and rates</li>
                 <li>Connecting with clients</li>
                 <li>Earning money by offering your time and company</li>
               </ul>`
            : `<p>As a <strong>Client</strong>, you're one step away from:</p>
               <ul>
                 <li>Browsing verified companions</li>
                 <li>Booking companions for activities</li>
                 <li>Creating meaningful connections</li>
                 <li>Enjoying new experiences</li>
               </ul>`
          }

          <div class="warning">
            <strong>⚠️ Action Required:</strong> Please verify your email address to activate your account and access all features.
          </div>

          <div style="text-align: center;">
            <a href="${verificationLink}" class="verify-button">
              Verify Email & Get Started →
            </a>
          </div>

          <p style="text-align: center; color: #6b7280; font-size: 14px;">
            If the button doesn't work, copy and paste this link into your browser:
          </p>
          <div class="link-fallback">
            ${verificationLink}
          </div>

          <p style="text-align: center; color: #6b7280;">
            <strong>This verification link expires in 24 hours.</strong>
          </p>

          ${userRole === 'companion'
            ? `<div class="highlight">
                <strong>📋 Next Steps After Verification:</strong><br>
                1. Complete your companion application<br>
                2. Upload your profile photo and verification documents<br>
                3. Wait for approval (24-48 hours)<br>
                4. Start accepting bookings!
              </div>`
            : ``
          }
        </div>

        <div class="footer">
          <p>Best regards,<br>The Meytle Team</p>
          <p>Need help? Contact us at support@meytle.com</p>
          <p style="font-size: 12px; color: #9ca3af;">
            You received this email because you signed up for Meytle.
          </p>
        </div>
      </div>
    </body>
    </html>
  `;
};

// Email templates (keeping old ones for backward compatibility)
const getWelcomeEmailTemplate = (userName, userRole) => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Welcome to Meytle</title>
      <style>
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
          background-color: #f8f9fa;
        }
        .container {
          background: white;
          border-radius: 10px;
          padding: 30px;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        .header {
          text-align: center;
          margin-bottom: 30px;
        }
        .logo {
          font-size: 28px;
          font-weight: bold;
          color: #8b5cf6;
          margin-bottom: 10px;
        }
        .welcome-title {
          color: #1f2937;
          font-size: 24px;
          margin-bottom: 20px;
        }
        .content {
          margin-bottom: 30px;
        }
        .role-badge {
          display: inline-block;
          background: linear-gradient(135deg, #8b5cf6, #ec4899);
          color: white;
          padding: 8px 16px;
          border-radius: 20px;
          font-size: 14px;
          font-weight: 600;
          margin: 10px 0;
        }
        .cta-button {
          display: inline-block;
          background: linear-gradient(135deg, #8b5cf6, #ec4899);
          color: white;
          padding: 12px 24px;
          text-decoration: none;
          border-radius: 8px;
          font-weight: 600;
          margin: 20px 0;
        }
        .footer {
          text-align: center;
          margin-top: 30px;
          padding-top: 20px;
          border-top: 1px solid #e5e7eb;
          color: #6b7280;
          font-size: 14px;
        }
        .highlight {
          background: #fef3c7;
          padding: 15px;
          border-radius: 8px;
          border-left: 4px solid #f59e0b;
          margin: 20px 0;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="logo">Meytle</div>
          <h1 class="welcome-title">Welcome to Meytle! 🎉</h1>
        </div>
        
        <div class="content">
          <p>Hi <strong>${userName}</strong>,</p>
          
          <p>Welcome to Meytle! We're thrilled to have you join our community of companions and clients.</p>
          
          <div style="text-align: center;">
            <span class="role-badge">${userRole === 'companion' ? 'Companion' : 'Client'}</span>
          </div>
          
          ${userRole === 'companion' 
            ? `<p>As a <strong>Companion</strong>, you can:</p>
               <ul>
                 <li>Create your profile and showcase your interests</li>
                 <li>Set your availability and hourly rates</li>
                 <li>Connect with clients looking for companionship</li>
                 <li>Earn money by offering your time and company</li>
               </ul>`
            : `<p>As a <strong>Client</strong>, you can:</p>
               <ul>
                 <li>Browse and discover amazing companions</li>
                 <li>Book companions for various activities</li>
                 <li>Enjoy meaningful connections and experiences</li>
                 <li>Rate and review your experiences</li>
               </ul>`
          }
          
          <div class="highlight">
            <strong>📧 Important:</strong> Please verify your email address to unlock all features and start ${userRole === 'companion' ? 'earning' : 'booking'}!
          </div>
          
          <p>Ready to get started?</p>
          <div style="text-align: center;">
            <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/dashboard" class="cta-button">
              Go to Dashboard →
            </a>
          </div>
        </div>
        
        <div class="footer">
          <p>Best regards,<br>The Meytle Team</p>
          <p>Need help? Contact us at support@meytle.com</p>
        </div>
      </div>
    </body>
    </html>
  `;
};

const getVerificationEmailTemplate = (userName, verificationLink) => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Verify Your Email - Meytle</title>
      <style>
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
          background-color: #f8f9fa;
        }
        .container {
          background: white;
          border-radius: 10px;
          padding: 30px;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        .header {
          text-align: center;
          margin-bottom: 30px;
        }
        .logo {
          font-size: 28px;
          font-weight: bold;
          color: #8b5cf6;
          margin-bottom: 10px;
        }
        .verify-title {
          color: #1f2937;
          font-size: 24px;
          margin-bottom: 20px;
        }
        .content {
          margin-bottom: 30px;
        }
        .verify-button {
          display: inline-block;
          background: linear-gradient(135deg, #8b5cf6, #ec4899);
          color: white;
          padding: 15px 30px;
          text-decoration: none;
          border-radius: 8px;
          font-weight: 600;
          font-size: 16px;
          margin: 20px 0;
          text-align: center;
        }
        .footer {
          text-align: center;
          margin-top: 30px;
          padding-top: 20px;
          border-top: 1px solid #e5e7eb;
          color: #6b7280;
          font-size: 14px;
        }
        .warning {
          background: #fef2f2;
          padding: 15px;
          border-radius: 8px;
          border-left: 4px solid #ef4444;
          margin: 20px 0;
          color: #dc2626;
        }
        .link-fallback {
          background: #f3f4f6;
          padding: 15px;
          border-radius: 8px;
          margin: 20px 0;
          word-break: break-all;
          font-family: monospace;
          font-size: 12px;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="logo">Meytle</div>
          <h1 class="verify-title">Verify Your Email Address 🔐</h1>
        </div>
        
        <div class="content">
          <p>Hi <strong>${userName}</strong>,</p>
          
          <p>Thank you for signing up with Meytle! To complete your registration and unlock all features, please verify your email address.</p>
          
          <div style="text-align: center;">
            <a href="${verificationLink}" class="verify-button">
              Verify Email Address
            </a>
          </div>
          
          <div class="warning">
            <strong>⚠️ Important:</strong> Without email verification, you won't be able to book companions or earn money as a companion.
          </div>
          
          <p>If the button doesn't work, copy and paste this link into your browser:</p>
          <div class="link-fallback">
            ${verificationLink}
          </div>
          
          <p><strong>This verification link will expire in 24 hours.</strong></p>
        </div>
        
        <div class="footer">
          <p>Best regards,<br>The Meytle Team</p>
          <p>Need help? Contact us at support@meytle.com</p>
        </div>
      </div>
    </body>
    </html>
  `;
};

// Generate verification token
const generateVerificationToken = () => {
  return crypto.randomBytes(32).toString('hex');
};

// Send combined welcome and verification email
const sendWelcomeVerificationEmail = async (email, userName, userRole, verificationToken) => {
  try {
    const verificationLink = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/verify-email?token=${verificationToken}`;

    // Check email mode configuration
    const emailMode = process.env.EMAIL_MODE || 'testing';
    const testEmailRecipient = process.env.TEST_EMAIL_RECIPIENT || 'sahilsingh@claritty.in';

    // Determine recipient based on mode
    let recipientEmail = email;
    let emailNote = '';

    if (emailMode === 'testing') {
      // In testing mode, send ALL emails to the test recipient
      recipientEmail = testEmailRecipient;
      emailNote = `[TEST MODE - Originally for: ${email}]`;
      logger.apiInfo('emailService', 'sendWelcomeVerificationEmail', 'TEST MODE: Redirecting email', { from: email, to: testEmailRecipient });
    }

    // Use 'onboarding@resend.dev' for testing or your verified domain
    const fromEmail = process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev';

    // Modify subject in test mode to show original recipient
    const subject = emailMode === 'testing'
      ? `[TEST: ${email}] Welcome to Meytle - Verify Your Email 🎉`
      : 'Welcome to Meytle - Verify Your Email 🎉';

    const { data, error } = await resend.emails.send({
      from: `Meytle <${fromEmail}>`,
      to: [recipientEmail],
      subject: subject,
      html: getCombinedWelcomeVerificationTemplate(userName, userRole, verificationLink),
    });

    if (error) {
      logger.apiError('emailService', 'sendWelcomeVerificationEmail', error, { email, emailMode });

      // Log helpful information about the error
      if (error.message && error.message.includes('You can only send testing emails')) {
        logger.apiInfo('emailService', 'sendWelcomeVerificationEmail', `Email mode is set to: ${emailMode}`, {});
        logger.apiInfo('emailService', 'sendWelcomeVerificationEmail', 'To enable production emails:', {
          steps: [
            'Get a domain and verify it in Resend',
            'Set EMAIL_MODE=production in .env',
            'Set RESEND_FROM_EMAIL=noreply@yourdomain.com'
          ]
        });
      }

      return { success: false, error };
    }

    logger.apiInfo('emailService', 'sendWelcomeVerificationEmail', 'Welcome+Verification email sent successfully', {
      recipientEmail,
      originalRecipient: email,
      emailNote
    });

    return { success: true, data, verificationLink, sentTo: recipientEmail, originalRecipient: email };
  } catch (error) {
    logger.apiError('emailService', 'sendWelcomeVerificationEmail', error, { email });
    return { success: false, error: error.message };
  }
};

// Send welcome email (legacy - kept for backward compatibility)
const sendWelcomeEmail = async (email, userName, userRole) => {
  try {
    // Check email mode configuration
    const emailMode = process.env.EMAIL_MODE || 'testing';
    const testEmailRecipient = process.env.TEST_EMAIL_RECIPIENT || 'sahilsingh@claritty.in';

    // In testing mode, redirect to test recipient
    const recipientEmail = emailMode === 'testing' ? testEmailRecipient : email;

    const fromEmail = process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev';

    const { data, error } = await resend.emails.send({
      from: `Meytle <${fromEmail}>`,
      to: [recipientEmail],
      subject: emailMode === 'testing'
        ? `[TEST: ${email}] Welcome to Meytle, ${userName}! 🎉`
        : `Welcome to Meytle, ${userName}! 🎉`,
      html: getWelcomeEmailTemplate(userName, userRole),
    });

    if (error) {
      logger.apiError('emailService', 'sendWelcomeEmail', error, { email });
      return { success: false, error };
    }

    logger.apiInfo('emailService', 'sendWelcomeEmail', 'Welcome email sent successfully', { email });
    return { success: true, data };
  } catch (error) {
    logger.apiError('emailService', 'sendWelcomeEmail', error, { email });
    return { success: false, error: error.message };
  }
};

// Send verification email (legacy - kept for backward compatibility)
const sendVerificationEmail = async (email, userName, verificationToken) => {
  try {
    const verificationLink = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/verify-email?token=${verificationToken}`;

    // Check email mode configuration
    const emailMode = process.env.EMAIL_MODE || 'testing';
    const testEmailRecipient = process.env.TEST_EMAIL_RECIPIENT || 'sahilsingh@claritty.in';

    // In testing mode, redirect to test recipient
    const recipientEmail = emailMode === 'testing' ? testEmailRecipient : email;

    const fromEmail = process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev';

    const { data, error } = await resend.emails.send({
      from: `Meytle <${fromEmail}>`,
      to: [recipientEmail],
      subject: emailMode === 'testing'
        ? `[TEST: ${email}] Verify Your Email - Meytle`
        : 'Verify Your Email - Meytle',
      html: getVerificationEmailTemplate(userName, verificationLink),
    });

    if (error) {
      logger.apiError('emailService', 'sendVerificationEmail', error, { email });
      return { success: false, error };
    }

    logger.apiInfo('emailService', 'sendVerificationEmail', 'Verification email sent successfully', { email });
    return { success: true, data, verificationLink };
  } catch (error) {
    logger.apiError('emailService', 'sendVerificationEmail', error, { email });
    return { success: false, error: error.message };
  }
};

// Booking notification email template for companions
const getBookingNotificationTemplate = (bookingDetails) => {
  const {
    companionName,
    clientName,
    bookingDate,
    startTime,
    endTime,
    durationHours,
    totalAmount,
    serviceName,
    meetingLocation,
    meetingType,
    specialRequests
  } = bookingDetails;

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>New Booking Request - Meytle</title>
      <style>
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
          background-color: #f8f9fa;
        }
        .container {
          background: white;
          border-radius: 10px;
          padding: 30px;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        .header {
          text-align: center;
          margin-bottom: 30px;
          border-bottom: 2px solid #8b5cf6;
          padding-bottom: 20px;
        }
        .logo {
          font-size: 28px;
          font-weight: bold;
          color: #8b5cf6;
          margin-bottom: 10px;
        }
        .title {
          color: #1f2937;
          font-size: 24px;
          margin-bottom: 10px;
        }
        .booking-badge {
          display: inline-block;
          background: #10b981;
          color: white;
          padding: 6px 12px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 600;
          margin-top: 10px;
        }
        .content {
          margin-bottom: 30px;
        }
        .booking-details {
          background: #f9fafb;
          border-radius: 8px;
          padding: 20px;
          margin: 20px 0;
        }
        .detail-row {
          display: flex;
          justify-content: space-between;
          padding: 10px 0;
          border-bottom: 1px solid #e5e7eb;
        }
        .detail-row:last-child {
          border-bottom: none;
        }
        .detail-label {
          font-weight: 600;
          color: #6b7280;
        }
        .detail-value {
          color: #111827;
          text-align: right;
        }
        .amount {
          font-size: 24px;
          font-weight: bold;
          color: #10b981;
        }
        .cta-button {
          display: inline-block;
          background: linear-gradient(135deg, #8b5cf6, #ec4899);
          color: white;
          padding: 14px 28px;
          text-decoration: none;
          border-radius: 8px;
          font-weight: 600;
          font-size: 16px;
          margin: 20px 0;
        }
        .special-requests {
          background: #fef3c7;
          padding: 15px;
          border-radius: 8px;
          border-left: 4px solid #f59e0b;
          margin: 20px 0;
        }
        .footer {
          text-align: center;
          margin-top: 30px;
          padding-top: 20px;
          border-top: 1px solid #e5e7eb;
          color: #6b7280;
          font-size: 14px;
        }
        .alert {
          background: #dcfce7;
          padding: 15px;
          border-radius: 8px;
          border-left: 4px solid #10b981;
          margin: 20px 0;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="logo">Meytle</div>
          <h1 class="title">New Booking Request! 🎉</h1>
          <span class="booking-badge">ACTION REQUIRED</span>
        </div>

        <div class="content">
          <p>Hi <strong>${companionName}</strong>,</p>

          <p>Great news! You have received a new booking request from a client.</p>

          <div class="alert">
            <strong>💰 Earning Opportunity:</strong> You'll earn <span class="amount">$${(totalAmount * 0.9).toFixed(2)}</span> from this booking (after 10% platform fee).
          </div>

          <div class="booking-details">
            <h3 style="margin-top: 0;">Booking Details</h3>
            <div class="detail-row">
              <span class="detail-label">Client Name:</span>
              <span class="detail-value"><strong>${clientName}</strong></span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Date:</span>
              <span class="detail-value">${new Date(bookingDate).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Time:</span>
              <span class="detail-value">${startTime} - ${endTime}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Duration:</span>
              <span class="detail-value">${durationHours} hour${durationHours > 1 ? 's' : ''}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Service:</span>
              <span class="detail-value">${serviceName || 'Standard Companionship'}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Meeting Type:</span>
              <span class="detail-value">${meetingType === 'virtual' ? '💻 Virtual' : '👥 In-Person'}</span>
            </div>
            ${meetingLocation ? `
            <div class="detail-row">
              <span class="detail-label">Location:</span>
              <span class="detail-value">${meetingLocation}</span>
            </div>
            ` : ''}
            <div class="detail-row">
              <span class="detail-label">Total Amount:</span>
              <span class="detail-value" style="font-size: 18px; font-weight: bold; color: #10b981;">$${totalAmount.toFixed(2)}</span>
            </div>
          </div>

          ${specialRequests ? `
          <div class="special-requests">
            <strong>📋 Special Requests from Client:</strong><br>
            ${specialRequests}
          </div>
          ` : ''}

          <p><strong>What happens next?</strong></p>
          <ul>
            <li>Review the booking details carefully</li>
            <li>Check your availability for the requested time</li>
            <li>Confirm or decline the booking in your dashboard</li>
            <li>The client will be notified of your decision</li>
          </ul>

          <div style="text-align: center;">
            <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/companion-dashboard" class="cta-button">
              View Booking in Dashboard →
            </a>
          </div>

          <p style="text-align: center; color: #6b7280; font-size: 14px;">
            Please respond to this booking request within 24 hours.
          </p>
        </div>

        <div class="footer">
          <p>Best regards,<br>The Meytle Team</p>
          <p>Need help? Contact us at support@meytle.com</p>
          <p style="font-size: 12px; color: #9ca3af;">
            You received this email because you have an active companion account on Meytle.
          </p>
        </div>
      </div>
    </body>
    </html>
  `;
};

// Send booking notification email to companion
const sendBookingNotificationEmail = async (companionEmail, bookingDetails) => {
  try {
    // Check email mode configuration
    const emailMode = process.env.EMAIL_MODE || 'testing';
    const testEmailRecipient = process.env.TEST_EMAIL_RECIPIENT || 'sahilsingh@claritty.in';

    // Determine recipient based on mode
    let recipientEmail = companionEmail;
    let emailNote = '';

    if (emailMode === 'testing') {
      // In testing mode, send ALL emails to the test recipient
      recipientEmail = testEmailRecipient;
      emailNote = `[TEST MODE - Originally for: ${companionEmail}]`;
      logger.apiInfo('emailService', 'sendBookingNotificationEmail', 'TEST MODE: Redirecting booking notification', { from: companionEmail, to: testEmailRecipient });
    }

    // Use 'onboarding@resend.dev' for testing or your verified domain
    const fromEmail = process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev';

    // Modify subject in test mode to show original recipient
    const subject = emailMode === 'testing'
      ? `[TEST: ${companionEmail}] New Booking Request - ${bookingDetails.clientName}`
      : `New Booking Request from ${bookingDetails.clientName}`;

    const { data, error } = await resend.emails.send({
      from: `Meytle <${fromEmail}>`,
      to: [recipientEmail],
      subject: subject,
      html: getBookingNotificationTemplate(bookingDetails),
    });

    if (error) {
      logger.apiError('emailService', 'sendBookingNotificationEmail', error, { companionEmail });
      return { success: false, error };
    }

    logger.apiInfo('emailService', 'sendBookingNotificationEmail', 'Booking notification email sent successfully', {
      recipientEmail,
      originalRecipient: companionEmail,
      emailNote
    });

    return { success: true, data, sentTo: recipientEmail, originalRecipient: companionEmail };
  } catch (error) {
    logger.apiError('emailService', 'sendBookingNotificationEmail', error, { companionEmail });
    return { success: false, error: error.message };
  }
};

module.exports = {
  sendWelcomeEmail,
  sendVerificationEmail,
  sendWelcomeVerificationEmail, // New combined email
  sendBookingNotificationEmail, // New booking notification email
  generateVerificationToken,
};
