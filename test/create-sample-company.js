// Script to create a sample company for HR user

async function createSampleCompany() {
  console.log('Creating sample company for HR user...\n');

  try {
    // First, login to get JWT token
    console.log('1. Logging in as HR user...');
    const loginResponse = await fetch('http://localhost:3002/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'phonghr@gmail.com',
        password: '123456'
      }),
    });

    if (!loginResponse.ok) {
      console.log('❌ Login failed');
      const errorText = await loginResponse.text();
      console.log('Error:', errorText);
      return;
    }

    const loginData = await loginResponse.json();
    const token = loginData.access_token;

    console.log('✅ Login successful, got JWT token');

    // Check if user already has companies
    console.log('\n2. Checking existing companies...');
    const companiesResponse = await fetch('http://localhost:3002/companies/user/my-companies', {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    const companies = await companiesResponse.json();

    if (companies.length > 0) {
      console.log('✅ User already has companies:');
      companies.forEach(company => {
        console.log(`  - ${company.name} (ID: ${company.id})`);
      });
      return;
    }

    console.log('ℹ️ User has no companies, creating sample company...');

    // Create sample company
    const sampleCompany = {
      name: 'TechViet Solutions',
      description: 'Leading technology company specializing in software development and digital solutions.',
      website: 'https://techviet.vn',
      industry: 'Technology',
      size: '51-200',
      address: '123 Đường ABC, Phường XYZ',
      city: 'Hà Nội',
      state: 'Hà Nội',
      country: 'Việt Nam',
      phone: '+84 123 456 789',
      email: 'contact@techviet.vn'
    };

    const createResponse = await fetch('http://localhost:3002/companies', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(sampleCompany),
    });

    if (createResponse.ok) {
      const newCompany = await createResponse.json();
      console.log('✅ Sample company created successfully!');
      console.log('Company details:');
      console.log(`  Name: ${newCompany.name}`);
      console.log(`  ID: ${newCompany.id}`);
      console.log(`  Industry: ${newCompany.industry}`);
      console.log(`  City: ${newCompany.city}`);
    } else {
      console.log('❌ Failed to create company');
      const errorText = await createResponse.text();
      console.log('Error:', errorText);
    }

  } catch (error) {
    console.error('Script failed:', error);
  }
}

// Run the script
createSampleCompany();
