import * as React from "react"
import {
  AudioWaveform,
  BookOpen,
  Bot,
  Command,
  Frame,
  Code,
  Map,
  ChartNoAxesCombined,
  ScreenShare,
  SquareTerminal,
} from "lucide-react"

import { NavMain } from "@/components/nav-main"
import { NavProjects } from "@/components/nav-projects"
import { NavUser } from "@/components/nav-user"
import { TeamSwitcher } from "@/components/team-switcher"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar"

// This is sample data.
const data = {
  user: {
    name: "Paulo Victor",
    email: "m@example.com",
    avatar: "/avatars/shadcn.jpg",
  },
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
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
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
  )
}
