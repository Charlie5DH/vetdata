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
import { ChevronsLeft, ChevronsRight } from "lucide-react";
import {
  ChevLIcon,
  ChevRIcon,
  SearchIcon,
} from "@/components/icons/vetdata-icons";

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
    <div className="overflow-hidden rounded-xl border border-border bg-card">
      <div className="border-b border-border px-4 py-3">
        <div className="relative w-full sm:max-w-xs">
          <SearchIcon
            size={16}
            className="pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 text-stone-500"
          />
          <Input
            placeholder="Buscar por nome ou email..."
            value={search}
            onChange={handleSearchChange}
            className="h-[34px] pl-10 text-[13.5px]"
          />
        </div>
      </div>

      <div>
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
                <TableHead className="w-12 pr-0">
                  <span className="sr-only">Selecionar</span>
                </TableHead>
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
                    data-state={isSelected ? "selected" : undefined}
                    className="cursor-pointer"
                    onClick={() => onSelect(String(owner.id))}
                  >
                    <TableCell className="w-12 pr-0">
                      <RadioGroupItem
                        value={String(owner.id)}
                        id={`owner-${owner.id}`}
                        checked={isSelected}
                        onClick={(e) => e.stopPropagation()}
                      />
                    </TableCell>
                    <TableCell className="font-semibold text-foreground">
                      {owner.first_name}
                    </TableCell>
                    <TableCell className="font-semibold text-foreground">
                      {owner.last_name}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {owner.email}
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {owner.patients?.length || 0}
                    </TableCell>
                  </TableRow>
                );
              })}
              {paginatedOwners.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="py-10 text-center text-muted-foreground"
                  >
                    <div className="flex flex-col items-center gap-2">
                      <span className="grid size-12 place-items-center rounded-full bg-muted text-foreground">
                        <SearchIcon size={20} />
                      </span>
                      <p className="text-sm">
                        Nenhum tutor encontrado para "{search}"
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </RadioGroup>
      </div>

      <div className="flex flex-col gap-3 border-t border-border px-4 py-2.5 text-[12.5px] text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-3 sm:gap-4">
          <div className="flex items-center gap-2">
            <p className="font-medium">Linhas por pág.</p>
            <Select value={`${pageSize}`} onValueChange={handlePageSizeChange}>
              <SelectTrigger size="sm" className="w-20">
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
          <div className="flex items-center justify-center tabular-nums">
            Pág. {page} de {totalPages || 1}
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <Button
            type="button"
            variant="outline"
            size="icon-sm"
            className="hidden lg:inline-flex"
            onClick={() => setPage(1)}
            disabled={page === 1}
          >
            <span className="sr-only">Ir para primeira página</span>
            <ChevronsLeft />
          </Button>
          <Button
            type="button"
            variant="outline"
            size="icon-sm"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
          >
            <span className="sr-only">Página anterior</span>
            <ChevLIcon />
          </Button>
          <Button
            type="button"
            variant="outline"
            size="icon-sm"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages || totalPages === 0}
          >
            <span className="sr-only">Próxima página</span>
            <ChevRIcon />
          </Button>
          <Button
            type="button"
            variant="outline"
            size="icon-sm"
            className="hidden lg:inline-flex"
            onClick={() => setPage(totalPages)}
            disabled={page === totalPages || totalPages === 0}
          >
            <span className="sr-only">Ir para última página</span>
            <ChevronsRight />
          </Button>
        </div>
      </div>
    </div>
  );
}
