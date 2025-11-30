// Test script for authentication API endpoints
const API_BASE_URL = 'http://localhost:3001';

async function testAuthAPI() {
  console.log('🧪 Testing Authentication API Endpoints...\n');

  try {
    // Generate unique email for this test run
    const timestamp = Date.now();
    const jobSeekerEmail = `test-jobseeker-${timestamp}@example.com`;

    // Test 1: Register a new job seeker
    console.log('1️⃣ Testing Job Seeker Registration...');
    const registerResponse = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: jobSeekerEmail,
        password: 'password123',
        role: 'job_seeker'
      }),
    });

    const registerData = await registerResponse.json();

    if (!registerResponse.ok) {
      console.log('❌ Registration failed:', registerData.message);
      return;
    }

    console.log('✅ Job Seeker Registration successful');
    console.log('   Access Token:', registerData.access_token ? 'Present' : 'Missing');
    console.log('   User ID:', registerData.user?.id);
    console.log('   User Roles:', registerData.user?.roles);
    console.log('');

    // Test 2: Login with the registered user
    console.log('2️⃣ Testing Login...');
    const loginResponse = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: jobSeekerEmail,
        password: 'password123',
      }),
    });

    const loginData = await loginResponse.json();

    if (!loginResponse.ok) {
      console.log('❌ Login failed:', loginData.message);
      return;
    }

    console.log('✅ Login successful');
    console.log('   Access Token:', loginData.access_token ? 'Present' : 'Missing');
    console.log('   Refresh Token:', loginData.refresh_token ? 'Present' : 'Missing');
    console.log('   User Roles:', loginData.user?.roles);
    console.log('');

    // Test 3: Test /me endpoint with token
    console.log('3️⃣ Testing /me endpoint...');
    const meResponse = await fetch(`${API_BASE_URL}/auth/me`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${loginData.access_token}`
      },
    });

    const meData = await meResponse.json();

    if (!meResponse.ok) {
      console.log('❌ /me endpoint failed:', meData.message);
      return;
    }

    console.log('✅ /me endpoint successful');
    console.log('   User ID:', meData.id);
    console.log('   User Email:', meData.email);
    console.log('   User Roles:', meData.roles);
    console.log('');

    // Test 4: Register an employer
    console.log('4️⃣ Testing Employer Registration...');
    const employerRegisterResponse = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: `test-employer-${timestamp}@example.com`,
        password: 'password123',
        role: 'employer'
      }),
    });

    const employerRegisterData = await employerRegisterResponse.json();

    if (!employerRegisterResponse.ok) {
      console.log('❌ Employer Registration failed:', employerRegisterData.message);
      return;
    }

    console.log('✅ Employer Registration successful');
    console.log('   User Roles:', employerRegisterData.user?.roles);
    console.log('   Expected: ["employer"]');
    console.log('');

    // Test 5: Register an HR
    console.log('5️⃣ Testing HR Registration...');
    const hrRegisterResponse = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: `test-hr-${timestamp}@example.com`,
        password: 'password123',
        role: 'hr'
      }),
    });

    const hrRegisterData = await hrRegisterResponse.json();

    if (!hrRegisterResponse.ok) {
      console.log('❌ HR Registration failed:', hrRegisterData.message);
      return;
    }

    console.log('✅ HR Registration successful');
    console.log('   User Roles:', hrRegisterData.user?.roles);
    console.log('   Expected: ["hr"]');
    console.log('');

    console.log('🎉 All authentication API tests passed!');

  } catch (error) {
    console.error('❌ Test failed with error:', error.message);
  }
}

// Run the test
testAuthAPI();
