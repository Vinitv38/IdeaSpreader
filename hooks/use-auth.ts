"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { create } from "node:domain";
import { createProfile } from "@/lib/db-handler";
import { NextResponse } from "next/server";

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
    id: "1",
    name: "John Doe",
    email: "john@example.com",
    avatar:
      "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face",
  },
];

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const mockCurrentUser = localStorage.getItem("mockUser");
    if (mockCurrentUser) {
      setUser(JSON.parse(mockCurrentUser));
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    // TODO: Implement actual authentication
    const { data: authData, error: signInError } =
      await supabase.auth.signInWithPassword({
        email: email,
        password: password,
      });

    if (signInError) {
      console.error("Sign in error:", signInError);
      throw new Error(signInError.message || "Failed to sign in");
    }

    if (!authData.user) {
      throw new Error("No user data returned from sign in");
    }

    const user: User = {
      id: authData.user.id,
      name: authData.user.user_metadata?.name || "Unknown User",
      email: authData.user.email || "",
      avatar:
        authData.user.user_metadata?.avatar_url ||
        `https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face`,
    };
    if (user) {
      createProfile(user);
      setUser(user);
      localStorage.setItem("mockUser", JSON.stringify(user));
      router.push("/dashboard");
    } else {
      throw new Error("Invalid credentials");
    }
  };

  const signup = async (name: string, email: string, password: string) => {
    //("Signup payload:", { email, password, name });

    const { data, error: signUpError } = await supabase.auth.signUp({
      email: email,
      password: password,
      options: {
        data: {
          name: name,
          email: email,
        },
        emailRedirectTo: `${window.location.origin}/login`, // Confirmation redirect
      },
    });

    if (signUpError) {
      return NextResponse.json(
        { success: false, message: signUpError.message },
        { status: 400 }
      );
    }

    // ✅ Send response telling frontend to show popup
    return NextResponse.json(
      {
        success: true,
        message: "Signup successful! Please check your email to confirm.",
      },
      { status: 200 }
    );

    //("Signup successful! Please check your email to confirm.");
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("mockUser");
    router.push("/");
  };

  return {
    user,
    isLoading,
    login,
    signup,
    logout,
  };
}
