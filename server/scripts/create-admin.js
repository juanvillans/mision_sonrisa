// Script to create an initial admin user
import bcrypt from "bcryptjs";
import { pool } from "../database/postgre.js";
import dotenv from "dotenv";

// Load environment variables based on NODE_ENV
const envFile = process.env.NODE_ENV === "production" 
  ? ".env.production" 
  : ".env.development.local";

dotenv.config({ path: envFile });

async function createAdminUser() {
  try {
    // Check if any users exist
    const { rows } = await pool.query("SELECT COUNT(*) FROM users");
    const userCount = parseInt(rows[0].count);
    
    if (userCount > 0) {
      console.log("Users already exist in the database. Admin creation skipped.");
      return;
    }
    
    // Admin user details
    const adminUser = {
      name: "Admin Juan",
      last_name: "Villasmil",
      email: "juanvillans16@gmail.com", // Change this to your admin email
      password: "123456", // This will be hashed
      allow_validate_exam: true,
      allow_handle_users: true,
      status: "active" // Admin is active by default
    };
    
    // Hash the password
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(adminUser.password, salt);
    
    // Insert admin user
    const result = await pool.query(`
      INSERT INTO users (
        name, 
        last_name, 
        email, 
        password, 
        allow_validate_exam, 
        allow_handle_users,
        status,
        created_at, 
        updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW())
      RETURNING id, name, email
    `, [
      adminUser.name,
      adminUser.last_name,
      adminUser.email.toLowerCase(),
      hashedPassword,
      adminUser.allow_validate_exam,
      adminUser.allow_handle_users,
      adminUser.status
    ]);
    
    
  } catch (error) {
    console.error("Error creating admin user:", error);
  } finally {
    // Close the database connection
    await pool.end();
  }
}

// Run the function
createAdminUser();