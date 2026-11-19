import React from 'react';
import { Navigate } from 'react-router-dom';
import { getDashboardPath } from '../utils/roles';

function isJwtExpired(token) {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return false;
    const payload = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')));
    if (payload.exp && typeof payload.exp === 'number') {
      return Date.now() >= payload.exp * 1000;
    }
  } catch {
    return false;
  }
  return false;
}

function ProtectedRoute({ children, allowedRoles }) {
  const token = localStorage.getItem('token') || localStorage.getItem('access_token');
  
  // If token is clearly expired, wipe it proactively to prevent bounce
  if (token && isJwtExpired(token)) {
    localStorage.removeItem('token');
    localStorage.removeItem('access_token');
    localStorage.removeItem('user');
    localStorage.removeItem('userRole');
    return <Navigate to="/login" state={{ sessionExpired: true }} replace />;
  }

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // Try getting userRole directly, or parse it from stored user object
  let userRole = localStorage.getItem('userRole');
  if (!userRole) {
    try {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        const parsed = JSON.parse(storedUser);
        userRole = parsed.role;
      }
    } catch {
      userRole = null;
    }
  }

  // If user role is not known or does not match allowed roles
  if (allowedRoles && (!userRole || !allowedRoles.includes(userRole.toLowerCase()))) {
    if (userRole) {
      return <Navigate to={getDashboardPath(userRole)} replace />;
    }
    return <Navigate to="/login" replace />;
  }

  return children;
}

export default ProtectedRoute;
