import {
  Shield,
  Menu,
  X,
  UserCircle,
  ChevronRight,
  LogOut,
  Building,
} from "lucide-react";

import { useState } from "react";
import { Link } from "react-router-dom";

import { motion, AnimatePresence } from "framer-motion";

import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useColaborador } from "@/hooks/useColaborador";
import { useCompanyAuth } from "@/contexts/CompanyAuthContext";

interface NavbarProps {
  onNavigate: (
    section: "home" | "education" | "simulation"
  ) => void;

  currentView: string;
}

const Navbar = ({
  onNavigate,
  currentView,
}: NavbarProps) => {
  const [mobileOpen, setMobileOpen] =
    useState(false);

  const { user } = useAuth();
  const { colaborador, logout } = useColaborador();
  const { company, logout: logoutCompany } = useCompanyAuth();

  const links = [
    {
      label: "Início",
      section: "home" as const,
    },
    {
      label: "Aprender",
      section: "education" as const,
    },
    {
      label: "Simulação",
      section: "simulation" as const,
    },
  ];

  return (
    <nav
      className="
        sticky top-0 z-50
        border-b border-white/10
        bg-[#060816]/80
        backdrop-blur-2xl
      "
    >
      {/* Glow */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(124,58,237,0.12),transparent_40%)]" />

      <div
        className="
          relative z-10
          container mx-auto px-4
          h-20
          flex items-center justify-between
        "
      >
        {/* Logo */}
        <button
          onClick={() => onNavigate("home")}
          className="
            group
            flex items-center gap-3
          "
        >
          <div
            className="
              relative
              flex items-center justify-center
              transition-transform duration-300
              group-hover:scale-105
            "
          >
            <img
              src="/images/logo.svg"
              alt="SecureLine"
              className="w-10 h-10"
            />
          </div>
{/* 
          <div className="flex items-center gap-3 mb-4">

          </div> */}

          <div className="text-left">
            <p className="text-lg font-black tracking-tight text-white">
              SecureLine
            </p>

            <p className="text-[10px] uppercase tracking-[0.2em] text-zinc-500">
              Security Awareness
            </p>
          </div>
        </button>

        {/* Desktop Nav */}
        <div
          className="
            hidden md:flex
            items-center gap-2
            rounded-2xl
            border border-white/10
            bg-white/[0.03]
            p-1.5
            backdrop-blur-xl
          "
        >
          {links.map((link) => {
            const active =
              currentView === link.section;

            return (
              <button
                key={link.section}
                onClick={() =>
                  onNavigate(link.section)
                }
                className={`
                  relative
                  px-5 py-2.5
                  rounded-xl
                  text-sm font-medium
                  transition-all duration-300
                  ${
                    active
                      ? "text-black"
                      : "text-zinc-400 hover:text-white"
                  }
                `}
              >
                {active && (
                  <motion.div
                    layoutId="navbar-active"
                    className="
                      absolute inset-0
                      rounded-xl
                      bg-gradient-to-r
                      from-primary
                      to-secondary
                      shadow-[0_10px_30px_rgba(124,58,237,0.35)]
                    "
                    transition={{
                      type: "spring",
                      bounce: 0.2,
                      duration: 0.6,
                    }}
                  />
                )}

                <span className="relative z-10">
                  {link.label}
                </span>
              </button>
            );
          })}
        </div>

        {/* Desktop Actions */}
        <div className="hidden md:flex items-center gap-3">
          {/* Company Auth Status */}
          {(company || !colaborador) && (
            company ? (
              <div className="flex items-center gap-2">
                <Button
                  asChild
                  variant="outline"
                  size="sm"
                  className="
                    h-11
                    rounded-2xl
                    border-white/10
                    bg-white/[0.03]
                    hover:bg-white/[0.06]
                    text-white
                    backdrop-blur-xl
                  "
                >
                  <Link to="/company/dashboard">
                    <Building className="w-4 h-4 mr-2" />
                    {company.nome}
                  </Link>
                </Button>
                <Button
                  onClick={logoutCompany}
                  variant="outline"
                  size="sm"
                  className="
                    h-11
                    rounded-2xl
                    border-white/10
                    bg-white/[0.03]
                    hover:bg-white/[0.06]
                    text-zinc-300
                    hover:text-white
                  "
                >
                  <LogOut className="w-4 h-4" />
                </Button>
              </div>
            ) : (
              <Button
                asChild
                variant="ghost"
                size="sm"
                className="
                  h-11
                  rounded-2xl
                  text-zinc-400
                  hover:text-white
                "
              >
                <Link to="/company/login">
                  Empresas
                </Link>
              </Button>
            )
          )}

          {/* Colaborador Auth Status */}
          {(colaborador || !company) && (
            colaborador ? (
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 px-4 py-2.5 rounded-2xl border border-white/10 bg-white/[0.03]">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-r from-primary to-secondary flex items-center justify-center">
                    <UserCircle className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-sm font-medium text-white">
                    {colaborador.nome || colaborador.codigo_colaborador}
                  </span>
                </div>
                
                <Button
                  onClick={logout}
                  variant="outline"
                  size="sm"
                  className="
                    h-11
                    rounded-2xl
                    border-white/10
                    bg-white/[0.03]
                    hover:bg-white/[0.06]
                    text-zinc-300
                    hover:text-white
                  "
                >
                  <LogOut className="w-4 h-4" />
                </Button>
              </div>
            ) : (
              <Button
                asChild
                variant="outline"
                size="sm"
                className="
                  h-11
                  rounded-2xl
                  border-white/10
                  bg-white/[0.03]
                  hover:bg-white/[0.06]
                  text-white
                  backdrop-blur-xl
                "
              >
                <Link to="/auth">
                  <UserCircle className="w-4 h-4 mr-2" />
                  Entrar
                </Link>
              </Button>
            )
          )}

          <Button
            onClick={() =>
              onNavigate("simulation")
            }
            className="
              h-11 px-5
              rounded-2xl
              text-sm font-semibold
              bg-gradient-to-r
              from-primary
              to-secondary
              shadow-[0_10px_40px_rgba(124,58,237,0.35)]
              hover:opacity-90
            "
          >
            Iniciar Quiz

            <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        </div>

        {/* Mobile Toggle */}
        <button
          className="
            md:hidden
            w-11 h-11
            rounded-2xl
            border border-white/10
            bg-white/[0.03]
            flex items-center justify-center
            text-white
          "
          onClick={() =>
            setMobileOpen(!mobileOpen)
          }
        >
          {mobileOpen ? (
            <X className="w-5 h-5" />
          ) : (
            <Menu className="w-5 h-5" />
          )}
        </button>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{
              opacity: 0,
              y: -10,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            exit={{
              opacity: 0,
              y: -10,
            }}
            transition={{
              duration: 0.2,
            }}
            className="
              md:hidden
              border-t border-white/5
              bg-[#060816]/95
              backdrop-blur-2xl
            "
          >
            <div className="container mx-auto px-4 py-5 space-y-2">
              {links.map((link) => {
                const active =
                  currentView === link.section;

                return (
                  <button
                    key={link.section}
                    onClick={() => {
                      onNavigate(link.section);

                      setMobileOpen(false);
                    }}
                    className={`
                      w-full
                      flex items-center justify-between
                      px-4 py-4
                      rounded-2xl
                      text-sm font-medium
                      transition-all duration-300
                      ${
                        active
                          ? "bg-gradient-to-r from-primary to-secondary text-white"
                          : "bg-white/[0.03] text-zinc-300 hover:bg-white/[0.06]"
                      }
                    `}
                  >
                    {link.label}

                    <ChevronRight className="w-4 h-4 opacity-60" />
                  </button>
                );
              })}

              {/* Company Mobile Auth Status */}
              {(company || !colaborador) && (
                company ? (
                  <>
                    <Link
                      to="/company/dashboard"
                      onClick={() => setMobileOpen(false)}
                      className="
                        w-full
                        flex items-center justify-between
                        px-4 py-4
                        rounded-2xl
                        bg-white/[0.03]
                        text-sm font-medium
                        text-zinc-300
                        hover:bg-white/[0.06]
                        transition-all
                      "
                    >
                      <div className="flex items-center gap-2">
                        <Building className="w-4 h-4 text-primary" />
                        <span>{company.nome} (Painel)</span>
                      </div>
                      <ChevronRight className="w-4 h-4 opacity-60" />
                    </Link>
                    <button
                      onClick={() => {
                        logoutCompany();
                        setMobileOpen(false);
                      }}
                      className="
                        w-full
                        flex items-center justify-between
                        px-4 py-4
                        rounded-2xl
                        bg-white/[0.03]
                        text-sm font-medium
                        text-red-400
                        hover:bg-white/[0.06]
                        transition-all
                      "
                    >
                      <div className="flex items-center gap-2">
                        <LogOut className="w-4 h-4" />
                        <span>Sair da Empresa</span>
                      </div>
                      <ChevronRight className="w-4 h-4 opacity-60" />
                    </button>
                  </>
                ) : (
                  <Link
                    to="/company/login"
                    onClick={() => setMobileOpen(false)}
                    className="
                      w-full
                      flex items-center justify-between
                      px-4 py-4
                      rounded-2xl
                      bg-white/[0.03]
                      text-sm font-medium
                      text-zinc-300
                      hover:bg-white/[0.06]
                      transition-all
                    "
                  >
                    <div className="flex items-center gap-2">
                      <Building className="w-4 h-4" />
                      <span>Área da Empresa</span>
                    </div>
                    <ChevronRight className="w-4 h-4 opacity-60" />
                  </Link>
                )
              )}

              {/* Colaborador Mobile Auth Status */}
              {(colaborador || !company) && (
                <Link
                  to={!colaborador ? "/auth" : "#"}
                  onClick={() => {
                    if (colaborador) {
                      logout();
                    }
                    setMobileOpen(false);
                  }}
                  className="
                    w-full
                    flex items-center justify-between
                    px-4 py-4
                    rounded-2xl
                    bg-white/[0.03]
                    text-sm font-medium
                    text-zinc-300
                    hover:bg-white/[0.06]
                    transition-all
                  "
                >
                  <div className="flex items-center gap-2">
                    <UserCircle className="w-4 h-4" />

                    {colaborador
                      ? colaborador.nome || colaborador.codigo_colaborador
                      : "Entrar como Colaborador"}
                  </div>

                  <ChevronRight className="w-4 h-4 opacity-60" />
                </Link>
              )}

              <Button
                onClick={() => {
                  onNavigate("simulation");

                  setMobileOpen(false);
                }}
                className="
                  w-full
                  h-12
                  rounded-2xl
                  mt-2
                  bg-gradient-to-r
                  from-primary
                  to-secondary
                  shadow-[0_10px_40px_rgba(124,58,237,0.35)]
                "
              >
                Iniciar Quiz
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;