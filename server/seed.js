/**
 * Database seed script
 * Run: node seed.js              → sample companies, candidates, news (idempotent)
 * Run: node seed.js --bulk       → additionally seed 180 random companies + 1080 jobs (only if company table empty)
 * All demo accounts password: Demo@123
 */
require('dotenv').config();
const bcrypt = require('bcryptjs');
const pool = require('./src/config/db');

const DEMO_PASSWORD = 'Demo@123';

const NEWS_CATEGORIES = [
  { name: 'Career Guide', description: 'In-depth articles for job seekers and career development' },
  { name: 'Hiring Insights', description: 'Recruiting strategies and hiring trends for employers' },
  { name: 'Career Tips', description: 'Advice for job seekers and career growth' },
  { name: 'Industry News', description: 'Latest hiring and market trends' },
  { name: 'Interview Guide', description: 'Prepare for technical and HR interviews' },
];

function thumb(seed, bg = '01796F') {
  return `https://picsum.photos/seed/${seed}/800/450`;
}

function companyCover(seed) {
  return `https://picsum.photos/seed/${seed}/1200/400`;
}

const SAMPLE_NEWS = [
  {
    category: 'Career Guide',
    title: 'How to Build a Resume That Gets Interviews in 2026',
    slug: 'career-guide-resume-that-gets-interviews',
    shortDescription: 'Recruiters spend less than 10 seconds on a first scan. Here is how to make every line count.',
    thumbnailUrl: thumb('career-resume-2026'),
    isFeatured: 1,
    content: `
      <p class="article-lead">Your resume is not a biography — it is a marketing document. In Vietnam's competitive tech and business job market, candidates who lead with outcomes rather than duties consistently land more interviews.</p>
      <h2>Start with a sharp professional summary</h2>
      <p>Open with two or three lines that state your role, years of experience, and strongest achievement. Avoid generic phrases like "hard-working team player." Instead, write: "Frontend Developer with 3 years building React apps used by 200K+ monthly users."</p>
      <h2>Quantify your impact</h2>
      <p>Hiring managers respond to numbers. Replace vague bullets with measurable results:</p>
      <ul>
        <li>Reduced page load time by 40% after refactoring legacy components</li>
        <li>Increased application completion rate by 18% through UX improvements</li>
        <li>Managed a team of 4 engineers across two product releases</li>
      </ul>
      <blockquote>"The best resumes answer one question: what changed because you were there?" — JobsMarket Career Team</blockquote>
      <h2>Tailor for each application</h2>
      <p>Mirror keywords from the job description — especially skills, tools, and role titles — so ATS systems and recruiters immediately see relevance. Keep the file to two pages maximum for mid-level roles.</p>
    `,
  },
  {
    category: 'Career Guide',
    title: 'Mastering Behavioral Interviews: The STAR Method Explained',
    slug: 'career-guide-star-method-interviews',
    shortDescription: 'Structure your answers with Situation, Task, Action, and Result to impress hiring panels.',
    thumbnailUrl: thumb('career-star-method'),
    isFeatured: 0,
    content: `
      <p class="article-lead">Behavioral questions — "Tell me about a time you handled conflict" — are designed to predict future performance. The STAR framework keeps your answers focused and credible.</p>
      <h2>Breaking down STAR</h2>
      <ul>
        <li><strong>Situation:</strong> Set the scene in one or two sentences</li>
        <li><strong>Task:</strong> Explain your responsibility</li>
        <li><strong>Action:</strong> Describe what you personally did</li>
        <li><strong>Result:</strong> Share the outcome with metrics when possible</li>
      </ul>
      <h2>Prepare five core stories</h2>
      <p>You do not need twenty rehearsed scripts. Prepare stories around leadership, conflict, failure, tight deadlines, and learning something new. Adapt them to different questions.</p>
      <h2>Common mistakes to avoid</h2>
      <p>Speaking in generalities ("we usually…"), blaming teammates, or ending without a result. Always bring the answer back to your contribution and what improved.</p>
    `,
  },
  {
    category: 'Career Guide',
    title: 'Switching Careers: From Non-Tech to Tech in Vietnam',
    slug: 'career-guide-switch-to-tech-vietnam',
    shortDescription: 'A practical roadmap for professionals pivoting into software, data, or product roles.',
    thumbnailUrl: thumb('career-switch-tech'),
    isFeatured: 0,
    content: `
      <p class="article-lead">Career switching is increasingly common as digital roles expand beyond traditional IT companies. Success depends on transferable skills, portfolio proof, and realistic entry points.</p>
      <h2>Identify your bridge skills</h2>
      <p>Teachers bring communication and structure. Accountants bring precision and data comfort. Marketers bring user empathy. Map these to target roles — business analyst, QA, UX, or junior developer.</p>
      <h2>Build visible proof</h2>
      <p>Complete two or three portfolio projects hosted on GitHub or a personal site. Bootcamp certificates help, but hiring managers weight demonstrated work more heavily for career changers.</p>
      <h2>Target the right level</h2>
      <p>Apply to intern, fresher, and junior roles openly. A step back in title is often the fastest path to a sustainable long-term career in tech.</p>
    `,
  },
  {
    category: 'Career Guide',
    title: 'Networking for Job Seekers: Beyond LinkedIn Messages',
    slug: 'career-guide-networking-job-seekers',
    shortDescription: 'Build genuine professional relationships at meetups, alumni events, and online communities.',
    thumbnailUrl: thumb('career-networking'),
    isFeatured: 0,
    content: `
      <p class="article-lead">Most opportunities still flow through people. Strategic networking is not about collecting contacts — it is about being helpful, visible, and specific about what you are looking for.</p>
      <h2>Show up consistently</h2>
      <p>Attend industry meetups, university alumni sessions, and online webinars in your target field. Follow up within 48 hours with a short, personal note referencing something specific from the conversation.</p>
      <h2>Offer value first</h2>
      <p>Share an article, introduce two people who should know each other, or volunteer on a community project. Reciprocity builds trust before you ever ask for a referral.</p>
    `,
  },
  {
    category: 'Hiring Insights',
    title: 'Writing Job Descriptions That Attract Top Talent',
    slug: 'hiring-insights-job-descriptions-that-convert',
    shortDescription: 'Clear titles, realistic requirements, and salary transparency improve applicant quality.',
    thumbnailUrl: thumb('hiring-job-descriptions', '0f766e'),
    isFeatured: 1,
    content: `
      <p class="article-lead">A vague job post attracts hundreds of irrelevant applications and hides your best candidates. Great job descriptions read like a pitch, not a wish list.</p>
      <h2>Use specific job titles</h2>
      <p>"IT Staff" tells candidates nothing. "Junior Backend Engineer (Node.js)" sets accurate expectations and improves search visibility on JobsMarket.</p>
      <h2>Separate must-haves from nice-to-haves</h2>
      <p>Long requirement lists discourage qualified applicants — especially women and career changers — from applying. List 5–7 core requirements and move the rest to a preferred section.</p>
      <h2>Describe the team and growth path</h2>
      <p>Top performers choose managers and missions, not just salary. Explain reporting structure, tech stack, and what success looks like in the first 90 days.</p>
      <blockquote>"If your job post sounds like it was written for a unicorn, you will wait a long time to find one." — JobsMarket HR Advisory</blockquote>
    `,
  },
  {
    category: 'Hiring Insights',
    title: 'Reducing Time-to-Hire Without Lowering the Bar',
    slug: 'hiring-insights-reduce-time-to-hire',
    shortDescription: 'Structured pipelines and clear stage owners help teams move faster with better decisions.',
    thumbnailUrl: thumb('hiring-time-to-hire', '0f766e'),
    isFeatured: 0,
    content: `
      <p class="article-lead">Slow hiring loses candidates to competitors. Fast hiring without structure leads to costly mis-hires. The goal is a repeatable pipeline with clear accountability.</p>
      <h2>Define stages and SLAs</h2>
      <p>Example: resume screen (2 days), phone screen (3 days), technical interview (5 days), offer (3 days). Assign an owner at each stage so applications never sit idle.</p>
      <h2>Batch interviews when possible</h2>
      <p>Coordinating multiple hiring managers for the same week reduces calendar friction and keeps candidates engaged while enthusiasm is high.</p>
      <h2>Collect structured feedback</h2>
      <p>Use a simple scorecard per competency. Gut feelings are harder to compare across interviewers and harder to defend when debriefing as a panel.</p>
    `,
  },
  {
    category: 'Hiring Insights',
    title: 'Employer Branding on JobsMarket: A Practical Playbook',
    slug: 'hiring-insights-employer-branding-playbook',
    shortDescription: 'Your company profile, media, and community presence shape how candidates perceive you.',
    thumbnailUrl: thumb('hiring-employer-brand', '0f766e'),
    isFeatured: 0,
    content: `
      <p class="article-lead">Candidates research your company before they apply. A complete JobsMarket profile — logo, culture description, photos, and active job posts — signals professionalism and stability.</p>
      <h2>Complete your company profile</h2>
      <p>Upload a clear logo, write a concise mission statement, and describe benefits honestly. Empty profiles create doubt about whether the company is actively hiring.</p>
      <h2>Share hiring updates in Career Hub</h2>
      <p>Post about team wins, office culture, and open roles. Consistent visibility keeps your brand top-of-mind when passive candidates are ready to move.</p>
    `,
  },
  {
    category: 'Hiring Insights',
    title: 'Salary Benchmarks for Tech Roles in Vietnam (2026)',
    slug: 'hiring-insights-salary-benchmarks-tech-2026',
    shortDescription: 'Reference ranges for junior to senior engineering, product, and data roles in major cities.',
    thumbnailUrl: thumb('hiring-salary-benchmarks', '0f766e'),
    isFeatured: 0,
    content: `
      <p class="article-lead">Competitive offers require market awareness. Below are indicative monthly gross ranges for Ho Chi Minh City and Hanoi tech hubs in 2026.</p>
      <h2>Software engineering</h2>
      <ul>
        <li><strong>Fresher / Junior:</strong> 12–22 million VND</li>
        <li><strong>Middle:</strong> 22–40 million VND</li>
        <li><strong>Senior:</strong> 40–70+ million VND</li>
      </ul>
      <h2>Product &amp; Data</h2>
      <ul>
        <li><strong>Product Analyst:</strong> 15–28 million VND</li>
        <li><strong>Data Analyst:</strong> 18–32 million VND</li>
      </ul>
      <p>Ranges vary by company size, English requirements, and hybrid/onsite expectations. Publishing a range on your job post increases application quality significantly.</p>
    `,
  },
  {
    category: 'Hiring Insights',
    title: 'Why Structured Interviews Beat Gut Feel',
    slug: 'hiring-insights-structured-interviews',
    shortDescription: 'Standardized questions and scorecards reduce bias and improve hiring consistency.',
    thumbnailUrl: thumb('hiring-structured-interviews', '0f766e'),
    isFeatured: 0,
    content: `
      <p class="article-lead">Unstructured interviews feel natural but produce inconsistent results. Structured interviews ask the same competency-based questions of every candidate and score answers against defined criteria.</p>
      <h2>Design competencies first</h2>
      <p>Before writing questions, list 4–6 competencies for the role: technical depth, communication, ownership, collaboration. Each interviewer evaluates assigned competencies.</p>
      <h2>Debrief with evidence</h2>
      <p>In panel debriefs, ask "what did they demonstrate?" rather than "did you like them?" Evidence-based discussion leads to fairer, more defensible decisions.</p>
    `,
  },
];

const SAMPLE_COMPANIES = [
  {
    email: 'hr.fpt@jobsmarket.demo',
    companyName: 'FPT Software',
    industryName: 'IT',
    logoUrl: 'https://ui-avatars.com/api/?name=FPT&background=01796F&color=fff&size=128',
    coverUrl: companyCover('company-fpt'),
    website: 'https://fptsoftware.com',
    address: 'Ho Chi Minh City',
    size: '1000+',
    description: 'Leading IT services and digital transformation company in Vietnam.',
    hrName: 'Lan Nguyen',
    jobs: [
      {
        title: 'Frontend Developer',
        description: 'Build responsive web interfaces for enterprise products.',
        requirements: 'React, JavaScript, HTML/CSS, REST API experience.',
        salaryMin: 18000000,
        salaryMax: 30000000,
        jobType: 'Full-time',
        jobLevel: 'Junior',
      },
      {
        title: 'QA Engineer',
        description: 'Design test cases and automate regression suites.',
        requirements: 'Manual testing, Selenium or Cypress basics, attention to detail.',
        salaryMin: 12000000,
        salaryMax: 22000000,
        jobType: 'Full-time',
        jobLevel: 'Fresher',
      },
    ],
  },
  {
    email: 'hr.vng@jobsmarket.demo',
    companyName: 'VNG Corporation',
    industryName: 'IT',
    logoUrl: 'https://ui-avatars.com/api/?name=VNG&background=2563eb&color=fff&size=128',
    coverUrl: companyCover('company-vng'),
    website: 'https://vng.com.vn',
    address: 'Ho Chi Minh City',
    size: '1000+',
    description: 'Technology conglomerate behind Zalo and popular digital entertainment products.',
    hrName: 'Minh Tran',
    jobs: [
      {
        title: 'Backend Engineer',
        description: 'Develop scalable backend services for digital platforms.',
        requirements: 'Node.js, SQL, API design, system performance optimization.',
        salaryMin: 22000000,
        salaryMax: 38000000,
        jobType: 'Full-time',
        jobLevel: 'Middle',
      },
    ],
  },
  {
    email: 'hr.momo@jobsmarket.demo',
    companyName: 'MoMo',
    industryName: 'Finance',
    logoUrl: 'https://ui-avatars.com/api/?name=MoMo&background=d946ef&color=fff&size=128',
    coverUrl: companyCover('company-momo'),
    website: 'https://momo.vn',
    address: 'Ho Chi Minh City',
    size: '500-1000',
    description: "Vietnam's leading digital wallet and financial services platform.",
    hrName: 'Hoa Le',
    jobs: [
      {
        title: 'Product Analyst',
        description: 'Analyze product metrics and recommend payment feature improvements.',
        requirements: 'SQL, dashboards, product thinking, communication skills.',
        salaryMin: 18000000,
        salaryMax: 32000000,
        jobType: 'Full-time',
        jobLevel: 'Junior',
      },
    ],
  },
  {
    email: 'hr.shopee@jobsmarket.demo',
    companyName: 'Shopee Vietnam',
    industryName: 'Marketing',
    logoUrl: 'https://ui-avatars.com/api/?name=Shopee&background=ea580c&color=fff&size=128',
    coverUrl: companyCover('company-shopee'),
    website: 'https://careers.shopee.vn',
    address: 'Ho Chi Minh City',
    size: '1000+',
    description: 'E-commerce leader connecting sellers and buyers across Southeast Asia.',
    hrName: 'Khanh Pham',
    jobs: [
      {
        title: 'E-commerce Operations Specialist',
        description: 'Coordinate campaigns and improve seller/customer experience.',
        requirements: 'E-commerce operations, Excel, stakeholder coordination.',
        salaryMin: 14000000,
        salaryMax: 24000000,
        jobType: 'Full-time',
        jobLevel: 'Junior',
      },
    ],
  },
  {
    email: 'hr.grab@jobsmarket.demo',
    companyName: 'Grab Vietnam',
    industryName: 'Marketing',
    logoUrl: 'https://ui-avatars.com/api/?name=Grab&background=16a34a&color=fff&size=128',
    coverUrl: companyCover('company-grab'),
    website: 'https://www.grab.com/vn',
    address: 'Ho Chi Minh City',
    size: '500-1000',
    description: 'Super-app for rides, deliveries, and financial services.',
    hrName: 'Duc Vo',
    jobs: [
      {
        title: 'Data Analyst',
        description: 'Turn mobility and delivery data into actionable business insights.',
        requirements: 'SQL, data visualization, analytics mindset, Python is a plus.',
        salaryMin: 17000000,
        salaryMax: 29000000,
        jobType: 'Full-time',
        jobLevel: 'Middle',
      },
    ],
  },
];

const SAMPLE_CANDIDATES = [
  {
    email: 'candidate.an@jobsmarket.demo',
    fullName: 'Nguyen Van An',
    phone: '0901234567',
    headline: 'Frontend Developer',
    birthday: '1999-05-15',
    address: 'District 1, Ho Chi Minh City',
    nationality: 'Vietnamese',
    skills: ['React', 'JavaScript', 'TypeScript', 'CSS'],
    education: { school: 'FPT University', degree: 'Software Engineering', gradDate: '2021-06' },
    experience: {
      company: 'Startup XYZ',
      role: 'Junior Frontend Developer',
      startDate: '2021-08',
      endDate: '2024-03',
      description: 'Built customer-facing dashboards with React and REST APIs.',
    },
  },
  {
    email: 'candidate.binh@jobsmarket.demo',
    fullName: 'Tran Thi Binh',
    phone: '0912345678',
    headline: 'Backend Engineer',
    birthday: '1998-11-20',
    address: 'Cau Giay, Hanoi',
    nationality: 'Vietnamese',
    skills: ['Node.js', 'Express', 'MySQL', 'Docker'],
    education: { school: 'HUST', degree: 'Computer Science', gradDate: '2020-06' },
    experience: {
      company: 'Tech Solutions JSC',
      role: 'Backend Developer',
      startDate: '2020-09',
      endDate: null,
      description: 'Designed REST APIs and optimized database queries for high-traffic services.',
    },
  },
  {
    email: 'candidate.cuong@jobsmarket.demo',
    fullName: 'Le Minh Cuong',
    phone: '0923456789',
    headline: 'Data Analyst',
    birthday: '2000-02-10',
    address: 'Hai Chau, Da Nang',
    nationality: 'Vietnamese',
    skills: ['SQL', 'Python', 'Power BI', 'Excel'],
    education: { school: 'University of Economics', degree: 'Business Analytics', gradDate: '2022-06' },
    experience: {
      company: 'Retail Analytics Co.',
      role: 'Data Analyst Intern',
      startDate: '2022-01',
      endDate: '2022-12',
      description: 'Created weekly sales dashboards and supported ad-hoc reporting requests.',
    },
  },
];

function deadlineInDays(days) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().split('T')[0];
}

async function getIndustryId(conn, name) {
  const [rows] = await conn.query('SELECT id FROM industry WHERE name = ? LIMIT 1', [name]);
  if (rows.length) return rows[0].id;
  const [result] = await conn.query('INSERT INTO industry (name) VALUES (?)', [name]);
  return result.insertId;
}

async function upsertUser(conn, email, role, passwordHash, status = 'Active') {
  const [rows] = await conn.query('SELECT id FROM user WHERE email = ?', [email]);
  if (rows.length) {
    await conn.query(
      'UPDATE user SET password_hash = ?, role = ?, status = ? WHERE id = ?',
      [passwordHash, role, status, rows[0].id]
    );
    return rows[0].id;
  }
  const [result] = await conn.query(
    'INSERT INTO user (email, password_hash, role, status) VALUES (?, ?, ?, ?)',
    [email, passwordHash, role, status]
  );
  return result.insertId;
}

async function upsertCompany(conn, hrId, industryId, data) {
  const [rows] = await conn.query('SELECT id FROM company WHERE hr_id = ? LIMIT 1', [hrId]);
  if (rows.length) {
    await conn.query(
      `UPDATE company SET industry_id = ?, name = ?, logo_url = ?, cover_image_url = ?, website = ?, address = ?,
       size = ?, description = ?, hr_name = ?, status = 'Active' WHERE id = ?`,
      [
        industryId, data.companyName, data.logoUrl, data.coverUrl || null, data.website, data.address,
        data.size, data.description, data.hrName, rows[0].id,
      ]
    );
    return rows[0].id;
  }
  const [result] = await conn.query(
    `INSERT INTO company (
      hr_id, industry_id, name, logo_url, cover_image_url, website, address, size, description, hr_name, status, pro_package
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Active', 'Free')`,
    [
      hrId, industryId, data.companyName, data.logoUrl, data.coverUrl || null, data.website,
      data.address, data.size, data.description, data.hrName,
    ]
  );
  return result.insertId;
}

async function upsertJob(conn, companyId, hrId, industryId, job) {
  const [existing] = await conn.query(
    'SELECT id FROM job_posting WHERE company_id = ? AND title = ? LIMIT 1',
    [companyId, job.title]
  );
  const deadline = deadlineInDays(30);
  const metadata = JSON.stringify({
    deadline,
    job_level: job.jobLevel,
    vacancies: '5',
    gender_req: 'Any',
  });

  if (existing.length) {
    await conn.query(
      `UPDATE job_posting SET description = ?, requirements = ?, salary_min = ?, salary_max = ?,
       job_type = ?, job_level = ?, status = 'Approved', loc = ?, deadline = ?, metadata = ?
       WHERE id = ?`,
      [
        job.description, job.requirements, job.salaryMin, job.salaryMax,
        job.jobType, job.jobLevel, 'Ho Chi Minh City', deadline, metadata, existing[0].id,
      ]
    );
    return existing[0].id;
  }

  const [result] = await conn.query(
    `INSERT INTO job_posting (
      company_id, hr_id, title, description, requirements, salary_min, salary_max,
      job_type, job_level, status, loc, deadline, metadata
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'Approved', ?, ?, ?)`,
    [
      companyId, hrId, job.title, job.description, job.requirements,
      job.salaryMin, job.salaryMax, job.jobType, job.jobLevel,
      'Ho Chi Minh City', deadline, metadata,
    ]
  );

  const jobId = result.insertId;
  await conn.query('INSERT IGNORE INTO job_industry (job_id, industry_id) VALUES (?, ?)', [jobId, industryId]);
  return jobId;
}

async function upsertCandidate(conn, passwordHash, candidate) {
  const userId = await upsertUser(conn, candidate.email, 'Candidate', passwordHash, 'Active');
  const skillsJson = JSON.stringify(candidate.skills);

  const [profileRows] = await conn.query('SELECT id FROM candidate_profile WHERE user_id = ? LIMIT 1', [userId]);
  let candidateId;

  if (profileRows.length) {
    candidateId = profileRows[0].id;
    await conn.query(
      `UPDATE candidate_profile SET full_name = ?, display_name = ?, phone = ?, headline = ?,
       birthday = ?, address = ?, nationality = ?, skills = ?, is_public = 1 WHERE id = ?`,
      [
        candidate.fullName, candidate.fullName, candidate.phone, candidate.headline,
        candidate.birthday, candidate.address, candidate.nationality, skillsJson, candidateId,
      ]
    );
  } else {
    const [result] = await conn.query(
      `INSERT INTO candidate_profile (
        user_id, full_name, display_name, phone, headline, birthday, address, nationality, skills, is_public
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1)`,
      [
        userId, candidate.fullName, candidate.fullName, candidate.phone,
        candidate.headline, candidate.birthday, candidate.address,
        candidate.nationality, skillsJson,
      ]
    );
    candidateId = result.insertId;
  }

  const [eduRows] = await conn.query('SELECT id FROM candidate_education WHERE candidate_id = ? LIMIT 1', [candidateId]);
  if (eduRows.length) {
    await conn.query(
      'UPDATE candidate_education SET school_name = ?, degree = ?, start_date = ?, end_date = ? WHERE id = ?',
      [candidate.education.school, candidate.education.degree, candidate.education.gradDate, candidate.education.gradDate, eduRows[0].id]
    );
  } else {
    await conn.query(
      'INSERT INTO candidate_education (candidate_id, school_name, degree, start_date, end_date) VALUES (?, ?, ?, ?, ?)',
      [candidateId, candidate.education.school, candidate.education.degree, candidate.education.gradDate, candidate.education.gradDate]
    );
  }

  const [expRows] = await conn.query('SELECT id FROM candidate_experience WHERE candidate_id = ? LIMIT 1', [candidateId]);
  if (expRows.length) {
    await conn.query(
      'UPDATE candidate_experience SET company_name = ?, role = ?, start_date = ?, end_date = ?, description = ? WHERE id = ?',
      [candidate.experience.company, candidate.experience.role, candidate.experience.startDate, candidate.experience.endDate, candidate.experience.description, expRows[0].id]
    );
  } else {
    await conn.query(
      'INSERT INTO candidate_experience (candidate_id, company_name, role, start_date, end_date, description) VALUES (?, ?, ?, ?, ?, ?)',
      [candidateId, candidate.experience.company, candidate.experience.role, candidate.experience.startDate, candidate.experience.endDate, candidate.experience.description]
    );
  }
}

async function upsertNewsCategory(conn, category) {
  const [rows] = await conn.query('SELECT id FROM news_category WHERE name = ? LIMIT 1', [category.name]);
  if (rows.length) return rows[0].id;
  const [result] = await conn.query('INSERT INTO news_category (name, description) VALUES (?, ?)', [category.name, category.description]);
  return result.insertId;
}

async function upsertNews(conn, adminId, categoryId, article) {
  const [rows] = await conn.query('SELECT id FROM news WHERE slug = ? LIMIT 1', [article.slug]);
  const thumbnail = article.thumbnailUrl
    || `https://ui-avatars.com/api/?name=${encodeURIComponent(article.title.slice(0, 2))}&background=01796F&color=fff&size=400`;
  const publishedAt = new Date();

  if (rows.length) {
    await conn.query(
      `UPDATE news SET admin_id = ?, category_id = ?, title = ?, thumbnail_url = ?,
       short_description = ?, content = ?, status = 'Published', is_featured = ?, published_at = ? WHERE id = ?`,
      [adminId, categoryId, article.title, thumbnail, article.shortDescription, article.content, article.isFeatured, publishedAt, rows[0].id]
    );
    return;
  }

  await conn.query(
    `INSERT INTO news (admin_id, category_id, title, slug, thumbnail_url, short_description, content, status, is_featured, published_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, 'Published', ?, ?)`,
    [adminId, categoryId, article.title, article.slug, thumbnail, article.shortDescription, article.content, article.isFeatured, publishedAt]
  );
}

async function seedSampleData(conn, passwordHash) {
  console.log('Seeding sample companies, candidates, and news...\n');

  const adminId = await upsertUser(conn, 'admin@jobsmarket.demo', 'Admin', passwordHash, 'Active');

  const categoryMap = {};
  for (const cat of NEWS_CATEGORIES) {
    categoryMap[cat.name] = await upsertNewsCategory(conn, cat);
  }

  for (const article of SAMPLE_NEWS) {
    await upsertNews(conn, adminId, categoryMap[article.category], article);
  }
  console.log(`News: ${SAMPLE_NEWS.length} articles, ${NEWS_CATEGORIES.length} categories`);

  let jobCount = 0;
  for (const company of SAMPLE_COMPANIES) {
    const hrId = await upsertUser(conn, company.email, 'HR', passwordHash, 'Active');
    const industryId = await getIndustryId(conn, company.industryName);
    const companyId = await upsertCompany(conn, hrId, industryId, company);
    for (const job of company.jobs) {
      await upsertJob(conn, companyId, hrId, industryId, job);
      jobCount++;
    }
  }
  console.log(`Companies: ${SAMPLE_COMPANIES.length}, Jobs: ${jobCount}`);

  for (const candidate of SAMPLE_CANDIDATES) {
    await upsertCandidate(conn, passwordHash, candidate);
  }
  console.log(`Candidates: ${SAMPLE_CANDIDATES.length}`);
}

async function seedBulkData(conn, passwordHash) {
  const [rows] = await conn.query('SELECT COUNT(*) AS count FROM company');
  if (rows[0].count > 0) {
    console.log('Bulk seed skipped — company table already has data.');
    return;
  }

  console.log('Seeding bulk random companies and jobs...');

  const hrId = await upsertUser(conn, 'bulk.hr@jobsmarket.demo', 'HR', passwordHash, 'Active');

  const locations = ['Ho Chi Minh City', 'Hanoi', 'Da Nang', 'Can Tho', 'Hai Phong'];
  const sizes = ['10-50', '50-100', '100-200', '200-500', '500-1000'];
  const jobTypes = ['Full-time', 'Part-time', 'Freelance'];
  const prefixes = ['Tech', 'Global', 'Smart', 'NextGen', 'Alpha', 'Prime', 'Apex', 'Nova', 'Core', 'Innova'];
  const suffixes = ['Solutions', 'Group', 'Inc', 'Corp', 'Enterprises', 'Holdings', 'Partners', 'Systems', 'Ventures'];

  let companyCount = 0;
  let jobCount = 0;

  for (let categoryId = 1; categoryId <= 30; categoryId++) {
    for (let i = 0; i < 6; i++) {
      const industryId = ((categoryId - 1) * 6) + i + 1;
      const companyName = `${prefixes[Math.floor(Math.random() * prefixes.length)]} ${suffixes[Math.floor(Math.random() * suffixes.length)]} ${companyCount + 1}`;
      const logoUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(companyName)}&background=random&color=fff&size=128`;
      const size = sizes[Math.floor(Math.random() * sizes.length)];
      const address = locations[Math.floor(Math.random() * locations.length)];
      const description = `We are ${companyName}, committed to excellence, innovation, and sustainable growth.`;

      const [companyResult] = await conn.query(
        `INSERT INTO company (hr_id, industry_id, name, size, logo_url, address, description, status, pro_package)
         VALUES (?, ?, ?, ?, ?, ?, ?, 'Active', 'Free')`,
        [hrId, industryId, companyName, size, logoUrl, address, description]
      );
      const companyId = companyResult.insertId;
      companyCount++;

      for (let j = 0; j < 6; j++) {
        const jobTitle = `Specialist Role ${j + 1} at ${companyName}`;
        const jobType = jobTypes[Math.floor(Math.random() * jobTypes.length)];
        const salaryMin = Math.floor(Math.random() * 10000000) + 5000000;
        const salaryMax = salaryMin + Math.floor(Math.random() * 15000000);
        const jobDesc = `Join our team as a ${jobTitle}. Drive key initiatives and deliver high-quality results.`;
        const requirements = 'Bachelor degree required. Minimum 2 years of experience. Strong communication skills.';
        const deadline = deadlineInDays(30);

        await conn.query(
          `INSERT INTO job_posting (company_id, hr_id, title, description, requirements, salary_min, salary_max, job_type, status, loc, deadline)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'Approved', ?, ?)`,
          [companyId, hrId, jobTitle, jobDesc, requirements, salaryMin, salaryMax, jobType, address, deadline]
        );
        jobCount++;
      }
    }
  }

  console.log(`Bulk seeded: ${companyCount} companies, ${jobCount} jobs`);
}

async function seedDatabase() {
  const conn = await pool.getConnection();
  try {
    const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 10);

    await seedSampleData(conn, passwordHash);

    if (process.argv.includes('--bulk')) {
      await seedBulkData(conn, passwordHash);
    }

    console.log('\n--- Demo login (password for all: Demo@123) ---');
    console.log('Admin:     admin@jobsmarket.demo');
    console.log('HR:        hr.fpt@jobsmarket.demo, hr.vng@jobsmarket.demo, ...');
    console.log('Candidate: candidate.an@jobsmarket.demo, candidate.binh@jobsmarket.demo, candidate.cuong@jobsmarket.demo');
    console.log('\nSeed completed successfully.');
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exitCode = 1;
  } finally {
    conn.release();
    await pool.end();
  }
}

seedDatabase();
