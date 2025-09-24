import { useState } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import LoginPage from "./components/auth/LoginPage";
import SignupPage from "./components/auth/SignupPage";
import DashboardLayout from "./components/dashboard/DashboardLayout";

const queryClient = new QueryClient();

interface User {
  name: string;
  email: string;
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

  const handleSignup = (userData: { name: string; email: string; password: string }) => {
    // Mock signup - in real app this would create account in backend
    setUser({
      name: userData.name,
      email: userData.email
    });
  };

  const handleLogout = () => {
    setUser(null);
  };

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <div className="dark"> {/* Force dark theme */}
          <Toaster />
          <Sonner />
          {!user ? (
            authMode === "login" ? (
              <LoginPage 
                onLogin={handleLogin}
                onSwitchToSignup={() => setAuthMode("signup")}
              />
            ) : (
              <SignupPage 
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
        </div>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
