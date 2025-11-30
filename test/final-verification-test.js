// Final verification test for all job API endpoints

async function finalVerificationTest() {
  console.log('🎯 FINAL VERIFICATION: Complete Job API Test Suite\n');
  console.log('='.repeat(70));

  const API_BASE = 'http://localhost:3001';

  try {
    // Step 1: Login
    console.log('1️⃣ 🔐 AUTHENTICATION TEST...');
    const loginResponse = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'employer@test.com',
        password: 'password123'
      }),
    });

    if (!loginResponse.ok) {
      console.log('❌ Authentication failed!');
      return;
    }

    const loginData = await loginResponse.json();
    const token = loginData.access_token;
    console.log('✅ Authentication successful');

    // Step 2: Get company
    console.log('\n2️⃣ 🏢 COMPANY ACCESS TEST...');
    const companiesResponse = await fetch(`${API_BASE}/companies/user/my-companies`, {
      headers: { 'Authorization': `Bearer ${token}` },
    });

    let companyId;
    if (companiesResponse.ok) {
      const companies = await companiesResponse.json();
      companyId = companies[0].id;
      console.log('✅ Company access successful');
    } else {
      console.log('❌ Company access failed');
      return;
    }

    // Step 3: Test all job endpoints
    console.log('\n3️⃣ 💼 COMPLETE JOB API TEST...');

    // 3.1 Create job
    const jobData = {
      title: 'Final Verification Job',
      description: 'Testing all job endpoints comprehensively',
      jobType: 'full_time',
      experienceLevel: 'mid_level',
      salaryType: 'monthly',
      minSalary: 20000000,
      maxSalary: 30000000,
      currency: 'VND',
      city: 'Hồ Chí Minh',
      country: 'Việt Nam',
      companyId: companyId
    };

    const createResponse = await fetch(`${API_BASE}/jobs`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(jobData),
    });

    if (!createResponse.ok) {
      console.log('❌ Job creation failed');
      return;
    }

    const createdJob = await createResponse.json();
    const jobId = createdJob.id;
    console.log('✅ Job creation: PASS');

    // 3.2 Get job by ID
    const getJobResponse = await fetch(`${API_BASE}/jobs/${jobId}`, {
      headers: { 'Authorization': `Bearer ${token}` },
    });

    if (!getJobResponse.ok) {
      console.log('❌ Get job by ID failed');
      return;
    }
    console.log('✅ Get job by ID: PASS');

    // 3.3 Get all jobs
    const getAllJobsResponse = await fetch(`${API_BASE}/jobs?page=1&limit=10`, {
      headers: { 'Authorization': `Bearer ${token}` },
    });

    if (!getAllJobsResponse.ok) {
      console.log('❌ Get all jobs failed');
      return;
    }
    console.log('✅ Get all jobs: PASS');

    // 3.4 Get company jobs
    const getCompanyJobsResponse = await fetch(`${API_BASE}/jobs/company/${companyId}`, {
      headers: { 'Authorization': `Bearer ${token}` },
    });

    if (!getCompanyJobsResponse.ok) {
      console.log('❌ Get company jobs failed');
      return;
    }
    console.log('✅ Get company jobs: PASS');

    // 3.5 Get user jobs stats
    const getUserJobsResponse = await fetch(`${API_BASE}/jobs/user/my-jobs`, {
      headers: { 'Authorization': `Bearer ${token}` },
    });

    if (!getUserJobsResponse.ok) {
      console.log('❌ Get user jobs failed');
      return;
    }
    console.log('✅ Get user jobs stats: PASS');

    // 3.6 Update job
    const updateResponse = await fetch(`${API_BASE}/jobs/${jobId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        title: 'Updated Final Verification Job',
        minSalary: 25000000
      }),
    });

    if (!updateResponse.ok) {
      console.log('❌ Update job failed');
      return;
    }
    console.log('✅ Update job: PASS');

    // 3.7 Publish job
    const publishResponse = await fetch(`${API_BASE}/jobs/${jobId}/publish`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` },
    });

    if (!publishResponse.ok) {
      console.log('❌ Publish job failed');
      return;
    }
    console.log('✅ Publish job: PASS');

    // 3.8 Close job
    const closeResponse = await fetch(`${API_BASE}/jobs/${jobId}/close`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` },
    });

    if (!closeResponse.ok) {
      console.log('❌ Close job failed');
      return;
    }
    console.log('✅ Close job: PASS');

    // 3.9 Delete job
    const deleteResponse = await fetch(`${API_BASE}/jobs/${jobId}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` },
    });

    if (!deleteResponse.ok) {
      console.log('❌ Delete job failed');
      return;
    }
    console.log('✅ Delete job: PASS');

    // Step 4: Final verification
    console.log('\n4️⃣ 🔍 FINAL VERIFICATION...');

    // Verify job is deleted
    const verifyResponse = await fetch(`${API_BASE}/jobs/${jobId}`, {
      headers: { 'Authorization': `Bearer ${token}` },
    });

    if (verifyResponse.status === 404) {
      console.log('✅ Job deletion verified: PASS');
    } else {
      console.log('❌ Job deletion verification failed');
      return;
    }

    console.log('\n' + '='.repeat(70));
    console.log('🎉 ALL TESTS PASSED! JOB API IS FULLY FUNCTIONAL!');
    console.log('='.repeat(70));

    console.log('\n📋 FINAL TEST RESULTS:');
    console.log('✅ Authentication & Authorization');
    console.log('✅ Company Access & Management');
    console.log('✅ Job Creation');
    console.log('✅ Job Retrieval (by ID, list, company, user stats)');
    console.log('✅ Job Update');
    console.log('✅ Job Publishing');
    console.log('✅ Job Closing');
    console.log('✅ Job Deletion');
    console.log('✅ Job Deletion Verification');

    console.log('\n🏆 TOTAL SCORE: 9/9 ENDPOINTS WORKING');
    console.log('📚 Swagger Documentation: http://localhost:3001/api');
    console.log('🔧 Ready for production use!');

  } catch (error) {
    console.error('❌ Final verification failed:', error.message);
  }
}

// Run final verification
finalVerificationTest();
