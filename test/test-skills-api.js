// Test Skills API

async function testSkillsAPI() {
  console.log('🚀 Testing Skills API...\n');

  try {
    // First login to get token
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

    // Test getting all skills
    console.log('\n2️⃣ 📋 GETTING ALL SKILLS...');
    const skillsResponse = await fetch('http://localhost:3001/skills', {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    if (skillsResponse.ok) {
      const skills = await skillsResponse.json();
      console.log('✅ Skills retrieved!');
      console.log('📊 Total skills:', skills.length);

      if (skills.length > 0) {
        console.log('📋 First 5 skills:');
        skills.slice(0, 5).forEach((skill, index) => {
          console.log(`  ${index + 1}. ${skill.name} (ID: ${skill.id})`);
        });
      }
    } else {
      console.log('❌ Failed to get skills');
    }

    // Test searching for React skill
    console.log('\n3️⃣ 🔍 SEARCHING FOR REACT SKILL...');
    const searchResponse = await fetch('http://localhost:3001/skills/search?name=React', {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    if (searchResponse.ok) {
      const reactSkills = await searchResponse.json();
      console.log('✅ React skills search completed!');
      console.log('📊 React skills found:', reactSkills.length);

      if (reactSkills.length > 0) {
        console.log('📋 React skill details:');
        console.log(`  Name: ${reactSkills[0].name}`);
        console.log(`  ID: ${reactSkills[0].id}`);
      }
    } else {
      console.log('❌ React skill search failed');
    }

    // Test searching for Node.js skill
    console.log('\n4️⃣ 🔍 SEARCHING FOR NODE.JS SKILL...');
    const nodeSearchResponse = await fetch('http://localhost:3001/skills/search?name=Node.js', {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    if (nodeSearchResponse.ok) {
      const nodeSkills = await nodeSearchResponse.json();
      console.log('✅ Node.js skills search completed!');
      console.log('📊 Node.js skills found:', nodeSkills.length);

      if (nodeSkills.length > 0) {
        console.log('📋 Node.js skill details:');
        console.log(`  Name: ${nodeSkills[0].name}`);
        console.log(`  ID: ${nodeSkills[0].id}`);
      }
    } else {
      console.log('❌ Node.js skill search failed');
    }

    console.log('\n' + '='.repeat(60));
    console.log('🎉 SKILLS API TESTING COMPLETED!');
    console.log('='.repeat(60));

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run test
testSkillsAPI();
