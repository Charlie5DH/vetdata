import { Link, useLocation } from "react-router-dom";
import { IconChevronDown, IconPlus } from "@tabler/icons-react";

import { useCurrentUser } from "@/api/auth";
import { SearchForm } from "@/components/search-form";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { getRouteMeta } from "@/components/layout/links";
import { useClinicPath } from "@/lib/clinic-routes";

export function SiteHeader() {
  const { pathname } = useLocation();
  const { clinicPath, stripClinicPath } = useClinicPath();
  const { page, section, sectionUrl } = getRouteMeta(stripClinicPath(pathname));
  const currentUserQuery = useCurrentUser();
  const canInviteMember = currentUserQuery.data?.clinic_role === "clinic_owner";

  return (
    <header className="sticky top-0 z-50 flex w-full items-center border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/80">
      <div className="flex h-(--header-height) w-full items-center pr-4 sm:pr-6">
        <div className="flex h-full w-(--sidebar-width-icon) shrink-0 items-center justify-center border-r border-border">
          <SidebarTrigger className="size-8 rounded-lg" />
        </div>
        <div className="flex min-w-0 flex-1 items-center gap-3 pl-4">
          <div className="min-w-0 flex-1">
            <div className="truncate text-sm font-medium md:hidden">{page}</div>
            <Breadcrumb className="hidden md:block">
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink asChild>
                    <Link to={clinicPath(sectionUrl)}>{section}</Link>
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage>{page}</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
          <SearchForm
            className="hidden lg:block lg:w-80"
            placeholder={`Buscar em ${section.toLowerCase()}...`}
          />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button>
                <IconPlus data-icon="inline-start" />
                Novo
                <IconChevronDown data-icon="inline-end" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-64">
              <DropdownMenuLabel>Cadastros</DropdownMenuLabel>
              <DropdownMenuItem asChild>
                <Link to={clinicPath("/patients/new")}>Paciente</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to={clinicPath("/tutors/new")}>Tutor</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to={clinicPath("/measures/new")}>Medida</Link>
              </DropdownMenuItem>
              {canInviteMember ? (
                <DropdownMenuItem asChild>
                  <Link to={clinicPath("/team?invite=1")}>Convidar membro</Link>
                </DropdownMenuItem>
              ) : null}
              <DropdownMenuSeparator />
              <DropdownMenuLabel>Tratamentos</DropdownMenuLabel>
              <DropdownMenuItem asChild>
                <Link to={clinicPath("/treatments/new")}>Tratamento</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to={clinicPath("/templates/new")}>
                  Modelo de tratamento
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
