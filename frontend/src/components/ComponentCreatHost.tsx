"use client"

import * as React from "react"
import { useState, useEffect, useCallback } from "react"
import axios from "axios"
import { toast } from "sonner"
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
} from "@tanstack/react-table"
import { Alert, AlertDescription, AlertTitle } from "./ui/alert"
import { Button } from "./ui/button"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import FrequencySelect from "./FrequencySelect"

export type Host = {
  id: string
  status: "True" | "False"
  dominio: string
  frequencia: string
  ultimaVerificacao: string
  nome: string
}

export const columns: ColumnDef<Host>[] = [
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
    cell: ({ row }) => <div className="capitalize">{row.getValue("status")}</div>,
  },
]

export function ComponentCreateHost() {
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = useState({})
  const [dialogOpen, setDialogOpen] = useState(false)
  const [hosts, setHosts] = useState<Host[]>([])

  // Estados do formulário
  const [nome, setNome] = useState("")
  const [host, setHost] = useState("")
  const [frequencia, setFrequencia] = useState("")

  // Função para buscar hosts no backend
  const fetchHosts = useCallback(async () => {
    try {
      const response = await axios.get("http://localhost:8000/api/list-hosts/", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
      })
      const transformedHosts = response.data.hosts.map((h: any) => ({
        id: h.id.toString(),
        nome: h.name,
        dominio: h.host,
        frequencia: h.frequency,
        ultimaVerificacao: h.last_update,
        status: "True", // Ajuste conforme a lógica do seu backend
      }))
      setHosts(transformedHosts)
      console.log("Hosts carregados com sucesso:", transformedHosts)
    } catch (error) {
      console.error("Erro ao buscar hosts", error)
    }
  }, [])

  useEffect(() => {
    fetchHosts()
  }, [fetchHosts])

  // Função para lidar com o registro do host
  const handleRegister = async (event: React.FormEvent) => {
    event.preventDefault()
    const errorAlert = document.getElementById("card-error")

    if (!nome.trim() || !host.trim() || !frequencia.trim()) {
      if (errorAlert) {
        errorAlert.querySelector(".text-red-100")!.textContent = "Por favor, preencha todos os campos."
        errorAlert.classList.remove("hidden")
      }
      return
    }

    try {
      const data = { nome, dominio: host, frequencia }

      const response = await axios.post("http://localhost:8000/api/create-host/", data, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
      })

      console.log("Host registrado com sucesso:", response.data)
      toast.success("Host registrado com sucesso!", {
        description: `O host ${nome} foi adicionado com sucesso.`,
      })

      // Limpa os campos do formulário e fecha o diálogo
      setNome("")
      setHost("")
      setFrequencia("")
      setDialogOpen(false)

      // Re-fetch os hosts para atualizar a tabela
      fetchHosts()
    } catch (error: any) {
      console.error("Erro ao registrar o host:", error.response?.data || error.message)
      if (errorAlert) {
        errorAlert.querySelector(".text-red-100")!.textContent = error.response.data.error
        errorAlert.classList.remove("hidden")
      }
    }
  }

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
  })

  return (
    <div className="w-full">
      <div className="flex items-center py-4">
        <Input
          placeholder="Buscar pelo nome..."
          value={(table.getColumn("nome")?.getFilterValue() as string) ?? ""}
          onChange={(event) => table.getColumn("nome")?.setFilterValue(event.target.value)}
          className="max-w-sm"
        />
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" className="ml-auto">
              Adicionar novo Host
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
              <DialogTitle>Adicionar Novo Host</DialogTitle>
              <DialogDescription>
                Preencha os dados abaixo para adicionar um novo host para monitoramento.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleRegister} className="grid gap-3 py-4">
              <Label>Nome:</Label>
              <Input value={nome} onChange={(e) => setNome(e.target.value)} />
              <Label>Domínio/IP:</Label>
              <Input value={host} onChange={(e) => setHost(e.target.value)} />
              <Label>Atualização:</Label>
              <FrequencySelect value={frequencia} onValueChange={setFrequencia} />
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
                    {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
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
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  Sem resultados.
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
            Página {table.getState().pagination.pageIndex + 1} de {table.getPageCount()}
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
  )
}
