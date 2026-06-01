import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import api from './api';

interface User {
  id: number;
  username: string;
  fullName?: string;
  email?: string;
  phone?: string;
  role: { name: string };
  company?: { id: number; name: string; taxId?: string };
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (token: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUser = async () => {
    try {
      const response = await api.get('/auth/me').catch(() => null);
      if (response) setUser(response.data);
    } catch {
      logout();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (token) fetchUser();
    else setLoading(false);
  }, []);

  const login = (token: string) => {
    localStorage.setItem('access_token', token);
    fetchUser();
  };

  const logout = () => {
    localStorage.removeItem('access_token');
    setUser(null);
    window.location.replace('/'); // Hard navigation
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
