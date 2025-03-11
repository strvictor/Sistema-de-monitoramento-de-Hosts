"use client";

import * as React from "react";
import { useState, useEffect, useCallback } from "react";
import api from "../axiosConfig";
import { toast } from "sonner";
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { MoreHorizontal } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "./ui/alert";
import { Button } from "./ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Label } from "@/components/ui/label";
import FrequencySelect from "./FrequencySelect";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

export type Host = {
  id: string;
  status: boolean;
  dominio: string;
  frequencia: string;
  ultimaVerificacao: string;
  nome: string;
};

export const columns: ColumnDef<Host>[] = [
  {
    id: "id",
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "nome",
    header: "Nome",
    cell: ({ row }) => <div>{row.getValue("nome")}</div>,
  },
  {
    accessorKey: "dominio",
    header: "Domínio/IP",
    cell: ({ row }) => <div>{row.getValue("dominio")}</div>,
  },
  {
    accessorKey: "frequencia",
    header: "Atualização do Host",
    cell: ({ row }) => <div>{row.getValue("frequencia")}</div>,
  },
  {
    accessorKey: "ultimaVerificacao",
    header: "Última Atualização",
    cell: ({ row }) => <div>{row.getValue("ultimaVerificacao")}</div>,
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status") === "true";
      return <div className="capitalize">{status ? "Ativo" : "Inativo"}</div>;
    },
  },
  {
    accessorKey: "actions",
    header: "Ação",
    id: "actions",
    enableHiding: false,
    cell: ({ row }) => {
      const host = row.original;
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Ações</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="cursor-pointer"
              onClick={() =>
                window.dispatchEvent(
                  new CustomEvent("editHost", { detail: host })
                )
              }
            >
              Editar Host
            </DropdownMenuItem>
            <DropdownMenuItem
              className="cursor-pointer"
              onClick={() => handleDeleteHost(host.id)}
            >
              <div className="hover:text-red-500 w-full">Excluir Host</div>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];

async function handleDeleteHost(hostId: string) {
  if (!window.confirm("Tem certeza que deseja excluir este host?")) {
    return;
  }
  try {
    await api.delete(`/delete-host/${hostId}`);
    toast.success("Host deletado com sucesso!");
    window.dispatchEvent(new Event("hostsUpdated"));
  } catch (error: any) {
    toast.error("Erro ao deletar host", {
      description: error.response?.data?.error || error.message,
    });
  }
}

export function ComponentCreateHost() {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});
  const [dialogOpen, setDialogOpen] = useState(false);
  const [hosts, setHosts] = useState<Host[]>([]);

  // Estados do formulário
  const [nome, setNome] = useState("");
  const [host, setHost] = useState("");
  const [frequencia, setFrequencia] = useState("");
  const [status, setStatus] = useState(true);

  // Estado para controle de edição
  const [editingHost, setEditingHost] = useState<Host | null>(null);

  // Função para buscar hosts no backend
  const fetchHosts = useCallback(async () => {
    try {
      const response = await api.get("/list-hosts/");
      const transformedHosts = response.data.hosts.map((h: any) => ({
        id: h.id.toString(),
        nome: h.name,
        dominio: h.host,
        frequencia: h.frequency,
        ultimaVerificacao: h.last_update,
        status: h.status.toString(),
      }));
      setHosts(transformedHosts);
      console.log("Hosts carregados com sucesso:", transformedHosts);
    } catch (error) {
      console.error("Erro ao buscar hosts", error);
    }
  }, []);

  useEffect(() => {
    fetchHosts();
    window.addEventListener("hostsUpdated", fetchHosts);
    return () => window.removeEventListener("hostsUpdated", fetchHosts);
  }, [fetchHosts]);

  // Ouvindo o evento customizado "editHost" para abrir o modal de edição
  useEffect(() => {
    const editListener = (e: CustomEvent) => {
      handleEditHost(e.detail);
    };
    window.addEventListener("editHost", editListener as EventListener);
    return () =>
      window.removeEventListener("editHost", editListener as EventListener);
  }, []);

  // Função para iniciar a edição de um host: preenche os campos e abre o modal
  const handleEditHost = (hostData: Host) => {
    setEditingHost(hostData);
    setNome(hostData.nome);
    setHost(hostData.dominio);
    setFrequencia(hostData.frequencia);
    setStatus(hostData.status);
    setDialogOpen(true);
  };

  // Função para lidar com o registro ou atualização do host
  const handleRegister = async (event: React.FormEvent) => {
    event.preventDefault();
    const errorAlert = document.getElementById("card-error");

    if (!nome.trim() || !host.trim() || !frequencia.trim()) {
      if (errorAlert) {
        errorAlert.querySelector(".text-red-100")!.textContent =
          "Por favor, preencha todos os campos.";
        errorAlert.classList.remove("hidden");
      }
      return;
    }

    try {
      const data = { nome, dominio: host, frequencia, status };

      if (editingHost) {
        // Atualização do host
        await api.put(`/update-host/${editingHost.id}`, data);
        toast.success("Host atualizado com sucesso!", {
          description: `O host ${nome} foi atualizado com sucesso.`,
        });
        setEditingHost(null);
      } else {
        // Criação do host
        await api.post("/create-host/", data);
        toast.success("Host registrado com sucesso!", {
          description: `O host ${nome} foi adicionado com sucesso.`,
        });
      }

      // Limpa os campos do formulário e fecha o diálogo
      setNome("");
      setHost("");
      setFrequencia("");
      setStatus(true);
      setDialogOpen(false);

      // Re-fetch os hosts para atualizar a tabela
      fetchHosts();
    } catch (error: any) {
      console.error(
        "Erro ao registrar/atualizar o host:",
        error.response?.data || error.message
      );
      if (errorAlert) {
        errorAlert.querySelector(".text-red-100")!.textContent =
          error.response?.data?.error || "Erro ao processar a solicitação";
        errorAlert.classList.remove("hidden");
      }
    }
  };

  const table = useReactTable({
    data: hosts,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
  });

  return (
    <div className="w-full">
      <div className="flex items-center py-4">
        <Input
          placeholder="Buscar pelo nome..."
          value={(table.getColumn("nome")?.getFilterValue() as string) ?? ""}
          onChange={(event) =>
            table.getColumn("nome")?.setFilterValue(event.target.value)
          }
          className="max-w-sm"
        />
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" className="ml-auto">
              {editingHost ? "Editar Host" : "Adicionar novo Host"}
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[525px]">
            <DialogHeader>
              <Alert id="card-error" className="mb-4 mt-4 hidden">
                <AlertTitle className="text-red-400">
                  Ops, tivemos um problema!
                </AlertTitle>
                <AlertDescription className="text-red-100">
                  E-mail ou senha inválidos.
                </AlertDescription>
              </Alert>
              <DialogTitle>
                {editingHost ? "Editar Host" : "Adicionar Novo Host"}
              </DialogTitle>
              <DialogDescription>
                {editingHost
                  ? "Altere os dados para atualizar o host."
                  : "Preencha os dados abaixo para adicionar um novo host para monitoramento."}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleRegister} className="grid gap-3 py-4">
              <Label>Nome:</Label>
              <Input value={nome} onChange={(e) => setNome(e.target.value)} />
              <Label>Domínio/IP:</Label>
              <Input value={host} onChange={(e) => setHost(e.target.value)} />
              <Label>Atualização:</Label>
              <FrequencySelect
                value={frequencia}
                onValueChange={setFrequencia}
              />
              <Label>Status:</Label>
              <Select
                value={status ? "true" : "false"}
                onValueChange={(value) => setStatus(value === "true")}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="true">Ativo</SelectItem>
                  <SelectItem value="false">Inativo</SelectItem>
                </SelectContent>
              </Select>
              <DialogFooter>
                <DialogTrigger asChild>
                  <Button variant="outline">Cancelar</Button>
                </DialogTrigger>
                <Button type="submit">Salvar</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  Sem hosts cadastrados.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-end space-x-2 py-4">
        <div className="space-x-2">
          <Button
            className="cursor-pointer"
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Anterior
          </Button>
          <span className="text-sm text-gray-400">
            Página {table.getState().pagination.pageIndex + 1} de{" "}
            {table.getPageCount()}
          </span>
          <Button
            className="cursor-pointer"
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Próximo
          </Button>
        </div>
      </div>
    </div>
  );
}
