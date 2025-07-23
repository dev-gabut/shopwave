'use client';

import { createContext, useState, ReactNode, useEffect } from 'react';

// This is a mock user object. In a real app, this would come from an auth provider.
interface User {
  id: string;
  email: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, pass: string) => Promise<void>;
  signup: (email: string, pass: string) => Promise<void>;
  logout: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

// In a real application, you would use a library like firebase/auth
// For this prototype, we'll use localStorage to simulate user sessions.

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate checking for an existing session
    const checkSession = () => {
      try {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
          setUser(JSON.parse(storedUser));
        }
      } catch (e) {
        console.error("Failed to parse user from localStorage", e);
        localStorage.removeItem('user');
      } finally {
        setLoading(false);
      }
    };
    checkSession();
  }, []);

  const login = async (email: string, pass: string) => {
    // In a real app, you'd call your auth provider here.
    // For now, we'll just check if the user exists in our mock 'database' (localStorage)
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 500)); // simulate network delay

    const storedUsers = JSON.parse(localStorage.getItem('users') || '{}');
    if (storedUsers[email] && storedUsers[email].password === pass) {
        const loggedInUser = { id: email, email };
        setUser(loggedInUser);
        localStorage.setItem('user', JSON.stringify(loggedInUser));
        setLoading(false);
    } else {
        setLoading(false);
        throw new Error('Invalid credentials');
    }
  };

  const signup = async (email: string, pass: string) => {
    // In a real app, you'd call your auth provider here.
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 500));

    const storedUsers = JSON.parse(localStorage.getItem('users') || '{}');
    if (storedUsers[email]) {
        setLoading(false);
        throw new Error('User already exists');
    }

    storedUsers[email] = { password: pass };
    localStorage.setItem('users', JSON.stringify(storedUsers));
    setLoading(false);
  };

  const logout = async () => {
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 200));
    setUser(null);
    localStorage.removeItem('user');
    setLoading(false);
  };

  const value = {
    user,
    loading,
    login,
    signup,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

    