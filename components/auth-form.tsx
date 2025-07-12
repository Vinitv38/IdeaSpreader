"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Lightbulb, Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface AuthFormProps {
  mode: "login" | "signup";
}

export function AuthForm({ mode }: AuthFormProps) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showEmailConfirmationModal, setShowEmailConfirmationModal] =
    useState(false);

  const { login, signup } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (mode === "login") {
        await login(formData.email, formData.password);
        toast.success("Welcome back!");
        router.push("/dashboard"); // ✅ Login: go to dashboard
      } else {
        const resp = await signup(
          formData.name,
          formData.email,
          formData.password
        );

        const data = await resp.json();
        if (data.success) {
          // ✅ Signup: email confirmation required
          toast.success("Account created! Please check your email to verify.");
          setShowEmailConfirmationModal(true) // Or stay on the page
        } else {
          // ✅ No email confirmation required (rare)
          toast.success("Account created successfully!");
          router.push("/dashboard");
        }
      }
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Something went wrong"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  return (
    <>
      <Card className="w-full max-w-md mx-auto glass">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-3 rounded-lg">
              <Lightbulb className="h-8 w-8 text-white" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold">
            {mode === "login" ? "Welcome Back" : "Join IdeaSpreader"}
          </CardTitle>
          <CardDescription>
            {mode === "login"
              ? "Sign in to continue spreading ideas"
              : "Start spreading brilliant ideas today"}
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === "signup" && (
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  name="name"
                  type="text"
                  placeholder="Enter your full name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="Enter your email"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
              disabled={isLoading}
            >
              {isLoading
                ? "Please wait..."
                : mode === "login"
                ? "Sign In"
                : "Create Account"}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {mode === "login"
                ? "Don't have an account?"
                : "Already have an account?"}{" "}
              <Link
                href={mode === "login" ? "/signup" : "/login"}
                className="text-purple-600 hover:text-purple-700 font-medium"
              >
                {mode === "login" ? "Sign up" : "Sign in"}
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
      {showEmailConfirmationModal && (
  <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex justify-center items-center z-50">
    <div className="glass rounded-2xl p-8 max-w-md w-full shadow-xl border border-border">
      <h2 className="text-3xl font-bold gradient-text mb-4">
        Check your email 📩
      </h2>
      <p className="text-muted-foreground mb-6">
        We've sent you a confirmation email. Please check your inbox and click
        the link to activate your account.
      </p>
      <button
        onClick={() => {
          setShowEmailConfirmationModal(false);
          router.push("/login");
        }}
        className="w-full py-3 px-6 rounded-xl bg-primary text-primary-foreground font-medium shadow-md hover:opacity-90 transition duration-300"
      >
        Go to Login
      </button>
    </div>
  </div>
)}

    </>
  );
}
