'use client';

import { createContext, useState, ReactNode } from 'react';

interface Address {
  id: string;
  label: string;
  address: string;
  city: string;
  province: string;
  postalCode: string;
  isDefault: boolean;
}

interface User {
  id: string;
  email: string;
  role: 'buyer' | 'seller' | 'admin';
  addresses?: Address[];
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, pass: string) => Promise<void>;
  signup: (email: string, pass: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser?: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Authentication is handled via API routes and HTTP-only JWT cookies.
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);

  // Call server-side loginUser for login
  const login = async (email: string, pass: string) => {
    setLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password: pass }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Login failed');
      }
      setUser(data.user);
    } catch (err) {
      setLoading(false);
      throw err;
    }
    setLoading(false);
  };

  // Signup is not implemented in this prototype.
  const signup = async () => {
    throw new Error('Signup is disabled. Use seeded users.');
  };
  const logout = async () => {
    setUser(null);
  };
  const refreshUser = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/auth/refresh');
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to refresh user');
      setUser(data.user);
    } catch (err) {
      setUser(null);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const value = {
    user,
    loading,
    login,
    signup,
    logout,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
