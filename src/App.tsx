import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { LanguageProvider } from "@/contexts/LanguageContext";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import Segreteria from "./pages/Segreteria";
import Tesoreria from "./pages/Tesoreria";
import Presidenza from "./pages/Presidenza";
import Prefettura from "./pages/Prefettura";
import Direttivo from "./pages/Direttivo";
import Comunicazione from "./pages/Comunicazione";
import Soci from "./pages/Soci";
import CreateDocument from "./pages/CreateDocument";
import RecurringMeetingsSettings from "./components/RecurringMeetingsSettings";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <LanguageProvider>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
            <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/segreteria" element={<Segreteria />} />
            <Route path="/tesoreria" element={<Tesoreria />} />
            <Route path="/presidenza" element={<Presidenza />} />
            <Route path="/prefettura" element={<Prefettura />} />
            <Route path="/direttivo" element={<Direttivo />} />
            <Route path="/comunicazione" element={<Comunicazione />} />
            <Route path="/soci" element={<Soci />} />
            <Route path="/create-document" element={<CreateDocument />} />
            <Route path="/document/:id" element={<CreateDocument />} />
            <Route path="/document/:id/edit" element={<CreateDocument />} />
            <Route path="/recurring-meetings" element={<RecurringMeetingsSettings />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </LanguageProvider>
  </QueryClientProvider>
);

export default App;
