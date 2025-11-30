// Test script để kiểm tra authentication fix
const axios = require('axios');

const BASE_URL = 'http://localhost:3001';

async function testAuthFix() {
  try {
    console.log('🔍 Testing Authentication Fix...');

    // Test Register
    const registerData = {
      email: `test${Date.now()}@example.com`,
      password: 'password123',
      role: 'job_seeker'
    };

    console.log('📝 Testing Register...');
    const registerResponse = await axios.post(`${BASE_URL}/auth/register`, registerData);
    console.log('✅ Register successful:', registerResponse.status);
    console.log('📋 Response data keys:', Object.keys(registerResponse.data));

    // Test Login
    const loginData = {
      email: registerData.email,
      password: registerData.password
    };

    console.log('🔐 Testing Login...');
    const loginResponse = await axios.post(`${BASE_URL}/auth/login`, loginData);
    console.log('✅ Login successful:', loginResponse.status);
    console.log('📋 Response data keys:', Object.keys(loginResponse.data));

    // Check token format
    if (loginResponse.data.access_token) {
      console.log('✅ Token format: snake_case (access_token)');
      console.log('🔑 Token received successfully!');
    } else if (loginResponse.data.accessToken) {
      console.log('❌ Token format: camelCase (accessToken) - still wrong');
    } else {
      console.log('❌ No token found in response');
    }

  } catch (error) {
    console.log('❌ Error:', error.message);
    if (error.response) {
      console.log('Status:', error.response.status);
      console.log('Data:', error.response.data);
    }
  }
}

testAuthFix();
