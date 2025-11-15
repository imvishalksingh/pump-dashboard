import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import api from "@/utils/api";
import { Role } from "@/utils/roles";

// Remove the API_URL since we're using relative paths with proxy
// const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

interface User {
  _id: string;
  email: string;
  name: string;
  role: Role;
  token: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<{ success: boolean; message?: string }>;
  register: (email: string, password: string, name: string, invitationToken: string) => Promise<{ success: boolean; message?: string }>;
  logout: () => Promise<void>;
  checkInvitation: (token: string, email: string) => Promise<{ valid: boolean; data?: any; message?: string }>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    const token = localStorage.getItem("token");
    
    if (storedUser && token) {
      try {
        const userData = JSON.parse(storedUser);
        setUser(userData);
        api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      } catch (error) {
        console.error("Error parsing stored user:", error);
        localStorage.removeItem("user");
        localStorage.removeItem("token");
      }
    }
  }, []);

  // ---------- CHECK INVITATION ----------
  const checkInvitation = async (token: string, email: string): Promise<{ valid: boolean; data?: any; message?: string }> => {
    try {
      console.log("🔍 Checking invitation:", { token, email });
      const res = await api.get(`/auth/invitation/${token}?email=${encodeURIComponent(email)}`);
      console.log("✅ Invitation check response:", res.data);
      return { valid: true, data: res.data };
    } catch (err: any) {
      console.error("❌ Invitation check failed:", err);
      const errorMessage = err.response?.data?.message || "Invalid invitation";
      return { valid: false, message: errorMessage };
    }
  };

  // ---------- REGISTER ----------
  const register = async (
    email: string,
    password: string,
    name: string,
    invitationToken: string
  ): Promise<{ success: boolean; message?: string }> => {
    try {
      console.log("🎯 Attempting registration with invitation:", email);
      
      const res = await api.post(`/auth/register`, { 
        email, 
        password, 
        name, 
        invitationToken 
      });

      const userData = res.data;
      console.log("✅ Registration successful:", userData.email);

      setUser(userData);
      localStorage.setItem("user", JSON.stringify(userData));
      localStorage.setItem("token", userData.token);

      api.defaults.headers.common["Authorization"] = `Bearer ${userData.token}`;
      return { success: true };
    } catch (err: any) {
      console.error("❌ Registration error:", err);
      const errorMessage = err.response?.data?.message || "Registration failed";
      return { success: false, message: errorMessage };
    }
  };

  // ---------- LOGIN ----------
  const login = async (email: string, password: string): Promise<{ success: boolean; message?: string }> => {
    try {
      console.log("🔐 Attempting login:", email);
      const res = await api.post(`/auth/login`, { email, password });
      const userData = res.data;
      console.log("✅ Login successful:", userData.email);

      setUser(userData);
      localStorage.setItem("user", JSON.stringify(userData));
      localStorage.setItem("token", userData.token);

      api.defaults.headers.common["Authorization"] = `Bearer ${userData.token}`;
      return { success: true };
    } catch (err: any) {
      console.error("❌ Login error:", err);
      const errorMessage = err.response?.data?.message || "Login failed";
      return { success: false, message: errorMessage };
    }
  };

  // ---------- LOGOUT ----------
  const logout = async () => {
    try {
      await api.post(`/auth/logout`);
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      setUser(null);
      localStorage.removeItem("user");
      localStorage.removeItem("token");
      delete api.defaults.headers.common["Authorization"];
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      login, 
      register, 
      logout, 
      checkInvitation,
      isAuthenticated: !!user 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) throw new Error("useAuth must be used within an AuthProvider");
  return context;
};