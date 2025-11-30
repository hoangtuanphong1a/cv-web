// Create Sample Skills

async function createSampleSkills() {
  console.log('🚀 Creating Sample Skills...\n');

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

    // Sample skills to create
    const sampleSkills = [
      { name: 'JavaScript', description: 'Programming language for web development' },
      { name: 'TypeScript', description: 'Typed superset of JavaScript' },
      { name: 'React', description: 'JavaScript library for building user interfaces' },
      { name: 'Node.js', description: 'JavaScript runtime built on Chrome V8 engine' },
      { name: 'Python', description: 'High-level programming language' },
      { name: 'Java', description: 'Object-oriented programming language' },
      { name: 'C#', description: 'Multi-paradigm programming language' },
      { name: 'PHP', description: 'Server-side scripting language' },
      { name: 'Ruby', description: 'Dynamic, open source programming language' },
      { name: 'Go', description: 'Statically typed, compiled programming language' },
      { name: 'HTML', description: 'HyperText Markup Language for web pages' },
      { name: 'CSS', description: 'Cascading Style Sheets for styling web pages' },
      { name: 'SQL', description: 'Structured Query Language for databases' },
      { name: 'MongoDB', description: 'NoSQL document database' },
      { name: 'PostgreSQL', description: 'Advanced open source relational database' },
      { name: 'MySQL', description: 'Open source relational database management system' },
      { name: 'AWS', description: 'Amazon Web Services cloud platform' },
      { name: 'Docker', description: 'Platform for developing, shipping, and running applications' },
      { name: 'Kubernetes', description: 'Container orchestration platform' },
      { name: 'Git', description: 'Distributed version control system' },
      { name: 'REST API', description: 'Representational State Transfer Application Programming Interface' },
      { name: 'GraphQL', description: 'Query language for APIs' },
      { name: 'Machine Learning', description: 'Field of AI that enables systems to learn from data' },
      { name: 'Data Science', description: 'Field that uses scientific methods to extract knowledge from data' },
      { name: 'DevOps', description: 'Set of practices that combines software development and IT operations' },
      { name: 'Agile', description: 'Project management methodology' },
      { name: 'Scrum', description: 'Framework for agile project management' },
      { name: 'UI/UX Design', description: 'User Interface and User Experience design' },
      { name: 'Figma', description: 'Vector graphics editor and prototyping tool' },
      { name: 'Adobe Photoshop', description: 'Raster graphics editor' },
      { name: 'Adobe Illustrator', description: 'Vector graphics editor' }
    ];

    console.log('\n2️⃣ 📝 CREATING SAMPLE SKILLS...');

    let createdCount = 0;
    let failedCount = 0;

    for (const skill of sampleSkills) {
      try {
        const createResponse = await fetch('http://localhost:3001/skills', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(skill)
        });

        if (createResponse.ok) {
          createdCount++;
          console.log(`✅ Created: ${skill.name}`);
        } else {
          failedCount++;
          console.log(`❌ Failed: ${skill.name}`);
        }
      } catch (error) {
        failedCount++;
        console.log(`❌ Error creating ${skill.name}:`, error.message);
      }
    }

    console.log('\n' + '='.repeat(60));
    console.log('🎉 SAMPLE SKILLS CREATION COMPLETED!');
    console.log('='.repeat(60));
    console.log(`✅ Successfully created: ${createdCount} skills`);
    console.log(`❌ Failed to create: ${failedCount} skills`);
    console.log(`📊 Total skills attempted: ${sampleSkills.length}`);

  } catch (error) {
    console.error('❌ Script failed:', error.message);
  }
}

// Run script
createSampleSkills();
