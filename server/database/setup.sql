-- PostgreSQL Database Setup for Casos1x10
-- Run this script to create the database and tables

-- Create database (run this as postgres superuser)
-- CREATE DATABASE Casos1x10;

-- Connect to Casos1x10 database and run the following:

-- Create users table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL CHECK (LENGTH(name) >= 2),
    last_name VARCHAR(50),
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL CHECK (LENGTH(password) >= 6),
    allow_validate_exam BOOLEAN DEFAULT FALSE,
    allow_handle_users BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create index on email for faster lookups
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- Create trigger to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at 
    BEFORE UPDATE ON users 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Insert sample data (optional)
-- INSERT INTO users (name, email, password) VALUES 
-- ('John Doe', 'john@example.com', '$2b$12$hashedpasswordhere'),
-- ('Jane Smith', 'jane@example.com', '$2b$12$anotherhashedpassword');

-- Verify tables
SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';
