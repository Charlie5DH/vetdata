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

function isRouteActive(pathname: string, url: string) {
  if (url === "/") {
    return pathname === "/";
  }

  return pathname === url || pathname.startsWith(`${url}/`);
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

  return (
    <SidebarGroup {...props}>
      <SidebarGroupContent>
        <SidebarMenu>
          {items.map((item) => {
            const isActive =
              !item.external && isRouteActive(normalizedPathname, item.url);

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
