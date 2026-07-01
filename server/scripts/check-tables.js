import knex from 'knex';
import config from '../config/knexfile.js';

const db = knex(config.development);

async function checkTables() {
  try {
    console.log('📋 Checking database tables...\n');
    
    // Get all tables
    const result = await db.raw(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `);
    
    console.log('Tables in database:');
    result.rows.forEach(row => {
      console.log(`  ✓ ${row.table_name}`);
    });
    
    console.log(`\nTotal: ${result.rows.length} tables`);
    
  } catch (error) {
    console.error('❌ Error checking tables:', error.message);
  } finally {
    await db.destroy();
  }
}

checkTables();

