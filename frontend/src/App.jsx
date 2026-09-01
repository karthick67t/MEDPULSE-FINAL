import React from 'react';
import AppErrorBoundary from './components/AppErrorBoundary';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import PatientDetail from './pages/PatientDetail';
import ModelPerformance from './pages/ModelPerformance';
import Patients from './pages/Patients';
import About from './pages/About';
import Calendar from './pages/Calendar';
import Analytics from './pages/Analytics';
import LoadingState from './components/LoadingState';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <LoadingState message="Initializing..." />;
  if (!user) return <Navigate to="/login" replace />;
  return children;
};

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginRoute />} />
      <Route path="/" element={
        <ProtectedRoute>
          <Layout />
        </ProtectedRoute>
      }>
        <Route index element={<Dashboard />} />
        <Route path="patients" element={<Patients />} />
        <Route path="patients/:id" element={<PatientDetail />} />
        <Route path="calendar" element={<Calendar />} />
        <Route path="analytics" element={<Analytics />} />
        <Route path="model-performance" element={<ModelPerformance />} />
        <Route path="about" element={<About />} />
      </Route>
    </Routes>
  );
}

const LoginRoute = () => {
  const { user, loading } = useAuth();
  if (loading) return <LoadingState message="Initializing..." />;
  if (user) return <Navigate to="/" replace />;
  return <Login />;
};

function App() {
  return (
    <AppErrorBoundary>
      <AuthProvider>
        <BrowserRouter>
          <AppRoutes />
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 3000,
              style: { fontFamily: 'Inter, sans-serif', fontSize: '14px' },
              success: { iconTheme: { primary: '#22c55e', secondary: '#fff' } },
              error: { iconTheme: { primary: '#ef4444', secondary: '#fff' } },
            }}
          />
        </BrowserRouter>
      </AuthProvider>
    </AppErrorBoundary>
  );
}

export default App;
