import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { userAPI } from '../services/api';

interface User {
  _id: string;
  name: string;
  email: string;
  role?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string, rememberMe?: boolean) => Promise<void>;
  register: (fullName: string, email: string, phone: string, password: string, role?: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const normalizeUser = (userData: any) => {
  if (!userData) return null;
  return {
    ...userData,
    role: typeof userData.role === 'string' ? userData.role.toLowerCase() : userData.role,
  };
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('buildestate_token'));
  const [isLoading, setIsLoading] = useState(true);

  const refreshUserProfile = useCallback(async () => {
    if (!token) return;

    try {
      const { data } = await userAPI.getProfile();
      if (data && data._id) {
        const normalizedUser = normalizeUser(data);
        setUser(normalizedUser);
        localStorage.setItem('buildestate_user', JSON.stringify(normalizedUser));
      }
    } catch (error) {
      console.error('Failed to refresh user profile', error);
    }
  }, [token]);

  // On mount, check if token exists and is valid
  useEffect(() => {
    const initializeAuth = async () => {
      const storedToken = localStorage.getItem('buildestate_token');
      const storedUser = localStorage.getItem('buildestate_user');

      if (storedToken) {
        try {
          setToken(storedToken);
          if (storedUser) {
            setUser(normalizeUser(JSON.parse(storedUser)));
          }
          await refreshUserProfile();
        } catch {
          localStorage.removeItem('buildestate_token');
          localStorage.removeItem('buildestate_user');
          setToken(null);
          setUser(null);
        }
      }

      setIsLoading(false);
    };

    initializeAuth();
  }, [refreshUserProfile]);

  const login = useCallback(async (email: string, password: string, rememberMe: boolean = false) => {
    const { data } = await userAPI.login({ email, password, rememberMe });
    if (data.success && data.token) {
      const normalizedUser = normalizeUser(data.user);
      localStorage.setItem('buildestate_token', data.token);
      localStorage.setItem('buildestate_user', JSON.stringify(normalizedUser));
      setToken(data.token);
      setUser(normalizedUser);
    } else {
      throw new Error(data.message || 'Login failed');
    }
  }, []);

  const register = useCallback(async (fullName: string, email: string, phone: string, password: string, role: string = 'buyer') => {
    const { data } = await userAPI.register({ fullName, email, phone, password, role });
    if (data.success && data.token) {
      const normalizedUser = normalizeUser(data.user);
      localStorage.setItem('buildestate_token', data.token);
      localStorage.setItem('buildestate_user', JSON.stringify(normalizedUser));
      setToken(data.token);
      setUser(normalizedUser);
    } else {
      throw new Error(data.message || 'Registration failed');
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('buildestate_token');
    localStorage.removeItem('buildestate_user');
    setToken(null);
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token && !!user,
        isLoading,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
