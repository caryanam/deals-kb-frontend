import React, { createContext, useState, useEffect } from 'react';
import { loginUser, registerUser, getCurrentUser, logoutUser, verifyRegistrationOtp } from '../api/authApi';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [authError, setAuthError] = useState(null);

  useEffect(() => {
    const restoreSession = async () => {
      try {
        const storedToken = sessionStorage.getItem('access_token');
        const storedUser = sessionStorage.getItem('user');

        if (storedToken && storedUser) {
          setToken(storedToken);
          setUser(JSON.parse(storedUser));

          try {
            const freshUser = await getCurrentUser();
            sessionStorage.setItem('user', JSON.stringify(freshUser));
            setUser(freshUser);
          } catch (apiErr) {
            console.error('Stored session token has expired or is invalid. Clearing credentials.', apiErr);
            sessionStorage.removeItem('access_token');
            sessionStorage.removeItem('user');
            setToken(null);
            setUser(null);
          }
        }
      } catch (err) {
        console.error('Failed to restore auth session:', err);
      } finally {
        setIsLoading(false);
      }
    };

    restoreSession();
  }, []);

  const login = async (identifier, password) => {
    setIsLoading(true);
    setAuthError(null);
    try {
      const normalizedIdentifier = identifier.trim();
      const loginPayload = normalizedIdentifier.includes('@')
        ? { email: normalizedIdentifier.toLowerCase(), password }
        : { mobile_number: normalizedIdentifier, password };

      sessionStorage.clear();

      const data = await loginUser(loginPayload);

      const tokenVal = data.access_token;
      const userVal = data.user;

      sessionStorage.setItem('access_token', tokenVal);
      sessionStorage.setItem('user', JSON.stringify(userVal));

      setToken(tokenVal);
      setUser(userVal);

      return userVal.role;
    } catch (err) {
      const message = err.response?.data?.detail || err.response?.data?.message || 'Login failed. Invalid credentials.';
      setAuthError(message);
      throw new Error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (name, email, password, role, phoneNumber, otp) => {
    setIsLoading(true);
    setAuthError(null);
    try {
      const payload = {
        email: email.trim().toLowerCase(),
        name: name.trim(),
        role,
        password,
        otp
      };
      if (phoneNumber && phoneNumber.trim()) {
        payload.mobile_number = phoneNumber.trim();
      }
      const data = await verifyRegistrationOtp(payload);

      if (data.access_token && data.user) {
        sessionStorage.clear();
        sessionStorage.setItem('access_token', data.access_token);
        sessionStorage.setItem('user', JSON.stringify(data.user));
        setToken(data.access_token);
        setUser(data.user);
      }
      return data;
    } catch (err) {
      const message = err.response?.data?.detail || err.response?.data?.message || 'OTP verification or registration failed.';
      setAuthError(message);
      throw new Error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async (redirectPath = '/login') => {
    setIsLoading(true);
    try {
      await logoutUser();
    } catch (err) {
      console.warn('Backend logout call failed or was un-authenticated. Wiping locally anyway.', err);
    } finally {
      sessionStorage.clear();
      setUser(null);
      setToken(null);
      setAuthError(null);
      setIsLoading(false);

      if (redirectPath && window.location.pathname !== redirectPath) {
        window.location.href = redirectPath;
      }
    }
  };

  const getDashboardPath = (role) => {
    const normalizedRole = role?.toLowerCase();
    switch (normalizedRole) {
      case 'buyer':
        return '/buyer/dashboard';
      case 'seller':
        return '/seller/dashboard';
      case 'dealer':
        return '/dealer/dashboard';
      case 'admin':
        return '/admin/dashboard';
      default:
        return '/';
    }
  };

  const isAuthenticated = !!token;

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        token,
        isLoading,
        authError,
        isAuthenticated,
        login,
        register,
        logout,
        setAuthError,
        getDashboardPath
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
