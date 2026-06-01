import { useEffect, useState } from "react";
import MembersLayout from "@/components/members/MembersLayout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Loader2, Users } from "lucide-react";
import { Colaborador, listColaboradores } from "@/services/colaboradores";
import { toast } from "@/hooks/use-toast";

const ColaboradoresList = () => {
  const [data, setData] = useState<Colaborador[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const list = await listColaboradores();
        setData(list);
      } catch (err) {
        toast({
          title: "Erro ao carregar",
          description: err instanceof Error ? err.message : "Falha",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <MembersLayout>
      <Card className="border-white/10 bg-white/[0.03] backdrop-blur-2xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <Users className="w-5 h-5 text-primary" />
            Colaboradores
          </CardTitle>
          <CardDescription className="text-zinc-400">
            Lista sincronizada com a API externa.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-10">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-white/10">
                    <TableHead className="text-zinc-400">Código</TableHead>
                    <TableHead className="text-zinc-400">Nome</TableHead>
                    <TableHead className="text-zinc-400">Setor</TableHead>
                    <TableHead className="text-zinc-400">Empresa</TableHead>
                    <TableHead className="text-zinc-400">Telefones</TableHead>
                    <TableHead className="text-zinc-400">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.map((c) => (
                    <TableRow key={c.id} className="border-white/5">
                      <TableCell className="font-mono text-xs text-white">
                        {c.codigo_colaborador}
                      </TableCell>
                      <TableCell className="text-white">
                        {c.nome || c.apelido || "—"}
                      </TableCell>
                      <TableCell className="text-zinc-300">
                        {c.setor || "—"}
                      </TableCell>
                      <TableCell className="text-zinc-300">
                        {c.empresa?.nome || "—"}
                      </TableCell>
                      <TableCell className="text-zinc-400 text-xs">
                        {c.telefones?.map((t) => t.numero).join(", ") || "—"}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={c.ativo ? "default" : "secondary"}
                          className={
                            c.ativo
                              ? "bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500/20"
                              : "bg-zinc-500/15 text-zinc-400"
                          }
                        >
                          {c.ativo ? "ativo" : "inativo"}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                  {data.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center text-zinc-500 py-10">
                        Nenhum colaborador encontrado.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </MembersLayout>
  );
};

export default ColaboradoresList;
