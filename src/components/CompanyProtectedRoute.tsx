import { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useCompanyAuth } from "@/contexts/CompanyAuthContext";
import { Loader2 } from "lucide-react";

interface Props {
  children: ReactNode;
}

const CompanyProtectedRoute = ({ children }: Props) => {
  const { company, loading } = useCompanyAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#060816]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!company) {
    return <Navigate to="/company/login" replace />;
  }

  return <>{children}</>;
};

export default CompanyProtectedRoute;
