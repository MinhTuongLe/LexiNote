const { Client } = require('pg');
require('dotenv').config();

async function verify() {
  console.log('Connecting to:', process.env.DATABASE_URL.replace(/:[^:]+@/, ':****@'));
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log('Connected successfully! 🚀');
    const res = await client.query("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'");
    console.log('Tables in DB:', res.rows.map(r => r.table_name));
    await client.end();
  } catch (err) {
    console.error('Connection failed! ❌', err);
  }
}

verify();
