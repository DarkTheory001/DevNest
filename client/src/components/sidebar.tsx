import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  LayoutDashboard, 
  Code, 
  MessageSquare, 
  Github, 
  MessageCircle,
  Coins,
  Users,
  Gift,
  Settings,
  Cloud
} from "lucide-react";
import { SiWhatsapp } from "react-icons/si";

const navigationItems = [
  { href: "/", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/ide", icon: Code, label: "IDE" },
  { href: "/whatsapp-bots", icon: SiWhatsapp, label: "WhatsApp Bots" },
  { href: "/github-repos", icon: Github, label: "GitHub Repos" },
  { href: "/chat", icon: MessageCircle, label: "Chat", badge: 3 },
  { href: "/transactions", icon: Coins, label: "Transactions" },
];

const adminItems = [
  { href: "/admin/users", icon: Users, label: "User Management" },
  { href: "/admin/coins", icon: Gift, label: "Coin Distribution" },
];

export function Sidebar() {
  const { user } = useAuth();
  const [location] = useLocation();

  if (!user) return null;

  const getUserInitials = (user: any) => {
    if (user.firstName && user.lastName) {
      return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
    }
    if (user.email) {
      return user.email[0].toUpperCase();
    }
    return "U";
  };

  return (
    <div className="w-64 bg-card border-r border-border flex flex-col h-full" data-testid="sidebar">
      {/* Logo and User Info */}
      <div className="p-6 border-b border-border">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-8 h-8 bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center">
            <Cloud className="text-white w-4 h-4" />
          </div>
          <h1 className="text-xl font-bold text-primary">DevCloud</h1>
        </div>
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
            <span className="text-primary-foreground text-sm font-medium">
              {getUserInitials(user)}
            </span>
          </div>
          <div>
            <p className="text-sm font-medium" data-testid="user-name">
              {(user as any).firstName && (user as any).lastName 
                ? `${(user as any).firstName} ${(user as any).lastName}` 
                : (user as any).email}
            </p>
            <div className="flex items-center space-x-2">
              <Coins className="text-accent w-3 h-3" />
              <span className="text-xs text-muted-foreground" data-testid="user-coin-balance">
                {(user as any).coinBalance || 0} coins
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {navigationItems.map((item) => {
          const Icon = item.icon;
          const isActive = location === item.href;
          
          return (
            <Link key={item.href} href={item.href}>
              <a
                className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all ${
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "hover:bg-muted text-muted-foreground hover:text-foreground"
                }`}
                data-testid={`nav-${item.label.toLowerCase().replace(/\s+/g, '-')}`}
              >
                <Icon className="w-4 h-4" />
                <span className="font-medium">{item.label}</span>
                {item.badge && (
                  <Badge 
                    className="ml-auto bg-accent text-accent-foreground text-xs px-2 py-1"
                    data-testid={`badge-${item.label.toLowerCase().replace(/\s+/g, '-')}`}
                  >
                    {item.badge}
                  </Badge>
                )}
              </a>
            </Link>
          );
        })}

        {/* Admin Section */}
        {(user as any).isAdmin && (
          <div className="pt-4 border-t border-border">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2 px-4">
              Admin
            </p>
            {adminItems.map((item) => {
              const Icon = item.icon;
              const isActive = location === item.href;
              
              return (
                <Link key={item.href} href={item.href}>
                  <a
                    className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all ${
                      isActive
                        ? "bg-primary/10 text-primary"
                        : "hover:bg-muted text-muted-foreground hover:text-foreground"
                    }`}
                    data-testid={`admin-nav-${item.label.toLowerCase().replace(/\s+/g, '-')}`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </a>
                </Link>
              );
            })}
          </div>
        )}
      </nav>

      {/* Settings */}
      <div className="p-4 border-t border-border">
        <Button
          variant="ghost"
          className="w-full justify-start"
          onClick={() => window.location.href = '/api/logout'}
          data-testid="logout-button"
        >
          <Settings className="w-4 h-4 mr-3" />
          <span>Logout</span>
        </Button>
      </div>
    </div>
  );
}
