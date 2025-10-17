/**
 * Email Service using Resend
 * Handles welcome emails and verification emails
 */

const { Resend } = require('resend');
const crypto = require('crypto');

// Initialize Resend with API key
const resend = new Resend(process.env.RESEND_API_KEY);

// Email templates
const getWelcomeEmailTemplate = (userName, userRole) => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Welcome to MeetGo</title>
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
          <div class="logo">MeetGo</div>
          <h1 class="welcome-title">Welcome to MeetGo! 🎉</h1>
        </div>
        
        <div class="content">
          <p>Hi <strong>${userName}</strong>,</p>
          
          <p>Welcome to MeetGo! We're thrilled to have you join our community of companions and clients.</p>
          
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
          <p>Best regards,<br>The MeetGo Team</p>
          <p>Need help? Contact us at support@hello.yuki.in</p>
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
      <title>Verify Your Email - MeetGo</title>
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
          <div class="logo">MeetGo</div>
          <h1 class="verify-title">Verify Your Email Address 🔐</h1>
        </div>
        
        <div class="content">
          <p>Hi <strong>${userName}</strong>,</p>
          
          <p>Thank you for signing up with MeetGo! To complete your registration and unlock all features, please verify your email address.</p>
          
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
          <p>Best regards,<br>The MeetGo Team</p>
          <p>Need help? Contact us at support@hello.yuki.in</p>
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

// Send welcome email
const sendWelcomeEmail = async (email, userName, userRole) => {
  try {
    const { data, error } = await resend.emails.send({
      from: 'MeetGo <welcome@hello.yuki.in>',
      to: [email],
      subject: `Welcome to MeetGo, ${userName}! 🎉`,
      html: getWelcomeEmailTemplate(userName, userRole),
    });

    if (error) {
      console.error('❌ Error sending welcome email:', error);
      return { success: false, error };
    }

    console.log('✅ Welcome email sent successfully:', data);
    return { success: true, data };
  } catch (error) {
    console.error('❌ Error in sendWelcomeEmail:', error);
    return { success: false, error: error.message };
  }
};

// Send verification email
const sendVerificationEmail = async (email, userName, verificationToken) => {
  try {
    const verificationLink = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/verify-email?token=${verificationToken}`;
    
    const { data, error } = await resend.emails.send({
      from: 'MeetGo <verify@hello.yuki.in>',
      to: [email],
      subject: 'Verify Your Email - MeetGo',
      html: getVerificationEmailTemplate(userName, verificationLink),
    });

    if (error) {
      console.error('❌ Error sending verification email:', error);
      return { success: false, error };
    }

    console.log('✅ Verification email sent successfully:', data);
    return { success: true, data, verificationLink };
  } catch (error) {
    console.error('❌ Error in sendVerificationEmail:', error);
    return { success: false, error: error.message };
  }
};

module.exports = {
  sendWelcomeEmail,
  sendVerificationEmail,
  generateVerificationToken,
};
