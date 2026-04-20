import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiClient } from './apiClient';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      // Assuming a /users/me endpoint exists or similar to verify token
      fetchProfile();
    } else {
      setLoading(false);
    }
  }, []);

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) return setLoading(false);

      const decoded = apiClient.decodeToken(token);
      if (!decoded || !decoded.userId) {
          localStorage.removeItem('accessToken');
          return setLoading(false);
      }

      const response = await apiClient.get(`/users/${decoded.userId}`);
      if (response.ok) {
        const data = await response.json();
        setUser(data);
      } else {
        localStorage.removeItem('accessToken');
        setUser(null);
      }
    } catch (error) {
      console.error('Failed to fetch profile', error);
    } finally {
      setLoading(false);
    }
  };

  const login = (token) => {
    apiClient.setToken(token);
    fetchProfile();
  };

  const logout = () => {
    setUser(null);
    apiClient.setToken(null);
    window.location.href = '/login';
  };

  return (
    <AuthContext.Provider value={{ user, setUser, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
