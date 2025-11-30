// Test script for job creation with proper authentication

async function testJobCreation() {
  console.log('🚀 Testing Job Creation with Authentication...\n');

  const API_BASE = 'http://localhost:3001';

  try {
    // Step 1: Login to get JWT token
    console.log('1️⃣ Đăng nhập để lấy JWT token...');
    const loginResponse = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'employer@test.com',
        password: 'password123'
      }),
    });

    if (!loginResponse.ok) {
      console.log('❌ Login failed!');
      console.log('Status:', loginResponse.status);
      const error = await loginResponse.text();
      console.log('Error:', error);
      return;
    }

    const loginData = await loginResponse.json();
    console.log('✅ Login successful!');
    console.log('User:', loginData.user.email);
    console.log('Token:', loginData.access_token.substring(0, 50) + '...');

    const token = loginData.access_token;

    // Step 2: Create a company
    console.log('\n2️⃣ Tạo company...');
    const companyResponse = await fetch(`${API_BASE}/companies`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        name: 'Test Company',
        description: 'A test company for job posting',
        website: 'https://testcompany.com',
        industry: 'technology',
        size: 'medium',
        city: 'Hà Nội',
        country: 'Việt Nam',
        logo: 'https://example.com/logo.png'
      }),
    });

    if (!companyResponse.ok) {
      console.log('❌ Company creation failed!');
      console.log('Status:', companyResponse.status);
      const error = await companyResponse.text();
      console.log('Error:', error);
      return;
    }

    const companyData = await companyResponse.json();
    console.log('✅ Company created successfully!');
    console.log('Company ID:', companyData.id);
    console.log('Company Name:', companyData.name);

    const companyId = companyData.id;

    // Step 3: Create a job
    console.log('\n3️⃣ Tạo job posting...');
    const jobData = {
      title: 'Senior Software Engineer',
      description: 'We are looking for a senior software engineer with experience in React and Next.js',
      requirements: '3+ years experience with React, TypeScript, and modern frontend tools',
      benefits: 'Competitive salary, health insurance, flexible working hours',
      jobType: 'full_time',
      experienceLevel: 'senior',
      salaryType: 'monthly',
      minSalary: 15000000,
      maxSalary: 25000000,
      currency: 'VND',
      city: 'Hà Nội',
      country: 'Việt Nam',
      remoteWork: true,
      companyId: companyId
    };

    console.log('📝 Job data:', JSON.stringify(jobData, null, 2));

    const jobResponse = await fetch(`${API_BASE}/jobs`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(jobData),
    });

    console.log('\n📡 Job creation response:');
    console.log('Status:', jobResponse.status);

    if (jobResponse.ok) {
      const jobResult = await jobResponse.json();
      console.log('✅ Job created successfully!');
      console.log('Job ID:', jobResult.id);
      console.log('Job Title:', jobResult.title);
      console.log('Job Status:', jobResult.status);

      // Step 4: Test getting the job
      console.log('\n4️⃣ Kiểm tra lấy job vừa tạo...');
      const getJobResponse = await fetch(`${API_BASE}/jobs/${jobResult.id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (getJobResponse.ok) {
        const jobDetails = await getJobResponse.json();
        console.log('✅ Job retrieved successfully!');
        console.log('Title:', jobDetails.title);
        console.log('Company:', jobDetails.company?.name);
      } else {
        console.log('⚠️ Could not retrieve job');
      }

    } else {
      console.log('❌ Job creation failed!');
      const error = await jobResponse.text();
      console.log('Error:', error);
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Alternative: Test with admin account
async function testWithAdmin() {
  console.log('\n🔧 Testing with Admin account...\n');

  const API_BASE = 'http://localhost:3001';

  try {
    // Login as admin
    const loginResponse = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'admin@cvking.com',
        password: 'admin123'
      }),
    });

    if (loginResponse.ok) {
      const loginData = await loginResponse.json();
      console.log('✅ Admin login successful!');
      console.log('Token preview:', loginData.access_token.substring(0, 30) + '...');

      return loginData.access_token;
    } else {
      console.log('❌ Admin login failed');
      return null;
    }
  } catch (error) {
    console.error('Admin test failed:', error.message);
    return null;
  }
}

// Run the tests
async function runTests() {
  console.log('='.repeat(50));
  console.log('🧪 CVKing Job Creation Test Suite');
  console.log('='.repeat(50));

  // Check if server is running
  try {
    const healthCheck = await fetch('http://localhost:3001');
    if (!healthCheck.ok) {
      console.log('❌ Backend server is not running!');
      console.log('Please start the server with: cd backend && npm run start:dev');
      return;
    }
  } catch (error) {
    console.log('❌ Cannot connect to backend server!');
    console.log('Please start the server with: cd backend && npm run start:dev');
    return;
  }

  console.log('✅ Backend server is running\n');

  // Test with employer account
  await testJobCreation();

  // If employer test fails, try with admin
  console.log('\n' + '='.repeat(30));
  const adminToken = await testWithAdmin();

  if (adminToken) {
    console.log('💡 You can use the admin token for testing other endpoints');
    console.log('Admin token:', adminToken);
  }

  console.log('\n' + '='.repeat(50));
  console.log('📚 Swagger UI: http://localhost:3001/api');
  console.log('🔐 Remember to include: Authorization: Bearer YOUR_TOKEN');
  console.log('='.repeat(50));
}

// Run tests
runTests();
