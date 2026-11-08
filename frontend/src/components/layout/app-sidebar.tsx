"use client";

import * as React from "react";
import { Link } from "react-router-dom";
import { VetDataLogo } from "@/components/brand/vetdata-logo";
import { NavMain } from "@/components/layout/nav-main";
import { NavUser } from "@/components/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { appNavigation } from "./links";

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar variant="inset" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              size="lg"
              asChild
              className="gap-2.5 rounded-xl px-2"
            >
              <Link to="/">
                <VetDataLogo size={32} aria-hidden="true" className="size-8! shrink-0" />
                <div className="grid flex-1 text-left leading-tight">
                  <span className="truncate text-[13.5px] font-semibold text-sidebar-accent-foreground">
                    VetData
                  </span>
                  <span className="truncate text-[11.5px] text-sidebar-foreground">
                    Gestão Veterinária
                  </span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={appNavigation.navMain} label="Menu" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  );
}
