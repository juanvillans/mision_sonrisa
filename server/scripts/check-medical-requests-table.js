import knex from 'knex';
import config from '../config/knexfile.js';

const db = knex(config.development);

async function checkMedicalRequestsTable() {
  try {
    console.log('📋 Checking medical_requests table structure...\n');
    
    // Get columns for medical_requests table
    const result = await db.raw(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = 'medical_requests'
      ORDER BY ordinal_position
    `);
    
    if (result.rows.length === 0) {
      console.log('❌ Table medical_requests does not exist!');
    } else {
      console.log('✅ Table medical_requests exists with the following columns:\n');
      result.rows.forEach(row => {
        const nullable = row.is_nullable === 'YES' ? 'NULL' : 'NOT NULL';
        console.log(`  • ${row.column_name.padEnd(25)} ${row.data_type.padEnd(20)} ${nullable}`);
      });
      console.log(`\nTotal: ${result.rows.length} columns`);
    }
    
  } catch (error) {
    console.error('❌ Error checking table:', error.message);
  } finally {
    await db.destroy();
  }
}

checkMedicalRequestsTable();

