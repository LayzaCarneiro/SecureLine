import { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Loader2 } from "lucide-react";

interface Props {
  children: ReactNode;
  requireAdmin?: boolean;
}

// Lê o colaborador do localStorage de forma 100% síncrona
function getColaboradorFromStorage(): boolean {
  try {
    const stored = localStorage.getItem("colaborador");
    if (!stored || stored === "null" || stored === "undefined") return false;
    const parsed = JSON.parse(stored);
    return parsed !== null && typeof parsed === "object";
  } catch {
    return false;
  }
}

const ProtectedRoute = ({ children, requireAdmin }: Props) => {
  const { user, loading: authLoading, isAdmin } = useAuth();

  // Checa colaborador sincronamente — sem hook, sem useEffect, sem timing
  const hasColaborador = getColaboradorFromStorage();

  // Só espera o Supabase se ainda não temos colaborador via API própria
  if (authLoading && !hasColaborador) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const isAuthenticated = !!user || hasColaborador;

  if (!isAuthenticated) return <Navigate to="/auth" replace />;
  if (requireAdmin && !isAdmin) return <Navigate to="/members" replace />;

  return <>{children}</>;
};

export default ProtectedRoute;
