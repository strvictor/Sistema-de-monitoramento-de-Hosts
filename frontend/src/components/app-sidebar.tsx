import * as React from "react";
import { Code, ChartNoAxesCombined, Server } from "lucide-react";
import api from "../axiosConfig";

import { NavMain } from "@/components/nav-main";
import { NavProjects } from "@/components/nav-projects";
import { NavUser } from "@/components/nav-user";
import { TeamSwitcher } from "@/components/team-switcher";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar";

import { useState, useEffect } from "react";

interface Host {
  id: string;
  name: string;
  host: string;
  status: boolean;
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const [user, setUser] = useState({ name: "", email: "", avatar: "" });
  const [hosts, setHosts] = useState<Host[]>([]);

  // Função para buscar hosts
  const fetchHosts = async () => {
    try {
      const response = await api.get("/list-hosts/");
      console.log("Resposta da API de hosts:", response.data);
      const hostsData = response.data.hosts || [];
      setHosts(hostsData);
    } catch (error) {
      console.error("Erro ao buscar hosts:", error);
    }
  };

  useEffect(() => {
    // Buscar dados do usuário
    const fetchUserData = async () => {
      try {
        const response = await api.get("/user-data/");
        console.log("Dados do usuário:", response.data);
        setUser({
          name: response.data.name,
          email: response.data.email,
          avatar: "https://avatars1.githubusercontent.com/u/250480",
        });
      } catch (error) {
        console.error("Erro ao obter usuário:", error);
      }
    };

    fetchUserData();
    fetchHosts();

    // Adicionar listener para atualização dos hosts
    window.addEventListener("hostsUpdated", fetchHosts);

    return () => {
      window.removeEventListener("hostsUpdated", fetchHosts);
    };
  }, []);

  const data = {
    dev: [
      {
        name: "Paulo Victor",
        logo: Code,
        plan: "desenvolvedor",
      },
    ],
    navMain: [
      {
        title: "Painel",
        url: "#",
        icon: ChartNoAxesCombined,
        isActive: true,
        items: [
          { title: "Cadastrar Host", url: "/cadastro-host" },
          { title: "Dashboard", url: "/dashboard" },
          { title: "Configurações", url: "/settings" },
        ],
      },
    ],
  };

  // Mapeia os hosts para o formato esperado pelo NavProjects
  const formattedHosts = hosts.map((host) => ({
    name: `${host.name} (${host.host})`,
    url: `/hosts/${host.id}`,
    icon: Server,
    status: host.status,
  }));

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={data.dev} />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavProjects projects={formattedHosts} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
