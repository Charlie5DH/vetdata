import * as React from "react";
import { Link } from "react-router-dom";
import { Command } from "lucide-react";

import { NavMain } from "@/components/nav-main";
import { NavSecondary } from "@/components/nav-secondary";
import { NavUser } from "@/components/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import { appNavigation } from "@/components/layout/links";
import { useClinicPath } from "@/lib/clinic-routes";

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { clinicPath } = useClinicPath();

  return (
    <Sidebar
      collapsible="icon"
      className={cn(
        "top-(--header-height) h-[calc(100svh-var(--header-height))]!",
        props.className,
      )}
      {...props}
    >
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link to={clinicPath("/")}>
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                  <Command className="size-5" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">
                    {appNavigation.brand.title}
                  </span>
                  <span className="truncate text-xs">
                    {appNavigation.brand.subtitle}
                  </span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={appNavigation.navMain} />
      </SidebarContent>
      <SidebarFooter>
        <NavSecondary items={appNavigation.navSecondary} />
        <NavUser />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
