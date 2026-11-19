import React, { createContext, useContext, useState } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem('user');
      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      return null;
    }
  });

  const [token, setToken] = useState(() => {
    return localStorage.getItem('token') || localStorage.getItem('access_token') || null;
  });

  const login = (userData, userToken, role, fullName, verificationStatus) => {
    const cleanRole = String(role || 'patient').toLowerCase().trim();
    const userObj = typeof userData === 'string'
      ? { username: userData, role: cleanRole, full_name: fullName || userData }
      : { ...userData, role: cleanRole, full_name: fullName || userData?.full_name || userData?.name || userData?.username };
    if (verificationStatus) userObj.verification_status = verificationStatus;

    setUser(userObj);
    setToken(userToken);
    localStorage.setItem('user', JSON.stringify(userObj));
    localStorage.setItem('userRole', cleanRole);
    localStorage.setItem('token', userToken);
    localStorage.setItem('access_token', userToken);
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('user');
    localStorage.removeItem('userRole');
    localStorage.removeItem('token');
    localStorage.removeItem('access_token');
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, isAuthenticated: !!token }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

export default AuthContext;
