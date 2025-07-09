import { BrowserRouter, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useEffect } from 'react';
import { GoogleOAuthProvider } from '@react-oauth/google'; // Import GoogleOAuthProvider

import Login from './Components/Login/Login';
import AdminDashboard from './Components/Dashboard/AdminDashboard';
import TestDashboard from './Components/Dashboard/TestDashboard';
import TeamLeadDashboard from './Components/Dashboard/TeamLeadDashboard';
import AddProject from './Pages/AddProject/AddProject';
import ProjectDetails from './Pages/ProjectDetails/ProjectDetails';
import Logout from './Components/Logout/Logout';
import AdminSidebar from './Components/Sidebar/AdminSidebar';
import TeamLeadSidebar from './Components/Sidebar/TeamLeadSidebar';
import Leads from './Pages/Leads/LeadDetails'

function getUserFromLocalStorage() {
  try {
    const stored = localStorage.getItem('user');
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
}

function LayoutWrapper({ children }) {
  const navigate = useNavigate();
  const user = getUserFromLocalStorage();

  useEffect(() => {
    if (!user) {
      navigate('/');
    }
  }, [user, navigate]);

  if (!user) return null;

  const role = user?.role;

  const renderSidebar = () => {
    if (role === 'admin') return <AdminSidebar />;
    if (role === 'teamlead') return <TeamLeadSidebar />;
    return null;
  };

  return (
    <div style={{ display: 'flex' }}>
      {renderSidebar()}
      <main style={{ flex: 1, padding: '20px' }}>{children}</main>
    </div>
  );
}

function AppContent() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route
        path="*"
        element={
          <LayoutWrapper>
            <Routes>
              <Route path="/admin-dashboard" element={<AdminDashboard />} />
                  <Route path="/test-dashboard" element={<TestDashboard />} />
                 <Route path="/leads" element={<Leads />} />
              <Route path="/teamlead-dashboard" element={<TeamLeadDashboard />} />
              <Route path="/add-project" element={<AddProject />} />
              <Route path="/project-details" element={<ProjectDetails />} />
              <Route path="/logout" element={<Logout />} />
            </Routes>
          </LayoutWrapper>
        }
      />
    </Routes>
  );
}

export default function App() {
  const queryClient = new QueryClient();

  // Replace with your actual Google Client ID
  const GOOGLE_CLIENT_ID = '910635849979-cohqci9jcn8mjcp7nbsrcdl7tf2ailqb.apps.googleusercontent.com';

  return (
    <QueryClientProvider client={queryClient}>
      <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
        <BrowserRouter>
          <AppContent />
        </BrowserRouter>
      </GoogleOAuthProvider>
    </QueryClientProvider>
  );
}