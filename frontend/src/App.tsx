import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ToastProvider } from './components/common/ToastProvider';
import LandingPage from './pages/LandingPage';
import RegisterPage from './pages/RegisterPage';
import VotePage from './pages/VotePage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import ResultsPage from './pages/ResultsPage';
import SecurityAuditPage from './pages/SecurityAuditPage';
import SupportCenterPage from './pages/SupportCenterPage';

function App() {
    return (
        <ToastProvider>
            <Router>
                <Routes>
                    <Route path="/" element={<LandingPage />} />
                    <Route path="/register" element={<RegisterPage />} />
                    <Route path="/vote" element={<VotePage />} />
                    <Route path="/admin" element={<AdminDashboardPage />} />
                    <Route path="/results" element={<ResultsPage />} />
                    <Route path="/audit" element={<SecurityAuditPage />} />
                    <Route path="/support" element={<SupportCenterPage />} />
                </Routes>
            </Router>
        </ToastProvider>
    );
}

export default App;
