// Test email configuration script
// Run this to verify your SMTP settings work

import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const testEmail = async () => {
  console.log('=== Email Configuration Test ===\n');
  
  console.log('SMTP Configuration:');
  console.log('Host:', process.env.SMTP_HOST || 'NOT SET');
  console.log('Port:', process.env.SMTP_PORT || 'NOT SET');
  console.log('User:', process.env.SMTP_USER ? `${process.env.SMTP_USER.substring(0, 5)}...` : 'NOT SET');
  console.log('Pass:', process.env.SMTP_PASS ? 'SET (hidden)' : 'NOT SET');
  console.log('From:', process.env.SMTP_FROM || 'NOT SET');
  console.log('');

  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.error('❌ ERROR: SMTP credentials not set!');
    console.error('\nPlease set the following in .env.local:');
    console.error('SMTP_HOST=smtp.gmail.com');
    console.error('SMTP_PORT=587');
    console.error('SMTP_USER=your-email@gmail.com');
    console.error('SMTP_PASS=your-app-password');
    console.error('\nFor Gmail: Enable 2FA and generate an App Password');
    console.error('Visit: https://myaccount.google.com/apppasswords\n');
    process.exit(1);
  }

  console.log('Creating transporter...');
  const transporter = nodemailer.createTransporter({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: Number(process.env.SMTP_PORT) || 587,
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
    tls: {
      rejectUnauthorized: false,
    },
  });

  console.log('Verifying SMTP connection...');
  try {
    await transporter.verify();
    console.log('✓ SMTP connection successful!\n');
  } catch (error) {
    console.error('❌ SMTP connection failed:', error.message);
    console.error('\nPossible issues:');
    console.error('1. Wrong SMTP credentials');
    console.error('2. Gmail: Need to enable 2FA and use App Password');
    console.error('3. SMTP_HOST or SMTP_PORT incorrect');
    console.error('4. Firewall blocking port 587\n');
    process.exit(1);
  }

  console.log('Sending test email...');
  try {
    const info = await transporter.sendMail({
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to: process.env.SMTP_USER, // Send to yourself
      subject: 'VMS Email Test',
      html: `
        <h2>Email Configuration Test</h2>
        <p>If you're reading this, your SMTP configuration is working correctly!</p>
        <p><strong>Test Time:</strong> ${new Date().toLocaleString()}</p>
        <hr>
        <p style="color: green;"><strong>✓ Your VMS can now send emails!</strong></p>
      `,
    });

    console.log('✓ Test email sent successfully!');
    console.log('Message ID:', info.messageId);
    console.log('\nCheck your inbox:', process.env.SMTP_USER);
    console.log('(Check spam folder if you don\'t see it)\n');
    console.log('=== Email test complete! ===\n');
  } catch (error) {
    console.error('❌ Failed to send email:', error.message);
    console.error('\nThe SMTP connection worked, but sending failed.');
    console.error('This might be a temporary issue. Try again.\n');
    process.exit(1);
  }
};

testEmail();
