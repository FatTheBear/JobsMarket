-- update add otp fields.sql
ALTER TABLE `User` 
ADD COLUMN `verification_code` VARCHAR(255) DEFAULT NULL,
ADD COLUMN `code_expires_at` TIMESTAMP NULL DEFAULT NULL;

-- update add deadline to Job_Posting
ALTER TABLE `Job_Posting`
ADD COLUMN `deadline` DATE DEFAULT NULL AFTER `job_type`;