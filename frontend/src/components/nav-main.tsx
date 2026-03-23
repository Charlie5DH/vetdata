"use client";

import { NavLink, useLocation } from "react-router-dom";
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import type { AppNavItem } from "@/components/layout/links";
import { useClinicPath } from "@/lib/clinic-routes";

function isRouteActive(pathname: string, url: string) {
  if (url === "/") {
    return pathname === "/";
  }

  return pathname === url || pathname.startsWith(`${url}/`);
}

export function NavMain({ items }: { items: AppNavItem[] }) {
  const { pathname } = useLocation();
  const { clinicPath, stripClinicPath } = useClinicPath();
  const normalizedPathname = stripClinicPath(pathname);

  return (
    <SidebarGroup>
      <SidebarGroupLabel>Navegacao</SidebarGroupLabel>
      <SidebarMenu>
        {items.map((item) => (
          <SidebarMenuItem key={item.title}>
            <SidebarMenuButton
              asChild
              tooltip={item.title}
              isActive={isRouteActive(normalizedPathname, item.url)}
            >
              <NavLink to={clinicPath(item.url)}>
                <item.icon />
                <span>{item.title}</span>
              </NavLink>
            </SidebarMenuButton>
          </SidebarMenuItem>
        ))}
      </SidebarMenu>
    </SidebarGroup>
  );
}
