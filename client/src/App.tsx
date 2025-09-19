import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/theme-provider";
import { useAuth } from "@/hooks/useAuth";

// Pages
import Landing from "@/pages/landing";
import Dashboard from "@/pages/dashboard";
import IDE from "@/pages/ide";
import WhatsAppBots from "@/pages/whatsapp-bots";
import GitHubRepos from "@/pages/github-repos";
import Chat from "@/pages/chat";
import Transactions from "@/pages/transactions";
import AdminUsers from "@/pages/admin-users";
import AdminCoins from "@/pages/admin-coins";
import NotFound from "@/pages/not-found";

function Router() {
  const { isAuthenticated, isLoading } = useAuth();

  return (
    <Switch>
      {isLoading || !isAuthenticated ? (
        <Route path="/" component={Landing} />
      ) : (
        <>
          <Route path="/" component={Dashboard} />
          <Route path="/ide" component={IDE} />
          <Route path="/whatsapp-bots" component={WhatsAppBots} />
          <Route path="/github-repos" component={GitHubRepos} />
          <Route path="/chat" component={Chat} />
          <Route path="/transactions" component={Transactions} />
          <Route path="/admin/users" component={AdminUsers} />
          <Route path="/admin/coins" component={AdminCoins} />
        </>
      )}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="light" storageKey="devcloud-ui-theme">
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
