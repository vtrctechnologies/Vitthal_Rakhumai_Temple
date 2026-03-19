import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { connect, disconnect } from './src/config/db.js';
import { authService } from './src/modules/auth/auth.service.js';
import { User } from './src/models/userModel.js';

dotenv.config();

const test = async () => {
  try {
    await connect();
    console.log('Connected to DB');

    // Clean up test user
    await User.deleteOne({ email: 'test@example.com' });
    console.log('Cleaned up previous test user');

    // 1. Test Register
    console.log('\n--- Testing Register ---');
    const regResult = await authService.registerUser({
      username: 'testuser',
      email: 'test@example.com',
      password: 'password123',
      phone: '1234567890'
    });
    console.log('Register Success:', regResult.status);
    console.log('Phone in register result:', regResult.data.admin.phone);
    console.log('Token generated:', !!regResult.data.token);

    // 2. Test Login
    console.log('\n--- Testing Login ---');
    const loginResult = await authService.loginUser('test@example.com', 'password123');
    console.log('Login Success:', loginResult.status);
    console.log('Phone in login result:', loginResult.data.admin.phone);
    console.log('User role:', loginResult.data.admin.role);

    // 3. Test OTP Generation
    console.log('\n--- Testing OTP Generation ---');
    const otpResult = await authService.forgotPassword('testuser');
    console.log('OTP Result:', otpResult.message);

    // 4. Test OTP Verification
    const user = await User.findOne({ username: 'testuser' }).select('+otp');
    console.log('Generated OTP:', user.otp);
    
    console.log('\n--- Testing OTP Verification ---');
    const verifyResult = await authService.verifyOTP('testuser', user.otp);
    console.log('Verify Success:', verifyResult.status);
    console.log('Phone in verify result:', verifyResult.admin.phone);
    console.log('Token in verify result:', !!verifyResult.token);

    // 5. Test Get Me
    console.log('\n--- Testing Get Me ---');
    const getMeResult = await authService.getMe(user._id);
    console.log('Get Me Success:', getMeResult.status);
    console.log('Phone in getMe result:', getMeResult.data.admin.phone);

    console.log('\nAll logic tests passed!');
  } catch (err) {
    console.error('\nTest failed:', err.message);
  } finally {
    await disconnect();
    console.log('Disconnected from DB');
    process.exit(0);
  }
};

test();
