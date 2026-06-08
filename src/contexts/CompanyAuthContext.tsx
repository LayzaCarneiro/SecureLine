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

      // Gera hash SHA-256 da senha digitada
      const msgBuffer = new TextEncoder().encode(senha);
      const hashBuffer = await crypto.subtle.digest("SHA-256", msgBuffer);
      const hashHex = Array.from(new Uint8Array(hashBuffer))
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("");

      const found = companies.find(
        (c) =>
          c.codigo_acesso.trim().toUpperCase() === codigoAcesso.trim().toUpperCase() &&
          // Compara hash SHA-256 com o campo senha (novo padrão)
          // Fallback: compara com email_admin (contas criadas antes da migração)
          (c.senha === hashHex || c.email_admin === hashHex)
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
