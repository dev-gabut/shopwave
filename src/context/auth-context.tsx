'use client';

import { createContext, useState, ReactNode } from 'react';
import { User } from '@/models/user';
import { getHeaders } from '@/lib/server-utils';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signin: (email: string, pass: string) => Promise<void>;
  signup: (name: string, email: string, pass: string) => Promise<void>;
  signout: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(
  undefined
);

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
        const headers = (await getHeaders()) as any;
        setUser({
          id: Number(
            headers.find(
              ([key, value]: [string, string]) => key === 'x-user-id'
            )?.[1] || ''
          ),
          imageUrl:
            headers.find(
              ([key, value]: [string, string]) => key === 'x-user-image'
            )?.[1] || '',
          email:
            headers.find(
              ([key, value]: [string, string]) => key === 'x-user-email'
            )?.[1] || '',
          role: headers.find(
            ([key, value]: [string, string]) => key === 'x-user-role'
          )?.[1] as 'BUYER' | 'SELLER' | 'ADMIN',
          addresses: [],
        });
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
  const signup = async (name: string, email: string, pass: string) => {
    setLoading(true);
    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email, password: pass }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Signup failed');
      }
    } catch (err) {
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const signout = async () => {
    return fetch('/api/auth/signout').then(() => {
      setUser(null);
    });
  };

  const value = {
    user,
    loading,
    signin,
    signup,
    signout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
