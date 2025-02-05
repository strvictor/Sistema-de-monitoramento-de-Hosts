import * as React from "react";
import {
  Code,
  ChartNoAxesCombined,
  ScreenShare,
} from "lucide-react";
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

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const [user, setUser] = useState({ name: "", email: "", avatar: "" });

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
  }, []);

  const data = {
    user: user,
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
          {
            title: "Cadastrar Host",
            url: "/cadastro-host",
          },
          {
            title: "Dashboard",
            url: "/dashboard",
          },
          {
            title: "Configurações",
            url: "/settings",
          },
        ],
      },
    ],
    hosts: [
      {
        name: "Google",
        url: "/host/<id>",
        icon: ScreenShare,
      },
      {
        name: "Facebook",
        url: "/host/<id>",
        icon: ScreenShare,
      },
      {
        name: "Youtube",
        url: "/host/<id>",
        icon: ScreenShare,
      },
      {
        name: "Mercado Livre",
        url: "/host/<id>",
        icon: ScreenShare,
      },
    ],
  };

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={data.dev} />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavProjects projects={data.hosts} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
