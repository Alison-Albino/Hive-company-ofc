import { useState, useEffect } from "react";
import type { AuthUser } from "@shared/auth-schema";

interface AuthState {
  user: AuthUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isLoading: true,
    isAuthenticated: false,
  });

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      // Check if we have a session stored
      const sessionId = localStorage.getItem("hive_session");
      const storedUser = localStorage.getItem("hive_user");

      if (!sessionId || !storedUser) {
        setAuthState({
          user: null,
          isLoading: false,
          isAuthenticated: false,
        });
        return;
      }

      // Verify session with server
      const res = await fetch("/api/auth/me", {
        headers: {
          Authorization: `Bearer ${sessionId}`,
        },
      });
      
      if (!res.ok) {
        throw new Error("Session invalid");
      }
      
      const response = await res.json();

      if (response.user) {
        setAuthState({
          user: response.user,
          isLoading: false,
          isAuthenticated: true,
        });
      } else {
        // Session invalid, clear storage
        localStorage.removeItem("hive_session");
        localStorage.removeItem("hive_user");
        setAuthState({
          user: null,
          isLoading: false,
          isAuthenticated: false,
        });
      }
    } catch (error) {
      // Session invalid or network error
      localStorage.removeItem("hive_session");
      localStorage.removeItem("hive_user");
      setAuthState({
        user: null,
        isLoading: false,
        isAuthenticated: false,
      });
    }
  };

  const login = (user: AuthUser, sessionId: string) => {
    localStorage.setItem("hive_session", sessionId);
    localStorage.setItem("hive_user", JSON.stringify(user));
    setAuthState({
      user,
      isLoading: false,
      isAuthenticated: true,
    });
  };

  const refreshAuth = () => {
    checkAuth();
  };

  const logout = async () => {
    try {
      const sessionId = localStorage.getItem("hive_session");
      if (sessionId) {
        await fetch("/api/auth/logout", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${sessionId}`,
          },
        });
      }
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      localStorage.removeItem("hive_session");
      localStorage.removeItem("hive_user");
      setAuthState({
        user: null,
        isLoading: false,
        isAuthenticated: false,
      });
    }
  };

  const canCreateProperty = () => {
    if (!authState.user || authState.user.userType !== "provider") {
      return false;
    }

    const provider = authState.user.provider;
    if (!provider || !provider.planActive) {
      return false;
    }

    return provider.categories.includes("imobiliaria");
  };

  return {
    ...authState,
    login,
    logout,
    canCreateProperty,
    refresh: refreshAuth,
  };
}