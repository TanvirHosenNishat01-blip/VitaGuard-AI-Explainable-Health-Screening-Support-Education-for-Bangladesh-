import BloodNetwork from './pages/BloodNetwork';
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Home from './pages/Home';
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
import KnowledgeHub from './pages/KnowledgeHub';
import KnowledgeGraph from './pages/KnowledgeGraph';
import ExplainCenter from './pages/ExplainCenter';
import FairnessDashboard from './pages/FairnessDashboard';
import Competition from './pages/Competition';
import Messages from './pages/Messages';
import DoctorDirectory from './pages/DoctorDirectory';
import KnowledgeArticle from './pages/KnowledgeArticle';
import Hospitals from './pages/Hospitals';
import HospitalDetail from './pages/HospitalDetail';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';
import ErrorBoundary from './components/ErrorBoundary';

const SELF_FOOTER_PATHS = new Set(['/login', '/register']);

function Shell({ children }) {
  const location = useLocation();
  const hideGlobalFooter = SELF_FOOTER_PATHS.has(location.pathname);

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-[#F6F9FC] text-[#12304A] flex flex-col justify-between overflow-x-hidden">
        <Navbar />
        <main
          id="main-content"
          tabIndex={-1}
          className={`flex-1 flex flex-col focus:outline-none ${
            hideGlobalFooter ? 'pb-16 md:pb-0' : ''
          }`}
        >
          {children}
        </main>
        {!hideGlobalFooter && <Footer />}
      </div>
    </ErrorBoundary>
  );
}

function App() {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Shell><Home /></Shell>} />
        <Route path="/login" element={<Shell><Login /></Shell>} />
        <Route path="/register" element={<Shell><Register /></Shell>} />
        <Route path="/awareness" element={<Shell><AwarenessSection /></Shell>} />
        <Route path="/bangladesh" element={<Shell><BangladeshScreen /></Shell>} />
        <Route path="/bangladesh-screen" element={<Navigate to="/bangladesh" replace />} />
        <Route path="/blood" element={<Shell><BloodNetwork /></Shell>} />
        <Route path="/notices" element={<Shell><HealthNotice /></Shell>} />
        <Route path="/evaluation" element={<Shell><ModelEvaluation /></Shell>} />
        <Route path="/knowledge" element={<Shell><KnowledgeHub /></Shell>} />
        <Route path="/knowledge/articles/:articleId" element={<Shell><KnowledgeArticle /></Shell>} />
        <Route path="/hospitals" element={<Shell><Hospitals /></Shell>} />
        <Route path="/hospitals/:hospitalId" element={<Shell><HospitalDetail /></Shell>} />
        <Route path="/knowledge/graph" element={<Shell><KnowledgeGraph /></Shell>} />
        <Route path="/explain" element={<Shell><ExplainCenter /></Shell>} />
        <Route path="/fairness" element={<Shell><FairnessDashboard /></Shell>} />
        <Route path="/presentation" element={<Shell><Competition /></Shell>} />
        <Route path="/architecture" element={<Shell><Competition /></Shell>} />
        <Route path="/security" element={<Shell><Competition /></Shell>} />
        <Route path="/data" element={<Shell><Competition /></Shell>} />
        <Route path="/governance" element={<Shell><Competition /></Shell>} />
        <Route path="/audit" element={<Shell><Competition /></Shell>} />
        <Route path="/pitchdeck" element={<Shell><Competition /></Shell>} />
        <Route path="/app" element={<Shell><Competition /></Shell>} />
        <Route path="/demo-user" element={<Shell><Competition /></Shell>} />
        <Route path="/demo-doctor" element={<Shell><Competition /></Shell>} />
        <Route path="/demo-admin" element={<Shell><Competition /></Shell>} />
        <Route
          path="/messages"
          element={
            <ProtectedRoute allowedRoles={['patient', 'doctor']}>
              <Shell><Messages /></Shell>
            </ProtectedRoute>
          }
        />
        <Route
          path="/doctors"
          element={
            <ProtectedRoute allowedRoles={['patient']}>
              <Shell><DoctorDirectory /></Shell>
            </ProtectedRoute>
          }
        />
        
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

        {/* Fallback 404 handler to prevent blank unrendered screens */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
