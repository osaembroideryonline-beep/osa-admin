import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [auth, setAuth] = useState({
    token: localStorage.getItem('admin_token'),
    email: localStorage.getItem('admin_email'),
    name: localStorage.getItem('admin_name'),
    id: localStorage.getItem('admin_id'),
    isAuthenticated: !!localStorage.getItem('admin_token'),
  });

  useEffect(() => {
    // Verify token is still valid on mount
    const token = localStorage.getItem('admin_token');
    setAuth(prev => ({
      ...prev,
      isAuthenticated: !!token,
    }));
  }, []);

  const login = (token, email, name, id) => {
    localStorage.setItem('admin_token', token);
    localStorage.setItem('admin_email', email);
    localStorage.setItem('admin_name', name);
    localStorage.setItem('admin_id', id);

    setAuth({
      token,
      email,
      name,
      id,
      isAuthenticated: true,
    });
  };

  const logout = () => {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_email');
    localStorage.removeItem('admin_name');
    localStorage.removeItem('admin_id');

    setAuth({
      token: null,
      email: null,
      name: null,
      id: null,
      isAuthenticated: false,
    });
  };

  return (
    <AuthContext.Provider value={{ auth, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
