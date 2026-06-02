import React from 'react';

const CandidateExportModal = ({
  show,
  onClose,
  profileData,
  workExperiences,
  skills,
  setModalError
}) => {
  if (!show) return null;

  const exportToWord = () => {
    const htmlContent = `
      <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
      <head>
        <title>Resume - ${profileData.fullName}</title>
        <!--[if gte mso 9]>
        <xml>
          <w:WordDocument>
            <w:View>Print</w:View>
            <w:Zoom>90</w:Zoom>
          </w:WordDocument>
        </xml>
        <![endif]-->
        <style>
          body { font-family: 'Segoe UI', Arial, sans-serif; color: #1e293b; line-height: 1.5; padding: 20px; }
          h1 { color: #01796F; font-size: 26pt; margin: 0 0 5px 0; font-weight: bold; }
          .title-sub { color: #64748b; font-size: 14pt; margin: 0 0 15px 0; font-weight: 500; }
          .contact-row { color: #475569; font-size: 10pt; margin-bottom: 25px; border-bottom: 2px solid #e2e8f0; padding-bottom: 10px; }
          h2 { color: #01796F; font-size: 16pt; border-bottom: 1.5px solid #01796F; padding-bottom: 4px; margin-top: 25px; margin-bottom: 15px; }
          .section { margin-bottom: 25px; }
          .experience-item { margin-bottom: 15px; }
          .experience-role { font-weight: bold; font-size: 11pt; color: #0f172a; }
          .experience-company { font-style: italic; color: #475569; font-size: 10pt; }
          .experience-duration { color: #64748b; font-size: 9.5pt; font-weight: normal; }
          .skills-list { margin: 0; padding-left: 20px; }
          .skill-item { margin-bottom: 5px; font-size: 10.5pt; }
        </style>
      </head>
      <body>
        <h1>${profileData.fullName || 'Candidate Profile'}</h1>
        <div class="title-sub">${profileData.jobTitle || 'Professional Developer'}</div>
        
        <div class="contact-row">
          <strong>Email:</strong> ${profileData.email} 
          ${profileData.phone ? ` | <strong>Phone:</strong> ${profileData.phone}` : ''} 
          ${profileData.address ? ` | <strong>Address:</strong> ${profileData.address}` : ''}
          ${profileData.nationality ? ` | <strong>Nationality:</strong> ${profileData.nationality}` : ''}
          <br/>
          ${profileData.portfolio ? `<strong>Portfolio:</strong> ${profileData.portfolio} ` : ''}
          ${profileData.github ? ` | <strong>GitHub:</strong> ${profileData.github}` : ''}
          ${profileData.facebook ? ` | <strong>Facebook:</strong> ${profileData.facebook}` : ''}
        </div>

        <div class="section">
          <h2>Work Experience & Qualifications</h2>
          ${workExperiences.length === 0 ? '<p>No experience entries added yet.</p>' : 
            workExperiences.map(exp => `
              <div class="experience-item">
                <span class="experience-role">${exp.role}</span>
                <br/>
                <span class="experience-company">${exp.company}</span>
                &nbsp;&bull;&nbsp;
                <span class="experience-duration">${exp.duration}</span>
              </div>
            `).join('')
          }
        </div>

        <div class="section">
          <h2>Professional Skills</h2>
          ${skills.length === 0 ? '<p>No skill entries added yet.</p>' : `
            <ul class="skills-list">
              ${skills.map(s => `<li class="skill-item"><strong>${s.name}</strong> - Competency Level: ${s.level}%</li>`).join('')}
            </ul>
          `}
        </div>
      </body>
      </html>
    `;
    const blob = new Blob(['\ufeff' + htmlContent], { type: 'application/msword' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${(profileData.fullName || 'Candidate').replace(/\s+/g, '_')}_Resume.doc`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const exportToPDF = () => {
    const printWindow = window.open('', '_blank', 'width=900,height=800');
    if (!printWindow) {
      setModalError("Pop-up blocked! Please allow popups to export as PDF.");
      return;
    }

    const skillsHtml = skills.map(s => `
      <div class="skill-bar-row">
        <div class="skill-meta">
          <span class="skill-name">${s.name}</span>
          <span class="skill-val">${s.level}%</span>
        </div>
        <div class="skill-progress-bg">
          <div class="skill-progress-bar" style="width: ${s.level}%"></div>
        </div>
      </div>
    `).join('');

    const experiencesHtml = workExperiences.map(exp => `
      <div class="exp-item">
        <div class="exp-header">
          <span class="exp-role">${exp.role}</span>
          <span class="exp-duration">${exp.duration}</span>
        </div>
        <div class="exp-company">${exp.company}</div>
      </div>
    `).join('');

    const documentHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Resume - ${profileData.fullName}</title>
        <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
        <style>
          @page { size: A4; margin: 15mm 15mm 15mm 15mm; }
          body {
            font-family: 'Outfit', sans-serif;
            color: #1e293b;
            margin: 0;
            padding: 0;
            background-color: #ffffff;
            line-height: 1.5;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          .resume-container {
            max-width: 800px;
            margin: 0 auto;
          }
          .header-section {
            border-bottom: 3px solid #01796F;
            padding-bottom: 20px;
            margin-bottom: 25px;
          }
          .candidate-name {
            font-size: 28px;
            font-weight: 800;
            color: #01796F;
            margin: 0 0 4px 0;
            letter-spacing: -0.5px;
          }
          .candidate-headline {
            font-size: 16px;
            font-weight: 500;
            color: #64748b;
            margin: 0 0 15px 0;
          }
          .contact-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 8px 20px;
            font-size: 13px;
            color: #475569;
          }
          .contact-item {
            display: flex;
            align-items: center;
            gap: 8px;
          }
          .contact-item i {
            color: #01796F;
            width: 16px;
            text-align: center;
          }
          .contact-item a {
            color: #475569;
            text-decoration: none;
          }
          .section-title {
            font-size: 18px;
            font-weight: 700;
            color: #01796F;
            border-bottom: 1.5px solid #e2e8f0;
            padding-bottom: 6px;
            margin-top: 25px;
            margin-bottom: 15px;
            display: flex;
            align-items: center;
            gap: 8px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }
          .section-title i {
            font-size: 16px;
          }
          .two-column-layout {
            display: flex;
            gap: 30px;
          }
          .left-column {
            flex: 0 0 62%;
            min-width: 0;
          }
          .right-column {
            flex: 0 0 38%;
            min-width: 0;
          }
          .exp-item {
            margin-bottom: 18px;
            page-break-inside: avoid;
          }
          .exp-header {
            display: flex;
            justify-content: space-between;
            align-items: baseline;
            gap: 15px;
            margin-bottom: 3px;
          }
          .exp-role {
            font-size: 14.5px;
            font-weight: 700;
            color: #0f172a;
          }
          .exp-duration {
            font-size: 12px;
            font-weight: 500;
            color: #01796F;
            background-color: #f0fdf4;
            border: 1px solid #dcfce7;
            padding: 2px 10px;
            border-radius: 20px;
            white-space: nowrap;
          }
          .exp-company {
            font-size: 13px;
            color: #475569;
            font-weight: 500;
          }
          .skill-bar-row {
            margin-bottom: 12px;
            page-break-inside: avoid;
          }
          .skill-meta {
            display: flex;
            justify-content: space-between;
            align-items: center;
            font-size: 12.5px;
            font-weight: 600;
            color: #334155;
            margin-bottom: 4px;
          }
          .skill-progress-bg {
            height: 6px;
            background-color: #f1f5f9;
            border-radius: 3px;
            overflow: hidden;
          }
          .skill-progress-bar {
            height: 100%;
            background-color: #01796F;
            border-radius: 3px;
          }
          .no-data {
            font-size: 13px;
            color: #94a3b8;
            font-style: italic;
          }
        </style>
      </head>
      <body>
        <div class="resume-container">
          <div class="header-section">
            <h1 class="candidate-name">${profileData.fullName || 'Candidate Resume'}</h1>
            <div class="candidate-headline">${profileData.jobTitle || 'Professional Developer'}</div>
            
            <div class="contact-grid">
              <div class="contact-item">
                <i class="fas fa-envelope"></i>
                <span>${profileData.email}</span>
              </div>
              ${profileData.phone ? `
                <div class="contact-item">
                  <i class="fas fa-phone"></i>
                  <span>${profileData.phone}</span>
                </div>
              ` : ''}
              ${profileData.address ? `
                <div class="contact-item">
                  <i class="fas fa-map-marker-alt"></i>
                  <span>${profileData.address}</span>
                </div>
              ` : ''}
              ${profileData.nationality ? `
                <div class="contact-item">
                  <i class="fas fa-globe"></i>
                  <span>${profileData.nationality}</span>
                </div>
              ` : ''}
              ${profileData.portfolio ? `
                <div class="contact-item">
                  <i class="fas fa-link"></i>
                  <a href="${profileData.portfolio}" target="_blank">${profileData.portfolio.replace(/^https?:\/\//, '')}</a>
                </div>
              ` : ''}
              ${profileData.github ? `
                <div class="contact-item">
                  <i class="fab fa-github"></i>
                  <a href="${profileData.github}" target="_blank">${profileData.github.replace(/^https?:\/\/(www\.)?github\.com\//, '')}</a>
                </div>
              ` : ''}
              ${profileData.facebook ? `
                <div class="contact-item">
                  <i class="fab fa-facebook"></i>
                  <a href="${profileData.facebook}" target="_blank">${profileData.facebook.replace(/^https?:\/\/(www\.)?facebook\.com\//, '')}</a>
                </div>
              ` : ''}
            </div>
          </div>

          <div class="two-column-layout">
            <div class="left-column">
              <div class="section-title">
                <i class="fas fa-briefcase"></i> Work Experience & Qualifications
              </div>
              ${workExperiences.length === 0 ? 
                '<div class="no-data">No work experience or educational entries added yet.</div>' : 
                experiencesHtml
              }
            </div>
            
            <div class="right-column">
              <div class="section-title">
                <i class="fas fa-tools"></i> Skills & Competencies
              </div>
              ${skills.length === 0 ? 
                '<div class="no-data">No skill entries added yet.</div>' : 
                skillsHtml
              }
            </div>
          </div>
        </div>

        <script>
          window.onload = function() {
            setTimeout(function() {
              window.print();
            }, 300);
          };
        </script>
      </body>
      </html>
    `;
    printWindow.document.open();
    printWindow.document.write(documentHtml);
    printWindow.document.close();
  };

  return (
    <div className="profile-modal-overlay" style={{ zIndex: 1300 }} onClick={onClose}>
      <div className="profile-modal-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '450px' }}>
        <div className="profile-modal-header bg-success text-white p-3 d-flex justify-content-between align-items-center">
          <h5 className="profile-modal-title mb-0 text-white d-flex align-items-center gap-2">
            <i className="fas fa-file-export text-white"></i> Export Standard CV
          </h5>
          <button
            type="button"
            className="btn-close btn-close-white"
            onClick={onClose}
            style={{ background: 'none', border: 'none', fontSize: '1.5rem', color: 'white', cursor: 'pointer' }}
          >
            &times;
          </button>
        </div>
        
        <div className="profile-modal-body p-4 text-center">
          <div className="mb-4">
            <div className="rounded-circle d-inline-flex align-items-center justify-content-center mb-3" style={{ width: '80px', height: '80px', backgroundColor: '#e6f4ea', color: '#137333' }}>
              <i className="fas fa-file-invoice fs-1"></i>
            </div>
            <h5 className="fw-bold text-dark">Standard Candidate Resume</h5>
            <p className="text-secondary small">
              Generate a standard professional CV containing your personal information, work experiences, and skills.
            </p>
          </div>

          <div className="d-flex flex-column gap-3">
            <button
              type="button"
              onClick={() => { exportToWord(); onClose(); }}
              className="btn btn-outline-primary py-2.5 w-100 fw-bold d-flex align-items-center justify-content-center gap-2"
            >
              <i className="far fa-file-word fs-5"></i> Download as Word (.doc)
            </button>
            
            <button
              type="button"
              onClick={() => { exportToPDF(); onClose(); }}
              className="btn btn-outline-danger py-2.5 w-100 fw-bold d-flex align-items-center justify-content-center gap-2"
            >
              <i className="far fa-file-pdf fs-5"></i> Print / Save as PDF (.pdf)
            </button>
          </div>
        </div>
        
        <div className="profile-modal-footer p-3 border-top d-flex justify-content-end bg-white">
          <button type="button" className="btn btn-secondary px-4 rounded-pill" onClick={onClose}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default CandidateExportModal;
