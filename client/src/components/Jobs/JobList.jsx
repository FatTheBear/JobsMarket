import React, { useState, useEffect } from 'react';
import JobCard from './JobCard';
import JobDetail from './JobDetail';
import './JobList.css';
import { useNavigate } from 'react-router-dom';

const API_URL = 'http://localhost:5000';
const mockJobs = [
  {
    id: 1,
    title: "Senior Fullstack Engineer (Node.js/React)",
    company_name: "FPT Software",
    logo_url: "https://Logos-download.com/wp-content/uploads/2016/12/FPT_Software_logo.png",
    salary_min: 2500,
    salary_max: 4000,
    loc: "Hanoi",
    job_type: "Full-time",
    deadline: "2026-07-30",
    description: "Design and implement scalable web applications using React.js and Node.js ecosystems. Collaborate with cross-functional teams to define software architecture and improve platform system performance.",
    requirements: "Minimum 5 years of experience in JavaScript/TypeScript setups. Proficient in RESTful API development and MySQL/MongoDB query optimization. Strong English communication skills."
  },
  {
    id: 2,
    title: "Mobile App Developer (Flutter/iOS)",
    company_name: "VNG Corporation",
    logo_url: "https://vectorise.net/vectorlogos/wp-content/uploads/2017/04/vng-logo.png",
    salary_min: 1800,
    salary_max: 3000,
    loc: "Ho Chi Minh City",
    job_type: "Full-time",
    deadline: "2026-08-15",
    description: "Develop high-performance mobile applications for Zalo ecosystem using Flutter framework. Build fluid, premium UI components and secure cloud-native integration mechanisms.",
    requirements: "Proven track record with published apps on Google Play or App Store. Deep understanding of state management patterns (BLoC or Provider) and local storage implementations."
  },
  {
    id: 3,
    title: "Data Analyst Internship",
    company_name: "Viettel Group",
    logo_url: "https://logos-download.com/wp-content/uploads/2016/12/Viettel_logo.png",
    salary_min: 500,
    salary_max: 800,
    loc: "Hanoi",
    job_type: "Internship",
    deadline: "2026-07-10",
    description: "Process massive telecom transactional data streams. Build comprehensive looker studio operational reports and automate standard internal reporting pipelines using advanced modern techniques.",
    requirements: "Final year students in Computer Science, Math, Data Science, or relevant fields. Solid foundation in SQL queries and Python data frames processing (Pandas/NumPy)."
  },
  {
    id: 4,
    title: "UI/UX Product Designer",
    company_name: "Momo E-Wallet",
    logo_url: "https://images.careervector.net/momo-square-logo.png",
    salary_min: 1500,
    salary_max: 2500,
    loc: "Ho Chi Minh City",
    job_type: "Part-time",
    deadline: "2026-08-01",
    description: "Craft modern web and mobile application layouts for fintech consumer software products. Build functional interactive user experience flow wireframes and high-fidelity mockups using advanced design assets.",
    requirements: "Strong online portfolio demonstrating end-to-end design thinking mechanics. Excellent mastery of Figma design system tools, atomic components logic, and responsive grid layout frameworks."
  },
  {
    id: 5,
    title: "DevOps Systems Engineer",
    company_name: "NashTech Vietnam",
    logo_url: "https://www.nashtechglobal.com/wp-content/uploads/2021/11/NashTech-Logo.png",
    salary_min: 2200,
    salary_max: 3500,
    loc: "Da Nang",
    job_type: "Full-time",
    deadline: "2026-07-25",
    description: "Maintain core multi-regional cloud deployment automation infrastructure pipelines. Build reliable monitoring alerting dashboards for corporate application ecosystems.",
    requirements: "Hands-on continuous experience with AWS platform cloud architectures. Deep knowledge of Docker engine configurations, Kubernetes cluster operations, and Jenkins automation script mechanisms."
  }
];
export default function JobList() {
  const navigate = useNavigate();
  const [jobs, setJobs] = useState([]);
  const [selectedJob, setSelectedJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch jobs from backend database on component mount
  useEffect(() => {
    const fetchJobs = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${API_URL}/api/jobs`);

        if (!response.ok) {
          throw new Error('Failed to fetch jobs from server');
        }

        const data = await response.json();
        setJobs(data);
      } catch (err) {
        console.error('Error fetching jobs:', err.message);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, []);

  return (
    <div className="job-list-container">
      <div className="job-list-header">
        <h2 className="job-list-heading">Explore Available Opportunities</h2>
        <p className="job-list-subheading">Find your next career move with JobsMarket</p>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="job-list-message loading">
          <div className="spinner"></div>
          <p>Loading jobs, please wait...</p>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="job-list-message error">
          <p>Something went wrong: {error}</p>
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && jobs.length === 0 && (
        <div className="job-list-message empty">
          <p>No jobs found. Check back later!</p>
        </div>
      )}

      {/* Data Render State */}
      {!loading && !error && jobs.length > 0 && (
        <div className="job-cards-grid">
          {jobs.map((jobItem) => (
            <JobCard
              key={jobItem.id}
              job={jobItem}
              onSelect={(clickedJob) => setSelectedJob(clickedJob)}
            />
          ))}
        </div>
      )}

      {/* Job Detail Modal Popup */}
      {selectedJob && (
        <JobDetail
          job={selectedJob}
          onClose={() => setSelectedJob(null)}
        />
      )}
    </div>
  );
}