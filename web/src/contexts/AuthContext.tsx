"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { api, authApi, User } from "@/lib/api";
import { useRouter } from "next/navigation";

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (data: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
  }) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  updateUser: (user: User) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      setIsLoading(false);
      return;
    }

    api.setToken(token);
    const { data, error } = await authApi.me();

    if (data) {
      setUser(data);
    } else {
      // Token invalide, on le supprime
      api.setToken(null);
      localStorage.removeItem("refreshToken");
    }

    setIsLoading(false);
  };

  const login = async (email: string, password: string) => {
    const { data, error } = await authApi.login({ email, password });

    if (error) {
      return { success: false, error };
    }

    if (data) {
      api.setToken(data.accessToken);
      localStorage.setItem("refreshToken", data.refreshToken);
      setUser(data.user);
      return { success: true };
    }

    return { success: false, error: "Une erreur est survenue" };
  };

  const register = async (registerData: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
  }) => {
    const { data, error } = await authApi.register(registerData);

    if (error) {
      return { success: false, error };
    }

    if (data) {
      api.setToken(data.accessToken);
      localStorage.setItem("refreshToken", data.refreshToken);
      setUser(data.user);
      return { success: true };
    }

    return { success: false, error: "Une erreur est survenue" };
  };

  const logout = async () => {
    await authApi.logout();
    api.setToken(null);
    localStorage.removeItem("refreshToken");
    setUser(null);
    router.push("/");
  };

  const updateUser = (updatedUser: User) => {
    setUser(updatedUser);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        register,
        logout,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
