import { IconChevronDown, IconPalette } from "@tabler/icons-react";
import { Link } from "react-router-dom";

import { useIsMobile } from "@/hooks/use-mobile";
import { useAppTheme } from "@/components/theme-provider";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { useClinicPath } from "@/lib/clinic-routes";

interface ThemeSelectorProps {
  className?: string;
  buttonClassName?: string;
  buttonSize?: React.ComponentProps<typeof Button>["size"];
  mobileButtonSize?: React.ComponentProps<typeof Button>["size"];
}

export function ThemeSelector({
  className,
  buttonClassName,
  buttonSize = "default",
  mobileButtonSize = "icon",
}: ThemeSelectorProps) {
  const isMobile = useIsMobile();
  const { theme, setTheme, themes } = useAppTheme();
  const activeTheme = themes.find((item) => item.id === theme) ?? themes[0];
  const { clinicPath } = useClinicPath();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size={isMobile ? mobileButtonSize : buttonSize}
          className={cn("shadow-xs", buttonClassName)}
        >
          <IconPalette data-icon="inline-start" />
          {!isMobile && (
            <>
              <span>Tema</span>
              <span className="text-muted-foreground">{activeTheme.label}</span>
              <IconChevronDown data-icon="inline-end" />
            </>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className={cn("w-64", className)}>
        <DropdownMenuLabel>Temas</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuRadioGroup
          value={theme}
          onValueChange={(value) => setTheme(value as typeof theme)}
        >
          {themes.map((option) => (
            <DropdownMenuRadioItem
              key={option.id}
              value={option.id}
              className="items-center gap-3"
            >
              <span
                className="size-3 rounded-full border border-border/60"
                style={{ backgroundColor: option.preview }}
              />
              <span className="flex-1">{option.label}</span>
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem disabled>
          Selecionado: {activeTheme.label}
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link to={clinicPath("/customization")}>Abrir personalizacao</Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
