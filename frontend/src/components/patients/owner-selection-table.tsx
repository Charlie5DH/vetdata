import { useState, useMemo } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Owner } from "@/types";
import { cn } from "@/lib/utils";
import {
  IconChevronLeft,
  IconChevronRight,
  IconChevronsLeft,
  IconChevronsRight,
  IconSearch,
} from "@tabler/icons-react";

interface OwnerSelectionTableProps {
  owners: Owner[];
  selectedOwnerId: string;
  onSelect: (id: string) => void;
}

export function OwnerSelectionTable({
  owners,
  selectedOwnerId,
  onSelect,
}: OwnerSelectionTableProps) {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);

  const filteredOwners = useMemo(() => {
    const query = search.toLowerCase();
    return owners.filter(
      (o) =>
        o.first_name.toLowerCase().includes(query) ||
        o.last_name.toLowerCase().includes(query) ||
        o.email.toLowerCase().includes(query),
    );
  }, [owners, search]);

  const totalPages = Math.ceil(filteredOwners.length / pageSize);
  const paginatedOwners = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredOwners.slice(start, start + pageSize);
  }, [filteredOwners, page, pageSize]);

  // Reset to page 1 when search or pageSize changes
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    setPage(1);
  };

  const handlePageSizeChange = (value: string) => {
    setPageSize(Number(value));
    setPage(1);
  };

  return (
    <div className="space-y-4 border rounded-lg p-4 bg-muted/10">
      <div className="space-y-2">
        <div className="relative">
          <IconSearch className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar por nome ou email..."
            value={search}
            onChange={handleSearchChange}
            className="bg-background pl-10"
          />
        </div>
      </div>

      <div className="rounded-md border bg-background">
        <RadioGroup
          value={selectedOwnerId}
          onValueChange={(value) => {
            console.log("Selected owner ID:", value);
            onSelect(value);
          }}
        >
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12.5">Sel.</TableHead>
                <TableHead>Nome</TableHead>
                <TableHead>Sobrenome</TableHead>
                <TableHead>Email</TableHead>
                <TableHead className="text-right">Pacientes</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedOwners.map((owner) => {
                const isSelected = selectedOwnerId === String(owner.id);
                return (
                  <TableRow
                    key={owner.id}
                    className={cn(
                      "cursor-pointer hover:bg-muted/50 transition-colors",
                      isSelected && "bg-primary/5",
                    )}
                    onClick={() => onSelect(String(owner.id))}
                  >
                    <TableCell>
                      <RadioGroupItem
                        value={String(owner.id)}
                        id={`owner-${owner.id}`}
                        checked={isSelected}
                        onClick={(e) => e.stopPropagation()}
                      />
                    </TableCell>
                    <TableCell className="font-medium">
                      {owner.first_name}
                    </TableCell>
                    <TableCell className="font-medium">
                      {owner.last_name}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {owner.email}
                    </TableCell>
                    <TableCell className="text-right">
                      <span className="inline-flex items-center justify-center rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
                        {owner.patients?.length || 0}
                      </span>
                    </TableCell>
                  </TableRow>
                );
              })}
              {paginatedOwners.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="text-center py-12 text-muted-foreground"
                  >
                    <div className="flex flex-col items-center gap-2">
                      <IconSearch className="h-8 w-8 opacity-20" />
                      <p>Nenhum tutor encontrado para "{search}"</p>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </RadioGroup>
      </div>

      <div className="flex flex-col gap-3 border-t px-2 pt-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-3 sm:gap-4">
          <div className="flex items-center gap-2">
            <p className="text-sm font-medium">Linhas por pág.</p>
            <Select value={`${pageSize}`} onValueChange={handlePageSizeChange}>
              <SelectTrigger className="h-8 w-17.5">
                <SelectValue placeholder={pageSize} />
              </SelectTrigger>
              <SelectContent side="top">
                {[5, 10, 20, 30, 40, 50].map((size) => (
                  <SelectItem key={size} value={`${size}`}>
                    {size}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex w-25 items-center justify-center text-sm font-medium">
            Pág. {page} de {totalPages || 1}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            className="hidden h-8 w-8 p-0 lg:flex"
            onClick={() => setPage(1)}
            disabled={page === 1}
          >
            <span className="sr-only">Ir para primeira página</span>
            <IconChevronsLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            className="h-8 w-8 p-0"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
          >
            <span className="sr-only">Página anterior</span>
            <IconChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            className="h-8 w-8 p-0"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages || totalPages === 0}
          >
            <span className="sr-only">Próxima página</span>
            <IconChevronRight className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            className="hidden h-8 w-8 p-0 lg:flex"
            onClick={() => setPage(totalPages)}
            disabled={page === totalPages || totalPages === 0}
          >
            <span className="sr-only">Ir para última página</span>
            <IconChevronsRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
