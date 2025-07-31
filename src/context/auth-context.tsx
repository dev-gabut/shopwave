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
  role: 'BUYER' | 'SELLER' | 'ADMIN';
  addresses?: Address[];
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signin: (email: string, pass: string) => Promise<void>;
  signup: (email: string, pass: string) => Promise<void>;
  logout: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Authentication is handled via API routes and HTTP-only JWT cookies.
import { useEffect } from 'react';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Restore user from cookie/session on mount
  useEffect(() => {
    async function fetchUser() {
      setLoading(true);
      try {
        const res = await fetch('/api/auth/me');
        const data = await res.json();
        setUser(data.user);
      } catch {
        setUser(null);
      } finally {
        setLoading(false);
      }
    }
    fetchUser();
  }, []);

  // Call server-side loginUser for login
  const signin = async (email: string, pass: string) => {
    setLoading(true);
    try {
      const res = await fetch('/api/auth/signin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password: pass }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Signin failed');
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

  const value = {
    user,
    loading,
    signin,
    signup,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
