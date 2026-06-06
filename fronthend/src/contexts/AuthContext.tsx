import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';

interface User {
  id: string;
  username: string;
  email: string;
  firstName?: string;
  lastName?: string;
  role?: string;
  phone?: string;
  country?: string;
  additionalInfo?: string;
}

interface AuthContextType {
  user: User | null;
  login: (username: string, password: string) => Promise<{success: boolean, role?: string}>;
  register: (userData: RegisterData) => Promise<{success: boolean, role?: string}>;
  updateProfile: (userData: any) => Promise<{success: boolean, message?: string}>;
  logout: () => void;
  isAuthenticated: boolean;
}

interface RegisterData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  username: string;
  password: string;
  role: string;
  country: string;
  additionalInfo: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      // Validate token and get user info
      fetch('/api/auth/me', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      .then(res => {
        if (res.ok) return res.json();
        throw new Error('Invalid token');
      })
      .then(userData => {
        setUser({
          id: userData._id,
          username: userData.username,
          email: userData.email,
          firstName: userData.firstName,
          lastName: userData.lastName,
          role: userData.role,
          phone: userData.phone,
          country: userData.country,
          additionalInfo: userData.additionalInfo,
        });
        setIsAuthenticated(true);
      })
      .catch(() => {
        localStorage.removeItem('token');
        setUser(null);
        setIsAuthenticated(false);
      });
    }
  }, []);

  const login = async (username: string, password: string): Promise<{success: boolean, role?: string}> => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem('token', data.token);
        setUser({
          id: data._id,
          username: data.username,
          email: data.email,
          firstName: data.firstName,
          lastName: data.lastName,
          role: data.role,
          phone: data.phone,
          country: data.country,
          additionalInfo: data.additionalInfo,
        });
        setIsAuthenticated(true);
        return { success: true, role: data.role };
      }
      return { success: false };
    } catch (error) {
      console.error('Login error:', error);
      return { success: false };
    }
  };

  const register = async (userData: RegisterData): Promise<{success: boolean, role?: string}> => {
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
      });

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem('token', data.token);
        setUser({
          id: data._id,
          username: data.username,
          email: data.email,
          firstName: data.firstName,
          lastName: data.lastName,
          role: data.role,
          phone: data.phone,
          country: data.country,
          additionalInfo: data.additionalInfo,
        });
        setIsAuthenticated(true);
        return { success: true, role: data.role };
      }
      return { success: false };
    } catch (error) {
      console.error('Registration error:', error);
      return { success: false };
    }
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('token');
  };

  const updateProfile = async (userData: any): Promise<{success: boolean, message?: string}> => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(userData)
      });

      const data = await response.json();
      
      if (response.ok) {
        localStorage.setItem('token', data.token);
        setUser({
          id: data._id,
          username: data.username,
          email: data.email,
          firstName: data.firstName,
          lastName: data.lastName,
          role: data.role,
          phone: data.phone,
          country: data.country,
          additionalInfo: data.additionalInfo,
        });
        return { success: true };
      }
      return { success: false, message: data.message };
    } catch (error: any) {
      console.error('Update profile error:', error);
      return { success: false, message: 'Server error' };
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, register, updateProfile, logout, isAuthenticated }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
