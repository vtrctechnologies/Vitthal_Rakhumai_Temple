# 📧 Email/SMTP Setup Guide for VR Temple

This guide will help you configure SMTP email settings to receive OTP emails for password reset.

## 🎯 Quick Setup (Gmail - Recommended)

### Step 1: Enable 2-Step Verification
1. Go to [Google Account Security](https://myaccount.google.com/security)
2. Click on **"2-Step Verification"**
3. Follow the prompts to enable it (if not already enabled)

### Step 2: Generate App Password
1. Still in Security settings, scroll down to **"App passwords"**
2. Click on **"App passwords"**
3. You may need to sign in again
4. Select:
   - **App**: Mail
   - **Device**: Other (Custom name)
   - **Name**: VR Temple
5. Click **"Generate"**
6. **Copy the 16-character password** (it will look like: `abcd efgh ijkl mnop`)
7. **Remove spaces** when using it: `abcdefghijklmnop`

### Step 3: Configure .env File
1. Open `backend/.env` file (create it if it doesn't exist)
2. Add these lines:

```env
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=abcdefghijklmnop
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_FROM_NAME=VR Temple
```

**Replace:**
- `your-email@gmail.com` with your actual Gmail address
- `abcdefghijklmnop` with the 16-character App Password (no spaces)

### Step 4: Restart Server
```bash
cd backend
npm run dev
```

## 🔍 Verify Configuration

### Check if Email is Configured
When you request a password reset, check the server console. You should see:

✅ **If configured correctly:**
```
✅ Email server connection verified
📤 Sending email...
✅ OTP email sent successfully!
```

❌ **If NOT configured:**
```
📧 EMAIL NOT CONFIGURED - OTP LOGGED TO CONSOLE
```

### Test Email Configuration
1. Request a password reset with your username
2. Check the server console logs
3. Look for the email address where OTP is being sent
4. Check your email inbox (and spam folder)

## 🛠️ Alternative Email Providers

### Outlook/Hotmail
```env
EMAIL_USER=your-email@outlook.com
EMAIL_PASS=your-password
EMAIL_HOST=smtp-mail.outlook.com
EMAIL_PORT=587
EMAIL_SECURE=false
```

### Yahoo Mail
```env
EMAIL_USER=your-email@yahoo.com
EMAIL_PASS=your-app-password
EMAIL_HOST=smtp.mail.yahoo.com
EMAIL_PORT=587
EMAIL_SECURE=false
```

### Custom SMTP Server
```env
EMAIL_USER=your-email@example.com
EMAIL_PASS=your-smtp-password
EMAIL_HOST=smtp.example.com
EMAIL_PORT=587
EMAIL_SECURE=false
```

## ❌ Common Issues & Solutions

### Issue 1: "Authentication failed"
**Solution:**
- Make sure you're using **App Password** (not regular password) for Gmail
- Verify 2-Step Verification is enabled
- Check that EMAIL_USER matches your Gmail address exactly

### Issue 2: "Connection timeout"
**Solution:**
- Check EMAIL_HOST is correct
- Verify EMAIL_PORT (587 for Gmail)
- Check your firewall/antivirus isn't blocking the connection

### Issue 3: "Email not received"
**Solution:**
- Check **spam/junk folder**
- Verify the email address in database matches your email
- Check server console for error messages
- Use the debug endpoint: `GET /api/auth/check-email/:username`

### Issue 4: "Less secure app access"
**Solution:**
- Gmail no longer supports "Less secure apps"
- **You MUST use App Password** (see Step 2 above)

## 🧪 Testing Your Setup

### Method 1: Request Password Reset
1. Go to admin login page
2. Click "Forgot Password"
3. Enter your username
4. Check server console for logs
5. Check your email inbox

### Method 2: Check Admin Email
```bash
# Replace 'your-username' with your actual username
GET http://localhost:5000/api/auth/check-email/your-username
```

This will show you the email address where OTP will be sent.

## 📝 Environment Variables Reference

| Variable | Description | Example | Required |
|----------|-------------|---------|----------|
| `EMAIL_USER` | Your email address | `admin@gmail.com` | ✅ Yes |
| `EMAIL_PASS` | App Password (Gmail) or SMTP password | `abcdefghijklmnop` | ✅ Yes |
| `EMAIL_HOST` | SMTP server hostname | `smtp.gmail.com` | ❌ No (defaults to Gmail) |
| `EMAIL_PORT` | SMTP server port | `587` | ❌ No (defaults to 587) |
| `EMAIL_SECURE` | Use SSL/TLS | `false` | ❌ No (defaults to false) |
| `EMAIL_FROM_NAME` | Sender display name | `VR Temple` | ❌ No |

## 🔐 Security Notes

1. **Never commit `.env` file to Git** (it's already in .gitignore)
2. **Use App Passwords** instead of regular passwords
3. **Keep your App Password secret**
4. **Rotate App Passwords** periodically
5. **Use different passwords** for development and production

## 📞 Still Having Issues?

1. Check server console logs for detailed error messages
2. Verify all environment variables are set correctly
3. Make sure you restarted the server after changing .env
4. Test with a different email provider
5. Check your email provider's documentation for SMTP settings

---

**Need Help?** Check the server console logs - they contain detailed information about what's happening with email sending.
