// Script to get existing company or create new one with unique name

async function getOrCreateCompany() {
  console.log('🔍 Getting existing company for job testing...\n');

  const API_BASE = 'http://localhost:3001';

  try {
    // Step 1: Login to get JWT token
    console.log('1️⃣ Đăng nhập...');
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
      return;
    }

    const loginData = await loginResponse.json();
    const token = loginData.access_token;
    console.log('✅ Login successful!');

    // Step 2: Get user's companies
    console.log('\n2️⃣ Lấy danh sách companies...');
    const companiesResponse = await fetch(`${API_BASE}/companies/user/my-companies`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (companiesResponse.ok) {
      const companies = await companiesResponse.json();

      if (companies.length > 0) {
        console.log('✅ Found existing company!');
        console.log('Company ID:', companies[0].id);
        console.log('Company Name:', companies[0].name);

        // Test creating a job with this company
        await createTestJob(token, companies[0].id);
        return companies[0];
      }
    }

    // Step 3: If no companies exist, create a new one with unique name
    console.log('\n3️⃣ Tạo company mới...');
    const timestamp = Date.now();
    const uniqueCompanyName = `Test Company ${timestamp}`;

    const companyResponse = await fetch(`${API_BASE}/companies`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        name: uniqueCompanyName,
        description: 'A test company for job posting',
        website: 'https://testcompany.com',
        industry: 'technology',
        size: 'medium',
        city: 'Hà Nội',
        country: 'Việt Nam',
        logo: 'https://example.com/logo.png'
      }),
    });

    if (companyResponse.ok) {
      const companyData = await companyResponse.json();
      console.log('✅ Company created successfully!');
      console.log('Company ID:', companyData.id);
      console.log('Company Name:', companyData.name);

      // Test creating a job with this new company
      await createTestJob(token, companyData.id);
      return companyData;
    } else {
      console.log('❌ Company creation failed!');
      const error = await companyResponse.text();
      console.log('Error:', error);
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

async function createTestJob(token, companyId) {
  console.log('\n4️⃣ Test tạo job...');

  const API_BASE = 'http://localhost:3001';

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

  try {
    const jobResponse = await fetch(`${API_BASE}/jobs`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(jobData),
    });

    console.log('Job creation response:', jobResponse.status);

    if (jobResponse.ok) {
      const jobResult = await jobResponse.json();
      console.log('✅ Job created successfully!');
      console.log('Job ID:', jobResult.id);
      console.log('Job Title:', jobResult.title);
      console.log('Job Status:', jobResult.status);

      console.log('\n🎉 SUCCESS! You can now use this company and job for testing!');
      console.log('Company ID:', companyId);
      console.log('Job ID:', jobResult.id);

    } else {
      console.log('❌ Job creation failed!');
      const error = await jobResponse.text();
      console.log('Error:', error);
    }
  } catch (error) {
    console.error('❌ Job creation error:', error.message);
  }
}

// Run the script
getOrCreateCompany();
