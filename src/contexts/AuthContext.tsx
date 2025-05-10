import React, { createContext, useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from "@/hooks/use-toast";

export type SubscriptionTier = 'basic' | 'premium' | 'enterprise';

export interface User {
  id: string;
  email: string;
  name: string;
  subscription: {
    tier: SubscriptionTier;
    expiresAt: string;
    features: string[];
  };
  isFullAdmin?: boolean; // Added for full admin control
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  socialLogin: (provider: 'google' | 'facebook') => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// List of emails with full admin privileges regardless of subscription tier
const fullAdminEmails = ["ahmedmokireldin.developers@gmail.com"];

// Mock API calls for now - would be replaced with real API in production
const mockLogin = async (email: string, password: string): Promise<User> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      // Check if the email is in the fullAdminEmails list
      const isFullAdmin = fullAdminEmails.includes(email.toLowerCase());
      
      resolve({
        id: 'user-123',
        email,
        name: 'Demo User',
        subscription: {
          tier: isFullAdmin ? 'enterprise' : 'premium', // Ensure full admins always have enterprise access
          expiresAt: new Date(Date.now() + 30 * 86400000).toISOString(), // 30 days from now
          features: isFullAdmin 
            ? ['bulk_extraction', 'export_all', 'advanced_filters', 'admin_access'] 
            : ['bulk_extraction', 'export_all', 'advanced_filters']
        },
        isFullAdmin // Add the isFullAdmin flag
      });
    }, 1000);
  });
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // Check for existing session
    const checkAuth = async () => {
      try {
        const savedUser = localStorage.getItem('user');
        if (savedUser) {
          setUser(JSON.parse(savedUser));
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      const user = await mockLogin(email, password);
      setUser(user);
      localStorage.setItem('user', JSON.stringify(user));
      toast({
        title: "Login Successful",
        description: `Welcome back, ${user.name}!${user.isFullAdmin ? ' (Full Admin Access)' : ''}`,
      });
      navigate('/dashboard');
    } catch (error) {
      console.error('Login error:', error);
      toast({
        title: "Login Failed",
        description: "Invalid email or password",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      setIsLoading(true);
      setUser(null);
      localStorage.removeItem('user');
      toast({
        title: "Logged Out",
        description: "You have been successfully logged out",
      });
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
      toast({
        title: "Error",
        description: "Failed to log out",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const socialLogin = async (provider: 'google' | 'facebook') => {
    try {
      setIsLoading(true);
      // This would be implemented with actual OAuth in the production version
      const mockUser: User = {
        id: `user-${Date.now()}`,
        email: `user@${provider}.com`,
        name: `${provider.charAt(0).toUpperCase() + provider.slice(1)} User`,
        subscription: {
          tier: 'basic',
          expiresAt: new Date(Date.now() + 7 * 86400000).toISOString(), // 7 days free trial
          features: ['basic_extraction']
        },
        isFullAdmin: false // Set isFullAdmin to false for non-full admin users
      };
      
      setUser(mockUser);
      localStorage.setItem('user', JSON.stringify(mockUser));
      toast({
        title: "Login Successful",
        description: `Welcome, ${mockUser.name}!`,
      });
      navigate('/dashboard');
    } catch (error) {
      console.error(`${provider} login error:`, error);
      toast({
        title: "Login Failed",
        description: `Failed to login with ${provider}`,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
        socialLogin
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
