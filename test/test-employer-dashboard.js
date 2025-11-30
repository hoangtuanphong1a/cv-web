const axios = require('axios');

const BASE_URL = 'http://localhost:3001';

async function testEmployerDashboard() {
  console.log('🧪 Testing Employer Dashboard Endpoints\n');

  try {
    // First, register a test employer user
    console.log('📝 Registering test employer...');
    const registerResponse = await axios.post(`${BASE_URL}/auth/register`, {
      email: 'employer-test@example.com',
      password: 'password123',
      role: 'employer',
    });
    console.log('✅ Registration successful');

    // Login to get token
    console.log('🔑 Logging in...');
    const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'employer-test@example.com',
      password: 'password123',
    });

    const authToken = loginResponse.data.access_token;
    const userId = loginResponse.data.user.id;
    console.log('✅ Login successful, User ID:', userId);

    const config = {
      headers: { Authorization: `Bearer ${authToken}` },
    };

    // Create a company for the employer
    console.log('🏢 Creating company...');
    const companyResponse = await axios.post(`${BASE_URL}/companies`, {
      name: 'Test Company Inc',
      description: 'A test company for dashboard testing',
      industry: 'Technology',
      website: 'https://testcompany.com',
      location: 'Test City, TC',
      size: '1-10',
    }, config);

    const companyId = companyResponse.data.id;
    console.log('✅ Company created, ID:', companyId);

    // Create a job
    console.log('💼 Creating job...');
    const jobResponse = await axios.post(`${BASE_URL}/jobs`, {
      title: 'Test Job Position',
      description: 'This is a test job for dashboard testing',
      requirements: 'Test requirements',
      jobType: 'full_time',
      experienceLevel: 'junior',
      city: 'Test City',
      country: 'Test Country',
      minSalary: 50000,
      maxSalary: 70000,
      currency: 'USD',
      skills: ['JavaScript', 'React'],
      companyId: companyId,
    }, config);

    const jobId = jobResponse.data.id;
    console.log('✅ Job created, ID:', jobId);

    // Publish the job
    console.log('📢 Publishing job...');
    await axios.post(`${BASE_URL}/jobs/${jobId}/publish`, {}, config);
    console.log('✅ Job published');

    // Now test the employer dashboard endpoints
    console.log('\n📊 Testing Employer Dashboard Endpoints');

    // Test stats endpoint
    console.log('📈 Testing GET /employer/dashboard/stats...');
    const statsResponse = await axios.get(`${BASE_URL}/employer/dashboard/stats`, config);
    console.log('✅ Stats endpoint working:', statsResponse.data);

    // Test jobs endpoint
    console.log('💼 Testing GET /employer/dashboard/jobs...');
    const jobsResponse = await axios.get(`${BASE_URL}/employer/dashboard/jobs?limit=5`, config);
    console.log('✅ Jobs endpoint working, found', jobsResponse.data.length, 'jobs');

    // Test applicants endpoint
    console.log('👥 Testing GET /employer/dashboard/applicants...');
    const applicantsResponse = await axios.get(`${BASE_URL}/employer/dashboard/applicants?limit=5`, config);
    console.log('✅ Applicants endpoint working, found', applicantsResponse.data.length, 'applicants');

    console.log('\n🎉 All employer dashboard endpoints are working!');

  } catch (error) {
    console.error('\n❌ Test failed:');
    console.error('Error:', error.response?.data || error.message);
    if (error.response?.status) {
      console.error('Status Code:', error.response.status);
    }
  }
}

testEmployerDashboard();
