/**
 * Email Test Script
 * Test the Resend email integration
 */

require('dotenv').config();
const { sendWelcomeEmail, sendVerificationEmail, generateVerificationToken } = require('./services/emailService');

const testEmail = async () => {
  console.log('🧪 Testing Resend Email Integration...\n');
  
  try {
    // Test welcome email
    console.log('📧 Sending welcome email...');
    const welcomeResult = await sendWelcomeEmail(
      'test@example.com', // Replace with your email for testing
      'Test User',
      'client'
    );
    
    if (welcomeResult.success) {
      console.log('✅ Welcome email sent successfully!');
    } else {
      console.log('❌ Welcome email failed:', welcomeResult.error);
    }
    
    // Test verification email
    console.log('\n📧 Sending verification email...');
    const token = generateVerificationToken();
    const verificationResult = await sendVerificationEmail(
      'test@example.com', // Replace with your email for testing
      'Test User',
      token
    );
    
    if (verificationResult.success) {
      console.log('✅ Verification email sent successfully!');
      console.log('🔗 Verification link:', verificationResult.verificationLink);
    } else {
      console.log('❌ Verification email failed:', verificationResult.error);
    }
    
    console.log('\n🎉 Email test completed!');
    
  } catch (error) {
    console.error('❌ Email test failed:', error);
  }
};

// Run the test
testEmail();
