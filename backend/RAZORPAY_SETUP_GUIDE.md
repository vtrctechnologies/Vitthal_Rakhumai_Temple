# 💳 Razorpay Payment Setup Guide for VR Temple

This guide will help you configure Razorpay payment gateway for accepting donations.

## 🎯 Quick Setup

### Step 1: Create Razorpay Account
1. Go to [Razorpay.com](https://razorpay.com)
2. Click **"Sign Up"** (Free account available)
3. Complete the registration process
4. Verify your email and phone number

### Step 2: Get Your API Keys
1. After signing up, go to your [Razorpay Dashboard](https://dashboard.razorpay.com)
2. Navigate to **Settings** → **API Keys**
3. You'll see your **Key ID** and **Key Secret**
4. **Important:** Copy both values (keep them secure!)

### Step 3: Activate Your Account
1. Complete KYC (Know Your Customer) verification
2. Add your bank account details
3. Wait for account activation (usually 24-48 hours)

### Step 4: Configure .env File
1. Open `backend/.env` file
2. Add these lines:

```env
RAZORPAY_KEY_ID=your-key-id-here
RAZORPAY_KEY_SECRET=your-key-secret-here
```

**Replace:**
- `your-key-id-here` with your Key ID (starts with `rzp_`)
- `your-key-secret-here` with your Key Secret

### Step 5: Test Mode vs Live Mode
- **Test Mode:** Use test keys (start with `rzp_test_`)
- **Live Mode:** Use live keys (start with `rzp_live_`)

For development, use test mode. For production, switch to live mode.

### Step 6: Restart Server
```bash
cd backend
npm run dev
```

## 📋 Environment Variables

| Variable | Description | Example | Required |
|----------|-------------|---------|----------|
| `RAZORPAY_KEY_ID` | Your Razorpay Key ID | `rzp_test_xxxxxxxxxxxx` | ✅ Yes |
| `RAZORPAY_KEY_SECRET` | Your Razorpay Key Secret | `xxxxxxxxxxxxxxxxxxxx` | ✅ Yes |

## 🔍 Verify Configuration

### Check if Razorpay is Configured
When a user submits a donation form, check the server console. You should see:

✅ **If configured correctly:**
```
Payment order created successfully
```

❌ **If NOT configured:**
```
Failed to create payment order
```

## 💳 Payment Flow

1. **User fills donation form** → Enters name, email, phone, amount
2. **Clicks "Proceed to Payment"** → Creates Razorpay order
3. **Razorpay checkout opens** → User selects payment method (UPI, Card, Net Banking, etc.)
4. **User completes payment** → Payment processed
5. **Payment verified** → Donation marked as successful
6. **User added to leaderboard** → Sorted by donation amount

## 🧪 Testing Your Setup

### Test Mode
1. Use test keys from Razorpay dashboard
2. Use test card numbers:
   - **Card Number:** `4111 1111 1111 1111`
   - **CVV:** Any 3 digits
   - **Expiry:** Any future date
   - **Name:** Any name

### Test UPI IDs
- `success@razorpay`
- `failure@razorpay`

## ❌ Common Issues & Solutions

### Issue 1: "Invalid Key ID"
**Solution:**
- Verify RAZORPAY_KEY_ID is correct
- Check for extra spaces in .env file
- Ensure you're using the correct key (test vs live)

### Issue 2: "Payment verification failed"
**Solution:**
- Verify RAZORPAY_KEY_SECRET is correct
- Check that payment was actually successful
- Ensure signature verification is working

### Issue 3: "Order creation failed"
**Solution:**
- Check Razorpay account is activated
- Verify KYC is completed
- Check account has sufficient balance/limits

### Issue 4: "Payment not reflecting in leaderboard"
**Solution:**
- Check payment verification endpoint is called
- Verify donation status is updated to "success"
- Check leaderboard query filters by paymentStatus: "success"

## 🔐 Security Notes

1. **Never commit `.env` file to Git** (it's already in .gitignore)
2. **Keep your Key Secret secure**
3. **Use different keys** for development and production
4. **Enable webhook verification** for production (optional but recommended)
5. **Monitor transactions** in Razorpay dashboard

## 📊 Features Implemented

✅ **Payment Methods Supported:**
- UPI (Google Pay, PhonePe, Paytm, etc.)
- Credit/Debit Cards
- Net Banking
- Wallets
- Other payment methods

✅ **Leaderboard Features:**
- Sorted by donation amount (highest first)
- Shows donor name and amount
- Search functionality
- Anonymous donation option
- Real-time updates after payment

✅ **Payment Verification:**
- Automatic signature verification
- Secure payment processing
- Status tracking (pending → success/failed)

## 💰 Razorpay Pricing

- **Setup Fee:** ₹0
- **Transaction Fee:** 2% per transaction
- **No Monthly Charges**
- **Settlement:** Next day (T+1)

## 📞 Still Having Issues?

1. Check server console logs for detailed error messages
2. Verify all environment variables are set correctly
3. Make sure you restarted the server after changing .env
4. Check Razorpay Dashboard for transaction logs
5. Verify your Razorpay account is fully activated

## 🚀 Production Checklist

- [ ] Switch to live mode keys
- [ ] Complete KYC verification
- [ ] Add bank account for settlements
- [ ] Test with real payment (small amount)
- [ ] Set up webhook for payment notifications (optional)
- [ ] Monitor first few transactions
- [ ] Set up email notifications in Razorpay dashboard

---

**Need Help?** Check the server console logs - they contain detailed information about payment processing.
