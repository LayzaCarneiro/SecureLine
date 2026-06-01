import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/hooks/useAuth";
import ProtectedRoute from "@/components/members/ProtectedRoute";
import Index from "@/pages/Index.tsx";
import NotFound from "@/pages/NotFound.tsx";
import Auth from "@/pages/Auth.tsx";
import MembersDashboard from "@/pages/members/MembersDashboard.tsx";
import TrainingsList from "@/pages/members/TrainingsList.tsx";
import TrainingPlayer from "@/pages/members/TrainingPlayer.tsx";
import AdminPanel from "@/pages/members/AdminPanel.tsx";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AuthProvider>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/members" element={<ProtectedRoute><MembersDashboard /></ProtectedRoute>} />
              <Route path="/members/trainings" element={<ProtectedRoute><TrainingsList /></ProtectedRoute>} />
              <Route path="/members/trainings/:id" element={<ProtectedRoute><TrainingPlayer /></ProtectedRoute>} />
              <Route path="/members/admin" element={<ProtectedRoute requireAdmin><AdminPanel /></ProtectedRoute>} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
