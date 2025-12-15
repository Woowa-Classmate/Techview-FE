import { createContext, useContext, useState, ReactNode } from "react";
import { useLocalStorage } from "@/hooks/useLocalStorage";

interface User {
  id: string;
  email: string;
  name: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  signup: (email: string, password: string, name: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useLocalStorage<User | null>("user", null);

  const login = async (email: string, password: string) => {
    // TODO: 실제 API 호출로 변경
    // const response = await api.post('/auth/login', { email, password });
    // setUser(response.data.user);
    
    // 임시 구현
    setUser({
      id: "1",
      email,
      name: "사용자",
    });
  };

  const logout = () => {
    setUser(null);
  };

  const signup = async (email: string, password: string, name: string) => {
    // TODO: 실제 API 호출로 변경
    // const response = await api.post('/auth/signup', { email, password, name });
    // setUser(response.data.user);
    
    // 임시 구현
    setUser({
      id: "1",
      email,
      name,
    });
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        login,
        logout,
        signup,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

