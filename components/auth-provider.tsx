"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export interface User {
  id: string;
  email: string;
  name: string | null;
  role: "admin" | "user";
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAdmin: boolean;
  login: (
    email: string,
    password: string,
    options?: { redirectOnAdmin?: boolean; onUserSuccess?: () => void }
  ) => Promise<User | null>;
  register: (name: string, email: string, password: string) => Promise<User | null>;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
  isAuthDialogOpen: boolean;
  authDialogTab: "login" | "register";
  authDialogMessage: string | null;
  openAuthDialog: (tab?: "login" | "register", message?: string) => void;
  closeAuthDialog: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthDialogOpen, setIsAuthDialogOpen] = useState(false);
  const [authDialogTab, setAuthDialogTab] = useState<"login" | "register">("login");
  const [authDialogMessage, setAuthDialogMessage] = useState<string | null>(null);
  const router = useRouter();

  const fetchSession = useCallback(async () => {
    try {
      const res = await fetch("/api/auth/me", { cache: "no-store" });
      if (res.ok) {
        const json = await res.json();
        setUser(json.data?.user || null);
      } else {
        setUser(null);
      }
    } catch (e) {
      console.error("Failed to load session:", e);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSession();
  }, [fetchSession]);

  const login = async (
    email: string,
    password: string,
    options?: { redirectOnAdmin?: boolean; onUserSuccess?: () => void }
  ): Promise<User | null> => {
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const json = await res.json();
      if (!res.ok) {
        toast.error(json.error || "Login failed");
        return null;
      }

      const loggedUser = json.data.user as User;
      setUser(loggedUser);
      setIsAuthDialogOpen(false);

      // CHECK THE ROLE ON LOGIN:
      if (loggedUser.role === "admin") {
        toast.success(`Welcome back, ${loggedUser.name || "Admin"}!`, {
          description: "Role verified: Administrator (Full access). Redirecting to Admin Dashboard...",
        });
        if (options?.redirectOnAdmin !== false) {
          router.push("/admin");
        }
      } else {
        toast.success(`Welcome back, ${loggedUser.name || "Submitter"}!`, {
          description: "Role verified: Tool Submitter. You are authorized to submit tools.",
        });
        if (options?.onUserSuccess) {
          options.onUserSuccess();
        }
      }

      router.refresh();
      return loggedUser;
    } catch {
      toast.error("Network error during login");
      return null;
    }
  };

  const register = async (name: string, email: string, password: string): Promise<User | null> => {
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });
      const json = await res.json();
      if (!res.ok) {
        toast.error(json.error || "Registration failed");
        return null;
      }
      const newUser = json.data.user as User;
      setUser(newUser);
      toast.success("Account created successfully!", {
        description: "Assigned role: Tool Submitter. You can now submit tools for review.",
      });
      setIsAuthDialogOpen(false);
      router.refresh();
      return newUser;
    } catch {
      toast.error("Network error during registration");
      return null;
    }
  };

  const logout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      setUser(null);
      toast.info("Signed out successfully");
      router.refresh();
      router.push("/");
    } catch {
      toast.error("Failed to log out");
    }
  };

  const openAuthDialog = (tab: "login" | "register" = "login", message?: string) => {
    setAuthDialogTab(tab);
    setAuthDialogMessage(message || null);
    setIsAuthDialogOpen(true);
  };

  const closeAuthDialog = () => {
    setIsAuthDialogOpen(false);
    setAuthDialogMessage(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAdmin: user?.role === "admin",
        login,
        register,
        logout,
        refresh: fetchSession,
        isAuthDialogOpen,
        authDialogTab,
        authDialogMessage,
        openAuthDialog,
        closeAuthDialog,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
