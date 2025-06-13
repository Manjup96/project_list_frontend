import { BrowserRouter, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import Login from './Components/Login/Login';
import AdminDashboard from './Components/Dashboard/AdminDashboard';
import TeamLeadDashboard from './Components/Dashboard/TeamLeadDashboard';
import AddProject from './Pages/AddProject/AddProject';
import ProjectDetails from './Pages/ProjectDetails/ProjectDetails';
import Logout from './Components/Logout/Logout';
import AdminSidebar from './Components/Sidebar/AdminSidebar';
import TeamLeadSidebar from './Components/Sidebar/TeamLeadSidebar';

// Safe user parser from localStorage
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
  const location = useLocation();
  const hideSidebarRoutes = ['/']; // Hide sidebar on login route
  const shouldHideSidebar = hideSidebarRoutes.includes(location.pathname);

  const user = getUserFromLocalStorage();
  
  // Redirect to login page if no user is found
  if (!user) {
    navigate('/');
    return null; // Avoid rendering Layout if no user
  }

  const role = user?.role;

  const renderSidebar = () => {
    if (role === 'admin') return <AdminSidebar />;
    if (role === 'teamlead') return <TeamLeadSidebar />;
    return null;
  };

  return (
    <div style={{ display: 'flex' }}>
      {!shouldHideSidebar && renderSidebar()}
      <main style={{ flex: 1, padding: '20px' }}>{children}</main>
    </div>
  );
}

function AppContent() {
  return (
    <LayoutWrapper>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/admin-dashboard" element={<AdminDashboard />} />
        <Route path="/teamlead-dashboard" element={<TeamLeadDashboard />} />
        <Route path="/add-project" element={<AddProject />} />
        <Route path="/project-details" element={<ProjectDetails />} />
        <Route path="/logout" element={<Logout />} />
      </Routes>
    </LayoutWrapper>
  );
}

export default function App() {
  const queryClient = new QueryClient();

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </QueryClientProvider>
  );
}
