import React from 'react';
import CandidateProfile from '../../components/CandidateProfile/Candidate_profile';

export default function CandidateProfilePage() {
  return (
    <div className="candidate-profile-page-container">
      {/* Container Page serving as the route destination for Candidate Profile */}
      <CandidateProfile />
    </div>
  );
}
