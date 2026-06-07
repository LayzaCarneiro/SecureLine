import { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useColaborador } from "@/hooks/useColaborador";
import { Loader2 } from "lucide-react";

interface Props {
  children: ReactNode;
  requireAdmin?: boolean;
}

const ProtectedRoute = ({ children, requireAdmin }: Props) => {
  const { user, loading: authLoading, isAdmin } = useAuth();
  const { colaborador, loading: colaboradorLoading } = useColaborador();

  const loading = authLoading || colaboradorLoading;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  // Aceita autenticação via Supabase OU via API própria (localStorage)
  const isAuthenticated = !!user || !!colaborador;

  if (!isAuthenticated) return <Navigate to="/auth" replace />;
  if (requireAdmin && !isAdmin) return <Navigate to="/members" replace />;

  return <>{children}</>;
};

export default ProtectedRoute;
