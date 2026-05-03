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

function matchesRoute(pathname: string, url: string) {
  if (url === "/") {
    return pathname === "/";
  }

  return pathname === url || pathname.startsWith(`${url}/`);
}

/**
 * Given a list of nav items, the longest-matching URL wins so we don't light
 * up both `/vaccines` and `/vaccines/catalog` when the user is on the catalog.
 */
function pickActiveUrl(pathname: string, items: AppNavItem[]): string | null {
  let best: string | null = null;
  for (const item of items) {
    if (matchesRoute(pathname, item.url) && (!best || item.url.length > best.length)) {
      best = item.url;
    }
  }
  return best;
}

export function NavMain({ items }: { items: AppNavItem[] }) {
  const { pathname } = useLocation();
  const { clinicPath, stripClinicPath } = useClinicPath();
  const normalizedPathname = stripClinicPath(pathname);
  const activeUrl = pickActiveUrl(normalizedPathname, items);

  return (
    <SidebarGroup>
      <SidebarGroupLabel>Navegacao</SidebarGroupLabel>
      <SidebarMenu>
        {items.map((item) => (
          <SidebarMenuItem key={item.title}>
            <SidebarMenuButton
              asChild
              tooltip={item.title}
              isActive={item.url === activeUrl}
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
