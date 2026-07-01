import knex from 'knex';
import config from '../config/knexfile.js';

const db = knex(config.development);

async function resetMigrations() {
  try {
    console.log('🔄 Resetting migration state...');

    // Drop triggers first
    console.log('Dropping triggers...');
    await db.raw('DROP TRIGGER IF EXISTS update_users_updated_at ON users');

    // Drop functions
    console.log('Dropping functions...');
    await db.raw('DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE');

    // Drop all tables
    console.log('Dropping tables...');
    await db.raw('DROP TABLE IF EXISTS medical_requests CASCADE');
    await db.raw('DROP TABLE IF EXISTS import_batches CASCADE');
    await db.raw('DROP TABLE IF EXISTS users CASCADE');
    await db.raw('DROP TABLE IF EXISTS statutes CASCADE');

    // Drop migration tracking tables
    console.log('Dropping migration tracking tables...');
    await db.raw('DROP TABLE IF EXISTS knex_migrations CASCADE');
    await db.raw('DROP TABLE IF EXISTS knex_migrations_lock CASCADE');

    console.log('✅ All tables, triggers, and functions dropped successfully');
    console.log('');
    console.log('Now you can run: node node_modules/knex/bin/cli.js migrate:latest');

  } catch (error) {
    console.error('❌ Error resetting migrations:', error.message);
  } finally {
    await db.destroy();
  }
}

resetMigrations();

