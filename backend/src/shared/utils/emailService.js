import nodemailer from "nodemailer";

// Create a ready-made email template for OTP
const getOtpEmailTemplate = (otp, adminName) => {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Password Reset OTP</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f5f5f5;">
    <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #f5f5f5;">
        <tr>
            <td align="center" style="padding: 40px 20px;">
                <table role="presentation" style="max-width: 600px; width: 100%; border-collapse: collapse; background-color: #ffffff; border-radius: 10px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
                    <!-- Header -->
                    <tr>
                        <td style="background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%); padding: 40px 30px; text-align: center; border-radius: 10px 10px 0 0;">
                            <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: bold;">VR Temple</h1>
                            <p style="margin: 10px 0 0 0; color: #fecaca; font-size: 16px;">Password Reset Request</p>
                        </td>
                    </tr>
                    
                    <!-- Content -->
                    <tr>
                        <td style="padding: 40px 30px;">
                            <p style="margin: 0 0 20px 0; color: #333333; font-size: 16px; line-height: 1.6;">
                                Hello <strong>${adminName}</strong>,
                            </p>
                            
                            <p style="margin: 0 0 30px 0; color: #555555; font-size: 16px; line-height: 1.6;">
                                You have requested to reset your password for your VR Temple admin account. Please use the One-Time Password (OTP) below to verify your identity and proceed with the password reset.
                            </p>
                            
                            <!-- OTP Box -->
                            <table role="presentation" style="width: 100%; margin: 30px 0;">
                                <tr>
                                    <td align="center" style="padding: 0;">
                                        <div style="background: linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%); border: 3px solid #dc2626; border-radius: 12px; padding: 30px 20px; display: inline-block;">
                                            <p style="margin: 0 0 10px 0; color: #991b1b; font-size: 14px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px;">Your OTP Code</p>
                                            <p style="margin: 0; color: #dc2626; font-size: 42px; font-weight: bold; letter-spacing: 10px; font-family: 'Courier New', monospace;">${otp}</p>
                                        </div>
                                    </td>
                                </tr>
                            </table>
                            
                            <p style="margin: 30px 0 20px 0; color: #666666; font-size: 14px; line-height: 1.6;">
                                <strong style="color: #dc2626;">⚠️ Important:</strong>
                            </p>
                            
                            <ul style="margin: 0 0 30px 0; padding-left: 20px; color: #666666; font-size: 14px; line-height: 1.8;">
                                <li>This OTP is valid for <strong style="color: #dc2626;">10 minutes</strong> only</li>
                                <li>Do not share this OTP with anyone</li>
                                <li>If you didn't request this password reset, please ignore this email</li>
                            </ul>
                            
                            <div style="background-color: #fef2f2; border-left: 4px solid #dc2626; padding: 15px; margin: 30px 0; border-radius: 4px;">
                                <p style="margin: 0; color: #991b1b; font-size: 13px; line-height: 1.6;">
                                    <strong>Security Tip:</strong> For your account's security, never share your OTP or password with anyone. VR Temple staff will never ask for your OTP or password.
                                </p>
                            </div>
                        </td>
                    </tr>
                    
                    <!-- Footer -->
                    <tr>
                        <td style="background-color: #f9fafb; padding: 30px; text-align: center; border-radius: 0 0 10px 10px; border-top: 1px solid #e5e7eb;">
                            <p style="margin: 0 0 10px 0; color: #6b7280; font-size: 12px;">
                                This is an automated email. Please do not reply to this message.
                            </p>
                            <p style="margin: 0; color: #9ca3af; font-size: 11px;">
                                © ${new Date().getFullYear()} VR Temple. All rights reserved.
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
  `;
};

// Create nodemailer transporter
const createTransporter = () => {
  // Get email configuration from environment variables
  const emailConfig = {
    host: process.env.EMAIL_HOST || process.env.SMTP_HOST || "smtp.gmail.com",
    port: parseInt(process.env.EMAIL_PORT || process.env.SMTP_PORT || "587", 10),
    secure: process.env.EMAIL_SECURE === "true" || false, // true for 465, false for other ports
    auth: {
      user: process.env.EMAIL_USER || process.env.SMTP_USER || process.env.EMAIL,
      pass: process.env.EMAIL_PASS || process.env.SMTP_PASS || process.env.EMAIL_PASSWORD,
    },
  };

  // Check if email credentials are provided
  if (!emailConfig.auth.user || !emailConfig.auth.pass) {
    return null;
  }

  return nodemailer.createTransport(emailConfig);
};

// Send OTP email to admin
export const sendOtpEmail = async (email, otp, adminName = "Admin") => {
  console.log("\n" + "=".repeat(70));
  console.log("📧 ATTEMPTING TO SEND OTP EMAIL");
  console.log("=".repeat(70));
  console.log(`Recipient: ${email}`);
  console.log(`Admin Name: ${adminName}`);
  console.log(`OTP: ${otp}`);
  
  const transporter = createTransporter();

  // Check environment variables
  const emailUser = process.env.EMAIL_USER || process.env.SMTP_USER || process.env.EMAIL;
  const emailPass = process.env.EMAIL_PASS || process.env.SMTP_PASS || process.env.EMAIL_PASSWORD;
  
  console.log(`Email Config Check:`);
  console.log(`  EMAIL_USER: ${emailUser ? '✅ Set' : '❌ Not set'}`);
  console.log(`  EMAIL_PASS: ${emailPass ? '✅ Set' : '❌ Not set'}`);
  console.log(`  EMAIL_HOST: ${process.env.EMAIL_HOST || process.env.SMTP_HOST || 'smtp.gmail.com (default)'}`);
  console.log(`  EMAIL_PORT: ${process.env.EMAIL_PORT || process.env.SMTP_PORT || '587 (default)'}`);

  // If email is not configured, log OTP to console
  if (!transporter) {
    console.log("\n" + "=".repeat(70));
    console.log("📧 EMAIL NOT CONFIGURED - OTP LOGGED TO CONSOLE");
    console.log("=".repeat(70));
    console.log(`To: ${email}`);
    console.log(`Subject: Password Reset OTP - VR Temple`);
    console.log(`Hello ${adminName},`);
    console.log(`Your OTP for password reset is: ${otp}`);
    console.log(`This OTP expires in 10 minutes.`);
    console.log("=".repeat(70));
    console.log(`\n⚠️  To enable email sending, add to your backend/.env file:`);
    console.log(`EMAIL_USER=your-email@gmail.com`);
    console.log(`EMAIL_PASS=your-app-password`);
    console.log(`EMAIL_HOST=smtp.gmail.com (optional, defaults to Gmail)`);
    console.log(`EMAIL_PORT=587 (optional, defaults to 587)`);
    console.log("\n💡 For Gmail, you need to use an App Password, not your regular password.");
    console.log("=".repeat(70) + "\n");
    
    // Return success so the flow continues
    return { messageId: "console-log", accepted: [email] };
  }

  // Get sender email
  const fromEmail = emailUser || "noreply@vrtemple.com";
  const fromName = process.env.EMAIL_FROM_NAME || "VR Temple";

  console.log(`From Email: ${fromEmail}`);
  console.log(`From Name: ${fromName}`);

  const mailOptions = {
    from: `"${fromName}" <${fromEmail}>`,
    to: email,
    subject: "Password Reset OTP - VR Temple",
    html: getOtpEmailTemplate(otp, adminName),
  };

  try {
    // Verify connection first
    console.log("\n🔍 Verifying email server connection...");
    await transporter.verify();
    console.log("✅ Email server connection verified successfully!");
  } catch (error) {
    console.error("\n❌ Email server connection failed!");
    console.error(`Error: ${error.message}`);
    if (error.code) console.error(`Error Code: ${error.code}`);
    if (error.response) console.error(`Response: ${JSON.stringify(error.response, null, 2)}`);
    
    console.log("\n" + "=".repeat(70));
    console.log("📧 EMAIL SENDING FAILED - OTP LOGGED TO CONSOLE");
    console.log("=".repeat(70));
    console.log(`OTP for ${email}: ${otp}`);
    console.log("\n💡 Common fixes:");
    console.log("  1. Check if EMAIL_USER and EMAIL_PASS are correct in .env");
    console.log("  2. For Gmail, use App Password (not regular password)");
    console.log("  3. Make sure 2-Step Verification is enabled on Gmail");
    console.log("  4. Check if 'Less secure app access' is enabled (if using Gmail)");
    console.log("  5. Verify EMAIL_HOST and EMAIL_PORT are correct");
    console.log("=".repeat(70) + "\n");
    
    return { messageId: "console-log", accepted: [email] };
  }

  try {
    console.log("\n📤 Sending email...");
    const info = await transporter.sendMail(mailOptions);
    console.log(`\n✅ OTP email sent successfully!`);
    console.log(`📧 Message ID: ${info.messageId}`);
    console.log(`📬 Sent to: ${email}`);
    console.log(`📨 Response: ${JSON.stringify(info.response, null, 2)}`);
    console.log("=".repeat(70) + "\n");
    return info;
  } catch (error) {
    console.error("\n❌ Email send error occurred!");
    console.error(`Error: ${error.message}`);
    if (error.code) console.error(`Error Code: ${error.code}`);
    if (error.response) {
      console.error(`Response Code: ${error.responseCode}`);
      console.error(`Response: ${error.response}`);
    }
    if (error.command) console.error(`Command: ${error.command}`);
    
    console.log("\n" + "=".repeat(70));
    console.log("📧 EMAIL SENDING FAILED - OTP LOGGED TO CONSOLE");
    console.log("=".repeat(70));
    console.log(`OTP for ${email}: ${otp}`);
    console.log("\n💡 Troubleshooting:");
    console.log("  1. Check spam/junk folder");
    console.log("  2. Verify recipient email address is correct");
    console.log("  3. Check email server logs");
    console.log("  4. Ensure sender email is verified");
    console.log("=".repeat(70) + "\n");
    
    // Return success so the flow continues even if email fails
    return { messageId: "console-log", accepted: [email] };
  }
};

export const isEmailConfigured = () => {
  return !!(process.env.EMAIL_USER || process.env.SMTP_USER || process.env.EMAIL) && 
         !!(process.env.EMAIL_PASS || process.env.SMTP_PASS || process.env.EMAIL_PASSWORD);
};
