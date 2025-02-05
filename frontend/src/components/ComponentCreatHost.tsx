"use client"

import * as React from "react"
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
import { MoreHorizontal } from "lucide-react"
import { Button } from "./ui/button"
import { Checkbox } from "./ui/checkbox"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
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
import FrequencySelect from "./FrequencySelect" // ajuste o caminho se necessário
export type Host = {
  id: string
  status: "ativo" | "inativo"
  dominio: string
  frequencia: string
  ultimaVerificacao: string
  nome: string
}

const data: Host[] = [
  {
    id: "m5gr84i9",
    status: "ativo",
    dominio: "example.com",
    frequencia: "de hora em hora",
    ultimaVerificacao: "2023-10-01 12:00",
    nome: "Host de exemplo 1",
  },
  {
    id: "3u1reuv4",
    status: "inativo",
    dominio: "10.5.2.87",
    frequencia: "diariamente",
    ultimaVerificacao: "2023-10-01 08:00",
    nome: "Host de exemplo 2",
  },
  {
    id: "derv1ws0",
    status: "ativo",
    dominio: "demo.com",
    frequencia: "semanalmente",
    ultimaVerificacao: "2023-09-30 10:00",
    nome: "Host de exemplo 3",
  },
]

export const columns: ColumnDef<Host>[] = [
  {
    id: "select",
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
    cell: ({ row }) => <div className="capitalize">{row.getValue("status")}</div>,
  },
  {
    accessorKey: "actions",
    header: "Ação",
    id: "actions",
    enableHiding: false,
    cell: ({ row }) => {
      const host = row.original
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
            <DropdownMenuItem className="cursor-pointer">Editar Host</DropdownMenuItem>
            <DropdownMenuItem className="cursor-pointer">
              <div className="hover:text-red-500 w-full">
                Excluir Host
              </div>
              </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
  },
]

export function ComponentCreateHost() {
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = React.useState({})

  const table = useReactTable({
    data,
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
          onChange={(event) =>
            table.getColumn("nome")?.setFilterValue(event.target.value)
          }
          className="max-w-sm"
        />
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline" className="ml-auto">
              Adicionar novo Host
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[525px] flex flex-col w-full">
            <DialogHeader>
              <DialogTitle>Adicionar Novo Host</DialogTitle>
              <DialogDescription>
                Preencha os dados abaixo para adicionar um novo host para monitoramento.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-3 py-4">
              <div className="grid grid-cols-4 items-center gap-2">
              <Label htmlFor="nome" className="col-span-1 text-left">
                Nome:
              </Label>
              <Input id="nome" className="col-span-4" required/>
              </div>

              <div className="grid grid-cols-4 items-center gap-2">
              <Label htmlFor="dominio" className="col-span-1 text-left">
                Domínio/IP:
              </Label>
              <Input id="dominio" className="col-span-4" required/>
              </div>

              <div className="grid grid-cols-4 items-center gap-2">
              <Label htmlFor="frequencia" className="col-span-1 text-left">
                Atualização:
              </Label>
              <div className="col-span-4">
                <FrequencySelect />
              </div>
              </div>
            </div>
            <DialogFooter className="col-span-4">
              <DialogTrigger asChild>
                <Button variant="outline">Cancelar</Button>
              </DialogTrigger>
              <Button type="submit">Salvar</Button>
            </DialogFooter>
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
                      : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id} data-state={row.getIsSelected() && "selected"}>
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
                  sem resultados.
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
