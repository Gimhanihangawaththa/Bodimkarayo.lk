-- Create database
CREATE DATABASE IF NOT EXISTS bodimkarayo_db;

-- Create user and grant privileges
CREATE USER IF NOT EXISTS 'bodim_user'@'localhost' IDENTIFIED BY 'StrongPassword123!';
GRANT ALL PRIVILEGES ON bodimkarayo_db.* TO 'bodim_user'@'localhost';
FLUSH PRIVILEGES;

-- Use the database
USE bodimkarayo_db;

-- Show confirmation
SELECT 'Database and user created successfully!' AS status;
