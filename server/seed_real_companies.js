/**
 * Seed Real Vietnamese Companies
 * This script seeds the database with real Vietnamese companies
 * All data is collected from public sources
 */

const pool = require('./src/config/db');

async function seedRealCompanies() {
  try {
    console.log('Seeding real Vietnamese companies...\n');

    // Real Vietnamese companies data
    const companies = [
      {
        name: 'FPT Software',
        industry_name: 'Information Technology',
        website: 'https://www.fpt-software.com',
        address: 'FPT Tower, 72A Ngo Gia Tu, District 10, Ho Chi Minh City',
        logo_url: 'https://upload.wikimedia.org/wikipedia/en/5/5f/FPT_Software_logo.svg',
        cover_image_url: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=1200&h=400&fit=crop',
        company_bio: 'FPT Software is a leading software development company based in Vietnam with global presence. We deliver innovative software solutions to enterprises worldwide across various industry including automotive, healthcare, and telecommunications. With over 20,000 employees globally, we provide software engineering, AI/ML solutions, cloud services, and digital transformation services.'
      },
      {
        name: 'Techcombank',
        industry_name: 'Finance - Banking',
        website: 'https://www.techcombank.com.vn',
        address: 'Techcombank Tower, 1 Ngo Tat To, Ba Dinh District, Hanoi',
        logo_url: 'https://upload.wikimedia.org/wikipedia/vi/5/51/Techcombank_logo.png',
        cover_image_url: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=1200&h=400&fit=crop',
        company_bio: 'Techcombank is one of Vietnam\'s leading private commercial banks. We provide comprehensive banking services including retail banking, corporate banking, investment banking, and digital financial services. Our mission is to deliver world-class financial solutions and exceptional customer service to millions of customers across Vietnam and Southeast Asia.'
      },
      {
        name: 'Viettel',
        industry_name: 'Telecommunications',
        website: 'https://www.viettel.com.vn',
        address: 'Viettel Tower, 235 Cau Giay Street, Hanoi',
        logo_url: 'https://upload.wikimedia.org/wikipedia/en/7/71/Viettel_logo.svg',
        cover_image_url: 'https://images.unsplash.com/photo-1516387938699-c61bc432180b?w=1200&h=400&fit=crop',
        company_bio: 'Viettel is Vietnam\'s largest telecommunications company with over 100 million customers across Vietnam, Cambodia, Laos, and East Timor. We provide mobile services, fixed broadband, satellite communications, and digital transformation solutions. As a pioneer in 5G technology in Southeast Asia, we continue to innovate to connect millions of people globally.'
      },
      {
        name: 'Vingroup',
        industry_name: 'Retail - Commerce',
        website: 'https://www.vingroup.net',
        address: 'Vincom Mega Mall, 241 De La Thanh, Dong Da District, Hanoi',
        logo_url: 'https://upload.wikimedia.org/wikipedia/commons/3/3f/Vingroup_logo.svg',
        cover_image_url: 'https://images.unsplash.com/photo-1454496522488-7a8e488e8606?w=1200&h=400&fit=crop',
        company_bio: 'Vingroup is Vietnam\'s leading conglomerate with diverse business operations in retail, real estate, healthcare, education, and technology. We operate VinMart supermarkets, VinMart+ convenience stores, and develop premium residential and commercial properties. With a vision to improve Vietnamese quality of life, we employ over 50,000 people across our ecosystem.'
      },
      {
        name: 'Samsung Vietnam',
        industry_name: 'Manufacturing',
        website: 'https://www.samsung.com/vn',
        address: 'Samsung Electronics Vietnam Factory, Yen Phong District, Bac Ninh Province',
        logo_url: 'https://upload.wikimedia.org/wikipedia/commons/2/24/Samsung_Logo.svg',
        cover_image_url: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=1200&h=400&fit=crop',
        company_bio: 'Samsung Electronics Vietnam is the manufacturing hub for Samsung in Southeast Asia. We produce mobile phones, semiconductors, displays, and consumer electronics for global markets. Our state-of-the-art facilities in Yen Phong employ over 100,000 workers and represent significant investment in Vietnam\'s manufacturing sector, contributing to the nation\'s economic development.'
      },
      {
        name: 'Grab',
        industry_name: 'Information Technology',
        website: 'https://www.grab.com',
        address: 'Grab Vietnam HQ, District 1, Ho Chi Minh City',
        logo_url: 'https://upload.wikimedia.org/wikipedia/commons/2/2a/Grab_logo_%282022%29.svg',
        cover_image_url: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=1200&h=400&fit=crop',
        company_bio: 'Grab is Southeast Asia\'s leading super app providing ride-hailing, food delivery, payments, and logistics services. Operating across Vietnam, we connect millions of users with thousands of drivers and merchants. Our mission is to drive Southeast Asia forward by creating economic empowerment for partners and convenience for our users through cutting-edge technology.'
      },
      {
        name: 'HSBC Vietnam',
        industry_name: 'Finance - Banking',
        website: 'https://www.hsbc.com.vn',
        address: 'HSBC Tower, District 1, Ho Chi Minh City',
        logo_url: 'https://upload.wikimedia.org/wikipedia/commons/f/ff/HSBC_logo.svg',
        cover_image_url: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=1200&h=400&fit=crop',
        company_bio: 'HSBC Vietnam is a subsidiary of HSBC Holdings, the world\'s leading international bank. We provide comprehensive financial services to corporations, institutions, and individuals across Vietnam. Our services include corporate banking, trade financing, wealth management, and investment services, serving as a bridge between Vietnam and global markets.'
      },
      {
        name: 'Unilever Vietnam',
        industry_name: 'Manufacturing',
        website: 'https://www.unilever.com.vn',
        address: 'Unilever Factory, Industrial Park, Binh Duong Province',
        logo_url: 'https://upload.wikimedia.org/wikipedia/commons/c/ca/Unilever.svg',
        cover_image_url: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=1200&h=400&fit=crop',
        company_bio: 'Unilever Vietnam manufactures and distributes leading consumer brands in personal care, home care, and foods. Our products reach millions of Vietnamese consumers daily. We are committed to sustainable business practices and social responsibility, contributing to community development and environmental conservation across Vietnam.'
      },
      {
        name: 'Shopee Vietnam',
        industry_name: 'E-commerce',
        website: 'https://www.shopee.vn',
        address: 'Shopee Vietnam Office, District 7, Ho Chi Minh City',
        logo_url: 'https://upload.wikimedia.org/wikipedia/commons/0/0e/Shopee_logo.svg',
        cover_image_url: 'https://images.unsplash.com/photo-1460925895917-adf4e565db1d?w=1200&h=400&fit=crop',
        company_bio: 'Shopee is Southeast Asia\'s leading e-commerce platform, connecting sellers and buyers across Vietnam. We provide a trusted marketplace for millions of products and serve millions of customers. Our mission is to democratize commerce in Southeast Asia by empowering small businesses and providing consumers with quality products and exceptional service.'
      },
      {
        name: 'Spotify Vietnam',
        industry_name: 'Information Technology',
        website: 'https://www.spotify.com',
        address: 'Spotify Regional Office, Ho Chi Minh City',
        logo_url: 'https://upload.wikimedia.org/wikipedia/commons/7/74/Spotify_App_Logo.svg',
        cover_image_url: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=1200&h=400&fit=crop',
        company_bio: 'Spotify Vietnam team supports music streaming services for millions of Vietnamese users. We are the world\'s leading music streaming platform with over 500 million users globally. Our mission is to make music accessible and affordable for everyone while providing artists a sustainable income stream.'
      }
    ];

    // Get industry IDs
    console.log('Fetching industry IDs...');
    const [industry] = await pool.query('SELECT id, name FROM Industry');
    const industryMap = {};
    industry.forEach(ind => {
      industryMap[ind.name.toLowerCase()] = ind.id;
    });

    // Create test HR users and companies
    console.log('Creating HR users and companies...\n');

    for (let i = 0; i < companies.length; i++) {
      const companyData = companies[i];
      const hrEmail = `hr_${companyData.name.toLowerCase().replace(/\s+/g, '_')}@company.vn`;
      const industryId = industryMap[companyData.industry_name.toLowerCase()] || 1;

      try {
        // Check if HR user already exists
        const [existingUser] = await pool.query('SELECT id FROM User WHERE email = ?', [hrEmail]);
        
        let hrId;
        if (existingUser.length > 0) {
          hrId = existingUser[0].id;
          console.log(`✓ HR user already exists: ${hrEmail}`);
        } else {
          // Create HR user
          const bcrypt = require('bcrypt');
          const passwordHash = await bcrypt.hash('password123', 10);
          
          const [userResult] = await pool.query(
            'INSERT INTO User (email, password_hash, role, status) VALUES (?, ?, ?, ?)',
            [hrEmail, passwordHash, 'HR', 'Active']
          );
          hrId = userResult.insertId;
          console.log(`✓ Created HR user: ${hrEmail}`);
        }

        // Check if company already exists
        const [existingCompany] = await pool.query(
          'SELECT id FROM Company WHERE hr_id = ?',
          [hrId]
        );

        if (existingCompany.length > 0) {
          console.log(`✓ Company already exists: ${companyData.name}`);
          continue;
        }

        // Create/Update company
        const [companyResult] = await pool.query(
          `INSERT INTO Company (hr_id, industry_id, name, logo_url, website, address, company_bio, cover_image_url)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            hrId,
            industryId,
            companyData.name,
            companyData.logo_url,
            companyData.website,
            companyData.address,
            companyData.company_bio,
            companyData.cover_image_url
          ]
        );

        const companyId = companyResult.insertId;
        console.log(`✓ Created company: ${companyData.name} (ID: ${companyId})`);

        // Seed sample jobs for each company
        await seedSampleJobs(pool, companyId, hrId, companyData.name);

      } catch (error) {
        console.error(`✗ Error processing ${companyData.name}:`, error.message);
      }
    }

    console.log('\n✓ Company seeding completed successfully!');

  } catch (error) {
    console.error('Error seeding companies:', error);
  }
}

async function seedSampleJobs(pool, companyId, hrId, companyName) {
  const sampleJobs = [
    {
      title: `Senior Full-Stack Developer at ${companyName}`,
      description: 'We are looking for an experienced Full-Stack Developer to join our team. You will work on challenging projects using modern technologies and best practices.',
      requirements: 'Minimum 3 years experience with React/Node.js, MySQL, RESTful APIs, and Agile development methodology.',
      salary_min: 30000000,
      salary_max: 50000000,
      job_type: 'Full-time',
      location: 'Ho Chi Minh City'
    },
    {
      title: `Frontend Developer at ${companyName}`,
      description: 'Join our frontend team to build amazing user interfaces. We use cutting-edge technologies and focus on user experience.',
      requirements: 'Experience with React, TypeScript, CSS, and responsive design. Good understanding of web performance optimization.',
      salary_min: 20000000,
      salary_max: 35000000,
      job_type: 'Full-time',
      location: 'Ho Chi Minh City'
    },
    {
      title: `DevOps Engineer at ${companyName}`,
      description: 'Build and maintain infrastructure for our cloud-based applications. Work with Docker, Kubernetes, and cloud platforms.',
      requirements: '2+ years with Docker, Kubernetes, AWS/GCP, Linux administration, and CI/CD pipelines.',
      salary_min: 25000000,
      salary_max: 45000000,
      job_type: 'Full-time',
      location: 'Hanoi'
    }
  ];

  for (const job of sampleJobs) {
    try {
      const [result] = await pool.query(
        `INSERT INTO Job_Posting 
         (company_id, hr_id, title, description, requirements, salary_min, salary_max, job_type, status)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          companyId,
          hrId,
          job.title,
          job.description,
          job.requirements,
          job.salary_min,
          job.salary_max,
          job.job_type,
          'Approved'
        ]
      );
      console.log(`  └─ Added job: ${job.title}`);
    } catch (error) {
      console.error(`  └─ Error adding job ${job.title}:`, error.message);
    }
  }
}

// Run seeding
seedRealCompanies().then(() => {
  pool.end();
  process.exit(0);
}).catch(error => {
  console.error('Fatal error:', error);
  pool.end();
  process.exit(1);
});
