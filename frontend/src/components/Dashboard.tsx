import { AppSideBar } from "./AppSideBar";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"

export function Dashboard() {
  return (
    <SidebarProvider>
      <AppSideBar />
      <main>
        <SidebarTrigger />
        <div>
          <p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Facilis dicta placeat ipsa voluptate veritatis velit cupiditate a magni perspiciatis rem! Nesciunt repellat cum odit, quaerat exercitationem delectus perspiciatis harum ullam.</p>
        </div>
      </main>
    </SidebarProvider>
  );
}
