import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type { Vaccine, VaccineCreate } from "@/types";

interface VaccineFormProps {
  initialVaccine?: Vaccine;
  isSubmitting?: boolean;
  submitLabel?: string;
  onSubmit: (payload: VaccineCreate) => void | Promise<void>;
  onCancel?: () => void;
}

const SPECIES_OPTIONS = [
  { value: "dog", label: "Cães" },
  { value: "cat", label: "Gatos" },
  { value: "all", label: "Todas as espécies" },
];

export function VaccineForm({
  initialVaccine,
  isSubmitting,
  submitLabel = "Salvar",
  onSubmit,
  onCancel,
}: VaccineFormProps) {
  const [name, setName] = useState(initialVaccine?.name ?? "");
  const [species, setSpecies] = useState(initialVaccine?.species ?? "dog");
  const [diseasesText, setDiseasesText] = useState(
    (initialVaccine?.diseases ?? []).join(", "),
  );
  const [description, setDescription] = useState(
    initialVaccine?.description ?? "",
  );
  const [manufacturer, setManufacturer] = useState(
    initialVaccine?.manufacturer ?? "",
  );
  const [recommendedAgeWeeks, setRecommendedAgeWeeks] = useState(
    initialVaccine?.recommended_age_weeks?.toString() ?? "",
  );
  const [boosterIntervalDays, setBoosterIntervalDays] = useState(
    initialVaccine?.booster_interval_days?.toString() ?? "365",
  );
  const [dosesInSeries, setDosesInSeries] = useState(
    initialVaccine?.doses_in_series?.toString() ?? "1",
  );
  const [isMandatory, setIsMandatory] = useState(
    Boolean(initialVaccine?.is_mandatory),
  );

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const diseases = diseasesText
      .split(",")
      .map((d) => d.trim())
      .filter(Boolean);

    const toNumber = (value: string) => {
      if (!value.trim()) return null;
      const parsed = Number(value);
      return Number.isFinite(parsed) ? parsed : null;
    };

    await onSubmit({
      name: name.trim(),
      species,
      diseases: diseases.length ? diseases : null,
      description: description.trim() || null,
      manufacturer: manufacturer.trim() || null,
      recommended_age_weeks: toNumber(recommendedAgeWeeks),
      booster_interval_days: toNumber(boosterIntervalDays),
      doses_in_series: toNumber(dosesInSeries),
      is_mandatory: isMandatory,
    });
  };

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <div className="space-y-2">
        <Label htmlFor="name">Nome*</Label>
        <Input
          id="name"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Ex: V10 Décupla Canina"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="species">Espécie*</Label>
          <Select value={species} onValueChange={setSpecies}>
            <SelectTrigger id="species">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {SPECIES_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="manufacturer">Fabricante</Label>
          <Input
            id="manufacturer"
            value={manufacturer}
            onChange={(e) => setManufacturer(e.target.value)}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="diseases">Doenças cobertas (separadas por vírgula)</Label>
        <Input
          id="diseases"
          value={diseasesText}
          onChange={(e) => setDiseasesText(e.target.value)}
          placeholder="Cinomose, Parvovirose, ..."
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Descrição</Label>
        <Textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="space-y-2">
          <Label htmlFor="recommended_age_weeks">Idade recomendada (semanas)</Label>
          <Input
            id="recommended_age_weeks"
            type="number"
            min={0}
            value={recommendedAgeWeeks}
            onChange={(e) => setRecommendedAgeWeeks(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="booster_interval_days">Intervalo de reforço (dias)</Label>
          <Input
            id="booster_interval_days"
            type="number"
            min={0}
            value={boosterIntervalDays}
            onChange={(e) => setBoosterIntervalDays(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="doses_in_series">Doses na série</Label>
          <Input
            id="doses_in_series"
            type="number"
            min={1}
            value={dosesInSeries}
            onChange={(e) => setDosesInSeries(e.target.value)}
          />
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Checkbox
          id="is_mandatory"
          checked={isMandatory}
          onCheckedChange={(checked) => setIsMandatory(Boolean(checked))}
        />
        <Label htmlFor="is_mandatory" className="cursor-pointer">
          Vacina obrigatória por lei
        </Label>
      </div>

      <div className="flex justify-end gap-2 pt-2">
        {onCancel ? (
          <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
            Cancelar
          </Button>
        ) : null}
        <Button type="submit" disabled={isSubmitting || !name.trim()}>
          {submitLabel}
        </Button>
      </div>
    </form>
  );
}
