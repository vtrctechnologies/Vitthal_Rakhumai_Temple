# 📱 Twilio SMS Setup Guide for VR Temple

This guide will help you configure Twilio to send OTP via SMS for password reset.

## 🎯 Quick Setup

### Step 1: Create Twilio Account
1. Go to [Twilio.com](https://www.twilio.com)
2. Click **"Sign Up"** (Free trial available with $15.50 credit)
3. Verify your email and phone number

### Step 2: Get Your Credentials
1. After signing up, go to your [Twilio Console Dashboard](https://console.twilio.com)
2. You'll see your **Account SID** and **Auth Token** on the dashboard
3. Copy both values (keep them secure!)

### Step 3: Get a Phone Number
1. In Twilio Console, go to **Phone Numbers** → **Manage** → **Buy a number**
2. Select your country
3. Choose a number (you can filter by SMS capability)
4. Click **"Buy"** (Free trial numbers are available)

### Step 4: Configure .env File
1. Open `backend/.env` file
2. Add these lines:

```env
TWILIO_ACCOUNT_SID=your-account-sid-here
TWILIO_AUTH_TOKEN=your-auth-token-here
TWILIO_PHONE_NUMBER=+1234567890
```

**Replace:**
- `your-account-sid-here` with your Account SID (starts with `AC`)
- `your-auth-token-here` with your Auth Token
- `+1234567890` with your Twilio phone number (must include country code with +)

### Step 5: Restart Server
```bash
cd backend
npm run dev
```

## 📋 Environment Variables

| Variable | Description | Example | Required |
|----------|-------------|---------|----------|
| `TWILIO_ACCOUNT_SID` | Your Twilio Account SID | `ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx` | ✅ Yes |
| `TWILIO_AUTH_TOKEN` | Your Twilio Auth Token | `your_auth_token_here` | ✅ Yes |
| `TWILIO_PHONE_NUMBER` | Your Twilio phone number | `+1234567890` | ✅ Yes |

## 🔍 Verify Configuration

### Check if SMS is Configured
When you request a password reset, check the server console. You should see:

✅ **If configured correctly:**
```
✅ SMS OTP sent successfully!
📱 Message SID: SMxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

❌ **If NOT configured:**
```
📱 TWILIO NOT CONFIGURED - OTP LOGGED TO CONSOLE
```

## 📱 Phone Number Format

**Important:** Phone numbers must be in E.164 format:
- ✅ Correct: `+1234567890`, `+919876543210`
- ❌ Wrong: `1234567890`, `(123) 456-7890`, `123-456-7890`

The system will automatically add `+` if missing, but it's better to include it.

## 🧪 Testing Your Setup

### Method 1: Request Password Reset
1. Go to admin login page
2. Click "Forgot Password"
3. Enter your username
4. Check server console for logs
5. Check your phone for SMS

### Method 2: Check Admin Phone
```bash
# Replace 'your-username' with your actual username
GET http://localhost:5000/api/auth/check-email/your-username
```

This will show you the phone number where OTP will be sent.

## ❌ Common Issues & Solutions

### Issue 1: "Authentication failed"
**Solution:**
- Verify TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN are correct
- Make sure there are no extra spaces in .env file
- Check that credentials match your Twilio dashboard

### Issue 2: "Invalid phone number"
**Solution:**
- Ensure phone number is in E.164 format (+country code + number)
- Verify TWILIO_PHONE_NUMBER matches your Twilio number exactly
- Check that recipient phone number is valid

### Issue 3: "SMS not received"
**Solution:**
- Check server console for error messages
- Verify Twilio account has credits/balance
- Check if phone number can receive SMS
- Verify phone number format is correct

### Issue 4: "Free trial limitations"
**Solution:**
- Twilio free trial can only send SMS to verified numbers
- Go to Twilio Console → Phone Numbers → Verified Caller IDs
- Add and verify the phone number you want to receive OTPs

## 💰 Twilio Pricing

- **Free Trial:** $15.50 credit (enough for testing)
- **Pay-as-you-go:** ~$0.0075 per SMS in US
- **Monthly plans:** Available for higher volumes

## 🔐 Security Notes

1. **Never commit `.env` file to Git** (it's already in .gitignore)
2. **Keep your Auth Token secret**
3. **Rotate credentials** periodically
4. **Use different credentials** for development and production
5. **Monitor Twilio usage** in dashboard

## 📞 Still Having Issues?

1. Check server console logs for detailed error messages
2. Verify all environment variables are set correctly
3. Make sure you restarted the server after changing .env
4. Check Twilio Console for error logs
5. Verify your Twilio account is active

## 🆓 Free Trial Tips

- Free trial allows sending SMS to **verified numbers only**
- To verify a number: Twilio Console → Phone Numbers → Verified Caller IDs
- Free trial credit expires after 30 days or when credit runs out
- Upgrade to paid account for production use

---

**Need Help?** Check the server console logs - they contain detailed information about SMS sending.
