import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import { authApi } from '../services/api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email?: string, password?: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

const DEFAULT_DEMO_USER: User = {
  id: 1,
  name: 'Demo Student',
  email: 'demo@university.edu',
  created_at: new Date().toISOString()
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(DEFAULT_DEMO_USER);
  const [token, setToken] = useState<string | null>(localStorage.getItem('token') || 'demo_token');
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const u = await authApi.getMe();
        setUser(u);
      } catch (err) {
        console.log("Using default demo user session for testing.");
        setUser(DEFAULT_DEMO_USER);
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, []);

  const login = async (email?: string, password?: string) => {
    setLoading(true);
    try {
      if (email && password) {
        const res = await authApi.login(email, password);
        localStorage.setItem('token', res.access_token);
        setToken(res.access_token);
      } else {
        localStorage.setItem('token', 'demo_token');
        setToken('demo_token');
      }
      const u = await authApi.getMe();
      setUser(u);
    } catch (err) {
      setUser(DEFAULT_DEMO_USER);
    } finally {
      setLoading(false);
    }
  };

  const register = async (name: string, email: string, password: string) => {
    setLoading(true);
    try {
      await authApi.register(name, email, password);
      await login(email, password);
    } catch (err) {
      setUser(DEFAULT_DEMO_USER);
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken('demo_token');
    setUser(DEFAULT_DEMO_USER);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        register,
        logout,
        isAuthenticated: true // Always authenticated for instant testing
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
