import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage/HomePage';
import AuthPage from './pages/AuthPage/AuthPage';
import CompanyProfile from './components/CompanyProfile/CompanyProfile';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/auth" element={<AuthPage />} />
        
        <Route path="/company-profile" element={<CompanyProfile />} />
      </Routes>
    </Router>
  );
}

export default App;