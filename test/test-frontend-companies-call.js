// Test Frontend Companies API Call Simulation

async function testFrontendCompaniesCall() {
  console.log('🚀 Testing Frontend Companies API Call...\n');

  try {
    // Step 1: Login to get JWT token (simulating frontend auth)
    console.log('1️⃣ 🔐 LOGIN - Getting JWT token...');
    const loginResponse = await fetch('http://localhost:3001/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'employer@test.com',
        password: 'password123'
      })
    });

    if (!loginResponse.ok) {
      console.log('❌ Login failed!');
      return;
    }

    const loginData = await loginResponse.json();
    const token = loginData.access_token;
    console.log('✅ Login successful!');

    // Step 2: Simulate the exact API call that frontend makes
    console.log('\n2️⃣ 🌐 SIMULATING FRONTEND API CALL...');
    console.log('📡 Calling: GET /companies/user/my-companies');
    console.log('🔑 Using token:', token.substring(0, 20) + '...');

    const companiesResponse = await fetch('http://localhost:3001/companies/user/my-companies', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    console.log('📡 Response status:', companiesResponse.status);
    console.log('📡 Response headers:', [...companiesResponse.headers.entries()]);

    if (companiesResponse.ok) {
      const companies = await companiesResponse.json();
      console.log('✅ Companies API call successful!');
      console.log('📊 Response type:', typeof companies);
      console.log('📊 Is array?', Array.isArray(companies));
      console.log('📊 Number of companies:', Array.isArray(companies) ? companies.length : 'N/A');

      if (Array.isArray(companies) && companies.length > 0) {
        console.log('🏢 Companies data:');
        companies.forEach((company, index) => {
          console.log(`  ${index + 1}. ${JSON.stringify(company, null, 2)}`);
        });
      } else {
        console.log('❌ Response is not an array or is empty!');
        console.log('📋 Raw response:', companies);
      }
    } else {
      console.log('❌ Companies API call failed!');
      const errorText = await companiesResponse.text();
      console.log('❌ Error response:', errorText);
    }

    console.log('\n' + '='.repeat(80));
    console.log('🎉 FRONTEND COMPANIES API CALL TEST COMPLETED!');
    console.log('='.repeat(80));

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error('Stack:', error.stack);
  }
}

// Run test
testFrontendCompaniesCall();
