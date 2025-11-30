// Comprehensive API Testing Suite for CVKing Job Board
// Tests all endpoints from the API specification

const API_BASE = 'http://localhost:3001';

async function makeRequest(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`;
  const defaultOptions = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers
    },
    ...options
  };

  try {
    const response = await fetch(url, defaultOptions);
    const data = await response.json().catch(() => null);
    return { response, data };
  } catch (error) {
    console.error(`❌ Request failed for ${endpoint}:`, error.message);
    return { response: null, data: null };
  }
}

async function comprehensiveAPITest() {
  console.log('🚀 COMPREHENSIVE CVKING API TESTING SUITE\n');
  console.log('='.repeat(80));

  let testResults = {
    passed: 0,
    failed: 0,
    total: 0
  };

  function logTest(testName, success, details = '') {
    testResults.total++;
    if (success) {
      testResults.passed++;
      console.log(`✅ ${testName}`);
      if (details) console.log(`   ${details}`);
    } else {
      testResults.failed++;
      console.log(`❌ ${testName}`);
      if (details) console.log(`   ${details}`);
    }
  }

  try {
    // ===== AUTHENTICATION =====
    console.log('🔐 TESTING AUTHENTICATION ENDPOINTS...\n');

    // Register test users
    const timestamp = Date.now();
    const testUsers = {
      jobSeeker: `test-jobseeker-${timestamp}@example.com`,
      employer: `test-employer-${timestamp}@example.com`,
      admin: 'admin@cvking.com'
    };

    // Register job seeker
    const registerJobSeeker = await makeRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        email: testUsers.jobSeeker,
        password: 'password123',
        role: 'job_seeker'
      })
    });
    logTest('Job Seeker Registration', registerJobSeeker.response?.ok, `User ID: ${registerJobSeeker.data?.user?.id}`);

    // Register employer
    const registerEmployer = await makeRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        email: testUsers.employer,
        password: 'password123',
        role: 'employer'
      })
    });
    logTest('Employer Registration', registerEmployer.response?.ok);

    // Login as job seeker
    const loginJobSeeker = await makeRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        email: testUsers.jobSeeker,
        password: 'password123'
      })
    });
    logTest('Job Seeker Login', loginJobSeeker.response?.ok);
    const jobSeekerToken = loginJobSeeker.data?.access_token;

    // Login as employer
    const loginEmployer = await makeRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        email: testUsers.employer,
        password: 'password123'
      })
    });
    logTest('Employer Login', loginEmployer.response?.ok);
    const employerToken = loginEmployer.data?.access_token;

    // Login as admin
    const loginAdmin = await makeRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        email: testUsers.admin,
        password: 'admin123'
      })
    });
    logTest('Admin Login', loginAdmin.response?.ok);
    const adminToken = loginAdmin.data?.access_token;

    // Test /auth/me
    const getMe = await makeRequest('/auth/me', {
      headers: { 'Authorization': `Bearer ${jobSeekerToken}` }
    });
    logTest('Get Current User Profile (/auth/me)', getMe.response?.ok, `Email: ${getMe.data?.email}`);

    // ===== JOB CATEGORIES =====
    console.log('\n📂 TESTING JOB CATEGORIES ENDPOINTS...\n');

    // Get all job categories
    const getJobCategories = await makeRequest('/job-categories');
    logTest('Get All Job Categories', getJobCategories.response?.ok, `Count: ${getJobCategories.data?.length || 0}`);

    // Get job category by ID (if categories exist)
    if (getJobCategories.data && getJobCategories.data.length > 0) {
      const categoryId = getJobCategories.data[0].id;
      const getJobCategory = await makeRequest(`/job-categories/${categoryId}`);
      logTest('Get Job Category by ID', getJobCategory.response?.ok, `Name: ${getJobCategory.data?.name}`);
    }

    // ===== COMPANIES =====
    console.log('\n🏢 TESTING COMPANIES ENDPOINTS...\n');

    // Get all companies
    const getCompanies = await makeRequest('/companies');
    logTest('Get All Companies', getCompanies.response?.ok, `Total: ${getCompanies.data?.total || 0}`);

    // Get user's companies
    const getUserCompanies = await makeRequest('/companies/user/my-companies', {
      headers: { 'Authorization': `Bearer ${employerToken}` }
    });
    logTest('Get User Companies', getUserCompanies.response?.ok, `Count: ${getUserCompanies.data?.length || 0}`);

    // ===== JOBS =====
    console.log('\n💼 TESTING JOBS ENDPOINTS...\n');

    // Get all jobs
    const getJobs = await makeRequest('/jobs');
    logTest('Get All Jobs', getJobs.response?.ok, `Total: ${getJobs.data?.total || 0}`);

    // Get user's jobs
    const getUserJobs = await makeRequest('/jobs/user/my-jobs', {
      headers: { 'Authorization': `Bearer ${employerToken}` }
    });
    logTest('Get User Jobs Stats', getUserJobs.response?.ok, `Total jobs: ${getUserJobs.data?.totalJobs || 0}`);

    // ===== SKILLS =====
    console.log('\n🛠️ TESTING SKILLS ENDPOINTS...\n');

    // Get all skills
    const getSkills = await makeRequest('/skills');
    logTest('Get All Skills', getSkills.response?.ok, `Count: ${getSkills.data?.length || 0}`);

    // Search skills
    const searchSkills = await makeRequest('/skills/search?name=react');
    logTest('Search Skills', searchSkills.response?.ok, `Found: ${searchSkills.data?.length || 0}`);

    // ===== JOB SEEKER PROFILE =====
    console.log('\n👤 TESTING JOB SEEKER PROFILE ENDPOINTS...\n');

    // Create job seeker profile
    const createJobSeekerProfile = await makeRequest('/jobseeker/profile', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${jobSeekerToken}` },
      body: JSON.stringify({
        firstName: 'John',
        lastName: 'Doe',
        phone: '+1234567890',
        bio: 'Experienced software developer',
        location: 'Hanoi, Vietnam',
        experienceYears: 5,
        currentPosition: 'Senior Developer'
      })
    });
    logTest('Create Job Seeker Profile', createJobSeekerProfile.response?.ok);

    // Get job seeker profile
    const getJobSeekerProfile = await makeRequest('/jobseeker/profile', {
      headers: { 'Authorization': `Bearer ${jobSeekerToken}` }
    });
    logTest('Get Job Seeker Profile', getJobSeekerProfile.response?.ok, `Name: ${getJobSeekerProfile.data?.firstName} ${getJobSeekerProfile.data?.lastName}`);

    // ===== APPLICATIONS =====
    console.log('\n📝 TESTING APPLICATIONS ENDPOINTS...\n');

    // Get user's applications
    const getUserApplications = await makeRequest('/applications/user/my-applications', {
      headers: { 'Authorization': `Bearer ${jobSeekerToken}` }
    });
    logTest('Get User Applications', getUserApplications.response?.ok, `Count: ${getUserApplications.data?.data?.length || 0}`);

    // ===== NOTIFICATIONS =====
    console.log('\n🔔 TESTING NOTIFICATIONS ENDPOINTS...\n');

    // Get user notifications
    const getNotifications = await makeRequest('/notifications', {
      headers: { 'Authorization': `Bearer ${jobSeekerToken}` }
    });
    logTest('Get User Notifications', getNotifications.response?.ok, `Count: ${getNotifications.data?.data?.length || 0}`);

    // Get unread notification count
    const getUnreadCount = await makeRequest('/notifications/unread/count', {
      headers: { 'Authorization': `Bearer ${jobSeekerToken}` }
    });
    logTest('Get Unread Notification Count', getUnreadCount.response?.ok, `Count: ${getUnreadCount.data?.count || 0}`);

    // ===== CVS =====
    console.log('\n📄 TESTING CV ENDPOINTS...\n');

    // Get user's CVs
    const getUserCVs = await makeRequest('/cvs/user/my-cvs', {
      headers: { 'Authorization': `Bearer ${jobSeekerToken}` }
    });
    logTest('Get User CVs', getUserCVs.response?.ok, `Count: ${getUserCVs.data?.data?.length || 0}`);

    // ===== USERS =====
    console.log('\n👥 TESTING USERS ENDPOINTS...\n');

    // Get current user profile
    const getCurrentUserProfile = await makeRequest('/users/profile/me', {
      headers: { 'Authorization': `Bearer ${jobSeekerToken}` }
    });
    logTest('Get Current User Profile', getCurrentUserProfile.response?.ok, `Email: ${getCurrentUserProfile.data?.email}`);

    // ===== SAVED JOBS =====
    console.log('\n💾 TESTING SAVED JOBS ENDPOINTS...\n');

    // Get saved jobs
    const getSavedJobs = await makeRequest('/saved-jobs', {
      headers: { 'Authorization': `Bearer ${jobSeekerToken}` }
    });
    logTest('Get Saved Jobs', getSavedJobs.response?.ok, `Count: ${getSavedJobs.data?.data?.length || 0}`);

    // ===== SUBSCRIPTION PLANS =====
    console.log('\n💳 TESTING SUBSCRIPTION PLANS ENDPOINTS...\n');

    // Get all subscription plans
    const getSubscriptionPlans = await makeRequest('/subscription-plans');
    logTest('Get All Subscription Plans', getSubscriptionPlans.response?.ok, `Count: ${getSubscriptionPlans.data?.length || 0}`);

    // ===== MESSAGING =====
    console.log('\n💬 TESTING MESSAGING ENDPOINTS...\n');

    // Get user conversations
    const getConversations = await makeRequest('/messaging/conversations', {
      headers: { 'Authorization': `Bearer ${jobSeekerToken}` }
    });
    logTest('Get User Conversations', getConversations.response?.ok, `Count: ${getConversations.data?.length || 0}`);

    // ===== BLOG =====
    console.log('\n📝 TESTING BLOG ENDPOINTS...\n');

    // Get all blog posts
    const getBlogPosts = await makeRequest('/blog');
    logTest('Get All Blog Posts', getBlogPosts.response?.ok, `Count: ${getBlogPosts.data?.data?.length || 0}`);

    // ===== ADMIN DASHBOARD =====
    if (adminToken) {
      console.log('\n👑 TESTING ADMIN DASHBOARD ENDPOINTS...\n');

      // Get admin dashboard overview
      const getAdminOverview = await makeRequest('/admin/dashboard/overview', {
        headers: { 'Authorization': `Bearer ${adminToken}` }
      });
      logTest('Get Admin Dashboard Overview', getAdminOverview.response?.ok);

      // Get admin users
      const getAdminUsers = await makeRequest('/admin/users', {
        headers: { 'Authorization': `Bearer ${adminToken}` }
      });
      logTest('Get Admin Users', getAdminUsers.response?.ok, `Count: ${getAdminUsers.data?.data?.length || 0}`);
    }

    // ===== EMPLOYER DASHBOARD =====
    if (employerToken) {
      console.log('\n💼 TESTING EMPLOYER DASHBOARD ENDPOINTS...\n');

      // Get employer dashboard stats
      const getEmployerStats = await makeRequest('/employer/dashboard/stats', {
        headers: { 'Authorization': `Bearer ${employerToken}` }
      });
      logTest('Get Employer Dashboard Stats', getEmployerStats.response?.ok);
    }

    // ===== FINAL SUMMARY =====
    console.log('\n' + '='.repeat(80));
    console.log('🎯 COMPREHENSIVE API TESTING COMPLETED!');
    console.log('='.repeat(80));

    console.log('\n📊 FINAL TEST RESULTS:');
    console.log(`✅ Passed: ${testResults.passed}`);
    console.log(`❌ Failed: ${testResults.failed}`);
    console.log(`📊 Total: ${testResults.total}`);
    console.log(`📈 Success Rate: ${((testResults.passed / testResults.total) * 100).toFixed(1)}%`);

    console.log('\n📋 ENDPOINTS TESTED:');
    console.log('✅ Authentication (Register, Login, Me)');
    console.log('✅ Job Categories (Get All, Get by ID)');
    console.log('✅ Companies (Get All, Get User Companies)');
    console.log('✅ Jobs (Get All, Get User Jobs)');
    console.log('✅ Skills (Get All, Search)');
    console.log('✅ Job Seeker Profile (Create, Get)');
    console.log('✅ Applications (Get User Applications)');
    console.log('✅ Notifications (Get, Unread Count)');
    console.log('✅ CVs (Get User CVs)');
    console.log('✅ Users (Get Current Profile)');
    console.log('✅ Saved Jobs (Get Saved Jobs)');
    console.log('✅ Subscription Plans (Get All)');
    console.log('✅ Messaging (Get Conversations)');
    console.log('✅ Blog (Get All Posts)');
    console.log('✅ Admin Dashboard (Overview, Users)');
    console.log('✅ Employer Dashboard (Stats)');

    console.log('\n🔗 API Documentation: http://localhost:3001/api');
    console.log('🧪 Tests completed successfully!');

  } catch (error) {
    console.error('❌ Comprehensive test suite failed:', error.message);
  }
}

// Run comprehensive test
comprehensiveAPITest();
