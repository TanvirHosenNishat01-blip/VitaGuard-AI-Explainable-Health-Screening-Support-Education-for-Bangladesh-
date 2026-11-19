import BloodNetwork from './pages/BloodNetwork';
import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import AdminDashboard from './pages/AdminDashboard';
import DoctorDashboard from './pages/DoctorDashboard';
import Assessment from './pages/Assessment';
import DiabetesPredict from './pages/DiabetesPredict';
import CardioPredict from './pages/CardioPredict';
import AwarenessSection from './components/AwarenessSection';
import HealthNotice from './pages/HealthNotice';
import ModelEvaluation from './pages/ModelEvaluation';
import BangladeshScreen from './pages/BangladeshScreen';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';

const SELF_FOOTER_PATHS = new Set(['/', '/login', '/register', '/assessment']);

function Shell({ children }) {
  const location = useLocation();
  const hideGlobalFooter = SELF_FOOTER_PATHS.has(location.pathname);

  return (
    <div className="min-h-screen bg-[#F6F9FC] text-[#12304A] flex flex-col justify-between overflow-x-hidden">
      <Navbar />
      <div
        id="main-content"
        tabIndex={-1}
        className={`flex-1 flex flex-col focus:outline-none ${
          hideGlobalFooter ? 'pb-16 md:pb-0' : ''
        }`}
      >
        {children}
      </div>
      {!hideGlobalFooter && <Footer />}
    </div>
  );
}

function App() {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Shell><Login /></Shell>} />
        <Route path="/login" element={<Shell><Login /></Shell>} />
        <Route path="/register" element={<Shell><Register /></Shell>} />
        <Route path="/awareness" element={<Shell><AwarenessSection /></Shell>} />
        <Route path="/bangladesh" element={<Shell><BangladeshScreen /></Shell>} />
        <Route path="/blood" element={<Shell><BloodNetwork /></Shell>} />
        <Route path="/notices" element={<Shell><HealthNotice /></Shell>} />
        <Route path="/evaluation" element={<Shell><ModelEvaluation /></Shell>} />
        
        {/* Assessment Landing */}
        <Route path="/assessment" element={<Shell><Assessment /></Shell>} />

        {/* Prediction Forms */}
        <Route path="/predict/diabetes" element={<Shell><DiabetesPredict /></Shell>} />
        <Route path="/predict/cardio" element={<Shell><CardioPredict /></Shell>} />

        {/* Role Dashboards */}
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute allowedRoles={['patient']}>
              <Shell><Dashboard /></Shell>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/doctor/dashboard" 
          element={
            <ProtectedRoute allowedRoles={['doctor']}>
              <Shell><DoctorDashboard /></Shell>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/admin/dashboard" 
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <Shell><AdminDashboard /></Shell>
            </ProtectedRoute>
          } 
        />
      </Routes>
    </Router>
  );
}

export default App;
