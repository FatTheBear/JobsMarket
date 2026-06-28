const db = require('./src/config/db');

const seedDatabase = async () => {
    try {
        const [rows] = await db.query('SELECT COUNT(*) as count FROM industry_category');
        
        if (rows[0].count > 0) {
            console.log('Database already seeded. Skipping...');
            process.exit(0);
        }

        console.log('Initializing default database values...');

        const insertCategories = `
            INSERT IGNORE INTO industry_category (id, name) VALUES
            (1, 'Information Technology & Software'),
            (2, 'Finance, Banking & Insurance'),
            (3, 'Healthcare, Medical & Pharmacy'),
            (4, 'Education & Training'),
            (5, 'Marketing, PR & Advertising'),
            (6, 'Engineering & Construction'),
            (7, 'Sales, Retail & FMCG'),
            (8, 'Human Resources & Recruitment'),
            (9, 'Design, Arts & Media'),
            (10, 'Logistics, Supply Chain & Transportation'),
            (11, 'Hospitality, Tourism & F&B'),
            (12, 'Manufacturing & Production'),
            (13, 'Agriculture, Forestry & Fishing'),
            (14, 'Energy, Utilities & Environment'),
            (15, 'Legal & Compliance'),
            (16, 'Real Estate & Property'),
            (17, 'Telecommunications'),
            (18, 'Accounting & Auditing'),
            (19, 'Public Sector & NGO'),
            (20, 'Consulting & Strategy');
        `;
        await db.query(insertCategories);

        const insertIndustries = `
            INSERT IGNORE INTO industry (id, category_id, name) VALUES
            (1, 1, 'Software Development'), (2, 1, 'Data Science & AI'), (3, 1, 'Cyber Security'), (4, 1, 'IT Support & Admin'), (5, 1, 'Cloud Computing'),
            (6, 2, 'Retail Banking'), (7, 2, 'Investment Banking'), (8, 2, 'Life Insurance'), (9, 2, 'Financial Planning'), (10, 2, 'Risk Management'),
            (11, 3, 'Nursing & Care'), (12, 3, 'Pharmacy'), (13, 3, 'Healthcare Administration'), (14, 3, 'Medical Equipment'), (15, 3, 'Biotechnology'),
            (16, 4, 'Higher Education'), (17, 4, 'E-learning / EdTech'), (18, 4, 'Special Education'), (19, 4, 'Test Preparation'), (20, 4, 'Corporate Training'),
            (21, 5, 'Digital Marketing'), (22, 5, 'SEO / SEM'), (23, 5, 'Content Strategy'), (24, 5, 'Public Relations'), (25, 5, 'Event Management'),
            (26, 6, 'Civil Engineering'), (27, 6, 'Mechanical Engineering'), (28, 6, 'Electrical Engineering'), (29, 6, 'Automation / Robotics'), (30, 6, 'Architecture'),
            (31, 7, 'B2B Sales'), (32, 7, 'Retail Management'), (33, 7, 'E-commerce'), (34, 7, 'FMCG Distribution'), (35, 7, 'Telesales'),
            (36, 8, 'Talent Acquisition'), (37, 8, 'Compensation & Benefits'), (38, 8, 'Employee Relations'), (39, 8, 'Learning & Development'), (40, 8, 'HR Administration'),
            (41, 9, 'Graphic Design'), (42, 9, 'UI/UX Design'), (43, 9, 'Interior Design'), (44, 9, 'Fashion Design'), (45, 9, 'Video Production'),
            (46, 10, 'Supply Chain Management'), (47, 10, 'Warehousing'), (48, 10, 'Freight Forwarding'), (49, 10, 'Procurement'), (50, 10, 'Fleet Management'),
            (51, 11, 'Hotel Management'), (52, 11, 'Travel Agency'), (53, 11, 'Restaurant Management'), (54, 11, 'Culinary Arts'), (55, 11, 'Airlines & Aviation'),
            (56, 12, 'Automotive Manufacturing'), (57, 12, 'Textile & Garment'), (58, 12, 'Electronics Production'), (59, 12, 'Quality Control'), (60, 12, 'Industrial Maintenance'),
            (61, 13, 'Agronomy'), (62, 13, 'Livestock Farming'), (63, 13, 'Fishery & Aquaculture'), (64, 13, 'Agri-tech'), (65, 13, 'Forestry Management'),
            (66, 14, 'Renewable Energy'), (67, 14, 'Oil & Gas'), (68, 14, 'Waste Management'), (69, 14, 'Water Treatment'), (70, 14, 'Environmental Consulting'),
            (71, 15, 'Corporate Law'), (72, 15, 'Intellectual Property'), (73, 15, 'Labor Law'), (74, 15, 'Litigation'), (75, 15, 'Legal Drafting'),
            (76, 16, 'Property Management'), (77, 16, 'Real Estate Brokerage'), (78, 16, 'Real Estate Valuation'), (79, 16, 'Facility Management'), (80, 16, 'Property Development'),
            (81, 17, 'Network Infrastructure'), (82, 17, 'Wireless Communication'), (83, 17, 'Telecommunications Sales'), (84, 17, 'Satellite Operations'), (85, 17, 'Broadband Services'),
            (86, 18, 'Internal Auditing'), (87, 18, 'External Auditing'), (88, 18, 'Tax Advisory'), (89, 18, 'Forensic Accounting'), (90, 18, 'Bookkeeping'),
            (91, 19, 'Public Administration'), (92, 19, 'Community Outreach'), (93, 19, 'Fundraising'), (94, 19, 'Social Work'), (95, 19, 'Policy Analysis'),
            (96, 20, 'Management Consulting'), (97, 20, 'Business Transformation'), (98, 20, 'Market Research'), (99, 20, 'Financial Consulting'), (100, 20, 'Operations Strategy');
        `;
        await db.query(insertIndustries);

        const insertSkills = `
            INSERT IGNORE INTO skill (id, skill_name) VALUES
            (1, 'Python'), (2, 'JavaScript'), (3, 'SQL'), (4, 'ReactJS'), (5, 'Node.js'), (6, 'Docker'), (7, 'Kubernetes'), (8, 'AWS / Azure'),
            (9, 'Financial Modeling'), (10, 'Risk Assessment'), (11, 'Bloomberg Terminal'), (12, 'Valuation Models'),
            (13, 'Patient Care'), (14, 'Electronic Medical Records (EMR)'), (15, 'Clinical Research'), (16, 'CPR Certified'),
            (17, 'Curriculum Design'), (18, 'Instructional Design'), (19, 'Classroom Management'), (20, 'Moodle / LMS'),
            (21, 'SEO Optimization'), (22, 'Google Ads'), (23, 'Content Strategy'), (24, 'Brand Management'),
            (25, 'AutoCAD'), (26, 'Revit'), (27, 'Structural Analysis'), (28, 'MATLAB'),
            (29, 'B2B Sales'), (30, 'CRM Software (Salesforce)'), (31, 'Cold Calling'), (32, 'Contract Negotiation'),
            (33, 'Talent Acquisition'), (34, 'Payroll Processing'), (35, 'Employee Relations'), (36, 'KPI Tracking'),
            (37, 'Figma'), (38, 'Adobe Photoshop'), (39, 'Adobe Illustrator'), (40, 'Premiere Pro'),
            (41, 'Supply Chain Planning'), (42, 'SAP ERP'), (43, 'Inventory Management'), (44, 'Fleet Tracking'),
            (45, 'Event Planning'), (46, 'Culinary Arts'), (47, 'Guest Relations'), (48, 'Food Safety (HACCP)'),
            (49, 'Lean Six Sigma'), (50, 'Quality Control (QA/QC)'), (51, 'PLC Programming'), (52, '5S Methodology'),
            (53, 'Agronomy'), (54, 'Irrigation Management'), (55, 'Crop Science'), (56, 'Agribusiness Operations'),
            (57, 'Renewable Energy Systems'), (58, 'SCADA'), (59, 'Environmental Impact Assessment'), (60, 'Petroleum Engineering'),
            (61, 'Contract Drafting'), (62, 'Litigation Strategy'), (63, 'Intellectual Property Law'), (64, 'Regulatory Compliance'),
            (65, 'Property Management'), (66, 'Real Estate Law'), (67, 'Market Appraisal'), (68, 'Zoning Regulations'),
            (69, '5G Networks'), (70, 'Fiber Optics'), (71, 'VoIP Configurations'), (72, 'Network Routing (BGP/OSPF)'),
            (73, 'GAAP Principles'), (74, 'QuickBooks'), (75, 'Tax Preparation'), (76, 'IFRS Standards'),
            (77, 'Policy Analysis'), (78, 'Grant Writing'), (79, 'Community Outreach'), (80, 'Public Speaking'),
            (81, 'Data Analysis'), (82, 'Change Management'), (83, 'Strategic Planning'), (84, 'Market Research'),
            (85, 'Agile/Scrum'), (86, 'Project Management (PMP)'), (87, 'Cyber Threat Analysis'), (88, 'Customer Service'),
            (89, 'Digital Transformation'), (90, 'Machine Learning Algorithms'), (91, 'Power BI / Tableau'), (92, 'Copywriting'),
            (93, 'Supply Chain Optimization'), (94, 'Mechanical Troubleshooting'), (95, 'E-commerce Management'), (96, 'Organizational Development'),
            (97, '3D Modeling'), (98, 'Procurement Strategies'), (99, 'Quality Assurance'), (100, 'Operations Strategy');
        `;
        await db.query(insertSkills);

        const insertTitles = `
            INSERT IGNORE INTO job_title_dictionary (title) VALUES 
            ('Data Analyst'), ('Data Engineer'), ('Data Scientist'), ('Database Administrator'), ('Machine Learning Engineer'),
            ('Frontend Developer'), ('Backend Developer'), ('Full Stack Developer'), ('DevOps Engineer'), ('System Administrator'),
            ('Digital Marketing Executive'), ('SEO Specialist'), ('Content Writer'), ('Marketing Manager'), ('Brand Manager'),
            ('Financial Analyst'), ('Chief Financial Officer'), ('Investment Banker'), ('Accountant'), ('Auditor'),
            ('HR Manager'), ('Technical Recruiter'), ('Training Coordinator'), ('UI/UX Designer'), ('Graphic Designer'),
            ('Project Manager'), ('Business Analyst'), ('Scrum Master'), ('Sales Executive'), ('Account Manager'),
            ('Supply Chain Manager'), ('Logistics Coordinator'), ('Civil Engineer'), ('Mechanical Engineer'), ('Registered Nurse'),
            ('Hotel Manager'), ('Chef'), ('Tour Guide'), ('Quality Assurance Inspector'), ('Production Supervisor'),
            ('Operations Manager'), ('Chief Executive Officer'), ('Chief Technology Officer'), ('Legal Advisor'), ('Customer Success Manager'),
            ('iOS Developer'), ('Android Developer'), ('Flutter Developer'), ('Game Developer'), ('Blockchain Engineer'),
            ('Copywriter'), ('Social Media Specialist'), ('Public Relations Manager'), ('Event Coordinator'), ('Art Director'),
            ('Network Engineer'), ('IT Support Specialist'), ('Cyber Security Analyst'), ('Penetration Tester'), ('Cloud Architect'),
            ('Investment Analyst'), ('Wealth Advisor'), ('Risk Manager'), ('Actuary'), ('Loan Officer'),
            ('Pharmacist'), ('Medical Officer'), ('Clinical Researcher'), ('Dentist'), ('Surgeon'),
            ('University Lecturer'), ('Curriculum Developer'), ('Special Education Teacher'), ('Admissions Counselor'), ('School Principal'),
            ('Real Estate Agent'), ('Property Manager'), ('Urban Planner'), ('Appraiser'), ('Leasing Consultant'),
            ('Corporate Lawyer'), ('Paralegal'), ('Compliance Officer'), ('Patent Attorney'), ('Legal Assistant'),
            ('Agronomist'), ('Farm Manager'), ('Forest Ranger'), ('Agricultural Engineer'), ('Veterinarian'),
            ('Electrical Engineer'), ('Solar Technician'), ('Environmental Scientist'), ('Petroleum Engineer'), ('Safety Inspector');
        `;
        await db.query(insertTitles);

        const insertIndustrySkillMapping = `
            -- 1. IT & Software (Cat 1) -> Skills: 1-8 (Dev, Cloud), 87 (Cyber), 90 (ML)
            INSERT IGNORE INTO industry_skill (industry_id, skill_id)
            SELECT i.id, s.id FROM industry i JOIN skill s WHERE i.category_id = 1 AND s.id IN (1, 2, 3, 4, 5, 6, 7, 8, 87, 90);

            -- 2. Finance & Accounting (Cat 2, 18) -> Skills: 9-12 (Finance), 73-76 (Accounting)
            INSERT IGNORE INTO industry_skill (industry_id, skill_id)
            SELECT i.id, s.id FROM industry i JOIN skill s WHERE i.category_id IN (2, 18) AND s.id IN (9, 10, 11, 12, 73, 74, 75, 76);

            -- 3. Healthcare (Cat 3) -> Skills: 13-16
            INSERT IGNORE INTO industry_skill (industry_id, skill_id)
            SELECT i.id, s.id FROM industry i JOIN skill s WHERE i.category_id = 3 AND s.id BETWEEN 13 AND 16;

            -- 4. Education (Cat 4) -> Skills: 17-20
            INSERT IGNORE INTO industry_skill (industry_id, skill_id)
            SELECT i.id, s.id FROM industry i JOIN skill s WHERE i.category_id = 4 AND s.id BETWEEN 17 AND 20;

            -- 5. Marketing & Design (Cat 5, 9) -> Skills: 21-24 (Mkt), 37-40 (Design), 92 (Copywriting)
            INSERT IGNORE INTO industry_skill (industry_id, skill_id)
            SELECT i.id, s.id FROM industry i JOIN skill s WHERE i.category_id IN (5, 9) AND s.id IN (21, 22, 23, 24, 37, 38, 39, 40, 92);

            -- 6. Engineering & Construction (Cat 6) -> Skills: 25-28, 97 (3D Modeling)
            INSERT IGNORE INTO industry_skill (industry_id, skill_id)
            SELECT i.id, s.id FROM industry i JOIN skill s WHERE i.category_id = 6 AND s.id IN (25, 26, 27, 28, 97);

            -- 7. Sales, Retail & FMCG (Cat 7) -> Skills: 29-32, 95 (E-commerce)
            INSERT IGNORE INTO industry_skill (industry_id, skill_id)
            SELECT i.id, s.id FROM industry i JOIN skill s WHERE i.category_id = 7 AND s.id IN (29, 30, 31, 32, 95);

            -- 8. Human Resources (Cat 8) -> Skills: 33-36, 96 (Org Dev)
            INSERT IGNORE INTO industry_skill (industry_id, skill_id)
            SELECT i.id, s.id FROM industry i JOIN skill s WHERE i.category_id = 8 AND s.id IN (33, 34, 35, 36, 96);

            -- 9. Logistics & Supply Chain (Cat 10) -> Skills: 41-44, 93, 98
            INSERT IGNORE INTO industry_skill (industry_id, skill_id)
            SELECT i.id, s.id FROM industry i JOIN skill s WHERE i.category_id = 10 AND s.id IN (41, 42, 43, 44, 93, 98);

            -- 10. Hospitality (Cat 11) -> Skills: 45-48
            INSERT IGNORE INTO industry_skill (industry_id, skill_id)
            SELECT i.id, s.id FROM industry i JOIN skill s WHERE i.category_id = 11 AND s.id BETWEEN 45 AND 48;

            -- 11. Manufacturing (Cat 12) -> Skills: 49-52, 94 (Troubleshooting), 99 (QA)
            INSERT IGNORE INTO industry_skill (industry_id, skill_id)
            SELECT i.id, s.id FROM industry i JOIN skill s WHERE i.category_id = 12 AND s.id IN (49, 50, 51, 52, 94, 99);

            -- 12. Agriculture (Cat 13) -> Skills: 53-56
            INSERT IGNORE INTO industry_skill (industry_id, skill_id)
            SELECT i.id, s.id FROM industry i JOIN skill s WHERE i.category_id = 13 AND s.id BETWEEN 53 AND 56;

            -- 13. Energy & Utilities (Cat 14) -> Skills: 57-60
            INSERT IGNORE INTO industry_skill (industry_id, skill_id)
            SELECT i.id, s.id FROM industry i JOIN skill s WHERE i.category_id = 14 AND s.id BETWEEN 57 AND 60;

            -- 14. Legal (Cat 15) -> Skills: 61-64
            INSERT IGNORE INTO industry_skill (industry_id, skill_id)
            SELECT i.id, s.id FROM industry i JOIN skill s WHERE i.category_id = 15 AND s.id BETWEEN 61 AND 64;

            -- 15. Real Estate (Cat 16) -> Skills: 65-68
            INSERT IGNORE INTO industry_skill (industry_id, skill_id)
            SELECT i.id, s.id FROM industry i JOIN skill s WHERE i.category_id = 16 AND s.id BETWEEN 65 AND 68;

            -- 16. Telecommunications (Cat 17) -> Skills: 69-72
            INSERT IGNORE INTO industry_skill (industry_id, skill_id)
            SELECT i.id, s.id FROM industry i JOIN skill s WHERE i.category_id = 17 AND s.id BETWEEN 69 AND 72;

            -- 17. Public Sector (Cat 19) -> Skills: 77-80
            INSERT IGNORE INTO industry_skill (industry_id, skill_id)
            SELECT i.id, s.id FROM industry i JOIN skill s WHERE i.category_id = 19 AND s.id BETWEEN 77 AND 80;

            -- 18. Consulting (Cat 20) -> Skills: 81-84, 100
            INSERT IGNORE INTO industry_skill (industry_id, skill_id)
            SELECT i.id, s.id FROM industry i JOIN skill s WHERE i.category_id = 20 AND s.id IN (81, 82, 83, 84, 100);

            
            INSERT IGNORE INTO industry_skill (industry_id, skill_id)
            SELECT i.id, s.id FROM industry i CROSS JOIN skill s WHERE s.id IN (81, 85, 86, 88, 89);
        `;

        
        const mappingQueries = insertIndustrySkillMapping.split(';').filter(q => q.trim().length > 0);
        for (let q of mappingQueries) {
            await db.query(q);
        }

        console.log('Default database seeding completed successfully!');
    } catch (error) {
        console.error('Database seeding failed:', error);
    }
};

seedDatabase();