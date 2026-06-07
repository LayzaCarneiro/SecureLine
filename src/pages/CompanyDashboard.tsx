import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useCompanyAuth } from "@/contexts/CompanyAuthContext";
import { getResults, Result, CompanyColaborador } from "@/services/company";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  const totalTestes = results.length;

  // Média Geral de Score (ignora nulls)
  const validScores = results.filter((r) => r.score !== null) as { score: number }[];
  const mediaScore =
    validScores.length > 0
      ? Math.round(validScores.reduce((acc, curr) => acc + curr.score, 0) / validScores.length)
      : 0;

  const cairamNoGolpe = company.colaboradores.filter((c) => c.triked).length;
  const naoCairamNoGolpe = company.colaboradores.filter((c) => !c.triked).length;

  // Filtrar resultados exibidos na tabela por busca
  const filteredResults = results.filter((r) => {
    const codeMatch = (r.colaborador?.codigo_colaborador || "")
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const sectorMatch = (r.colaborador?.setor || "")
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    return codeMatch || sectorMatch;
  });

  return (
    <div className="min-h-screen bg-[#060816] text-white flex flex-col">
      {/* Header */}
      <header className="border-b border-white/10 bg-[#060816]/80 backdrop-blur-2xl sticky top-0 z-50">
        <div className="container mx-auto px-4 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-primary to-secondary flex items-center justify-center">
              <Building className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-black tracking-tight text-white">{company.nome}</h1>
              <p className="text-xs text-zinc-500 uppercase tracking-wider">Painel Administrativo</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button
              asChild
              variant="outline"
              className="rounded-2xl border-white/10 bg-white/[0.03] hover:bg-white/[0.06] text-zinc-300 hover:text-white"
            >
              <Link to="/">
                <Home className="w-4 h-4 mr-2" />
                Voltar à Home
              </Link>
            </Button>
            <Button
              onClick={logout}
              variant="outline"
              className="rounded-2xl border-white/10 bg-white/[0.03] hover:bg-white/[0.06] text-zinc-300 hover:text-white"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sair
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 container mx-auto px-4 py-8 space-y-8">
        {/* Cards de Resumo */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          {/* Card 1: Total Colaboradores */}
          <Card className="border border-white/[0.08] bg-white/[0.02] backdrop-blur-xl rounded-2xl">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium text-zinc-400">Colaboradores</CardTitle>
              <Users className="w-4 h-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{totalColaboradores}</div>
              <p className="text-xs text-zinc-500 mt-1">Total cadastrados</p>
            </CardContent>
          </Card>

          {/* Card 2: Total Testes */}
          <Card className="border border-white/[0.08] bg-white/[0.02] backdrop-blur-xl rounded-2xl">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium text-zinc-400">Testes Realizados</CardTitle>
              <FileText className="w-4 h-4 text-secondary" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{totalTestes}</div>
              <p className="text-xs text-zinc-500 mt-1">Simulações concluídas</p>
            </CardContent>
          </Card>

          {/* Card 3: Média Score */}
          <Card className="border border-white/[0.08] bg-white/[0.02] backdrop-blur-xl rounded-2xl">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium text-zinc-400">Média Geral Score</CardTitle>
              <TrendingUp className="w-4 h-4 text-green-400" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{mediaScore}%</div>
              <p className="text-xs text-zinc-500 mt-1">Pontuação média</p>
            </CardContent>
          </Card>

          {/* Card 4: Caíram no golpe */}
          <Card className="border border-white/[0.08] bg-white/[0.02] backdrop-blur-xl rounded-2xl">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium text-zinc-400">Caíram no Golpe</CardTitle>
              <AlertTriangle className="w-4 h-4 text-red-400" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-red-400">{cairamNoGolpe}</div>
              <p className="text-xs text-zinc-500 mt-1">Status de vulnerabilidade</p>
            </CardContent>
          </Card>

          {/* Card 5: Não caíram */}
          <Card className="border border-white/[0.08] bg-white/[0.02] backdrop-blur-xl rounded-2xl">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium text-zinc-400">Não Caíram</CardTitle>
              <CheckCircle className="w-4 h-4 text-emerald-400" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-emerald-400">{naoCairamNoGolpe}</div>
              <p className="text-xs text-zinc-500 mt-1">Conscientizados</p>
            </CardContent>
          </Card>
        </div>

        {/* Seção Tabela */}
        <Card className="border border-white/[0.08] bg-white/[0.02] backdrop-blur-xl rounded-3xl overflow-hidden">
          <CardHeader className="border-b border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-4 p-6">
            <div>
              <CardTitle className="text-xl font-bold">Resultados dos Testes</CardTitle>
              <p className="text-sm text-zinc-500 mt-1">
                Lista detalhada dos resultados das simulações por colaborador.
              </p>
            </div>
            <div className="relative w-full md:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
              <Input
                type="text"
                placeholder="Buscar por código ou setor..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 h-10 rounded-xl border-white/10 bg-white/[0.03] placeholder:text-zinc-600"
              />
            </div>
          </CardHeader>

          <CardContent className="p-0">
            {loading ? (
              <div className="p-12 flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : error ? (
              <div className="p-12 text-center space-y-4">
                <p className="text-red-400">{error}</p>
                <Button onClick={loadData} variant="outline" className="rounded-xl border-white/10">
                  Tentar Novamente
                </Button>
              </div>
            ) : filteredResults.length === 0 ? (
              <div className="p-12 text-center text-zinc-500">
                Nenhum resultado de teste encontrado para esta empresa.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader className="bg-white/[0.01]">
                    <TableRow className="border-white/10">
                      <TableHead className="text-zinc-400 font-semibold h-12">Código</TableHead>
                      <TableHead className="text-zinc-400 font-semibold h-12">Setor</TableHead>
                      <TableHead className="text-zinc-400 font-semibold h-12">Acertos</TableHead>
                      <TableHead className="text-zinc-400 font-semibold h-12">Erros</TableHead>
                      <TableHead className="text-zinc-400 font-semibold h-12">Score</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredResults.map((result) => {
                      const colaborador = result.colaborador;
                      return (
                        <TableRow key={result.id} className="border-white/10 hover:bg-white/[0.02] transition-colors">
                          <TableCell className="font-mono text-zinc-300">
                            {colaborador?.codigo_colaborador || "-"}
                          </TableCell>
                          <TableCell className="text-zinc-300">
                            {colaborador?.setor || "Geral"}
                          </TableCell>
                          <TableCell className="text-zinc-300">
                            {result.total_acertos !== null ? result.total_acertos : "-"}
                          </TableCell>
                          <TableCell className="text-zinc-300">
                            {result.total_erros !== null ? result.total_erros : "-"}
                          </TableCell>
                          <TableCell className="font-semibold text-zinc-100">
                            {result.score !== null ? `${result.score}%` : "-"}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default CompanyDashboard;
