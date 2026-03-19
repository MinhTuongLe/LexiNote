const { Client } = require('pg');

// Live Supabase URL (commented out in .env)
const connectionString = 'postgresql://postgres.htrrsvagyxbvbmudgqgp:Minhtuongle%4009122002@aws-1-ap-southeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true';

const sql = `
  ALTER TABLE "user" 
  ADD COLUMN IF NOT EXISTS "refresh_token" TEXT,
  ADD COLUMN IF NOT EXISTS "reset_password_token" TEXT,
  ADD COLUMN IF NOT EXISTS "reset_password_expires" BIGINT;
`;

async function run() {
  const client = new Client({
    connectionString: connectionString,
    ssl: { rejectUnauthorized: false }
  });

  try {
    console.log('Connecting to Live Database... 🌉');
    await client.connect();
    console.log('Successfully connected! Running migration... 🚀');
    
    await client.query(sql);
    console.log('Migration completed successfully! 🎉 New columns added.');
    
  } catch (err) {
    console.error('Migration failed! 😿', err.message);
  } finally {
    await client.end();
  }
}

run();
