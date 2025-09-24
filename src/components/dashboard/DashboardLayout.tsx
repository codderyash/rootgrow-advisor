import { useState } from "react";
import { Button } from "@/components/ui/button";
import { 
  LayoutDashboard, 
  MessageSquare, 
  TrendingUp, 
  MapPin,
  Settings,
  LogOut,
  Menu,
  X,
  RefreshCw
} from "lucide-react";
import smartRootsLogo from "@/assets/smartroots-logo.jpg";
import SensorDashboard from "./SensorDashboard";
import ChatInterface from "./ChatInterface";
import YieldPrediction from "./YieldPrediction";
import MarketRecommendations from "./MarketRecommendations";

interface DashboardLayoutProps {
  user: { name: string; email: string };
  onLogout: () => void;
}

export default function DashboardLayout({ user, onLogout }: DashboardLayoutProps) {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const navigation = [
    { id: "dashboard", name: "Dashboard", icon: LayoutDashboard },
    { id: "chat", name: "AgriBot Chat", icon: MessageSquare },
    { id: "yield", name: "Yield Prediction", icon: TrendingUp },
    { id: "market", name: "Market Intel", icon: MapPin },
  ];

  const handleRefresh = async () => {
    setIsRefreshing(true);
    // Simulate data refresh
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsRefreshing(false);
  };

  const renderContent = () => {
    switch (activeTab) {
      case "dashboard":
        return <SensorDashboard />;
      case "chat":
        return <ChatInterface />;
      case "yield":
        return <YieldPrediction />;
      case "market":
        return <MarketRecommendations />;
      default:
        return <SensorDashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-sidebar border-r border-sidebar-border transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-sidebar-border">
            <div className="flex items-center gap-3">
              <img 
                src={smartRootsLogo} 
                alt="SmartRoots" 
                className="w-10 h-10 rounded-lg"
              />
              <div>
                <h1 className="text-lg font-bold text-sidebar-foreground">SmartRoots</h1>
                <p className="text-xs text-sidebar-foreground/60">Agricultural AI</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="lg:hidden"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2">
            {navigation.map((item) => {
              const Icon = item.icon;
              return (
                <Button
                  key={item.id}
                  variant={activeTab === item.id ? "default" : "ghost"}
                  className={`w-full justify-start gap-3 ${
                    activeTab === item.id 
                      ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-[var(--shadow-glow)]" 
                      : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                  }`}
                  onClick={() => {
                    setActiveTab(item.id);
                    setSidebarOpen(false);
                  }}
                >
                  <Icon className="h-4 w-4" />
                  {item.name}
                </Button>
              );
            })}
          </nav>

          {/* User Profile & Actions */}
          <div className="p-4 border-t border-sidebar-border space-y-3">
            <Button
              variant="outline"
              className="w-full justify-start gap-3 border-sidebar-border"
              onClick={handleRefresh}
              disabled={isRefreshing}
            >
              <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              {isRefreshing ? "Refreshing..." : "Refresh Data"}
            </Button>
            
            <div className="flex items-center gap-3 p-2 rounded-lg bg-sidebar-accent/50">
              <div className="w-8 h-8 rounded-full bg-gradient-primary flex items-center justify-center text-sidebar-primary-foreground font-medium text-sm">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-sidebar-foreground truncate">{user.name}</p>
                <p className="text-xs text-sidebar-foreground/60 truncate">{user.email}</p>
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                className="flex-1 border-sidebar-border"
              >
                <Settings className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="flex-1 border-sidebar-border hover:bg-destructive hover:text-destructive-foreground"
                onClick={onLogout}
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="lg:pl-64">
        {/* Mobile Header */}
        <div className="lg:hidden flex items-center justify-between p-4 border-b border-border bg-card/80 backdrop-blur-sm sticky top-0 z-30">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-5 w-5" />
          </Button>
          <h1 className="font-semibold">SmartRoots</h1>
          <div className="w-9" /> {/* Spacer */}
        </div>

        {/* Content Area */}
        <main className="p-4 lg:p-6">
          {renderContent()}
        </main>
      </div>
    </div>
  );
}