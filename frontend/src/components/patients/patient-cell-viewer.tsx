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

export function PatientCellViewer({ item }: { item: Patient }) {
  const isMobile = useIsMobile();

  return (
    <Drawer direction={isMobile ? "bottom" : "right"}>
      <DrawerTrigger asChild>
        <Button
          variant="link"
          className="text-foreground w-fit px-0 text-left font-medium"
        >
          {item.name}
        </Button>
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader className="gap-1">
          <DrawerTitle>{item.name}</DrawerTitle>
          <DrawerDescription>Patient Details</DrawerDescription>
        </DrawerHeader>
        <div className="flex flex-col gap-4 overflow-y-auto px-4 text-sm pb-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <Label>Species</Label>
              <div className="text-muted-foreground">{item.species}</div>
            </div>
            <div className="flex flex-col gap-2">
              <Label>Breed</Label>
              <div className="text-muted-foreground">{item.breed || "-"}</div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <Label>Age</Label>
              <div className="text-muted-foreground">
                {item.age_years ? `${item.age_years}y` : ""}{" "}
                {item.age_months ? `${item.age_months}m` : ""}
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <Label>Weight</Label>
              <div className="text-muted-foreground">
                {item.weight_kg ? `${item.weight_kg} kg` : "-"}
              </div>
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <Label>Owner</Label>
            <div className="text-muted-foreground">
              {item.owner
                ? `${item.owner.first_name} ${item.owner.last_name}`
                : "Unknown"}
            </div>
            {item.owner && (
              <div className="text-xs text-muted-foreground">
                {item.owner.email}
              </div>
            )}
          </div>
          {item.motive && (
            <div className="flex flex-col gap-2">
              <Label>Motive</Label>
              <div className="text-muted-foreground whitespace-pre-wrap">
                {item.motive}
              </div>
            </div>
          )}
          {item.notes && (
            <div className="flex flex-col gap-2">
              <Label>Notes</Label>
              <div className="text-muted-foreground whitespace-pre-wrap">
                {item.notes}
              </div>
            </div>
          )}
        </div>
        <DrawerFooter>
          <DrawerClose asChild>
            <Button variant="outline">Close</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
