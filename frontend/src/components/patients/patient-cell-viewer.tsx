import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { Label } from "@/components/ui/label";
import { useIsMobile } from "@/hooks/use-mobile";
import type { Patient } from "@/types";
import { formatWeight, ownerFullName } from "./patient-format";

export function PatientCellViewer({ item }: { item: Patient }) {
  const isMobile = useIsMobile();

  return (
    <Drawer direction={isMobile ? "bottom" : "right"}>
      <DrawerTrigger asChild>
        <Button
          variant="link"
          className="w-fit px-0 text-left font-semibold text-foreground"
        >
          {item.name}
        </Button>
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader className="gap-1">
          <DrawerTitle>{item.name}</DrawerTitle>
          <DrawerDescription>Detalhes do paciente</DrawerDescription>
        </DrawerHeader>
        <div className="flex flex-col gap-4 overflow-y-auto px-4 pb-4 text-sm">
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <Label>Espécie</Label>
              <div className="text-muted-foreground">{item.species}</div>
            </div>
            <div className="flex flex-col gap-1">
              <Label>Raça</Label>
              <div className="text-muted-foreground">{item.breed || "—"}</div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <Label>Idade</Label>
              <div className="text-muted-foreground tabular-nums">
                {!item.age_years && !item.age_months && "—"}
                {item.age_years ? `${item.age_years}a` : ""}{" "}
                {item.age_months ? `${item.age_months}m` : ""}
              </div>
            </div>
            <div className="flex flex-col gap-1">
              <Label>Peso</Label>
              <div className="text-muted-foreground tabular-nums">
                {formatWeight(item.weight_kg)
                  ? `${formatWeight(item.weight_kg)} kg`
                  : "—"}
              </div>
            </div>
          </div>
          <div className="flex flex-col gap-1">
            <Label>Tutor</Label>
            <div className="text-muted-foreground">
              {ownerFullName(item.owner) ?? "Desconhecido"}
            </div>
            {item.owner && (
              <div className="text-xs text-muted-foreground">
                {item.owner.email}
              </div>
            )}
          </div>
          {item.motive && (
            <div className="flex flex-col gap-1">
              <Label>Motivo</Label>
              <div className="text-muted-foreground whitespace-pre-wrap">
                {item.motive}
              </div>
            </div>
          )}
          {item.notes && (
            <div className="flex flex-col gap-1">
              <Label>Notas</Label>
              <div className="text-muted-foreground whitespace-pre-wrap">
                {item.notes}
              </div>
            </div>
          )}
        </div>
        <DrawerFooter>
          <DrawerClose asChild>
            <Button variant="outline">Fechar</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
