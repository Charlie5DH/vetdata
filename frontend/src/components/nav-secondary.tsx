"use client";

import * as React from "react";
import { Link, useLocation } from "react-router-dom";

import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import type { AppSecondaryNavItem } from "@/components/layout/links";
import { useClinicPath } from "@/lib/clinic-routes";

function matchesRoute(pathname: string, url: string) {
  if (url === "/") {
    return pathname === "/";
  }

  return pathname === url || pathname.startsWith(`${url}/`);
}

function pickActiveUrl(pathname: string, items: AppSecondaryNavItem[]): string | null {
  let best: string | null = null;
  for (const item of items) {
    if (item.external) continue;
    if (matchesRoute(pathname, item.url) && (!best || item.url.length > best.length)) {
      best = item.url;
    }
  }
  return best;
}

export function NavSecondary({
  items,
  ...props
}: {
  items: AppSecondaryNavItem[];
} & React.ComponentPropsWithoutRef<typeof SidebarGroup>) {
  const { pathname } = useLocation();
  const { clinicPath, stripClinicPath } = useClinicPath();
  const normalizedPathname = stripClinicPath(pathname);
  const activeUrl = pickActiveUrl(normalizedPathname, items);

  return (
    <SidebarGroup {...props}>
      <SidebarGroupContent>
        <SidebarMenu>
          {items.map((item) => {
            const isActive = !item.external && item.url === activeUrl;

            return (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton
                  asChild
                  isActive={isActive}
                  tooltip={item.title}
                >
                  {item.external ? (
                    <a href={item.url} target="_blank" rel="noreferrer">
                      <item.icon />
                      <span>{item.title}</span>
                    </a>
                  ) : (
                    <Link to={clinicPath(item.url)}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  )}
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
