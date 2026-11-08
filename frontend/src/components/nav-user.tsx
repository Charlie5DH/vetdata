import { Link, useNavigate } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { ChevUdIcon, LogoutIcon, OkIcon } from "@/components/icons/vetdata-icons";
import { useAuth } from "@/components/auth/auth-provider";
import { useCurrentUser } from "@/api/auth";
import { useClinicPath } from "@/lib/clinic-routes";

export function NavUser() {
  const { isMobile } = useSidebar();
  const { signOut } = useAuth();
  const navigate = useNavigate();
  const { data: currentUser } = useCurrentUser();
  const { clinicPath } = useClinicPath();

  const displayName = currentUser?.display_name ?? "Equipe VetData";
  const email = currentUser?.email ?? "";
  const avatarUrl = currentUser?.avatar_url ?? "";
  const initials =
    displayName
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((segment) => segment[0]?.toUpperCase() ?? "")
      .join("") || "VD";

  const handleSignOut = async () => {
    await signOut();
    navigate("/sign-in", { replace: true });
  };

  return (
    <SidebarMenu className="mt-2 border-t border-sidebar-border pt-2.5">
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="gap-2.5 rounded-xl px-2 data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <Avatar className="size-8 rounded-full">
                <AvatarImage src={avatarUrl} alt={displayName} />
                <AvatarFallback className="rounded-full bg-mint-300 text-xs font-semibold text-forest-900">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left leading-tight">
                <span className="truncate text-[13px] font-semibold text-sidebar-accent-foreground">
                  {displayName}
                </span>
                <span className="truncate text-[11.5px] text-sidebar-foreground">
                  {email}
                </span>
              </div>
              <ChevUdIcon size={14} className="ml-auto size-3.5!" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-(--radix-dropdown-menu-trigger-width) min-w-56"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuLabel className="p-0 text-sm font-normal normal-case tracking-normal text-foreground">
              <div className="flex items-center gap-2.5 px-1 py-1.5 text-left">
                <Avatar className="size-8 rounded-full">
                  <AvatarImage src={avatarUrl} alt={displayName} />
                  <AvatarFallback className="rounded-full bg-mint-300 text-xs font-semibold text-forest-900">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left leading-tight">
                  <span className="truncate text-[13px] font-semibold text-foreground">
                    {displayName}
                  </span>
                  <span className="truncate text-xs text-muted-foreground">
                    {email}
                  </span>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuItem asChild>
              <Link to={clinicPath("/perfil")}>
                <OkIcon />
                Perfil
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => void handleSignOut()}>
              <LogoutIcon />
              Sair
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
