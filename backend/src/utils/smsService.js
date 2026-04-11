import twilio from "twilio";

// Initialize Twilio client
const getTwilioClient = () => {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;

  if (!accountSid || !authToken) {
    return null;
  }

  return twilio(accountSid, authToken);
};

// Send OTP via SMS using Twilio
export const sendOtpSMS = async (phoneNumber, otp, adminName = "Admin") => {
  const client = getTwilioClient();
  const fromNumber = process.env.TWILIO_PHONE_NUMBER;

  // Check if Twilio is configured
  if (!client || !fromNumber) {
    console.log("\n" + "=".repeat(70));
    console.log("📱 TWILIO NOT CONFIGURED - OTP LOGGED TO CONSOLE");
    console.log("=".repeat(70));
    console.log(`To: ${phoneNumber}`);
    console.log(`Message: Your VR Temple password reset OTP is: ${otp}`);
    console.log(`This OTP expires in 10 minutes.`);
    console.log("=".repeat(70));
    console.log(`\n⚠️  To enable SMS sending, add to your backend/.env file:`);
    console.log(`TWILIO_ACCOUNT_SID=your-account-sid`);
    console.log(`TWILIO_AUTH_TOKEN=your-auth-token`);
    console.log(`TWILIO_PHONE_NUMBER=+1234567890`);
    console.log("\n📝 How to get Twilio credentials:");
    console.log("1. Sign up at https://www.twilio.com");
    console.log("2. Get your Account SID and Auth Token from dashboard");
    console.log("3. Get a phone number from Twilio (free trial available)");
    console.log("=".repeat(70) + "\n");
    
    // Return success so the flow continues
    return { sid: "console-log", status: "sent" };
  }

  // Format phone number (ensure it starts with +)
  let formattedPhone = phoneNumber.trim();
  if (!formattedPhone.startsWith("+")) {
    formattedPhone = `+${formattedPhone}`;
  }

  const message = `Your VR Temple password reset OTP is: ${otp}. This code expires in 10 minutes. Do not share this code with anyone.`;

  try {
    console.log("\n" + "=".repeat(70));
    console.log("📱 ATTEMPTING TO SEND SMS OTP");
    console.log("=".repeat(70));
    console.log(`From: ${fromNumber}`);
    console.log(`To: ${formattedPhone}`);
    console.log(`OTP: ${otp}`);

    const messageResponse = await client.messages.create({
      body: message,
      from: fromNumber,
      to: formattedPhone,
    });

    console.log(`\n✅ SMS OTP sent successfully!`);
    console.log(`📱 Message SID: ${messageResponse.sid}`);
    console.log(`📬 Status: ${messageResponse.status}`);
    console.log("=".repeat(70) + "\n");

    return messageResponse;
  } catch (error) {
    console.error("\n❌ SMS send error occurred!");
    console.error(`Error: ${error.message}`);
    if (error.code) console.error(`Error Code: ${error.code}`);
    if (error.moreInfo) console.error(`More Info: ${error.moreInfo}`);
    
    console.log("\n" + "=".repeat(70));
    console.log("📱 SMS SENDING FAILED - OTP LOGGED TO CONSOLE");
    console.log("=".repeat(70));
    console.log(`OTP for ${formattedPhone}: ${otp}`);
    console.log("\n💡 Troubleshooting:");
    console.log("  1. Verify TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN are correct");
    console.log("  2. Check TWILIO_PHONE_NUMBER is in E.164 format (+1234567890)");
    console.log("  3. Verify phone number is valid and can receive SMS");
    console.log("  4. Check Twilio account balance (if not on free trial)");
    console.log("=".repeat(70) + "\n");
    
    // Return success so the flow continues even if SMS fails
    return { sid: "console-log", status: "failed" };
  }
};

export const isSmsConfigured = () => {
  return !!(
    process.env.TWILIO_ACCOUNT_SID &&
    process.env.TWILIO_AUTH_TOKEN &&
    process.env.TWILIO_PHONE_NUMBER
  );
};
