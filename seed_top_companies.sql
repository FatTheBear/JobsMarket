-- Seed data for the User Dashboard "Top Companies" section.
-- Demo company accounts all use password: Company@123

INSERT INTO `Industry` (`name`) VALUES
('Information Technology'),
('Finance - Banking'),
('Retail - E-commerce'),
('Logistics - Transportation'),
('Artificial Intelligence')
ON DUPLICATE KEY UPDATE `name` = VALUES(`name`);

INSERT INTO `User` (`email`, `password_hash`, `role`, `status`) VALUES
('hr.fpt@jobsmarket.demo', '$2b$10$FKGELWQC05p8aECQmhPpeu5OmPK9oT/YpWvq89s3Y.Pz8TvDMjOfS', 'HR', 'Active'),
('hr.vng@jobsmarket.demo', '$2b$10$FKGELWQC05p8aECQmhPpeu5OmPK9oT/YpWvq89s3Y.Pz8TvDMjOfS', 'HR', 'Active'),
('hr.momo@jobsmarket.demo', '$2b$10$FKGELWQC05p8aECQmhPpeu5OmPK9oT/YpWvq89s3Y.Pz8TvDMjOfS', 'HR', 'Active'),
('hr.shopee@jobsmarket.demo', '$2b$10$FKGELWQC05p8aECQmhPpeu5OmPK9oT/YpWvq89s3Y.Pz8TvDMjOfS', 'HR', 'Active'),
('hr.grab@jobsmarket.demo', '$2b$10$FKGELWQC05p8aECQmhPpeu5OmPK9oT/YpWvq89s3Y.Pz8TvDMjOfS', 'HR', 'Active')
ON DUPLICATE KEY UPDATE `status` = 'Active';

INSERT INTO `Company` (`hr_id`, `industry_id`, `name`, `logo_url`, `website`, `address`)
SELECT u.id, i.id, 'FPT Software', '/icons/emp_fpt.png', 'https://fptsoftware.com', 'Ho Chi Minh City'
FROM `User` u JOIN `Industry` i ON i.name = 'Information Technology'
WHERE u.email = 'hr.fpt@jobsmarket.demo'
ON DUPLICATE KEY UPDATE `industry_id` = VALUES(`industry_id`), `name` = VALUES(`name`), `logo_url` = VALUES(`logo_url`), `website` = VALUES(`website`), `address` = VALUES(`address`);

INSERT INTO `Company` (`hr_id`, `industry_id`, `name`, `logo_url`, `website`, `address`)
SELECT u.id, i.id, 'VNG Corporation', '/icons/emp_vng.png', 'https://vng.com.vn', 'Ho Chi Minh City'
FROM `User` u JOIN `Industry` i ON i.name = 'Information Technology'
WHERE u.email = 'hr.vng@jobsmarket.demo'
ON DUPLICATE KEY UPDATE `industry_id` = VALUES(`industry_id`), `name` = VALUES(`name`), `logo_url` = VALUES(`logo_url`), `website` = VALUES(`website`), `address` = VALUES(`address`);

INSERT INTO `Company` (`hr_id`, `industry_id`, `name`, `logo_url`, `website`, `address`)
SELECT u.id, i.id, 'MoMo', '/icons/emp_momo.png', 'https://momo.vn', 'Ho Chi Minh City'
FROM `User` u JOIN `Industry` i ON i.name = 'Finance - Banking'
WHERE u.email = 'hr.momo@jobsmarket.demo'
ON DUPLICATE KEY UPDATE `industry_id` = VALUES(`industry_id`), `name` = VALUES(`name`), `logo_url` = VALUES(`logo_url`), `website` = VALUES(`website`), `address` = VALUES(`address`);

INSERT INTO `Company` (`hr_id`, `industry_id`, `name`, `logo_url`, `website`, `address`)
SELECT u.id, i.id, 'Shopee Vietnam', '/icons/emp_shopee.png', 'https://careers.shopee.vn', 'Ho Chi Minh City'
FROM `User` u JOIN `Industry` i ON i.name = 'Retail - E-commerce'
WHERE u.email = 'hr.shopee@jobsmarket.demo'
ON DUPLICATE KEY UPDATE `industry_id` = VALUES(`industry_id`), `name` = VALUES(`name`), `logo_url` = VALUES(`logo_url`), `website` = VALUES(`website`), `address` = VALUES(`address`);

INSERT INTO `Company` (`hr_id`, `industry_id`, `name`, `logo_url`, `website`, `address`)
SELECT u.id, i.id, 'Grab Vietnam', '/icons/emp_grab.png', 'https://www.grab.com/vn', 'Ho Chi Minh City'
FROM `User` u JOIN `Industry` i ON i.name = 'Logistics - Transportation'
WHERE u.email = 'hr.grab@jobsmarket.demo'
ON DUPLICATE KEY UPDATE `industry_id` = VALUES(`industry_id`), `name` = VALUES(`name`), `logo_url` = VALUES(`logo_url`), `website` = VALUES(`website`), `address` = VALUES(`address`);

INSERT INTO `Job_Posting` (`company_id`, `hr_id`, `title`, `description`, `requirements`, `salary_min`, `salary_max`, `job_type`, `status`, `deadline`)
SELECT c.id, c.hr_id, 'Frontend Developer', 'Build responsive web interfaces for enterprise products.', 'React, JavaScript, HTML, CSS, REST API experience.', 18000000, 30000000, 'Full-time', 'Approved', DATE_ADD(CURDATE(), INTERVAL 30 DAY)
FROM `Company` c WHERE c.name = 'FPT Software'
AND NOT EXISTS (SELECT 1 FROM `Job_Posting` jp WHERE jp.company_id = c.id AND jp.title = 'Frontend Developer');

INSERT INTO `Job_Posting` (`company_id`, `hr_id`, `title`, `description`, `requirements`, `salary_min`, `salary_max`, `job_type`, `status`, `deadline`)
SELECT c.id, c.hr_id, 'Backend Engineer', 'Develop scalable backend services for digital entertainment platforms.', 'Node.js, SQL, API design, system performance optimization.', 22000000, 38000000, 'Full-time', 'Approved', DATE_ADD(CURDATE(), INTERVAL 30 DAY)
FROM `Company` c WHERE c.name = 'VNG Corporation'
AND NOT EXISTS (SELECT 1 FROM `Job_Posting` jp WHERE jp.company_id = c.id AND jp.title = 'Backend Engineer');

INSERT INTO `Job_Posting` (`company_id`, `hr_id`, `title`, `description`, `requirements`, `salary_min`, `salary_max`, `job_type`, `status`, `deadline`)
SELECT c.id, c.hr_id, 'Product Analyst', 'Analyze product metrics and recommend improvements for payment features.', 'SQL, dashboards, product thinking, communication skills.', 18000000, 32000000, 'Full-time', 'Approved', DATE_ADD(CURDATE(), INTERVAL 30 DAY)
FROM `Company` c WHERE c.name = 'MoMo'
AND NOT EXISTS (SELECT 1 FROM `Job_Posting` jp WHERE jp.company_id = c.id AND jp.title = 'Product Analyst');

INSERT INTO `Job_Posting` (`company_id`, `hr_id`, `title`, `description`, `requirements`, `salary_min`, `salary_max`, `job_type`, `status`, `deadline`)
SELECT c.id, c.hr_id, 'E-commerce Operations Specialist', 'Coordinate campaign operations and improve seller/customer experience.', 'E-commerce operations, Excel, stakeholder coordination.', 14000000, 24000000, 'Full-time', 'Approved', DATE_ADD(CURDATE(), INTERVAL 30 DAY)
FROM `Company` c WHERE c.name = 'Shopee Vietnam'
AND NOT EXISTS (SELECT 1 FROM `Job_Posting` jp WHERE jp.company_id = c.id AND jp.title = 'E-commerce Operations Specialist');

INSERT INTO `Job_Posting` (`company_id`, `hr_id`, `title`, `description`, `requirements`, `salary_min`, `salary_max`, `job_type`, `status`, `deadline`)
SELECT c.id, c.hr_id, 'Data Analyst', 'Turn mobility and delivery data into actionable business insights.', 'SQL, data visualization, analytics mindset, Python is a plus.', 17000000, 29000000, 'Full-time', 'Approved', DATE_ADD(CURDATE(), INTERVAL 30 DAY)
FROM `Company` c WHERE c.name = 'Grab Vietnam'
AND NOT EXISTS (SELECT 1 FROM `Job_Posting` jp WHERE jp.company_id = c.id AND jp.title = 'Data Analyst');
