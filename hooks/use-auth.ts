"use client";

import { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
}

// TODO: Replace with actual auth provider (Auth.js, Clerk, Firebase, etc.)
const mockUsers: User[] = [
  {
    id: '1',
    name: 'John Doe',
    email: 'john@example.com',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face'
  }
];

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // TODO: Check for existing session/token
    const mockCurrentUser = localStorage.getItem('mockUser');
    if (mockCurrentUser) {
      setUser(JSON.parse(mockCurrentUser));
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    // TODO: Implement actual authentication
    const user = mockUsers.find(u => u.email === email);
    if (user) {
      setUser(user);
      localStorage.setItem('mockUser', JSON.stringify(user));
      router.push('/dashboard');
    } else {
      throw new Error('Invalid credentials');
    }
  };

  const signup = async (name: string, email: string, password: string) => {
    // TODO: Implement actual user registration
    const newUser: User = {
      id: Date.now().toString(),
      name,
      email,
      avatar: `https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face`
    };
    
    mockUsers.push(newUser);
    setUser(newUser);
    localStorage.setItem('mockUser', JSON.stringify(newUser));
    router.push('/dashboard');
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('mockUser');
    router.push('/');
  };

  return {
    user,
    isLoading,
    login,
    signup,
    logout
  };
}