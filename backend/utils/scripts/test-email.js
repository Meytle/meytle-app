/**
 * Email Test Script
 * Test the Resend email integration
 */

require('dotenv').config();
const { sendWelcomeVerificationEmail, generateVerificationToken } = require('./services/emailService');

const testEmail = async () => {
  console.log('🧪 Testing Resend Email Integration...\n');

  // Accept email from command line argument or use default
  const testEmailAddress = process.argv[2] || 'sahilsingh@claritty.in';
  console.log(`📧 Testing with email: ${testEmailAddress}\n`);

  try {
    // Test COMBINED welcome + verification email
    console.log('📧 Sending combined Welcome + Verification email...');
    const token = generateVerificationToken();

    const emailResult = await sendWelcomeVerificationEmail(
      testEmailAddress,
      'Test User',
      'companion',  // Testing as companion
      token
    );

    if (emailResult.success) {
      console.log('✅ Combined email sent successfully!');
      console.log('📬 Email ID:', emailResult.data?.id);
      console.log('🔗 Verification link:', emailResult.verificationLink);
    } else {
      console.log('❌ Email failed:', emailResult.error);

      // Check if it's a testing mode restriction
      if (emailResult.error?.message && emailResult.error.message.includes('You can only send testing emails')) {
        console.log('\n⚠️  IMPORTANT: Your Resend account is in testing mode!');
        console.log('    You can only send emails to: sahilsingh@claritty.in');
        console.log('    To send to other emails, verify your domain at: https://resend.com/domains');
      }
    }

    console.log('\n🎉 Email test completed!');
    console.log('📮 Check your inbox at:', testEmailAddress);
    console.log('\n💡 TIP: You can test with a different email by running:');
    console.log('   node test-email.js your-email@example.com');

  } catch (error) {
    console.error('❌ Email test failed:', error);
  }
};

// Run the test
testEmail();