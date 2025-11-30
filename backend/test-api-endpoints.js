const axios = require('axios');

const BASE_URL = 'http://localhost:3001';
let authToken = null;

// Colors for console output
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

function logTest(testName, result, details = '') {
  const status = result ? '✅ PASS' : '❌ FAIL';
  const color = result ? colors.green : colors.red;
  console.log(`${color}${status}${colors.reset} - ${testName}`);
  if (details) console.log(`   ${details}`);
}

function logError(testName, error) {
  console.log(`${colors.red}❌ FAIL${colors.reset} - ${testName}`);
  console.log(`   Error: ${error.message}`);
  if (error.response) {
    console.log(`   Status: ${error.response.status}`);
    console.log(`   Data: ${JSON.stringify(error.response.data, null, 2)}`);
  } else if (error.request) {
    console.log(`   No response received - check if server is running`);
  }
}

// Test basic health check
async function testHealthCheck() {
  try {
    log('\n🔍 Testing Health Check...', colors.blue);
    const response = await axios.get(`${BASE_URL}/`);
    logTest('Health Check', response.status === 200, `Status: ${response.status}`);
    return true;
  } catch (error) {
    logError('Health Check', error);
    return false;
  }
}

// Test Authentication endpoints
async function testAuth() {
  log('\n🔐 Testing Authentication Endpoints...', colors.blue);

  // Test Register
  try {
    const registerData = {
      email: `test${Date.now()}@example.com`,
      password: 'testpassword123',
      role: 'job_seeker'
    };

    const registerResponse = await axios.post(`${BASE_URL}/auth/register`, registerData);
    logTest('POST /auth/register', registerResponse.status === 201,
      `User created with ID: ${registerResponse.data?.id || 'unknown'}`);

    // Test Login
    const loginData = {
      email: registerData.email,
      password: registerData.password
    };

    const loginResponse = await axios.post(`${BASE_URL}/auth/login`, loginData);
    logTest('POST /auth/login', loginResponse.status === 201,
      `Token received: ${loginResponse.data?.access_token ? 'Yes' : 'No'}`);

    if (loginResponse.data?.accessToken) {
      authToken = loginResponse.data.accessToken;
      axios.defaults.headers.common['Authorization'] = `Bearer ${authToken}`;
    }

    return true;
  } catch (error) {
    logError('Authentication Tests', error);
    return false;
  }
}

// Test Users endpoints
async function testUsers() {
  if (!authToken) {
    log('\n⏭️  Skipping Users tests - No auth token', colors.yellow);
    return false;
  }

  log('\n👥 Testing Users Endpoints...', colors.blue);

  try {
    // GET /users
    const getUsersResponse = await axios.get(`${BASE_URL}/users`);
    logTest('GET /users', getUsersResponse.status === 200,
      `Found ${getUsersResponse.data?.length || 0} users`);

    // GET /users/profile/me
    const getProfileResponse = await axios.get(`${BASE_URL}/users/profile/me`);
    logTest('GET /users/profile/me', getProfileResponse.status === 200,
      `Profile: ${getProfileResponse.data?.email || 'unknown'}`);

    return true;
  } catch (error) {
    logError('Users Tests', error);
    return false;
  }
}

// Test Skills endpoints
async function testSkills() {
  log('\n🛠️  Testing Skills Endpoints (GET, POST, PUT, DELETE)...', colors.blue);
  let createdSkillId = null;

  try {
    // GET /skills
    const getSkillsResponse = await axios.get(`${BASE_URL}/skills`);
    logTest('GET /skills', getSkillsResponse.status === 200,
      `Found ${getSkillsResponse.data?.length || 0} skills`);

    // POST /skills (if authenticated)
    if (authToken) {
      const skillData = {
        name: `Test Skill ${Date.now()}`,
        description: 'Test skill description'
      };

      const createSkillResponse = await axios.post(`${BASE_URL}/skills`, skillData);
      logTest('POST /skills', createSkillResponse.status === 201,
        `Skill created: ${createSkillResponse.data?.name || 'unknown'}`);
      createdSkillId = createSkillResponse.data?.id;

      // GET /skills/:id
      if (createdSkillId) {
        const getSkillResponse = await axios.get(`${BASE_URL}/skills/${createdSkillId}`);
        logTest('GET /skills/:id', getSkillResponse.status === 200,
          `Retrieved skill: ${getSkillResponse.data?.name || 'unknown'}`);

        // PUT /skills/:id
        const updateData = {
          name: `Updated Skill ${Date.now()}`,
          description: 'Updated skill description'
        };
        const updateSkillResponse = await axios.put(`${BASE_URL}/skills/${createdSkillId}`, updateData);
        logTest('PUT /skills/:id', updateSkillResponse.status === 200,
          `Skill updated: ${updateSkillResponse.data?.name || 'unknown'}`);

        // DELETE /skills/:id
        const deleteSkillResponse = await axios.delete(`${BASE_URL}/skills/${createdSkillId}`);
        logTest('DELETE /skills/:id', deleteSkillResponse.status === 200,
          'Skill deleted successfully');
      }
    }

    return true;
  } catch (error) {
    logError('Skills Tests', error);
    return false;
  }
}

// Test Job Categories endpoints
async function testJobCategories() {
  log('\n📂 Testing Job Categories Endpoints (GET, POST, PUT, DELETE)...', colors.blue);
  let createdCategoryId = null;

  try {
    // GET /job-categories
    const getCategoriesResponse = await axios.get(`${BASE_URL}/job-categories`);
    logTest('GET /job-categories', getCategoriesResponse.status === 200,
      `Found ${getCategoriesResponse.data?.length || 0} categories`);

    // POST /job-categories (if authenticated)
    if (authToken) {
      const categoryData = {
        name: `Test Category ${Date.now()}`,
        description: 'Test job category description'
      };

      const createCategoryResponse = await axios.post(`${BASE_URL}/job-categories`, categoryData);
      logTest('POST /job-categories', createCategoryResponse.status === 201,
        `Category created: ${createCategoryResponse.data?.name || 'unknown'}`);
      createdCategoryId = createCategoryResponse.data?.id;

      // GET /job-categories/:id
      if (createdCategoryId) {
        const getCategoryResponse = await axios.get(`${BASE_URL}/job-categories/${createdCategoryId}`);
        logTest('GET /job-categories/:id', getCategoryResponse.status === 200,
          `Retrieved category: ${getCategoryResponse.data?.name || 'unknown'}`);

        // PUT /job-categories/:id
        const updateData = {
          name: `Updated Category ${Date.now()}`,
          description: 'Updated job category description'
        };
        const updateCategoryResponse = await axios.put(`${BASE_URL}/job-categories/${createdCategoryId}`, updateData);
        logTest('PUT /job-categories/:id', updateCategoryResponse.status === 200,
          `Category updated: ${updateCategoryResponse.data?.name || 'unknown'}`);

        // DELETE /job-categories/:id
        const deleteCategoryResponse = await axios.delete(`${BASE_URL}/job-categories/${createdCategoryId}`);
        logTest('DELETE /job-categories/:id', deleteCategoryResponse.status === 200,
          'Category deleted successfully');
      }
    }

    return true;
  } catch (error) {
    logError('Job Categories Tests', error);
    return false;
  }
}

// Test Companies endpoints
async function testCompanies() {
  if (!authToken) {
    log('\n⏭️  Skipping Companies tests - No auth token', colors.yellow);
    return false;
  }

  log('\n🏢 Testing Companies Endpoints (GET, POST, PUT, DELETE)...', colors.blue);
  let createdCompanyId = null;

  try {
    // GET /companies
    const getCompaniesResponse = await axios.get(`${BASE_URL}/companies`);
    logTest('GET /companies', getCompaniesResponse.status === 200,
      `Found ${getCompaniesResponse.data?.length || 0} companies`);

    // POST /companies
    const companyData = {
      name: `Test Company ${Date.now()}`,
      description: 'Test company description',
      website: 'https://testcompany.com',
      industry: 'technology',
      size: 'medium',
      address: '123 Test Street',
      city: 'Test City',
      country: 'Vietnam'
    };

    const createCompanyResponse = await axios.post(`${BASE_URL}/companies`, companyData);
    logTest('POST /companies', createCompanyResponse.status === 201,
      `Company created: ${createCompanyResponse.data?.name || 'unknown'}`);
    createdCompanyId = createCompanyResponse.data?.id;

    if (createdCompanyId) {
      // GET /companies/:id
      const getCompanyResponse = await axios.get(`${BASE_URL}/companies/${createdCompanyId}`);
      logTest('GET /companies/:id', getCompanyResponse.status === 200,
        `Retrieved company: ${getCompanyResponse.data?.name || 'unknown'}`);

      // PUT /companies/:id
      const updateData = {
        name: `Updated Company ${Date.now()}`,
        description: 'Updated company description',
        website: 'https://updatedcompany.com'
      };
      const updateCompanyResponse = await axios.put(`${BASE_URL}/companies/${createdCompanyId}`, updateData);
      logTest('PUT /companies/:id', updateCompanyResponse.status === 200,
        `Company updated: ${updateCompanyResponse.data?.name || 'unknown'}`);

      // DELETE /companies/:id
      const deleteCompanyResponse = await axios.delete(`${BASE_URL}/companies/${createdCompanyId}`);
      logTest('DELETE /companies/:id', deleteCompanyResponse.status === 200,
        'Company deleted successfully');
    }

    return true;
  } catch (error) {
    logError('Companies Tests', error);
    return false;
  }
}

// Test Jobs endpoints
async function testJobs() {
  log('\n💼 Testing Jobs Endpoints...', colors.blue);

  try {
    // GET /jobs
    const getJobsResponse = await axios.get(`${BASE_URL}/jobs`);
    logTest('GET /jobs', getJobsResponse.status === 200,
      `Found ${getJobsResponse.data?.length || 0} jobs`);

    return true;
  } catch (error) {
    logError('Jobs Tests', error);
    return false;
  }
}

// Test Blog endpoints
async function testBlog() {
  log('\n📝 Testing Blog Endpoints (GET, POST, PUT, DELETE)...', colors.blue);
  let createdBlogId = null;

  try {
    // GET /blog
    const getBlogsResponse = await axios.get(`${BASE_URL}/blog`);
    logTest('GET /blog', getBlogsResponse.status === 200,
      `Found ${getBlogsResponse.data?.length || 0} blog posts`);

    // POST /blog (if authenticated)
    if (authToken) {
      const blogData = {
        title: `Test Blog Post ${Date.now()}`,
        content: 'This is a test blog post content',
        excerpt: 'Test blog excerpt',
        status: 'draft'
      };

      const createBlogResponse = await axios.post(`${BASE_URL}/blog`, blogData);
      logTest('POST /blog', createBlogResponse.status === 201,
        `Blog created: ${createBlogResponse.data?.title || 'unknown'}`);
      createdBlogId = createBlogResponse.data?.id;

      if (createdBlogId) {
        // GET /blog/:id
        const getBlogResponse = await axios.get(`${BASE_URL}/blog/${createdBlogId}`);
        logTest('GET /blog/:id', getBlogResponse.status === 200,
          `Retrieved blog: ${getBlogResponse.data?.title || 'unknown'}`);

        // PUT /blog/:id
        const updateData = {
          title: `Updated Blog Post ${Date.now()}`,
          content: 'Updated blog content',
          excerpt: 'Updated excerpt'
        };
        const updateBlogResponse = await axios.put(`${BASE_URL}/blog/${createdBlogId}`, updateData);
        logTest('PUT /blog/:id', updateBlogResponse.status === 200,
          `Blog updated: ${updateBlogResponse.data?.title || 'unknown'}`);

        // DELETE /blog/:id
        const deleteBlogResponse = await axios.delete(`${BASE_URL}/blog/${createdBlogId}`);
        logTest('DELETE /blog/:id', deleteBlogResponse.status === 200,
          'Blog deleted successfully');
      }
    }

    return true;
  } catch (error) {
    logError('Blog Tests', error);
    return false;
  }
}

// Test Admin endpoints
async function testAdmin() {
  if (!authToken) {
    log('\n⏭️  Skipping Admin tests - No auth token', colors.yellow);
    return false;
  }

  log('\n👑 Testing Admin Endpoints...', colors.blue);

  try {
    // GET /admin/dashboard/overview
    const getDashboardResponse = await axios.get(`${BASE_URL}/admin/dashboard/overview`);
    logTest('GET /admin/dashboard/overview', getDashboardResponse.status === 200,
      'Dashboard data retrieved');

    return true;
  } catch (error) {
    logError('Admin Tests', error);
    return false;
  }
}

// Main test runner
async function runAllTests() {
  log(`${colors.bold}🚀 CVKing API Testing Suite${colors.reset}`, colors.blue);
  log(`Testing against: ${BASE_URL}`, colors.blue);
  log('='.repeat(60), colors.blue);

  const results = [];

  // Run tests
  results.push(await testHealthCheck());
  results.push(await testAuth());
  results.push(await testUsers());
  results.push(await testSkills());
  results.push(await testJobCategories());
  results.push(await testCompanies());
  results.push(await testJobs());
  results.push(await testBlog());
  results.push(await testAdmin());

  // Summary
  const passed = results.filter(r => r).length;
  const total = results.length;

  log('\n' + '='.repeat(60), colors.blue);
  log(`${colors.bold}📊 TEST SUMMARY${colors.reset}`, colors.blue);
  log(`✅ Passed: ${passed}/${total}`, passed === total ? colors.green : colors.yellow);
  log(`❌ Failed: ${total - passed}/${total}`, total - passed === 0 ? colors.green : colors.red);

  if (passed === total) {
    log('\n🎉 All tests passed! API is working correctly.', colors.green);
  } else {
    log('\n⚠️  Some tests failed. Check the details above.', colors.yellow);
  }

  log('\n💡 You can also test manually using Swagger UI:');
  log(`   ${BASE_URL}/api`, colors.blue);
}

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

runAllTests().catch(console.error);
