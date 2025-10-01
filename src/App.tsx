import { useState } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import LoginPage from "./components/auth/LoginPage";
import SignupPageEnhanced from "./components/auth/SignupPageEnhanced";
import DashboardLayout from "./components/dashboard/DashboardLayout";
import { LanguageProvider } from "./contexts/LanguageContext";

const queryClient = new QueryClient();

export interface User {
  name: string;
  email: string;
  landSize?: string;
  landUnit?: string;
  language?: string;
  cropType?: string;
}

const App = () => {
  const [user, setUser] = useState<User | null>(null);
  const [authMode, setAuthMode] = useState<"login" | "signup">("login");

  const handleLogin = (credentials: { email: string; password: string }) => {
    // Mock login - in real app this would authenticate with backend
    setUser({
      name: credentials.email.split('@')[0],
      email: credentials.email
    });
  };

  const handleSignup = (userData: { 
    name: string; 
    email: string; 
    password: string; 
    landSize: string;
    landUnit: string;
    language: string;
  }) => {
    // Mock signup - in real app this would create account in backend
    setUser({
      name: userData.name,
      email: userData.email,
      landSize: userData.landSize,
      landUnit: userData.landUnit,
      language: userData.language
    });
  };

  const handleLogout = () => {
    setUser(null);
  };

  return (
    <QueryClientProvider client={queryClient}>
      <LanguageProvider initialLanguage={user?.language || 'en'}>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          {!user ? (
              authMode === "login" ? (
                <LoginPage 
                  onLogin={handleLogin}
                  onSwitchToSignup={() => setAuthMode("signup")}
                />
              ) : (
                <SignupPageEnhanced 
                  onSignup={handleSignup}
                  onSwitchToLogin={() => setAuthMode("login")}
                />
              )
            ) : (
              <DashboardLayout 
                user={user}
                onLogout={handleLogout}
            />
          )}
        </TooltipProvider>
      </LanguageProvider>
    </QueryClientProvider>
  );
};

export default App;
