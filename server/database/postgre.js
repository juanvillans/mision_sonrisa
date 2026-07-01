import knex from 'knex';
import { NODE_ENV } from '../config/env.js';
import knexConfig from '../config/knexfile.js';

const {
  POSTGRES_URL,
  POSTGRES_HOST,
  POSTGRES_PASSWORD,
  POSTGRES_DATABASE,
  POSTGRES_USER = "postgres",
  POSTGRES_PORT = 5432,
} = process.env;

// Knex configuration
const db = knex(knexConfig.development)
// Initialize Knex
// Test connection and run migrations
async function connectToDB() {
  try {
    // Test connection
    await db.raw('SELECT 1');
    console.log(`✅ Connected to PostgreSQL database: ${POSTGRES_DATABASE}`);
    
    // Run migrations
    await db.migrate.latest();
    return db;
  } catch (error) {
    console.error("❌ Error connecting to PostgreSQL:", error.message);
    throw error;
  }
}

// Graceful shutdown
process.on("SIGINT", async () => {
  console.log("🔄 Closing database connection pool...");
  await db.destroy();
  console.log("✅ Database connection pool closed");
  process.exit(0);
});

export default connectToDB;
export { db };