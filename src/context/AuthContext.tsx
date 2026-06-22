import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

interface AuthUser {
  username: string;
}

interface AuthContextType {
  user: AuthUser | null;
  authReady: boolean;
  adminPassword?: string;
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AUTH_STORAGE_KEY = 'portfolio-admin-session';
const ADMIN_USERNAME = 'akish';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [adminPassword, setAdminPassword] = useState<string | undefined>(undefined);

  useEffect(() => {
    const savedSession = window.localStorage.getItem(AUTH_STORAGE_KEY);
    if (savedSession === ADMIN_USERNAME) {
      setUser({ username: ADMIN_USERNAME });
    }
    setAuthReady(true);
  }, []);

  const value = useMemo<AuthContextType>(() => ({
    user,
    authReady,
    adminPassword,
    login: async (username: string, password: string) => {
      if (username !== ADMIN_USERNAME) {
        throw new Error('Invalid username.');
      }
      if (!password) {
        throw new Error('Password cannot be empty.');
      }

      const nextUser = { username: ADMIN_USERNAME };
      window.localStorage.setItem(AUTH_STORAGE_KEY, ADMIN_USERNAME);
      setUser(nextUser);
      setAdminPassword(password);
    },
    logout: async () => {
      window.localStorage.removeItem(AUTH_STORAGE_KEY);
      setUser(null);
      setAdminPassword(undefined);
    }
  }), [authReady, user, adminPassword]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
