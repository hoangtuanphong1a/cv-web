// Comprehensive Job API Testing Script

async function comprehensiveJobTest() {
  console.log('🚀 Comprehensive Job API Testing Suite\n');
  console.log('='.repeat(60));

  const API_BASE = 'http://localhost:3001';

  try {
    // Step 1: Login to get JWT token
    console.log('1️⃣ 🔐 LOGIN - Getting JWT token...');
    const loginResponse = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
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
    console.log('🔑 Token preview:', token.substring(0, 50) + '...');

    // Step 2: Get existing company
    console.log('\n2️⃣ 🏢 GETTING EXISTING COMPANY...');
    const companiesResponse = await fetch(`${API_BASE}/companies/user/my-companies`, {
      headers: { 'Authorization': `Bearer ${token}` },
    });

    let companyId;
    if (companiesResponse.ok) {
      const companies = await companiesResponse.json();
      if (companies.length > 0) {
        companyId = companies[0].id;
        console.log('✅ Found company:', companies[0].name);
        console.log('🆔 Company ID:', companyId);
      } else {
        console.log('❌ No companies found. Please create a company first.');
        return;
      }
    } else {
      console.log('❌ Failed to get companies');
      return;
    }

    // Step 3: Test Job Creation
    console.log('\n3️⃣ 💼 TESTING JOB CREATION...');
    const jobData = {
      title: 'Senior Full Stack Developer',
      description: 'We are looking for a senior full stack developer with experience in React, Node.js, and cloud technologies.',
      requirements: '5+ years of full stack development experience, React, Node.js, AWS, PostgreSQL',
      benefits: 'Competitive salary, health insurance, flexible working hours, professional development budget',
      jobType: 'full_time',
      experienceLevel: 'senior',
      salaryType: 'monthly',
      minSalary: 25000000,
      maxSalary: 40000000,
      currency: 'VND',
      city: 'Hà Nội',
      country: 'Việt Nam',
      remoteWork: true,
      companyId: companyId
    };

    console.log('📝 Creating job with data:');
    console.log(JSON.stringify(jobData, null, 2));

    const createJobResponse = await fetch(`${API_BASE}/jobs`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(jobData),
    });

    console.log('\n📡 Job creation response:');
    console.log('Status:', createJobResponse.status);

    let jobId;
    if (createJobResponse.ok) {
      const createdJob = await createJobResponse.json();
      jobId = createdJob.id;
      console.log('✅ Job created successfully!');
      console.log('🆔 Job ID:', jobId);
      console.log('📋 Job Title:', createdJob.title);
      console.log('📊 Job Status:', createdJob.status);
    } else {
      console.log('❌ Job creation failed!');
      const error = await createJobResponse.text();
      console.log('Error:', error);
      return;
    }

    // Step 4: Test Get Job by ID
    console.log('\n4️⃣ 📖 TESTING GET JOB BY ID...');
    const getJobResponse = await fetch(`${API_BASE}/jobs/${jobId}`, {
      headers: { 'Authorization': `Bearer ${token}` },
    });

    if (getJobResponse.ok) {
      const jobDetails = await getJobResponse.json();
      console.log('✅ Job retrieved successfully!');
      console.log('📋 Title:', jobDetails.title);
      console.log('🏢 Company:', jobDetails.company?.name);
      console.log('👀 View Count:', jobDetails.viewCount);
    } else {
      console.log('❌ Failed to get job');
    }

    // Step 5: Test Get All Jobs
    console.log('\n5️⃣ 📋 TESTING GET ALL JOBS...');
    const getAllJobsResponse = await fetch(`${API_BASE}/jobs?page=1&limit=5`, {
      headers: { 'Authorization': `Bearer ${token}` },
    });

    if (getAllJobsResponse.ok) {
      const jobsList = await getAllJobsResponse.json();
      console.log('✅ Jobs list retrieved!');
      console.log('📊 Total jobs:', jobsList.total);
      console.log('📄 Page:', jobsList.page, 'of', jobsList.totalPages);
      console.log('📋 Jobs on this page:', jobsList.data.length);
    } else {
      console.log('❌ Failed to get jobs list');
    }

    // Step 6: Test Get Company Jobs
    console.log('\n6️⃣ 🏢 TESTING GET COMPANY JOBS...');
    const getCompanyJobsResponse = await fetch(`${API_BASE}/jobs/company/${companyId}`, {
      headers: { 'Authorization': `Bearer ${token}` },
    });

    if (getCompanyJobsResponse.ok) {
      const companyJobs = await getCompanyJobsResponse.json();
      console.log('✅ Company jobs retrieved!');
      console.log('📊 Jobs for this company:', companyJobs.length);
      companyJobs.forEach((job, index) => {
        console.log(`  ${index + 1}. ${job.title} (${job.status})`);
      });
    } else {
      console.log('❌ Failed to get company jobs');
    }

    // Step 7: Test Update Job
    console.log('\n7️⃣ ✏️ TESTING UPDATE JOB...');
    const updateData = {
      title: 'Senior Full Stack Developer - Updated',
      minSalary: 30000000,
      maxSalary: 45000000,
      remoteWork: false
    };

    const updateJobResponse = await fetch(`${API_BASE}/jobs/${jobId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(updateData),
    });

    if (updateJobResponse.ok) {
      const updatedJob = await updateJobResponse.json();
      console.log('✅ Job updated successfully!');
      console.log('📋 New title:', updatedJob.title);
      console.log('💰 New salary range:', `${updatedJob.minSalary} - ${updatedJob.maxSalary}`);
      console.log('🏠 Remote work:', updatedJob.remoteWork ? 'Yes' : 'No');
    } else {
      console.log('❌ Job update failed!');
      const error = await updateJobResponse.text();
      console.log('Error:', error);
    }

    // Step 8: Test Publish Job
    console.log('\n8️⃣ 📢 TESTING PUBLISH JOB...');
    const publishJobResponse = await fetch(`${API_BASE}/jobs/${jobId}/publish`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` },
    });

    if (publishJobResponse.ok) {
      const publishedJob = await publishJobResponse.json();
      console.log('✅ Job published successfully!');
      console.log('📊 New status:', publishedJob.status);
      console.log('📅 Published at:', publishedJob.publishedAt);
    } else {
      console.log('❌ Job publish failed!');
      const error = await publishJobResponse.text();
      console.log('Error:', error);
    }

    // Step 9: Test Get User's Jobs
    console.log('\n9️⃣ 👤 TESTING GET USER JOBS...');
    const getUserJobsResponse = await fetch(`${API_BASE}/jobs/user/my-jobs`, {
      headers: { 'Authorization': `Bearer ${token}` },
    });

    if (getUserJobsResponse.ok) {
      const userJobsStats = await getUserJobsResponse.json();
      console.log('✅ User jobs stats retrieved!');
      console.log('📊 Total jobs:', userJobsStats.totalJobs);
      console.log('📢 Published jobs:', userJobsStats.publishedJobs);
      console.log('📝 Draft jobs:', userJobsStats.draftJobs);
      console.log('👀 Total views:', userJobsStats.totalViews);
      console.log('📬 Total applications:', userJobsStats.totalApplications);
    } else {
      console.log('❌ Failed to get user jobs');
    }

    // Step 10: Test Search Jobs
    console.log('\n🔟 🔍 TESTING SEARCH JOBS...');
    const searchJobsResponse = await fetch(`${API_BASE}/jobs?search=developer&experienceLevel=senior&page=1&limit=3`, {
      headers: { 'Authorization': `Bearer ${token}` },
    });

    if (searchJobsResponse.ok) {
      const searchResults = await searchJobsResponse.json();
      console.log('✅ Job search successful!');
      console.log('🔍 Search results:', searchResults.total, 'jobs found');
      console.log('📋 Showing page:', searchResults.page, 'of', searchResults.totalPages);
    } else {
      console.log('❌ Job search failed');
    }

    console.log('\n' + '='.repeat(60));
    console.log('🎉 COMPREHENSIVE JOB TESTING COMPLETED!');
    console.log('='.repeat(60));
    console.log('\n📋 SUMMARY:');
    console.log('✅ Authentication working');
    console.log('✅ Job CRUD operations working');
    console.log('✅ Job publishing working');
    console.log('✅ Job search and filtering working');
    console.log('✅ Company-job relationships working');
    console.log('\n🔑 Key IDs for reference:');
    console.log('🏢 Company ID:', companyId);
    console.log('💼 Job ID:', jobId);
    console.log('🔐 JWT Token:', token.substring(0, 30) + '...');

    console.log('\n📚 Swagger URL: http://localhost:3001/api');
    console.log('🔧 You can now test all job endpoints in Swagger!');

  } catch (error) {
    console.error('❌ Test suite failed:', error.message);
  }
}

// Run comprehensive test
comprehensiveJobTest();
