-- SQL Script for phpMyAdmin Import
-- Database: jobs_market
-- Generated for JobsMarket Project
-- Compatible with MySQL 5.7+ and MySQL 8.0+

SET FOREIGN_KEY_CHECKS = 0;

-- --------------------------------------------------------
-- Table: User
-- --------------------------------------------------------
DROP TABLE IF EXISTS `User`;
CREATE TABLE `User` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `email` VARCHAR(255) UNIQUE NOT NULL,
  `password_hash` VARCHAR(255) NOT NULL,
  `role` ENUM('Admin', 'HR', 'Candidate') NOT NULL,
  `status` ENUM('Pending', 'Active', 'Banned') NOT NULL DEFAULT 'Pending',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table: Industry
-- --------------------------------------------------------
DROP TABLE IF EXISTS `Industry`;
CREATE TABLE `Industry` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(255) UNIQUE NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table: Company
-- --------------------------------------------------------
DROP TABLE IF EXISTS `Company`;
CREATE TABLE `Company` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `hr_id` INT NOT NULL UNIQUE, -- Unique for 1-to-1 relationship with User
  `industry_id` INT NOT NULL,
  `name` VARCHAR(255) NOT NULL,
  `logo_url` VARCHAR(255) DEFAULT NULL,
  `website` VARCHAR(255) DEFAULT NULL,
  `address` TEXT DEFAULT NULL,
  CONSTRAINT `fk_company_hr` FOREIGN KEY (`hr_id`) REFERENCES `User` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_company_industry` FOREIGN KEY (`industry_id`) REFERENCES `Industry` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table: Candidate_Profile
-- --------------------------------------------------------
DROP TABLE IF EXISTS `Candidate_Profile`;
CREATE TABLE `Candidate_Profile` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT UNIQUE NOT NULL, -- Unique for 1-to-1 relationship with User
  `full_name` VARCHAR(255) NOT NULL,
  `phone` VARCHAR(20) DEFAULT NULL,
  `avatar_url` VARCHAR(255) DEFAULT NULL,
  `headline` VARCHAR(255) DEFAULT NULL,
  `about` TEXT DEFAULT NULL,
  `years_of_experience` INT DEFAULT 0,
  `skills` JSON DEFAULT NULL, -- MySQL 5.7+ supports JSON. In MySQL 8.0.13+, DEFAULT (JSON_ARRAY()) can be used, but NULL is safer for compatibility.
  `is_public` BOOLEAN DEFAULT TRUE,
  CONSTRAINT `fk_profile_user` FOREIGN KEY (`user_id`) REFERENCES `User` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table: Job_Posting
-- --------------------------------------------------------
DROP TABLE IF EXISTS `Job_Posting`;
CREATE TABLE `Job_Posting` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `company_id` INT NOT NULL,
  `hr_id` INT NOT NULL,
  `title` VARCHAR(255) NOT NULL,
  `description` TEXT DEFAULT NULL,
  `requirements` TEXT DEFAULT NULL,
  `salary_min` INT DEFAULT NULL,
  `salary_max` INT DEFAULT NULL,
  `job_type` ENUM('Full-time', 'Part-time', 'Freelance') DEFAULT NULL,
  `status` ENUM('Pending', 'Approved', 'Rejected', 'Closed') DEFAULT 'Pending',
  `view_count` INT DEFAULT 0,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT `fk_job_company` FOREIGN KEY (`company_id`) REFERENCES `Company` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_job_hr` FOREIGN KEY (`hr_id`) REFERENCES `User` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table: Skill
-- --------------------------------------------------------
DROP TABLE IF EXISTS `Skill`;
CREATE TABLE `Skill` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(100) UNIQUE NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table: Job_Skill
-- --------------------------------------------------------
DROP TABLE IF EXISTS `Job_Skill`;
CREATE TABLE `Job_Skill` (
  `job_id` INT NOT NULL,
  `skill_id` INT NOT NULL,
  `min_level` ENUM('Beginner', 'Intermediate', 'Advanced', 'Expert') NOT NULL DEFAULT 'Beginner',
  `min_years` DECIMAL(3,1) NOT NULL DEFAULT 0.0,
  PRIMARY KEY (`job_id`, `skill_id`),
  CONSTRAINT `fk_jobskill_job` FOREIGN KEY (`job_id`) REFERENCES `Job_Posting` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_jobskill_skill` FOREIGN KEY (`skill_id`) REFERENCES `Skill` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table: Candidate_Skill
-- --------------------------------------------------------
DROP TABLE IF EXISTS `Candidate_Skill`;
CREATE TABLE `Candidate_Skill` (
  `candidate_id` INT NOT NULL,
  `skill_id` INT NOT NULL,
  `level` ENUM('Beginner', 'Intermediate', 'Advanced', 'Expert') NOT NULL DEFAULT 'Beginner',
  `years_of_experience` DECIMAL(3,1) NOT NULL DEFAULT 0.0,
  PRIMARY KEY (`candidate_id`, `skill_id`),
  CONSTRAINT `fk_candskill_candidate` FOREIGN KEY (`candidate_id`) REFERENCES `Candidate_Profile` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_candskill_skill` FOREIGN KEY (`skill_id`) REFERENCES `Skill` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table: Saved_Job
-- --------------------------------------------------------
DROP TABLE IF EXISTS `Saved_Job`;
CREATE TABLE `Saved_Job` (
  `candidate_id` INT NOT NULL,
  `job_id` INT NOT NULL,
  `saved_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`candidate_id`, `job_id`),
  CONSTRAINT `fk_saved_candidate` FOREIGN KEY (`candidate_id`) REFERENCES `Candidate_Profile` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_saved_job` FOREIGN KEY (`job_id`) REFERENCES `Job_Posting` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table: Candidate_CV
-- --------------------------------------------------------
DROP TABLE IF EXISTS `Candidate_CV`;
CREATE TABLE `Candidate_CV` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `candidate_id` INT NOT NULL,
  `cv_name` VARCHAR(255) NOT NULL,
  `file_name` VARCHAR(255) NOT NULL,
  `file_url` VARCHAR(255) NOT NULL,
  `file_type` ENUM('PDF', 'Word', 'Image') NOT NULL,
  `file_size` INT DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT `fk_cv_candidate` FOREIGN KEY (`candidate_id`) REFERENCES `Candidate_Profile` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table: Application
-- --------------------------------------------------------
DROP TABLE IF EXISTS `Application`;
CREATE TABLE `Application` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `job_id` INT NOT NULL,
  `candidate_id` INT NOT NULL,
  `cv_id` INT NOT NULL,
  `status` ENUM('Applied', 'Reviewing', 'Interviewing', 'Offered', 'Rejected') DEFAULT 'Applied',
  `applied_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT `fk_app_job` FOREIGN KEY (`job_id`) REFERENCES `Job_Posting` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_app_candidate` FOREIGN KEY (`candidate_id`) REFERENCES `Candidate_Profile` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_app_cv` FOREIGN KEY (`cv_id`) REFERENCES `Candidate_CV` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table: Notification
-- --------------------------------------------------------
DROP TABLE IF EXISTS `Notification`;
CREATE TABLE `Notification` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT NOT NULL,
  `title` VARCHAR(255) NOT NULL,
  `content` TEXT DEFAULT NULL,
  `is_read` BOOLEAN DEFAULT FALSE,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT `fk_notification_user` FOREIGN KEY (`user_id`) REFERENCES `User` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table: News_Category
-- --------------------------------------------------------
DROP TABLE IF EXISTS `News_Category`;
CREATE TABLE `News_Category` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(100) UNIQUE NOT NULL,
  `description` TEXT DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table: News
-- --------------------------------------------------------
DROP TABLE IF EXISTS `News`;
CREATE TABLE `News` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `admin_id` INT NOT NULL,
  `category_id` INT NOT NULL,
  `title` VARCHAR(255) NOT NULL,
  `slug` VARCHAR(255) UNIQUE NOT NULL,
  `thumbnail_url` VARCHAR(255) DEFAULT NULL,
  `short_description` TEXT DEFAULT NULL,
  `content` LONGTEXT DEFAULT NULL,
  `status` ENUM('Draft', 'Published', 'Hidden') DEFAULT 'Draft',
  `is_featured` BOOLEAN DEFAULT FALSE,
  `view_count` INT DEFAULT 0,
  `published_at` TIMESTAMP NULL DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT `fk_news_admin` FOREIGN KEY (`admin_id`) REFERENCES `User` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_news_category` FOREIGN KEY (`category_id`) REFERENCES `News_Category` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SET FOREIGN_KEY_CHECKS = 1;

/* Cập nhật bảng user, thêm cột coins để lưu số xu của user */
ALTER TABLE `User` 
ADD COLUMN `coins` INT DEFAULT 0,
ADD COLUMN `bank_name` VARCHAR(100) DEFAULT NULL,
ADD COLUMN `bank_account_number` VARCHAR(50) DEFAULT NULL,
ADD COLUMN `bank_account_name` VARCHAR(100) DEFAULT NULL;

/* Tạo bảng Transaction để lưu lịch sử giao dịch */
CREATE TABLE `Transaction` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `user_id` INT NOT NULL,
    `amount_fiat` DECIMAL(10, 2) DEFAULT 0.00,
    `coins` INT NOT NULL,
    `type` ENUM('deposit', 'purchase', 'refund') NOT NULL,
    `payment_method` VARCHAR(50) DEFAULT 'bank_transfer',
    `status` ENUM('pending', 'completed', 'failed') DEFAULT 'pending',
    `reference_code` VARCHAR(100) UNIQUE,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (`user_id`) REFERENCES `User`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- --------------------------------------------------------
-- Table: Candidate_Education (Added via Fix)
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS Candidate_Education (
  id INT AUTO_INCREMENT PRIMARY KEY,
  candidate_id INT NOT NULL,
  school_name VARCHAR(255),
  degree VARCHAR(255),
  start_date VARCHAR(20),
  end_date VARCHAR(20),
  description TEXT,
  FOREIGN KEY (candidate_id) REFERENCES Candidate_Profile(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table: Candidate_Experience (Added via Fix)
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS Candidate_Experience (
  id INT AUTO_INCREMENT PRIMARY KEY,
  candidate_id INT NOT NULL,
  company_name VARCHAR(255),
  role VARCHAR(255),
  start_date VARCHAR(20),
  end_date VARCHAR(20),
  description TEXT,
  FOREIGN KEY (candidate_id) REFERENCES Candidate_Profile(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table: Company_Follower (Added via Fix)
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS Company_Follower (
  candidate_id INT NOT NULL,
  company_id INT NOT NULL,
  PRIMARY KEY (candidate_id, company_id),
  FOREIGN KEY (candidate_id) REFERENCES Candidate_Profile(id) ON DELETE CASCADE,
  FOREIGN KEY (company_id) REFERENCES Company(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
