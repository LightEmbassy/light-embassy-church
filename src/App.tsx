import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { NavigationProvider } from "./contexts/NavigationContext";
import Index from "./pages/Index";
import Admin from "./pages/Admin";
import Auth from "./pages/Auth";
import Watch from "./pages/Watch";
import NotFound from "./pages/NotFound";
import Prayers from "./pages/Prayers";
import Podcast from "./pages/Podcast";
import Learn from "./pages/Learn";
import Messages from "./pages/Messages";
import Privacy from "./pages/Privacy";
import DeleteAccount from "./pages/DeleteAccount";
import ReleaseNotes from "./pages/ReleaseNotes";
import { AdminRoute } from "./components/auth/AdminRoute";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <NavigationProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/auth" element={<Auth />} />
              <Route path="/" element={<Index />} />
              <Route path="/watch" element={<Watch />} />
              <Route path="/prayers" element={<Prayers />} />
              <Route path="/podcast" element={<Podcast />} />
              <Route path="/learn" element={<Learn />} />
              <Route path="/messages" element={<Messages />} />
              <Route path="/privacy" element={<Privacy />} />
              <Route path="/delete-account" element={<DeleteAccount />} />
              <Route path="/release-notes" element={<ReleaseNotes />} />
              <Route path="/admin" element={<AdminRoute><Admin /></AdminRoute>} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </NavigationProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
