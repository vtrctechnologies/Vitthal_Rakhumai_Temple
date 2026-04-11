/**
 * Email Configuration Test Script
 * 
 * This script tests your SMTP email configuration
 * Run: node src/scripts/testEmail.js
 */

import dotenv from "dotenv";
import nodemailer from "nodemailer";

// Load environment variables
dotenv.config();

console.log("\n" + "=".repeat(70));
console.log("📧 EMAIL CONFIGURATION TEST");
console.log("=".repeat(70));

// Check environment variables
const emailConfig = {
  host: process.env.EMAIL_HOST || process.env.SMTP_HOST || "smtp.gmail.com",
  port: parseInt(process.env.EMAIL_PORT || process.env.SMTP_PORT || "587", 10),
  secure: process.env.EMAIL_SECURE === "true" || false,
  auth: {
    user: process.env.EMAIL_USER || process.env.SMTP_USER || process.env.EMAIL,
    pass: process.env.EMAIL_PASS || process.env.SMTP_PASS || process.env.EMAIL_PASSWORD,
  },
};

console.log("\n📋 Configuration Check:");
console.log(`  EMAIL_USER: ${emailConfig.auth.user ? '✅ ' + emailConfig.auth.user : '❌ Not set'}`);
console.log(`  EMAIL_PASS: ${emailConfig.auth.pass ? '✅ Set (' + emailConfig.auth.pass.length + ' chars)' : '❌ Not set'}`);
console.log(`  EMAIL_HOST: ${emailConfig.host}`);
console.log(`  EMAIL_PORT: ${emailConfig.port}`);
console.log(`  EMAIL_SECURE: ${emailConfig.secure}`);

if (!emailConfig.auth.user || !emailConfig.auth.pass) {
  console.log("\n❌ ERROR: Email credentials are not configured!");
  console.log("\n📝 Please add these to your backend/.env file:");
  console.log("   EMAIL_USER=your-email@gmail.com");
  console.log("   EMAIL_PASS=your-app-password");
  console.log("\n💡 See EMAIL_SETUP_GUIDE.md for detailed instructions.");
  process.exit(1);
}

// Create transporter
const transporter = nodemailer.createTransport(emailConfig);

// Test connection
console.log("\n🔍 Testing SMTP connection...");
transporter.verify((error, success) => {
  if (error) {
    console.log("\n❌ CONNECTION FAILED!");
    console.log(`Error: ${error.message}`);
    console.log(`Code: ${error.code || 'N/A'}`);
    
    if (error.code === 'EAUTH') {
      console.log("\n💡 Authentication failed. Common causes:");
      console.log("   1. Wrong email or password");
      console.log("   2. For Gmail: Not using App Password");
      console.log("   3. 2-Step Verification not enabled");
    } else if (error.code === 'ECONNECTION' || error.code === 'ETIMEDOUT') {
      console.log("\n💡 Connection failed. Common causes:");
      console.log("   1. Wrong EMAIL_HOST");
      console.log("   2. Wrong EMAIL_PORT");
      console.log("   3. Firewall blocking connection");
    }
    
    process.exit(1);
  } else {
    console.log("✅ Connection successful!");
    
    // Test sending email
    const testEmail = process.argv[2] || emailConfig.auth.user;
    console.log(`\n📤 Sending test email to: ${testEmail}`);
    
    const mailOptions = {
      from: `"VR Temple Test" <${emailConfig.auth.user}>`,
      to: testEmail,
      subject: "Test Email - VR Temple SMTP Configuration",
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
          <h2 style="color: #dc2626;">✅ Email Configuration Successful!</h2>
          <p>If you received this email, your SMTP configuration is working correctly.</p>
          <p><strong>Configuration Details:</strong></p>
          <ul>
            <li>Host: ${emailConfig.host}</li>
            <li>Port: ${emailConfig.port}</li>
            <li>User: ${emailConfig.auth.user}</li>
          </ul>
          <p style="color: #666; font-size: 12px; margin-top: 30px;">
            This is a test email from VR Temple backend.
          </p>
        </div>
      `,
    };
    
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.log("\n❌ EMAIL SEND FAILED!");
        console.log(`Error: ${error.message}`);
        process.exit(1);
      } else {
        console.log("\n✅ TEST EMAIL SENT SUCCESSFULLY!");
        console.log(`📧 Message ID: ${info.messageId}`);
        console.log(`📬 Response: ${info.response}`);
        console.log(`\n💡 Check your inbox (and spam folder) at: ${testEmail}`);
        console.log("=".repeat(70) + "\n");
        process.exit(0);
      }
    });
  }
});
