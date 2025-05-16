import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Landing from "@/pages/Landing";
import Dashboard from "@/pages/Dashboard";
import Profile from "@/pages/Profile";
import FamilyMembers from "@/pages/FamilyMembers";
import Newsletters from "@/pages/Newsletters";
import CreateOrEditProfile from "@/pages/CreateOrEditProfile";
import CreateFamily from "@/pages/CreateFamily";
import { useAuth } from "@/hooks/useAuth";
import { ThemeProvider } from "@/components/ThemeProvider";

// PrivateRoute wrapper component
function PrivateRoute({ component: Component, ...rest }: { component: React.FC }) {
  const { isAuthenticated, isLoading } = useAuth();
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  if (!isAuthenticated) {
    // Redirect to login
    window.location.href = "/api/login";
    return null;
  }
  
  return <Component {...rest} />;
}

function Router() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <div className="flex-grow">
        <Switch>
          <Route path="/" component={Landing} />
          <Route path="/dashboard">
            {() => <PrivateRoute component={Dashboard} />}
          </Route>
          <Route path="/profile">
            {() => <PrivateRoute component={Profile} />}
          </Route>
          <Route path="/profile/edit">
            {() => <PrivateRoute component={CreateOrEditProfile} />}
          </Route>
          <Route path="/family/create">
            {() => <PrivateRoute component={CreateFamily} />}
          </Route>
          <Route path="/family/:id/members">
            {(params) => <PrivateRoute component={() => <FamilyMembers familyId={Number(params.id)} />} />}
          </Route>
          <Route path="/family/:id/newsletters">
            {(params) => <PrivateRoute component={() => <Newsletters familyId={Number(params.id)} />} />}
          </Route>
          <Route component={NotFound} />
        </Switch>
      </div>
      <Footer />
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
