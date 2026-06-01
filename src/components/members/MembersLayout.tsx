import { ReactNode } from "react";

import {
  Link,
  useLocation,
  useNavigate,
} from "react-router-dom";

import {
  Shield,
  LogOut,
  LayoutDashboard,
  GraduationCap,
  Users,
  ChevronRight,
} from "lucide-react";

import { motion } from "framer-motion";

import { useAuth } from "@/hooks/useAuth";

import { Button } from "@/components/ui/button";

const MembersLayout = ({
  children,
}: {
  children: ReactNode;
}) => {
  const {
    user,
    signOut,
    isAdmin,
  } = useAuth();

  const navigate = useNavigate();

  const { pathname } =
    useLocation();

  const handleSignOut =
    async () => {
      await signOut();

      navigate("/");
    };

  const navItems = [
    {
      to: "/members",
      label: "Dashboard",
      icon: LayoutDashboard,
      end: true,
    },

    {
      to: "/members/trainings",
      label: "Treinamentos",
      icon: GraduationCap,
    },

    ...(isAdmin
      ? [
          {
            to: "/members/admin",
            label: "Admin",
            icon: Users,
          },
        ]
      : []),
  ];

  return (
    <div
      className="
        min-h-screen
        bg-[#060816]
        text-white
      "
    >
      {/* BACKGROUND */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(124,58,237,0.16),transparent_35%)]" />

        <div className="absolute inset-0 opacity-[0.03] bg-[linear-gradient(to_right,#ffffff_1px,transparent_1px),linear-gradient(to_bottom,#ffffff_1px,transparent_1px)] bg-[size:48px_48px]" />
      </div>

      {/* HEADER */}
      <header
        className="
          sticky top-0 z-50
          border-b border-white/10
          bg-[#060816]/80
          backdrop-blur-2xl
        "
      >
        <div
          className="
            container mx-auto
            px-4
            h-20
            flex items-center justify-between
          "
        >
          {/* LOGO */}
          <Link
            to="/members"
            className="
              group
              flex items-center gap-3
            "
          >
            <div
              className="
                relative
                w-11 h-11
                flex items-center justify-center
                transition-transform duration-300
                group-hover:scale-105
              "
            >
              <img
                src="/images/logo.svg"
                alt="SecureLine"
                className="w-12 h-12"
              />
            </div>

            <div>
              <h1 className="text-lg font-black tracking-tight">
                SecureLine
              </h1>

              <div className="flex items-center gap-2">
                <p className="text-[10px] uppercase tracking-[0.25em] text-zinc-500">
                  Members Area
                </p>

                <span
                  className={`
                    text-[10px]
                    px-2 py-0.5
                    rounded-full
                    font-bold
                    ${
                      isAdmin
                        ? "bg-primary/20 text-primary"
                        : "bg-emerald-500/15 text-emerald-400"
                    }
                  `}
                >
                  {isAdmin
                    ? "ADMIN"
                    : "MEMBRO"}
                </span>
              </div>
            </div>
          </Link>

          {/* USER */}
          <div className="flex items-center gap-3">
            <div className="hidden sm:block text-right">
              <p className="text-sm font-medium text-white">
                {user?.email}
              </p>
            </div>

            <Button
              variant="ghost"
              size="icon"
              onClick={handleSignOut}
              className="
                rounded-2xl
                border border-white/10
                bg-white/[0.03]
                hover:bg-white/[0.06]
                text-zinc-300
                hover:text-white
              "
            >
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* NAV */}
        <nav
          className="
            container mx-auto
            px-4
            flex items-center gap-2
            overflow-x-auto
            pb-3
          "
        >
          {navItems.map(
            ({
              to,
              label,
              icon: Icon,
              end,
            }) => {
              const active = end
                ? pathname === to
                : pathname.startsWith(to);

              return (
                <Link
                  key={to}
                  to={to}
                  className="
                    relative
                    shrink-0
                  "
                >
                  <div
                    className={`
                      relative
                      flex items-center gap-2
                      px-4 py-2.5
                      rounded-2xl
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
                        layoutId="members-navbar"
                        className="
                          absolute inset-0
                          rounded-2xl
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

                    <div className="relative z-10 flex items-center gap-2">
                      <Icon className="w-4 h-4" />

                      {label}

                      {active && (
                        <ChevronRight className="w-3.5 h-3.5 opacity-70" />
                      )}
                    </div>
                  </div>
                </Link>
              );
            }
          )}
        </nav>
      </header>

      {/* CONTENT */}
      <main
        className="
          relative z-10
          container mx-auto
          px-4 py-8
        "
      >
        {children}
      </main>
    </div>
  );
};

export default MembersLayout;