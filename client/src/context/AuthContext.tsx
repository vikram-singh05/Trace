import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from 'react';
import type { ReactNode } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { authApi } from '../api/authApi';
import { connectSocket, disconnectSocket } from '../lib/socket';
import type { User, LoginInput, RegisterInput } from '../types';


interface AuthContextValue {

  user: User | null;

  isLoading: boolean;

  isAuthenticated: boolean;

  isAdmin: boolean;

  login: (data: LoginInput) => Promise<void>;
  register: (data: RegisterInput) => Promise<void>;

  verifyOtp: (email: string, otp: string) => Promise<void>;

  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);



export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const queryClient = useQueryClient();

  useEffect(() => {
    const checkSession = async () => {
      const currentUser = await authApi.getMe();
      setUser(currentUser);
      if (currentUser) {
        connectSocket();
      }
      setIsLoading(false);
    };

    checkSession();
  }, []);

  const login = useCallback(async (data: LoginInput) => {
    const loggedInUser = await authApi.login(data);
    setUser(loggedInUser);
    connectSocket();
    queryClient.clear();
  }, [queryClient]);

  const register = useCallback(async (data: RegisterInput) => {
    await authApi.register(data);
  }, []);

  const verifyOtp = useCallback(async (email: string, otp: string) => {
    const newUser = await authApi.verifyOtp(email, otp);
    setUser(newUser);
    connectSocket();
    queryClient.clear();
  }, [queryClient]);

  const logout = useCallback(async () => {
    await authApi.logout();
    setUser(null);
    disconnectSocket();
    queryClient.clear();
  }, [queryClient]);

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        isAdmin: user?.role === 'ADMIN',
        login,
        register,
        verifyOtp,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextValue => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an <AuthProvider>');
  }
  return context;
};
