import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useCompanyAuth } from "@/contexts/CompanyAuthContext";
import { getResults, Result } from "@/services/company";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import {
  Users,
  FileText,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  LogOut,
  Loader2,
  Search,
  Building,
  Home,
  Activity,
  ArrowRight,
  Shield,
} from "lucide-react";

const CompanyDashboard = () => {
  const { company, logout } = useCompanyAuth();
  const [results, setResults] = useState<Result[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const loadData = async () => {
    setLoading(true);
    setError("");
    try {
      const allResults = await getResults();
      if (company) {
        // Obter os IDs de colaboradores pertencentes a esta empresa
        const colaboradorIds = new Set(company.colaboradores.map((c) => c.id));
        
        // Filtrar apenas os resultados dos colaboradores desta empresa
        const companyResults = allResults.filter((r) => colaboradorIds.has(r.colaboradorId));
        setResults(companyResults);
      }
    } catch (err: any) {
      console.error(err);
      setError("Falha ao carregar os resultados dos testes. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (company) {
      loadData();
    }
  }, [company]);

  if (!company) return null;

  // Cálculos dos Cards de Resumo
  const totalColaboradores = company.colaboradores.length;

  // Filtrar apenas resultados finalizados (com score preenchido)
  const finalizados = results.filter((r) => r.score !== null);
  const totalTestes = finalizados.length;

  // Média Geral de Acertos — soma de acertos / soma de questões respondidas
  const totalAcertos = finalizados.reduce((acc, curr) => acc + (curr.total_acertos || 0), 0);
  const totalErros = finalizados.reduce((acc, curr) => acc + (curr.total_erros || 0), 0);
  const totalQuestoes = totalAcertos + totalErros;
  const mediaScore = totalQuestoes > 0 ? Math.round((totalAcertos / totalQuestoes) * 100) : 0;

  // "Caíram no Golpe" usa o campo triked do banco (indica quem clicou em link de phishing simulado)
  const cairamNoGolpe = company.colaboradores.filter((c) => c.triked).length;
  const naoCairamNoGolpe = totalColaboradores - cairamNoGolpe;

  // Filtrar resultados exibidos na tabela por busca (apenas finalizados)
  const filteredResults = finalizados.filter((r) => {
    const codeMatch = (r.colaborador?.codigo_colaborador || "")
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const sectorMatch = (r.colaborador?.setor || "")
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    return codeMatch || sectorMatch;
  });

  // Paginação
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  
  // Resetar página quando a busca mudar
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const totalPages = Math.ceil(filteredResults.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedResults = filteredResults.slice(startIndex, startIndex + itemsPerPage);

  return (
    <div className="min-h-screen bg-[#060816] text-white flex flex-col relative overflow-hidden">
      {/* BACKGROUND */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(124,58,237,0.16),transparent_35%)]" />
        <div className="absolute inset-0 opacity-[0.03] bg-[linear-gradient(to_right,#ffffff_1px,transparent_1px),linear-gradient(to_bottom,#ffffff_1px,transparent_1px)] bg-[size:48px_48px]" />
      </div>

      {/* Header */}
      <header className="relative z-50 border-b border-white/10 bg-[#060816]/80 backdrop-blur-2xl sticky top-0">
        <div className="container mx-auto px-4 h-20 flex items-center justify-between">
          <Link
            to="/company/dashboard"
            className="group flex items-center gap-3"
          >
            <div className="relative w-11 h-11 flex items-center justify-center transition-transform duration-300 group-hover:scale-105">
              <img src="/images/logo.svg" alt="SecureLine" className="w-12 h-12" />
            </div>

            <div>
              <h1 className="text-lg font-black tracking-tight text-white leading-none">SecureLine</h1>
              <div className="flex items-center gap-2">
                <p className="text-[10px] uppercase tracking-[0.2em] text-zinc-500">Corporate Area</p>
                <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-primary/20 text-primary">EMPRESA</span>
              </div>
            </div>
          </Link>
          <div className="flex items-center gap-3">
            <Button asChild variant="outline" className="rounded-2xl border-white/10 bg-white/[0.03] hover:bg-white/[0.06] text-zinc-300 hover:text-white">
              <Link to="/">
                <Home className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">Voltar à Home</span>
              </Link>
            </Button>
            <Button onClick={logout} variant="ghost" className="flex items-center gap-2 px-4 h-10 rounded-2xl border border-white/10 bg-white/[0.03] hover:bg-red-500/10 hover:border-red-500/30 text-zinc-400 hover:text-red-400 transition-all duration-200 text-sm font-medium">
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Sair</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 flex-1 container mx-auto px-4 py-8 space-y-8">
        {/* HERO */}
        <section className="relative overflow-hidden rounded-[36px] border border-white/10 bg-[#0B1023] p-8 md:p-10">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(124,58,237,0.18),transparent_35%)]" />
          <div className="absolute inset-0 opacity-[0.03] bg-[linear-gradient(to_right,#ffffff_1px,transparent_1px),linear-gradient(to_bottom,#ffffff_1px,transparent_1px)] bg-[size:48px_48px]" />

          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-10">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-primary/20 bg-primary/10 text-primary text-xs font-semibold uppercase tracking-[0.2em] mb-6">
                <Building className="w-3.5 h-3.5" />
                Área Corporativa
              </div>

              <h1 className="text-4xl md:text-5xl font-black tracking-tight leading-[1.05] text-white">
                Dashboard Geral
              </h1>

              <p className="mt-4 text-zinc-400 text-base md:text-lg leading-relaxed">
                Bem-vindo à central de inteligência da{" "}
                <span className="text-white font-bold">{company.nome}</span>.
                Acompanhe o engajamento dos colaboradores, pontuações médias e
                métricas de segurança.
              </p>
            </div>

            <div className="flex items-center gap-6 p-6 rounded-3xl bg-white/[0.02] border border-white/5 backdrop-blur-xl">
              <div className="space-y-1">
                <span className="text-[10px] uppercase tracking-[0.2em] text-zinc-500">
                  Código de Acesso
                </span>
                <div className="flex items-center gap-3">
                  <code className="text-xl font-mono font-black text-primary">
                    {company.codigo_acesso}
                  </code>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* METRICS CARDS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard icon={Users} label="Total Colaboradores" value={totalColaboradores.toString()} glow="from-primary/20 to-purple-500/10" />
          <StatCard icon={FileText} label="Total Simulações Concluídas" value={totalTestes.toString()} glow="from-blue-500/20 to-cyan-500/10" />
          <StatCard icon={TrendingUp} label="Média de Acertos Geral" value={`${mediaScore}%`} glow="from-emerald-500/20 to-green-500/10" alertColor={mediaScore >= 70 ? "text-emerald-400" : mediaScore >= 50 ? "text-amber-400" : "text-red-400"} />
          <StatCard icon={AlertTriangle} label="Caíram no Golpe (Simulado)" value={`${cairamNoGolpe}`} glow="from-red-500/20 to-orange-500/10" alertColor={cairamNoGolpe > 0 ? "text-red-400" : "text-white"} />
        </div>

        {/* RESULTS TABLE */}
        <section className="relative overflow-hidden rounded-[32px] border border-white/10 bg-[#0B1023]">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(124,58,237,0.12),transparent_35%)]" />

          <div className="relative z-10 p-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 mb-8">
              <div>
                <p className="text-primary text-sm font-semibold uppercase tracking-[0.2em] mb-3">Relatório</p>
                <h2 className="text-3xl font-black text-white">Resultados das Simulações</h2>
              </div>
              <div className="relative w-full md:w-80">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                <Input type="text" placeholder="Buscar por código ou setor..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-11 h-12 rounded-2xl border-white/10 bg-white/[0.03] placeholder:text-zinc-600 text-white focus-visible:ring-primary focus-visible:ring-offset-0" />
              </div>
            </div>

            {loading ? (
              <div className="p-16 flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
            ) : error ? (
              <div className="p-16 text-center space-y-4">
                <p className="text-red-400">{error}</p>
                <Button onClick={loadData} variant="outline" className="rounded-2xl border-white/10">Tentar Novamente</Button>
              </div>
            ) : filteredResults.length === 0 ? (
              <div className="p-16 text-center text-zinc-500 border border-white/5 rounded-2xl bg-white/[0.01]">Nenhum resultado de teste encontrado para esta empresa.</div>
            ) : (
              <div className="space-y-6">
                <div className="overflow-x-auto rounded-2xl border border-white/10">
                  <Table>
                    <TableHeader className="bg-white/[0.02]">
                      <TableRow className="border-white/10 hover:bg-transparent">
                        <TableHead className="text-zinc-400 font-semibold h-14 px-6">Código</TableHead>
                        <TableHead className="text-zinc-400 font-semibold h-14 px-6">Setor</TableHead>
                        <TableHead className="text-zinc-400 font-semibold h-14 px-6 text-center">Acertos</TableHead>
                        <TableHead className="text-zinc-400 font-semibold h-14 px-6 text-center">Erros</TableHead>
                        <TableHead className="text-zinc-400 font-semibold h-14 px-6 text-right">Score</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {paginatedResults.map((result) => {
                        const colaborador = result.colaborador;
                        return (
                          <TableRow key={result.id} className="border-white/10 hover:bg-white/[0.02] transition-colors">
                            <TableCell className="font-mono text-zinc-300 h-14 px-6">{colaborador?.codigo_colaborador || "-"}</TableCell>
                            <TableCell className="text-zinc-300 h-14 px-6">{colaborador?.setor || "Geral"}</TableCell>
                            <TableCell className="text-zinc-300 h-14 px-6 text-center">{result.total_acertos !== null ? result.total_acertos : "-"}</TableCell>
                            <TableCell className="text-zinc-300 h-14 px-6 text-center">{result.total_erros !== null ? result.total_erros : "-"}</TableCell>
                            <TableCell className="font-semibold text-right h-14 px-6">
                              <span className={result.score !== null && result.score >= 70 ? "text-emerald-400" : result.score !== null && result.score >= 50 ? "text-amber-400" : "text-red-400"}>
                                {result.score !== null ? `${result.score}%` : "-"}
                              </span>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>

                {/* PAGINATION CONTROLS */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-between border-t border-white/5 pt-6">
                    <p className="text-sm text-zinc-500">
                      Mostrando <span className="font-semibold text-zinc-300">{startIndex + 1}</span> a{" "}
                      <span className="font-semibold text-zinc-300">{Math.min(startIndex + itemsPerPage, filteredResults.length)}</span>{" "}
                      de <span className="font-semibold text-zinc-300">{filteredResults.length}</span> resultados
                    </p>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm" disabled={currentPage === 1} onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))} className="rounded-xl border-white/10 bg-white/[0.02] hover:bg-white/[0.06] text-zinc-300">Anterior</Button>
                      <div className="flex items-center gap-1">
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                          <Button key={page} variant={currentPage === page ? "default" : "outline"} size="sm" onClick={() => setCurrentPage(page)} className={`w-9 h-9 rounded-xl p-0 ${currentPage === page ? "bg-primary text-white" : "border-white/10 bg-white/[0.02] hover:bg-white/[0.06] text-zinc-300"}`}>
                            {page}
                          </Button>
                        ))}
                      </div>
                      <Button variant="outline" size="sm" disabled={currentPage === totalPages} onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))} className="rounded-xl border-white/10 bg-white/[0.02] hover:bg-white/[0.06] text-zinc-300">Próxima</Button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
};

const StatCard = ({
  icon: Icon,
  label,
  value,
  glow,
  alertColor = "text-white",
}: {
  icon: any;
  label: string;
  value: string;
  glow: string;
  alertColor?: string;
}) => (
  <motion.div whileHover={{ y: -5 }}>
    <Card
      className="
        relative
        overflow-hidden
        rounded-[28px]
        border border-white/10
        bg-[#0B1023]
        h-full
      "
    >
      <div
        className={`
          absolute inset-0 opacity-0 hover:opacity-100 transition-opacity duration-500
          bg-gradient-to-br ${glow}
        `}
      />

      <CardContent className="relative z-10 p-6">
        <div className="flex items-center justify-between mb-5">
          <div
            className="
              w-14 h-14
              rounded-2xl
              bg-white/[0.03]
              border border-white/10
              flex items-center justify-center
            "
          >
            <Icon className="w-6 h-6 text-primary" />
          </div>

          <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
        </div>

        <p className="text-sm text-zinc-500 mb-2">
          {label}
        </p>

        <h3 className={`text-4xl font-black tracking-tight ${alertColor}`}>
          {value}
        </h3>
      </CardContent>
    </Card>
  </motion.div>
);

export default CompanyDashboard;
