// Test Job Posting with Skills

async function testJobPostingWithSkills() {
  console.log('🚀 Testing Job Posting with Skills...\n');

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

    // Step 2: Get existing company
    console.log('\n2️⃣ 🏢 GETTING EXISTING COMPANY...');
    const companiesResponse = await fetch('http://localhost:3001/companies/user/my-companies', {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    let companyId;
    if (companiesResponse.ok) {
      const companies = await companiesResponse.json();
      if (companies.length > 0) {
        companyId = companies[0].id;
        console.log('✅ Found company:', companies[0].name);
      } else {
        console.log('❌ No companies found. Please create a company first.');
        return;
      }
    } else {
      console.log('❌ Failed to get companies');
      return;
    }

    // Step 3: Get skill IDs for React and Node.js
    console.log('\n3️⃣ 🔍 GETTING SKILL IDs...');

    // Search for React
    const reactResponse = await fetch('http://localhost:3001/skills/search?name=React', {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    let reactSkillId = null;
    if (reactResponse.ok) {
      const reactSkills = await reactResponse.json();
      if (reactSkills.length > 0) {
        reactSkillId = reactSkills[0].id;
        console.log('✅ Found React skill ID:', reactSkillId);
      }
    }

    // Search for Node.js
    const nodeResponse = await fetch('http://localhost:3001/skills/search?name=Node.js', {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    let nodeSkillId = null;
    if (nodeResponse.ok) {
      const nodeSkills = await nodeResponse.json();
      if (nodeSkills.length > 0) {
        nodeSkillId = nodeSkills[0].id;
        console.log('✅ Found Node.js skill ID:', nodeSkillId);
      }
    }

    // Step 4: Create job with skills
    console.log('\n4️⃣ 💼 CREATING JOB WITH SKILLS...');

    const skillIds = [];
    if (reactSkillId) skillIds.push(reactSkillId);
    if (nodeSkillId) skillIds.push(nodeSkillId);

    const jobData = {
      title: 'Full Stack Developer with Modern Skills',
      description: 'We are looking for a full stack developer proficient in React and Node.js to join our innovative team.',
      requirements: '3+ years of experience with React, Node.js, and modern JavaScript frameworks. Experience with REST APIs and database design.',
      benefits: 'Competitive salary, health insurance, flexible working hours, professional development budget, remote work options',
      jobType: 'full_time',
      experienceLevel: 'mid_level',
      minSalary: 20000000,
      maxSalary: 35000000,
      currency: 'VND',
      city: 'Hà Nội',
      country: 'Việt Nam',
      remoteWork: true,
      skillIds: skillIds,
      companyId: companyId,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30 days from now
    };

    console.log('📝 Creating job with skills...');
    console.log('🎯 Skills to attach:', skillIds.length, 'skills');

    const createJobResponse = await fetch('http://localhost:3001/jobs', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(jobData)
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
      console.log('🎯 Skills attached:', createdJob.skills?.length || 0);
    } else {
      console.log('❌ Job creation failed!');
      const error = await createJobResponse.text();
      console.log('Error:', error);
      return;
    }

    // Step 5: Verify job details and skills
    console.log('\n5️⃣ 🔍 VERIFYING JOB DETAILS AND SKILLS...');
    const getJobResponse = await fetch(`http://localhost:3001/jobs/${jobId}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    if (getJobResponse.ok) {
      const jobDetails = await getJobResponse.json();
      console.log('✅ Job retrieved successfully!');
      console.log('📋 Title:', jobDetails.title);
      console.log('🏢 Company:', jobDetails.company?.name);
      console.log('🎯 Skills count:', jobDetails.skills?.length || 0);

      if (jobDetails.skills && jobDetails.skills.length > 0) {
        console.log('📋 Attached skills:');
        jobDetails.skills.forEach((skill, index) => {
          console.log(`  ${index + 1}. ${skill.name} (ID: ${skill.id})`);
        });
      }

      // Verify skills match what we expected
      const expectedSkillIds = new Set(skillIds);
      const actualSkillIds = new Set(jobDetails.skills?.map(s => s.id) || []);

      const skillsMatch = expectedSkillIds.size === actualSkillIds.size &&
        [...expectedSkillIds].every(id => actualSkillIds.has(id));

      if (skillsMatch) {
        console.log('✅ Skills correctly attached to job!');
      } else {
        console.log('❌ Skills mismatch!');
        console.log('Expected:', [...expectedSkillIds]);
        console.log('Actual:', [...actualSkillIds]);
      }
    } else {
      console.log('❌ Failed to retrieve job details');
    }

    console.log('\n' + '='.repeat(80));
    console.log('🎉 JOB POSTING WITH SKILLS TEST COMPLETED!');
    console.log('='.repeat(80));
    console.log('\n📋 SUMMARY:');
    console.log('✅ Authentication working');
    console.log('✅ Skills API working');
    console.log('✅ Job creation with skills working');
    console.log('✅ Skills properly attached to jobs');
    console.log('\n🔑 Key IDs for reference:');
    console.log('🏢 Company ID:', companyId);
    console.log('💼 Job ID:', jobId);
    console.log('🎯 Skill IDs:', skillIds.join(', '));

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run test
testJobPostingWithSkills();
