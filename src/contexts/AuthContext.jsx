import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext({});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Check if user is authenticated on app load
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('codeArenaToken');
        const savedUser = localStorage.getItem('codeArenaUser');
        
        if (token && savedUser) {
          // Verify token is still valid by fetching profile
          const response = await authAPI.getProfile();
          if (response.success) {
            setUser(response.data.user);
          } else {
            // Token is invalid, clear storage
            localStorage.removeItem('codeArenaToken');
            localStorage.removeItem('codeArenaUser');
          }
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        // Clear invalid tokens
        localStorage.removeItem('codeArenaToken');
        localStorage.removeItem('codeArenaUser');
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (credentials) => {
    try {
      setError(null);
      const response = await authAPI.login(credentials);
      
      if (response.success) {
        const { user, token } = response.data;
        
        // Store token and user data
        localStorage.setItem('codeArenaToken', token);
        localStorage.setItem('codeArenaUser', JSON.stringify(user));
        
        // Set user in state
        setUser(user);
        
        return { success: true, user };
      } else {
        throw new Error(response.message || 'Login failed');
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Login failed';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  const register = async (userData) => {
    try {
      setError(null);
      
      // Transform frontend data to match backend expectations
      const registrationData = {
        name: userData.name,
        email: userData.email,
        password: userData.password,
        password_confirmation: userData.confirmPassword,
        role: userData.role,
        department: userData.department,
        // Student-specific fields
        roll_number: userData.role === 'student' ? userData.roll_number : undefined,
        year_of_study: userData.role === 'student' ? Number(userData.year_of_study) : undefined,
        section: userData.role === 'student' ? userData.section : undefined,
        // Teacher-specific fields
        designation: userData.role === 'teacher' ? userData.designation : undefined,
        // Common optional
        phone_no: userData.phone_no || null,
      };

      const response = await authAPI.register(registrationData);
      
      if (response.success) {
        const { user, token } = response.data;
        
        // Store token and user data
        localStorage.setItem('codeArenaToken', token);
        localStorage.setItem('codeArenaUser', JSON.stringify(user));
        
        // Set user in state
        setUser(user);
        
        return { success: true, user };
      } else {
        throw new Error(response.message || 'Registration failed');
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Registration failed';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  const logout = async () => {
    try {
      // Call logout API to revoke token
      await authAPI.logout();
    } catch (error) {
      console.error('Logout API call failed:', error);
    } finally {
      // Clear local storage and state regardless of API call result
      localStorage.removeItem('codeArenaToken');
      localStorage.removeItem('codeArenaUser');
      setUser(null);
      setError(null);
    }
  };

  const updateProfile = async (profileData) => {
    try {
      setError(null);
      const response = await authAPI.updateProfile(profileData);
      
      if (response.success) {
        const updatedUser = response.data.user;
        
        // Update stored user data
        localStorage.setItem('codeArenaUser', JSON.stringify(updatedUser));
        setUser(updatedUser);
        
        return { success: true, user: updatedUser };
      } else {
        throw new Error(response.message || 'Profile update failed');
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Profile update failed';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  const changePassword = async (passwordData) => {
    try {
      setError(null);
      const response = await authAPI.changePassword(passwordData);
      
      if (response.success) {
        return { success: true };
      } else {
        throw new Error(response.message || 'Password change failed');
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Password change failed';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  const forgotPassword = async (email) => {
    try {
      setError(null);
      const response = await authAPI.forgotPassword(email);
      
      if (response.success) {
        return { success: true, message: response.message };
      } else {
        throw new Error(response.message || 'Password reset request failed');
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Password reset request failed';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  const resetPassword = async (resetData) => {
    try {
      setError(null);
      const response = await authAPI.resetPassword(resetData);
      
      if (response.success) {
        return { success: true, message: response.message };
      } else {
        throw new Error(response.message || 'Password reset failed');
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Password reset failed';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  const refreshToken = async () => {
    try {
      const response = await authAPI.refreshToken();
      
      if (response.success) {
        const { token } = response.data;
        localStorage.setItem('codeArenaToken', token);
        return { success: true, token };
      } else {
        throw new Error('Token refresh failed');
      }
    } catch (error) {
      console.error('Token refresh failed:', error);
      // If refresh fails, logout user
      await logout();
      return { success: false };
    }
  };

  const updateAuthProfile = async (userData) => {
    setUser(userData);
    localStorage.setItem('codeArenaUser', JSON.stringify(userData));
  };

  const value = {
    user,
    loading,
    error,
    login,
    register,
    logout,
    updateProfile,
    updateAuthProfile,
    changePassword,
    forgotPassword,
    resetPassword,
    refreshToken,
    isAuthenticated: !!user,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};