-- =====================================================================
-- IMOTA LOCAL COUNCIL DEVELOPMENT AREA (LCDA) YOUTH DATA REGISTRATION
-- RELATIONAL DATABASE SCHEMAS (MySQL 8.0+ & PostgreSQL 14+)
-- =====================================================================
-- Description: Production database schemas with strict UNIQUE constraints
-- on Full Name (normalized), Email (case-insensitive), and Phone Number.
-- =====================================================================

-- ---------------------------------------------------------------------
-- 1. MYSQL 8.0+ RELATIONAL SCHEMA
-- ---------------------------------------------------------------------
CREATE DATABASE IF NOT EXISTS imota_youth_portal CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE imota_youth_portal;

-- Table: Registrations
CREATE TABLE IF NOT EXISTS registrations (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    reg_number VARCHAR(40) NOT NULL UNIQUE COMMENT 'Unique registration slip code e.g. IMT/2026/YTH-00101',
    full_name VARCHAR(150) NOT NULL COMMENT 'Full Name as entered by youth',
    full_name_clean VARCHAR(150) NOT NULL UNIQUE COMMENT 'RULE 1: Normalized lowercase whitespace-trimmed full name',
    email VARCHAR(150) NOT NULL COMMENT 'Email address as entered',
    email_clean VARCHAR(150) NOT NULL UNIQUE COMMENT 'RULE 2: Lowercase trimmed unique email address',
    phone VARCHAR(30) NOT NULL COMMENT 'Phone number as entered',
    phone_clean VARCHAR(20) NOT NULL UNIQUE COMMENT 'RULE 3: Canonical 11-digit Nigerian phone number e.g. 08031234567',
    gender ENUM('Male', 'Female', 'Other') NOT NULL,
    ward VARCHAR(100) NULL COMMENT 'Electoral ward in Imota LCDA',
    lassra VARCHAR(50) NULL COMMENT 'Lagos State Residents Registration Agency number',
    dob DATE NOT NULL COMMENT 'Date of Birth (Required)',
    address TEXT NOT NULL COMMENT 'Residential Address in Imota / Lagos State',
    state_of_origin VARCHAR(80) NOT NULL COMMENT 'State of origin in Nigeria',
    occupation VARCHAR(120) NOT NULL COMMENT 'Current occupation / vocational engagement',
    education VARCHAR(100) NULL COMMENT 'Highest educational qualification',
    photo_url MEDIUMTEXT NULL COMMENT 'Passport photograph (base64 or storage URI)',
    skills TEXT NULL COMMENT 'Skill or professional expertise',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_reg_num (reg_number),
    INDEX idx_created_at (created_at),
    INDEX idx_ward (ward),
    INDEX idx_gender (gender)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table: Administrative Users
CREATE TABLE IF NOT EXISTS admin_users (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(120) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(120) NOT NULL,
    role ENUM('super_admin', 'council_officer', 'analyst') NOT NULL DEFAULT 'council_officer',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_admin_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Table: Email Dispatch & Confirmation Log
CREATE TABLE IF NOT EXISTS email_dispatches (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    reg_id BIGINT UNSIGNED NULL,
    reg_number VARCHAR(40) NOT NULL,
    recipient_email VARCHAR(150) NOT NULL,
    recipient_name VARCHAR(150) NOT NULL,
    subject VARCHAR(200) NOT NULL,
    body TEXT NOT NULL,
    status ENUM('SENT', 'FAILED', 'QUEUED') NOT NULL DEFAULT 'SENT',
    sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_email_reg_id (reg_id),
    CONSTRAINT fk_email_registration FOREIGN KEY (reg_id) REFERENCES registrations(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Table: Security Audit Trail
CREATE TABLE IF NOT EXISTS audit_logs (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    action VARCHAR(100) NOT NULL,
    target_id VARCHAR(50) NULL,
    details TEXT NULL,
    ip_address VARCHAR(45) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_audit_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


-- ---------------------------------------------------------------------
-- 2. POSTGRESQL 14+ / SUPABASE RELATIONAL SCHEMA
-- ---------------------------------------------------------------------
/*
-- Run in PostgreSQL / Supabase SQL Editor:

CREATE TABLE IF NOT EXISTS registrations (
    id BIGSERIAL PRIMARY KEY,
    reg_number VARCHAR(40) NOT NULL UNIQUE,
    full_name VARCHAR(150) NOT NULL,
    full_name_clean VARCHAR(150) NOT NULL UNIQUE,
    email VARCHAR(150) NOT NULL,
    email_clean VARCHAR(150) NOT NULL UNIQUE,
    phone VARCHAR(30) NOT NULL,
    phone_clean VARCHAR(20) NOT NULL UNIQUE,
    gender VARCHAR(20) NOT NULL CHECK (gender IN ('Male', 'Female', 'Other')),
    ward VARCHAR(100),
    lassra VARCHAR(50),
    dob DATE NOT NULL,
    address TEXT NOT NULL,
    state_of_origin VARCHAR(80) NOT NULL,
    occupation VARCHAR(120) NOT NULL,
    education VARCHAR(100),
    photo_url TEXT,
    skills TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Case-insensitive unique indexes on clean columns
CREATE UNIQUE INDEX IF NOT EXISTS uq_registrations_name_clean ON registrations (full_name_clean);
CREATE UNIQUE INDEX IF NOT EXISTS uq_registrations_email_clean ON registrations (email_clean);
CREATE UNIQUE INDEX IF NOT EXISTS uq_registrations_phone_clean ON registrations (phone_clean);
CREATE INDEX IF NOT EXISTS idx_registrations_created_at ON registrations (created_at);

CREATE TABLE IF NOT EXISTS admin_users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(120) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(120) NOT NULL,
    role VARCHAR(30) NOT NULL DEFAULT 'council_officer',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS email_dispatches (
    id BIGSERIAL PRIMARY KEY,
    reg_id BIGINT REFERENCES registrations(id) ON DELETE SET NULL,
    reg_number VARCHAR(40) NOT NULL,
    recipient_email VARCHAR(150) NOT NULL,
    recipient_name VARCHAR(150) NOT NULL,
    subject VARCHAR(200) NOT NULL,
    body TEXT NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'SENT',
    sent_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS audit_logs (
    id BIGSERIAL PRIMARY KEY,
    action VARCHAR(100) NOT NULL,
    target_id VARCHAR(50),
    details TEXT,
    ip_address VARCHAR(45),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
*/
