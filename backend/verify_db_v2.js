const { Client } = require('pg');
require('dotenv').config();

async function testInsert() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log('Connected! 🚀');
    
    // Check tables again
    const tables = await client.query("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'");
    console.log('Current Tables:', tables.rows.map(r => r.table_name));

    if (tables.rows.some(t => t.table_name === 'user')) {
      console.log('User table exists. Attempting to count users...');
      const count = await client.query('SELECT count(*) FROM "user"');
      console.log('User count:', count.rows[0].count);
    } else {
      console.log('User table STILL not found in public schema!');
    }

    await client.end();
  } catch (err) {
    console.error('Test failed! ❌', err);
  }
}

testInsert();
