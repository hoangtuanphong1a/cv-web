const mysql = require('mysql2/promise');

async function testConnection() {
  console.log('🔍 Testing MySQL Database Connection...\n');

  const config = {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3306'),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '123321',
    database: process.env.DB_NAME || 'JOB_DB',
    connectTimeout: 5000,
  };

  console.log('📍 Connection Config:');
  console.log(`   Host: ${config.host}:${config.port}`);
  console.log(`   User: ${config.user}`);
  console.log(`   Database: ${config.database}`);
  console.log(`   Password: ${config.password ? '***' : 'not set'}`);
  console.log('');

  let connection;

  try {
    console.log('⏳ Attempting to connect...');
    connection = await mysql.createConnection(config);
    console.log('✅ Successfully connected to MySQL database!\n');

    // Test basic query
    const [result] = await connection.execute('SELECT 1 as test');
    console.log('✅ Basic query test passed:', result);

    // Get all databases
    const [databases] = await connection.execute('SHOW DATABASES');
    console.log('\n📋 AVAILABLE DATABASES:');
    databases.forEach((db, index) => {
      console.log(`${index + 1}. ${Object.values(db)[0]}`);
    });

    // Get all tables in current database
    const [tables] = await connection.execute('SHOW TABLES');
    console.log(`\n📋 TABLES IN "${config.database}":`);
    if (tables.length === 0) {
      console.log('   No tables found');
    } else {
      tables.forEach((table, index) => {
        console.log(`${index + 1}. ${Object.values(table)[0]}`);
      });
    }

  } catch (error) {
    console.error('❌ Database connection failed!');
    console.error('Error details:', {
      code: error.code,
      errno: error.errno,
      sqlState: error.sqlState,
      sqlMessage: error.sqlMessage,
    });

    console.log('\n🔧 Troubleshooting:');
    console.log('1. Make sure MySQL server is running');
    console.log(`2. Check if database "${config.database}" exists`);
    console.log('3. Verify username/password in .env file');
    console.log('4. Check MySQL user permissions');
    console.log('5. Try connecting without database first');
  } finally {
    if (connection) {
      await connection.end();
      console.log('\n🔌 Database connection closed');
    }
  }

  console.log('\n🎉 Connection test completed!');
}

testConnection().catch(console.error);
