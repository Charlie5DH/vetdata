import * as React from "react";
import { Link } from "react-router-dom";

import { VetDataLogo } from "@/components/brand/vetdata-logo";
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
            <SidebarMenuButton
              size="lg"
              asChild
              className="gap-2.5 rounded-xl px-2"
            >
              <Link to={clinicPath("/")}>
                <VetDataLogo size={32} aria-hidden="true" className="size-8! shrink-0" />
                <div className="grid flex-1 text-left leading-tight">
                  <span className="truncate text-[13.5px] font-semibold text-sidebar-accent-foreground">
                    {appNavigation.brand.title}
                  </span>
                  <span className="truncate text-[11.5px] text-sidebar-foreground">
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
