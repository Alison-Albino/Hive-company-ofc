import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Home from "./pages/home";
import Properties from "./pages/properties";
import Services from "./pages/services";
import Plans from "./pages/plans";
import Profiles from "./pages/profiles";
import ProfilePage from "./pages/profile";
import Navigation from "./components/navigation";
import Footer from "./components/footer";
import ChatWidget from "./components/chat-widget";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/properties" component={Properties} />
      <Route path="/services" component={Services} />
      <Route path="/plans" component={Plans} />
      <Route path="/profiles" component={Profiles} />
      <Route path="/profile/:profileId" component={ProfilePage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <div className="min-h-screen bg-white font-inter">
          <Navigation />
          <main>
            <Router />
          </main>
          <Footer />
          <ChatWidget />
          <Toaster />
        </div>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
