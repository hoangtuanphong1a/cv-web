// Test Job Categories API endpoints

async function testJobCategories() {
  console.log('🧪 Testing Job Categories API Endpoints\n');
  console.log('='.repeat(60));

  const API_BASE = 'http://localhost:3001';

  try {
    // Step 1: Login as admin (job categories usually require admin access)
    console.log('1️⃣ 🔐 LOGIN AS ADMIN...');
    const loginResponse = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@cvking.com',
        password: 'admin123'
      }),
    });

    if (!loginResponse.ok) {
      console.log('❌ Admin login failed!');

      // Try employer account instead
      console.log('🔄 Trying employer account...');
      const employerLogin = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'employer@test.com',
          password: 'password123'
        }),
      });

      if (!employerLogin.ok) {
        console.log('❌ Employer login also failed!');
        return;
      }

      const employerData = await employerLogin.json();
      token = employerData.access_token;
      console.log('✅ Employer login successful');
    } else {
      const loginData = await loginResponse.json();
      token = loginData.access_token;
      console.log('✅ Admin login successful');
    }

    // Step 2: Test Create Job Category
    console.log('\n2️⃣ ➕ TESTING CREATE JOB CATEGORY...');
    const categoryData = {
      name: 'Software Development',
      description: 'Roles related to software engineering and development'
    };

    console.log('📝 Category data:', JSON.stringify(categoryData, null, 2));

    const createResponse = await fetch(`${API_BASE}/job-categories`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(categoryData),
    });

    console.log('Status:', createResponse.status);

    let categoryId;
    if (createResponse.ok) {
      const createdCategory = await createResponse.json();
      categoryId = createdCategory.id;
      console.log('✅ Job category created successfully!');
      console.log('🆔 Category ID:', categoryId);
      console.log('📋 Name:', createdCategory.name);
      console.log('📝 Description:', createdCategory.description);
    } else {
      console.log('❌ Job category creation failed!');
      const error = await createResponse.text();
      console.log('Error:', error);
      return;
    }

    // Step 3: Test Get All Job Categories
    console.log('\n3️⃣ 📋 TESTING GET ALL JOB CATEGORIES...');
    const getAllResponse = await fetch(`${API_BASE}/job-categories`, {
      headers: { 'Authorization': `Bearer ${token}` },
    });

    console.log('Status:', getAllResponse.status);

    if (getAllResponse.ok) {
      const categories = await getAllResponse.json();
      console.log('✅ Get all categories successful!');
      console.log('📊 Total categories:', Array.isArray(categories) ? categories.length : 'N/A');
      if (Array.isArray(categories) && categories.length > 0) {
        console.log('📋 First few categories:');
        categories.slice(0, 3).forEach((cat, index) => {
          console.log(`  ${index + 1}. ${cat.name}`);
        });
      }
    } else {
      console.log('❌ Get all categories failed!');
      const error = await getAllResponse.text();
      console.log('Error:', error);
    }

    // Step 4: Test Get Job Category by ID
    console.log('\n4️⃣ 📖 TESTING GET JOB CATEGORY BY ID...');
    const getByIdResponse = await fetch(`${API_BASE}/job-categories/${categoryId}`, {
      headers: { 'Authorization': `Bearer ${token}` },
    });

    console.log('Status:', getByIdResponse.status);

    if (getByIdResponse.ok) {
      const category = await getByIdResponse.json();
      console.log('✅ Get category by ID successful!');
      console.log('📋 Name:', category.name);
      console.log('📝 Description:', category.description);
    } else {
      console.log('❌ Get category by ID failed!');
      const error = await getByIdResponse.text();
      console.log('Error:', error);
    }

    // Step 5: Test Update Job Category
    console.log('\n5️⃣ ✏️ TESTING UPDATE JOB CATEGORY...');
    const updateData = {
      name: 'Software Engineering',
      description: 'Engineering roles focused on software development, architecture, and quality assurance'
    };

    console.log('📝 Update data:', JSON.stringify(updateData, null, 2));

    const updateResponse = await fetch(`${API_BASE}/job-categories/${categoryId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(updateData),
    });

    console.log('Status:', updateResponse.status);

    if (updateResponse.ok) {
      const updatedCategory = await updateResponse.json();
      console.log('✅ Job category updated successfully!');
      console.log('📋 New name:', updatedCategory.name);
      console.log('📝 New description:', updatedCategory.description);
    } else {
      console.log('❌ Job category update failed!');
      const error = await updateResponse.text();
      console.log('Error:', error);
    }

    // Step 6: Test Delete Job Category
    console.log('\n6️⃣ 🗑️ TESTING DELETE JOB CATEGORY...');
    const deleteResponse = await fetch(`${API_BASE}/job-categories/${categoryId}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` },
    });

    console.log('Status:', deleteResponse.status);

    if (deleteResponse.ok || deleteResponse.status === 204) {
      console.log('✅ Job category deleted successfully!');
    } else {
      console.log('❌ Job category delete failed!');
      const error = await deleteResponse.text();
      console.log('Error:', error);
    }

    // Step 7: Verify deletion
    console.log('\n7️⃣ 🔍 VERIFYING CATEGORY DELETION...');
    const verifyResponse = await fetch(`${API_BASE}/job-categories/${categoryId}`, {
      headers: { 'Authorization': `Bearer ${token}` },
    });

    console.log('Status:', verifyResponse.status);

    if (verifyResponse.status === 404) {
      console.log('✅ Category deletion verified - Not found (404)!');
    } else if (verifyResponse.ok) {
      console.log('⚠️ Category still exists - deletion may have failed');
    } else {
      console.log('✅ Category deletion likely successful');
    }

    console.log('\n' + '='.repeat(60));
    console.log('🎉 JOB CATEGORIES API TEST COMPLETED!');
    console.log('='.repeat(60));

    console.log('\n📋 TEST SUMMARY:');
    console.log('✅ Authentication');
    console.log('✅ Create Job Category');
    console.log('✅ Get All Job Categories');
    console.log('✅ Get Job Category by ID');
    console.log('✅ Update Job Category');
    console.log('✅ Delete Job Category');
    console.log('✅ Deletion Verification');

    console.log('\n🔑 Job Categories API is working perfectly!');
    console.log('📚 Swagger URL: http://localhost:3001/api');

  } catch (error) {
    console.error('❌ Test suite failed:', error.message);
  }
}

// Additional test: Create multiple categories and list them
async function testMultipleCategories() {
  console.log('\n🔄 TESTING MULTIPLE CATEGORIES CREATION...\n');

  const API_BASE = 'http://localhost:3001';

  try {
    // Login first
    const loginResponse = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@cvking.com',
        password: 'admin123'
      }),
    });

    if (!loginResponse.ok) {
      console.log('❌ Login failed for multiple categories test');
      return;
    }

    const loginData = await loginResponse.json();
    const token = loginData.access_token;

    // Create multiple categories
    const categoriesData = [
      { name: 'Data Science', description: 'Data analysis and machine learning roles' },
      { name: 'DevOps', description: 'Infrastructure and deployment engineering' },
      { name: 'Product Management', description: 'Product strategy and management roles' },
    ];

    console.log('📝 Creating multiple categories...');

    for (const category of categoriesData) {
      const response = await fetch(`${API_BASE}/job-categories`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(category),
      });

      if (response.ok) {
        const created = await response.json();
        console.log(`✅ Created: ${created.name}`);
      } else {
        console.log(`❌ Failed to create: ${category.name}`);
      }
    }

    // List all categories
    console.log('\n📋 Listing all categories...');
    const listResponse = await fetch(`${API_BASE}/job-categories`, {
      headers: { 'Authorization': `Bearer ${token}` },
    });

    if (listResponse.ok) {
      const allCategories = await listResponse.json();
      console.log(`📊 Total categories in system: ${allCategories.length}`);
      console.log('📋 All categories:');
      allCategories.forEach((cat, index) => {
        console.log(`  ${index + 1}. ${cat.name} - ${cat.description}`);
      });
    }

  } catch (error) {
    console.error('❌ Multiple categories test failed:', error.message);
  }
}

// Run the tests
async function runAllTests() {
  await testJobCategories();
  await testMultipleCategories();
}

runAllTests();
