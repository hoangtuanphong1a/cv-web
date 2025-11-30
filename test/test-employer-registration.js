// Test script for employer registration and company creation

async function testEmployerRegistration() {
  console.log('🧪 Testing Employer Registration with Company Creation...\n');

  const testEmployer = {
    email: `employer-test-${Date.now()}@example.com`,
    password: '123456',
    role: 'employer'
  };

  const companyData = {
    name: `Test Company ${Date.now()}`,
    phone: '+84 123 456 789',
    email: testEmployer.email
  };

  try {
    console.log('1️⃣ Registering employer account...');
    console.log('Email:', testEmployer.email);
    console.log('Role:', testEmployer.role);

    const registerResponse = await fetch('http://localhost:3001/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testEmployer),
    });

    console.log('Register response status:', registerResponse.status);

    if (!registerResponse.ok) {
      const errorText = await registerResponse.text();
      console.log('❌ Registration failed:', errorText);
      return;
    }

    const registerData = await registerResponse.json();
    console.log('✅ Registration successful!');
    console.log('User ID:', registerData.user?.id);
    console.log('User roles:', registerData.user?.roles);
    console.log('Access token received:', !!registerData.access_token);

    const token = registerData.access_token;

    // Wait a moment for any async operations
    console.log('\n2️⃣ Waiting for company creation...');
    await new Promise(resolve => setTimeout(resolve, 2000));

    console.log('\n3️⃣ Checking if company was created...');
    const companiesResponse = await fetch('http://localhost:3001/companies/user/my-companies', {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    console.log('Companies response status:', companiesResponse.status);

    let companies = null;
    if (companiesResponse.ok) {
      companies = await companiesResponse.json();
      console.log('✅ Companies found:', companies.length);

      if (companies.length > 0) {
        const company = companies[0];
        console.log('🏢 Company details:');
        console.log('  ID:', company.id);
        console.log('  Name:', company.name);
        console.log('  Phone:', company.phone);
        console.log('  Email:', company.email);
        console.log('  Owner ID:', company.ownerId);
        console.log('  Created At:', company.createdAt);
      } else {
        console.log('❌ No companies found for this user');
      }
    } else {
      const errorText = await companiesResponse.text();
      console.log('❌ Failed to fetch companies:', errorText);
    }

    console.log('\n4️⃣ Testing company update...');
    // Use the companies data from step 3
    if (companiesResponse.ok && companies && companies.length > 0) {
      const company = companies[0];
      const updateData = {
        description: 'Updated company description',
        website: 'https://testcompany.com',
        industry: 'technology',
        size: 'small'
      };

      const updateResponse = await fetch(`http://localhost:3001/companies/${company.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(updateData),
      });

      console.log('Update response status:', updateResponse.status);

      if (updateResponse.ok) {
        const updatedCompany = await updateResponse.json();
        console.log('✅ Company updated successfully!');
        console.log('  Description:', updatedCompany.description);
        console.log('  Website:', updatedCompany.website);
        console.log('  Industry:', updatedCompany.industry);
        console.log('  Size:', updatedCompany.size);
      } else {
        const errorText = await updateResponse.text();
        console.log('❌ Company update failed:', errorText);
      }
    } else {
      console.log('❌ Cannot test update - no companies available');
    }

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Run the test
testEmployerRegistration();
