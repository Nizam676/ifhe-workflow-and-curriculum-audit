CREATE DATABASE IF NOT EXISTS greencampus_db
  CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE greencampus_db;

CREATE TABLE IF NOT EXISTS users (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  full_name VARCHAR(120) NOT NULL,
  email VARCHAR(254) NOT NULL,
  phone VARCHAR(30) NOT NULL,
  campus_id VARCHAR(80) NOT NULL,
  role ENUM('student','faculty','maintenance','admin') NOT NULL DEFAULT 'student',
  department VARCHAR(120) NULL,
  program VARCHAR(80) NULL,
  year_of_study VARCHAR(40) NULL,
  designation VARCHAR(120) NULL,
  campus_area VARCHAR(120) NULL,
  shift VARCHAR(40) NULL,
  password_hash VARCHAR(255) NOT NULL,
  consent_at DATETIME NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  UNIQUE KEY uq_users_email (email),
  UNIQUE KEY uq_users_campus_id (campus_id)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS user_sessions (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  user_id BIGINT UNSIGNED NOT NULL,
  token_hash CHAR(64) NOT NULL,
  expires_at DATETIME NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_sessions_token_hash (token_hash),
  KEY idx_sessions_user_id (user_id),
  CONSTRAINT fk_sessions_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;
