import { useState, useEffect } from "react";
import { AppSidebar } from "./app-sidebar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Separator } from "./ui/separator";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "./ui/sidebar";
import { Info } from "lucide-react";

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./ui/tooltip";

import styles from "./styles/Dashboard.module.css";
import { Chart1 } from "../components/charts/Chat1";
import { SSLCertInfo } from "./charts/SSLCertInfo";
import { Chart3 } from "./charts/Chart3";
import api from "@/axiosConfig";

// Definir a interface para os dados dos hosts
interface Host {
  id: string;
  name: string;
}

export default function Dashboard() {
  const [hosts, setHosts] = useState<Host[]>([]);
  const [selectedHost, setSelectedHost] = useState<string>("");
  const [location, setLocation] = useState<string>("");

  useEffect(() => {
    const fetchHosts = async () => {
      try {
        const response = await api.get("list-hosts/", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
        });
        console.log("Resposta da API:", response.data);
        setHosts(response.data.hosts);
      } catch (error) {
        console.error("Erro ao buscar hosts", error);
      }
    };

    fetchHosts();
  }, []);

  // Exemplo de uso do selectedHost
  useEffect(() => {
    if (selectedHost) {
      console.log(`Host selecionado: ${selectedHost}`);
    }
  }, [selectedHost]);

  useEffect(() => {
    const fetchLocation = async () => {
      try {
        const response = await api.get("location-server/");
        setLocation(
          response.data.cidade +
            ", " +
            response.data.regiao +
            ", " +
            response.data.pais
        );
      } catch (error) {
        console.error("Erro ao buscar localização", error);
      }
    };

    fetchLocation();
  }, []);

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
          <div className="flex-1 rounded-xl bg-muted/50 md:min-h-min p-4">
            <div className="flex items-center justify-between pb-4">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger className="flex items-center gap-2">
                    <Info className="w-6 h-6 text-gray-500 cursor-pointer" />
                    Onde estou hospedado!
                  </TooltipTrigger>
                  <TooltipContent className="bg-gray-800 text-sm text-gray-100">
                    <p>Minhas requisições estão saindo de: {location}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <Select onValueChange={(value: string) => setSelectedHost(value)}>
                <SelectTrigger
                  className={`w-[180px] ${
                    !selectedHost ? styles.selectWarning : ""
                  }`}
                >
                  <SelectValue placeholder="Selecione o seu Host" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Hosts</SelectLabel>
                    {hosts.map((host) => (
                      <SelectItem
                        className="cursor-pointer"
                        key={host.id}
                        value={host.id}
                      >
                        {host.name}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
            <div className="w-full grid grid-cols-2 justify-center gap-4 pb-4 align-center">
              <div>
                <Chart1 selectedHost={selectedHost} />
              </div>
              <div>
                <SSLCertInfo selectedHost={selectedHost} />
              </div>
            </div>
            <div>
              <Chart3 selectedHost={selectedHost} />
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
