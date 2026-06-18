import React, { createContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [doctorProfile, setDoctorProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch logged in user profile
  const fetchUserProfile = async () => {
    try {
      setLoading(true);
      const data = await authAPI.getMe();
      if (data.success) {
        setUser(data.user);
        if (data.doctorProfile) {
          setDoctorProfile(data.doctorProfile);
        }
      } else {
        logout();
      }
    } catch (err) {
      console.error('Error fetching user profile:', err);
      logout();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchUserProfile();
    } else {
      setLoading(false);
    }
  }, [token]);

  // Login User
  const login = async (email, password) => {
    setError(null);
    try {
      const data = await authAPI.login(email, password);
      
      if (!data.success) {
        setError(data.message || 'Login failed');
        return false;
      }

      localStorage.setItem('token', data.token);
      setToken(data.token);
      setUser({
        _id: data._id,
        name: data.name,
        email: data.email,
        role: data.role,
      });
      
      if (data.doctorProfile) {
        setDoctorProfile(data.doctorProfile);
      } else {
        setDoctorProfile(null);
      }
      return data.role;
    } catch (err) {
      const message = err.response?.data?.message || err.message || 'Login failed';
      setError(message);
      return false;
    }
  };

  // Register Patient / Admin
  const register = async (name, email, password, phone, role = 'patient') => {
    setError(null);
    try {
      const data = await authAPI.register(name, email, password, phone, role);

      if (!data.success) {
        setError(data.message || 'Registration failed');
        return false;
      }

      localStorage.setItem('token', data.token);
      setToken(data.token);
      setUser({
        _id: data._id,
        name: data.name,
        email: data.email,
        role: data.role,
      });
      setDoctorProfile(null);
      return data.role;
    } catch (err) {
      const message = err.response?.data?.message || err.message || 'Registration failed';
      setError(message);
      return false;
    }
  };

  // Register Doctor (multipart/form-data)
  const registerDoctor = async (formData) => {
    setError(null);
    try {
      const data = await authAPI.registerDoctor(formData);

      if (!data.success) {
        setError(data.message || 'Doctor registration failed');
        return false;
      }

      localStorage.setItem('token', data.token);
      setToken(data.token);
      setUser({
        _id: data._id,
        name: data.name,
        email: data.email,
        role: data.role,
      });
      setDoctorProfile(data.doctorProfile);
      return data.role;
    } catch (err) {
      const message = err.response?.data?.message || err.message || 'Doctor registration failed';
      setError(message);
      return false;
    }
  };

  // Logout User
  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    setDoctorProfile(null);
    setError(null);
  };

  // Update profile updates locally
  const updateDoctorProfileState = (newProfile) => {
    setDoctorProfile(newProfile);
    if (newProfile.user) {
      setUser((prev) => ({
        ...prev,
        name: newProfile.user.name,
        phone: newProfile.user.phone,
      }));
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        doctorProfile,
        loading,
        error,
        login,
        register,
        registerDoctor,
        logout,
        updateDoctorProfileState,
        setError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
