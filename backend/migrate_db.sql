-- LexiNote Database Migration
-- Run this on your production database (e.g., Render/PostgreSQL) 
-- to add the necessary columns for authentication and security features.

ALTER TABLE "user" 
ADD COLUMN IF NOT EXISTS "refresh_token" TEXT,
ADD COLUMN IF NOT EXISTS "reset_password_token" TEXT,
ADD COLUMN IF NOT EXISTS "reset_password_expires" BIGINT,
ADD COLUMN IF NOT EXISTS "is_email_verified" BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS "email_verification_token" TEXT,
ADD COLUMN IF NOT EXISTS "email_verification_expires" BIGINT;
