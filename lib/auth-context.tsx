'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, UserRole } from '@/types';
import { mockApi } from '@/lib/mock-data';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, role?: UserRole) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Check if user is already logged in (from localStorage)
  useEffect(() => {
    const storedUser = localStorage.getItem('hll_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = async (email: string, role?: UserRole) => {
    setLoading(true);
    try {
      // Mock authentication - find user by email
      const users = await mockApi.getUsers();
      let foundUser = users.find(u => u.email === email);
      
      // If role is provided (demo mode), find user by role
      if (role && !foundUser) {
        foundUser = users.find(u => u.role === role);
      }
      
      if (foundUser) {
        setUser(foundUser as User);
        localStorage.setItem('hll_user', JSON.stringify(foundUser));
      } else {
        throw new Error('Kullanıcı bulunamadı');
      }
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('hll_user');
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
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
