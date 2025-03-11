import * as React from "react";
import { Code, ChartNoAxesCombined, Server } from "lucide-react"; // Movi o Server para o topo
import axios from "axios";

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
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const [user, setUser] = useState({ name: "", email: "", avatar: "" });
  const [hosts, setHosts] = useState<Host[]>([]);

  useEffect(() => {
    const token = localStorage.getItem("accessToken");

    if (!token) {
      console.error("Token não encontrado. Faça login novamente.");
      return;
    }

    axios
      .get("http://localhost:8000/api/user-data/", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((response) => {
        console.log("Usuário autenticado:", response.data);
        setUser({
          name: response.data.name,
          email: response.data.email,
          avatar: "https://avatars1.githubusercontent.com/u/250480",
        });
      })
      .catch((error) => {
        console.error("Erro ao obter usuário:", error.response?.data || error);
      });

    // Buscar hosts
    const fetchHosts = async () => {
      try {
        const response = await axios.get("http://localhost:8000/api/list-hosts/", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
        });
        console.log("Resposta da API:", response.data);
        setHosts(response.data.hosts || response.data); // Garante compatibilidade caso a API retorne um array direto
      } catch (error) {
        console.error("Erro ao buscar hosts", error);
      }
    };

    fetchHosts();
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

  // Mapeia os hosts para o formato esperado
  const formattedHosts = hosts.map((host) => ({
    name: host.name,
    url: `/hosts/${host.id}`, // Define um URL fictício, ajuste conforme necessário
    icon: Server, // Usa um ícone genérico para os hosts
  }));

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={data.dev} />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavProjects projects={formattedHosts} /> {/* Agora está no formato correto */}
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
