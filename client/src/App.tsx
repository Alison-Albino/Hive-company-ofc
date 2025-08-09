import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ChatProvider } from "@/context/ChatContext";
import NotFound from "@/pages/not-found";
import Home from "./pages/home";
import Properties from "./pages/properties";
import Services from "./pages/services";
import Plans from "./pages/plans";
import ProfilePage from "./pages/profile";
import ChatPage from "./pages/chat";
import PropertyDetail from "./pages/property-detail";
import Navigation from "./components/navigation";
import Footer from "./components/footer";
import ChatManager from "./components/chat/ChatManager";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/properties" component={Properties} />
      <Route path="/property/:id" component={PropertyDetail} />
      <Route path="/services" component={Services} />
      <Route path="/services/:category" component={Services} />
      <Route path="/profile/:profileId" component={ProfilePage} />
      <Route path="/plans" component={Plans} />
      <Route path="/chat" component={ChatPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ChatProvider>
        <TooltipProvider>
          <div className="min-h-screen bg-white font-inter">
            <Navigation />
            <main>
              <Router />
            </main>
            <Footer />
            <ChatManager />
            <Toaster />
          </div>
        </TooltipProvider>
      </ChatProvider>
    </QueryClientProvider>
  );
}

export default App;
