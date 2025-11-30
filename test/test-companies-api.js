// Test Companies API

async function testCompaniesAPI() {
  console.log('🚀 Testing Companies API...\n');

  try {
    // Step 1: Login to get JWT token
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

    // Step 2: Test get user companies
    console.log('\n2️⃣ 🏢 TESTING GET USER COMPANIES...');
    const userCompaniesResponse = await fetch('http://localhost:3001/companies/user/my-companies', {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    console.log('📡 Response status:', userCompaniesResponse.status);

    if (userCompaniesResponse.ok) {
      const userCompanies = await userCompaniesResponse.json();
      console.log('✅ User companies retrieved!');
      console.log('📊 Number of companies:', userCompanies.length);

      if (userCompanies.length > 0) {
        console.log('🏢 Companies:');
        userCompanies.forEach((company, index) => {
          console.log(`  ${index + 1}. ${company.name} (ID: ${company.id})`);
          console.log(`     Description: ${company.description || 'No description'}`);
        });
      } else {
        console.log('❌ No companies found for this user!');
        console.log('💡 You need to create a company first before posting jobs.');
      }
    } else {
      console.log('❌ Failed to get user companies');
      const error = await userCompaniesResponse.text();
      console.log('Error:', error);
    }

    // Step 3: Test get all companies (public)
    console.log('\n3️⃣ 🌐 TESTING GET ALL COMPANIES (PUBLIC)...');
    const allCompaniesResponse = await fetch('http://localhost:3001/companies?page=1&limit=5');

    if (allCompaniesResponse.ok) {
      const allCompaniesData = await allCompaniesResponse.json();
      console.log('✅ All companies retrieved!');
      console.log('📊 Total companies:', allCompaniesData.total);
      console.log('📄 Current page:', allCompaniesData.page);
      console.log('📋 Companies on this page:', allCompaniesData.data.length);

      if (allCompaniesData.data.length > 0) {
        console.log('🏢 Sample companies:');
        allCompaniesData.data.slice(0, 3).forEach((company, index) => {
          console.log(`  ${index + 1}. ${company.name}`);
        });
      }
    } else {
      console.log('❌ Failed to get all companies');
    }

    console.log('\n' + '='.repeat(60));
    console.log('🎉 COMPANIES API TESTING COMPLETED!');
    console.log('='.repeat(60));

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run test
testCompaniesAPI();
