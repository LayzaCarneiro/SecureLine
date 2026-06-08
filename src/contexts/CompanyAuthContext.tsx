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
      // 1. Tenta autenticação via rota de API centralizada (igual aos colaboradores)
      try {
        const res = await fetch("https://api-golpe-whatsapp.onrender.com/auth/login", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({ apelido: codigoAcesso.trim(), senha }),
        });

        if (res.ok) {
          const data = await res.json();
          if (data.sucesso) {
            const companyData = data.colaborador || data.usuario || data.empresa || data;
            setCompany(companyData);
            localStorage.setItem("empresa", JSON.stringify(companyData));
            return;
          }
        }
      } catch (apiErr) {
        console.warn("⚠️ Falha na autenticação via endpoint /auth/login:", apiErr);
      }

      // 2. Fallback: Validação local (cliente) buscando nas empresas cadastradas
      const companies = await getCompanies();

      // Gera hash SHA-256 caso a senha no banco esteja salva criptografada (padrão antigo)
      const msgBuffer = new TextEncoder().encode(senha);
      const hashBuffer = await crypto.subtle.digest("SHA-256", msgBuffer);
      const hashHex = Array.from(new Uint8Array(hashBuffer))
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("");

      const found = companies.find(
        (c) =>
          (c.codigo_acesso || "").trim().toUpperCase() === codigoAcesso.trim().toUpperCase() &&
          (
            // Comparação de texto plano (novo padrão, idêntico aos colaboradores)
            c.senha === senha ||
            (c as any).senha_raw === senha ||
            c.email_admin === senha ||
            // Compatibilidade com hashes anteriores
            c.senha === hashHex ||
            (c as any).senha_raw === hashHex ||
            c.email_admin === hashHex
          )
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
