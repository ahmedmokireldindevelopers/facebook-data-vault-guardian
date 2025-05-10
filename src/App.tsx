
import { useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { initLocale } from "./utils/i18n";

// Pages
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Dashboard from "./pages/Dashboard";
import Settings from "./pages/Settings";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import SubscriptionPage from "./pages/SubscriptionPage";
import AdminSubscriberPage from "./pages/AdminSubscriberPage";
import AdminDashboardPage from "./pages/AdminDashboardPage";

const queryClient = new QueryClient();

// Protected route component
const ProtectedRoute = ({ element }: { element: React.ReactNode }) => {
  const { isAuthenticated, isLoading } = useAuth();
  
  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">
      <div className="inline-block h-12 w-12 rounded-full border-4 border-primary border-t-transparent animate-spin"></div>
    </div>;
  }
  
  return isAuthenticated ? element : <Navigate to="/login" replace />;
};

// Admin route component
const AdminRoute = ({ element }: { element: React.ReactNode }) => {
  const { user, isLoading, isAuthenticated } = useAuth();
  
  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">
      <div className="inline-block h-12 w-12 rounded-full border-4 border-primary border-t-transparent animate-spin"></div>
    </div>;
  }
  
  // Check if user is authenticated and has admin permission (enterprise tier or isFullAdmin)
  const isAdmin = isAuthenticated && (user?.subscription?.tier === "enterprise" || user?.isFullAdmin);
  
  return isAdmin ? element : <Navigate to="/dashboard" replace />;
};

// Auth wrapper component
const AuthenticatedApp = () => {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/dashboard" />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/dashboard" element={<ProtectedRoute element={<Dashboard />} />} />
      <Route path="/settings" element={<ProtectedRoute element={<Settings />} />} />
      <Route path="/subscription" element={<ProtectedRoute element={<SubscriptionPage />} />} />
      <Route path="/admin/dashboard" element={<ProtectedRoute element={<AdminDashboardPage />} />} />
      <Route path="/admin/subscribers" element={<ProtectedRoute element={<AdminSubscriberPage />} />} />
      {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

// Main App component
const App = () => {
  useEffect(() => {
    // Initialize language
    initLocale();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <TooltipProvider>
          <AuthProvider>
            <Toaster />
            <Sonner />
            <AuthenticatedApp />
          </AuthProvider>
        </TooltipProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
};

export default App;
