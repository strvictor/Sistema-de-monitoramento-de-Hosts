import { AppSidebar } from "./app-sidebar"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Separator } from "./ui/separator"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "./ui/sidebar"

import * as React from "react"

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { motion } from 'framer-motion'


import { Chart1 } from "../components/charts/Chat1"
import { Chart2 } from "./charts/Chat2"
import { Chart3 } from "./charts/Chart3"
export default function Dashboard() {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <h1 className="text-2xl font-bold">Dashboard</h1>
          </div>
          <div className="flex items-center gap-4 ml-auto px-4">
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink href="/">Home</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbLink href="/dashboard">Dashboard</BreadcrumbLink>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>
        <div className="flex flex-1 flex-col p-4 pt-0">
          <div className="min-h-[100vh] flex-1 rounded-xl bg-muted/50 md:min-h-min p-4">
          <div className="flex items-center justify-between pb-4">

            <motion.p
              className="text-sm font-bold"
              animate={{
                color: ['#93c5fd', '#6ee7b7', '#fca5a5']
              }}
              transition={{
                duration: 6,
                repeat: Infinity,
                ease: 'easeInOut'
              }}
            >
              Escolha um host para monitoramento inteligente e análise preditiva
            </motion.p>

            <Select>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Selecione o seu Host" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Hosts</SelectLabel>
                  <SelectItem className="cursor-pointer" value="apple">Mercado Livre</SelectItem>
                  <SelectItem className="cursor-pointer" value="banana">Facebook</SelectItem>
                  <SelectItem className="cursor-pointer" value="blueberry">Instagram</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
          <div className="w-full grid grid-cols-2 justify-center gap-4 pb-4 align-center">
            <div>
              <Chart1 />
            </div>
            <div>
              <Chart2 />
            </div>
          </div>
          <div>
            < Chart3 />
          </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
