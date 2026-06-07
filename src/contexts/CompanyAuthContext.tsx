import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { Company, getCompanies } from "@/services/company";

interface CompanyAuthContextType {
  company: Company | null;
  loading: boolean;
  login: (codigoAcesso: string, senha: string) => Promise<void>;
  logout: () => void;
}

const CompanyAuthContext = createContext<CompanyAuthContextType | undefined>(undefined);

export const CompanyAuthProvider = ({ children }: { children: ReactNode }) => {
  const [company, setCompany] = useState<Company | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem("empresa");
    if (stored) {
      try {
        setCompany(JSON.parse(stored));
      } catch (e) {
        console.error("Erro ao ler dados da empresa do localStorage", e);
        localStorage.removeItem("empresa");
      }
    }
    setLoading(false);
  }, []);

  const login = async (codigoAcesso: string, senha: string) => {
    setLoading(true);
    try {
      const companies = await getCompanies();
      const found = companies.find(
        (c) =>
          c.codigo_acesso.trim().toUpperCase() === codigoAcesso.trim().toUpperCase() &&
          c.senha === senha
      );

      if (!found) {
        throw new Error("Código de acesso ou senha inválidos.");
      }

      setCompany(found);
      localStorage.setItem("empresa", JSON.stringify(found));
    } catch (error: any) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem("empresa");
    setCompany(null);
  };

  return (
    <CompanyAuthContext.Provider value={{ company, loading, login, logout }}>
      {children}
    </CompanyAuthContext.Provider>
  );
};

export const useCompanyAuth = () => {
  const context = useContext(CompanyAuthContext);
  if (!context) {
    throw new Error("useCompanyAuth deve ser utilizado dentro de um CompanyAuthProvider");
  }
  return context;
};
