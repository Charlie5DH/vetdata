import * as React from "react";
import {
  Activity,
  BarChart3,
  LayoutDashboard,
  PaintbrushVertical,
  PanelLeftOpen,
  PawPrint,
  RotateCcw,
  SlidersHorizontal,
  Type,
} from "lucide-react";
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts";

import { PageLayout } from "@/components/layout/page-layout";
import { useAppCustomization } from "@/components/theme-provider";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInput,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
} from "@/components/ui/sidebar";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  borderStyleOptions,
  componentSizeOptions,
  controlHeightOptions,
  shadowDepthOptions,
} from "@/lib/customization";
import { themeAccentClasses } from "@/lib/theme-styles";

const previewChartData = [
  { time: "08:00", fc: 92, pa: 118 },
  { time: "09:00", fc: 96, pa: 114 },
  { time: "10:00", fc: 102, pa: 112 },
  { time: "11:00", fc: 98, pa: 116 },
  { time: "12:00", fc: 94, pa: 119 },
];

const previewChartConfig = {
  fc: {
    label: "Frequencia cardiaca",
    color: "var(--color-primary)",
  },
  pa: {
    label: "Pressao media",
    color: "var(--color-chart-2)",
  },
} satisfies ChartConfig;

export default function Customization() {
  const [isPreviewDialogOpen, setPreviewDialogOpen] = React.useState(false);
  const {
    customization,
    fonts,
    resetCustomization,
    themes,
    updateCustomization,
  } = useAppCustomization();

  const activeTheme =
    themes.find((theme) => theme.id === customization.theme) ?? themes[0];
  const activeFont =
    fonts.find((font) => font.id === customization.fontFamily) ?? fonts[0];

  return (
    <>
      <PageLayout
        title="Personalizacao"
        actions={
          <Button variant="outline" onClick={resetCustomization}>
            <RotateCcw data-icon="inline-start" />
            Restaurar padrao
          </Button>
        }
      >
        <div className="grid gap-6 xl:grid-cols-[minmax(0,1.1fr)_minmax(360px,0.9fr)]">
          <div className="flex flex-col gap-6">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary shadow-xs">
                    <PaintbrushVertical />
                  </div>
                  <div>
                    <CardTitle>Tema e atmosfera</CardTitle>
                    <CardDescription>
                      Escolha a paleta base que abastece toda a aplicacao.
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                  {themes.map((theme) => {
                    const isActive = theme.id === customization.theme;

                    return (
                      <Button
                        key={theme.id}
                        variant={isActive ? "default" : "outline"}
                        className="h-auto items-start justify-start py-4 text-left"
                        onClick={() => updateCustomization({ theme: theme.id })}
                      >
                        <div className="flex w-full items-start gap-3">
                          <span
                            className="mt-0.5 size-4 shrink-0 rounded-full border border-border/70"
                            style={{ backgroundColor: theme.preview }}
                          />
                          <span className="flex min-w-0 flex-1 flex-col gap-1">
                            <span>{theme.label}</span>
                            <span className="text-xs text-muted-foreground">
                              {theme.appearance === "dark"
                                ? "Base escura"
                                : "Base clara"}
                            </span>
                          </span>
                        </div>
                      </Button>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="flex size-10 items-center justify-center rounded-xl bg-secondary text-secondary-foreground shadow-xs">
                    <Type />
                  </div>
                  <div>
                    <CardTitle>Tipografia</CardTitle>
                    <CardDescription>
                      Controle a fonte principal e o tamanho base do texto.
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <FieldGroup>
                  <Field>
                    <FieldLabel>Fonte principal</FieldLabel>
                    <FieldContent>
                      <Select
                        value={customization.fontFamily}
                        onValueChange={(value) =>
                          updateCustomization({
                            fontFamily:
                              value as typeof customization.fontFamily,
                          })
                        }
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Selecione uma fonte" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectGroup>
                            {fonts.map((font) => (
                              <SelectItem key={font.id} value={font.id}>
                                {font.label}
                              </SelectItem>
                            ))}
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                      <FieldDescription>
                        {activeFont.description}
                      </FieldDescription>
                    </FieldContent>
                  </Field>

                  <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                    {fonts.map((font) => {
                      const isActive = font.id === customization.fontFamily;

                      return (
                        <button
                          key={font.id}
                          type="button"
                          onClick={() =>
                            updateCustomization({ fontFamily: font.id })
                          }
                          className={[
                            "rounded-xl border bg-card p-4 text-left shadow-xs transition-colors",
                            isActive
                              ? "border-primary bg-primary/5"
                              : "border-border hover:bg-muted/40",
                          ].join(" ")}
                        >
                          <div className="flex items-center justify-between gap-3">
                            <span className="text-sm font-medium">
                              {font.label}
                            </span>
                            {isActive && (
                              <Badge variant="secondary">Ativa</Badge>
                            )}
                          </div>
                          <p
                            className="mt-3 text-xl leading-tight text-foreground"
                            style={{ fontFamily: font.stack || undefined }}
                          >
                            Aa Gg 123
                          </p>
                          <p className="mt-2 text-xs text-muted-foreground">
                            {font.description}
                          </p>
                        </button>
                      );
                    })}
                  </div>

                  <Field>
                    <FieldLabel>Tamanho base</FieldLabel>
                    <FieldContent>
                      <div className="flex items-center justify-between gap-3">
                        <Slider
                          min={14}
                          max={20}
                          step={1}
                          value={[customization.fontSize]}
                          onValueChange={([fontSize]) =>
                            updateCustomization({ fontSize })
                          }
                        />
                        <Badge variant="secondary">
                          {customization.fontSize}px
                        </Badge>
                      </div>
                      <FieldDescription>
                        Ajusta o tamanho tipografico base aplicado em toda a
                        interface.
                      </FieldDescription>
                    </FieldContent>
                  </Field>

                  <Field>
                    <FieldLabel>Peso base da fonte</FieldLabel>
                    <FieldContent>
                      <div className="flex items-center justify-between gap-3">
                        <Slider
                          min={300}
                          max={600}
                          step={50}
                          value={[customization.fontWeight]}
                          onValueChange={([fontWeight]) =>
                            updateCustomization({ fontWeight })
                          }
                        />
                        <Badge variant="secondary">
                          {customization.fontWeight}
                        </Badge>
                      </div>
                      <FieldDescription>
                        Define o peso tipografico base do texto corrido. O padrao inicial e 400.
                      </FieldDescription>
                    </FieldContent>
                  </Field>
                </FieldGroup>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="flex size-10 items-center justify-center rounded-xl bg-muted text-foreground shadow-xs">
                    <SlidersHorizontal />
                  </div>
                  <div>
                    <CardTitle>Escala dos componentes</CardTitle>
                    <CardDescription>
                      Separe densidade horizontal da altura dos controles.
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <FieldGroup>
                  <Field>
                    <FieldLabel>Tamanho padrao</FieldLabel>
                    <FieldContent>
                      <Select
                        value={customization.componentSize}
                        onValueChange={(value) =>
                          updateCustomization({
                            componentSize:
                              value as typeof customization.componentSize,
                          })
                        }
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Selecione um tamanho" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectGroup>
                            {componentSizeOptions.map((option) => (
                              <SelectItem key={option.id} value={option.id}>
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                    </FieldContent>
                  </Field>

                  <Field>
                    <FieldLabel>Altura dos controles</FieldLabel>
                    <FieldContent>
                      <Select
                        value={customization.controlHeight}
                        onValueChange={(value) =>
                          updateCustomization({
                            controlHeight:
                              value as typeof customization.controlHeight,
                          })
                        }
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Selecione uma altura" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectGroup>
                            {controlHeightOptions.map((option) => (
                              <SelectItem key={option.id} value={option.id}>
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                    </FieldContent>
                  </Field>

                  <Field>
                    <FieldLabel>Arredondamento</FieldLabel>
                    <FieldContent>
                      <div className="flex items-center justify-between gap-3">
                        <Slider
                          min={60}
                          max={180}
                          step={5}
                          value={[customization.radiusScale]}
                          onValueChange={([radiusScale]) =>
                            updateCustomization({ radiusScale })
                          }
                        />
                        <Badge variant="secondary">
                          {customization.radiusScale}%
                        </Badge>
                      </div>
                      <FieldDescription>
                        Escala global do raio aplicado aos componentes
                        compartilhados.
                      </FieldDescription>
                    </FieldContent>
                  </Field>
                </FieldGroup>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Bordas e sombras</CardTitle>
                <CardDescription>
                  Ajustes de relevo para destacar ou suavizar a interface.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <FieldGroup>
                  <Field>
                    <FieldLabel>Tratamento de borda</FieldLabel>
                    <FieldContent>
                      <Select
                        value={customization.borderStyle}
                        onValueChange={(value) =>
                          updateCustomization({
                            borderStyle:
                              value as typeof customization.borderStyle,
                          })
                        }
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Selecione o estilo" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectGroup>
                            {borderStyleOptions.map((option) => (
                              <SelectItem key={option.id} value={option.id}>
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                    </FieldContent>
                  </Field>

                  <Field>
                    <FieldLabel>Profundidade das sombras</FieldLabel>
                    <FieldContent>
                      <Select
                        value={customization.shadowDepth}
                        onValueChange={(value) =>
                          updateCustomization({
                            shadowDepth:
                              value as typeof customization.shadowDepth,
                          })
                        }
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Selecione a profundidade" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectGroup>
                            {shadowDepthOptions.map((option) => (
                              <SelectItem key={option.id} value={option.id}>
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                    </FieldContent>
                  </Field>
                </FieldGroup>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Badges</CardTitle>
                <CardDescription>
                  Ajuste borda, sombra, tipografia, arredondamento e padding dos badges de toda a aplicacao.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <FieldGroup>
                  <Field>
                    <FieldLabel>Borda do badge</FieldLabel>
                    <FieldContent>
                      <Select
                        value={customization.badgeBorderStyle}
                        onValueChange={(value) =>
                          updateCustomization({
                            badgeBorderStyle:
                              value as typeof customization.badgeBorderStyle,
                          })
                        }
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Selecione o estilo" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectGroup>
                            {borderStyleOptions.map((option) => (
                              <SelectItem key={option.id} value={option.id}>
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                    </FieldContent>
                  </Field>

                  <Field>
                    <FieldLabel>Sombra do badge</FieldLabel>
                    <FieldContent>
                      <Select
                        value={customization.badgeShadowDepth}
                        onValueChange={(value) =>
                          updateCustomization({
                            badgeShadowDepth:
                              value as typeof customization.badgeShadowDepth,
                          })
                        }
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Selecione a profundidade" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectGroup>
                            {shadowDepthOptions.map((option) => (
                              <SelectItem key={option.id} value={option.id}>
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                    </FieldContent>
                  </Field>

                  <Field>
                    <FieldLabel>Tamanho da fonte do badge</FieldLabel>
                    <FieldContent>
                      <div className="flex items-center justify-between gap-3">
                        <Slider
                          min={10}
                          max={16}
                          step={1}
                          value={[customization.badgeFontSize]}
                          onValueChange={([badgeFontSize]) =>
                            updateCustomization({ badgeFontSize })
                          }
                        />
                        <Badge variant="secondary">
                          {customization.badgeFontSize}px
                        </Badge>
                      </div>
                    </FieldContent>
                  </Field>

                  <Field>
                    <FieldLabel>Padding horizontal</FieldLabel>
                    <FieldContent>
                      <div className="flex items-center justify-between gap-3">
                        <Slider
                          min={4}
                          max={16}
                          step={1}
                          value={[customization.badgePaddingX]}
                          onValueChange={([badgePaddingX]) =>
                            updateCustomization({ badgePaddingX })
                          }
                        />
                        <Badge variant="secondary">
                          {customization.badgePaddingX}px
                        </Badge>
                      </div>
                    </FieldContent>
                  </Field>

                  <Field>
                    <FieldLabel>Padding vertical</FieldLabel>
                    <FieldContent>
                      <div className="flex items-center justify-between gap-3">
                        <Slider
                          min={0}
                          max={8}
                          step={1}
                          value={[customization.badgePaddingY]}
                          onValueChange={([badgePaddingY]) =>
                            updateCustomization({ badgePaddingY })
                          }
                        />
                        <Badge variant="secondary">
                          {customization.badgePaddingY}px
                        </Badge>
                      </div>
                    </FieldContent>
                  </Field>

                  <Field>
                    <FieldLabel>Arredondamento do badge</FieldLabel>
                    <FieldContent>
                      <div className="flex items-center justify-between gap-3">
                        <Slider
                          min={60}
                          max={180}
                          step={5}
                          value={[customization.badgeRadiusScale]}
                          onValueChange={([badgeRadiusScale]) =>
                            updateCustomization({ badgeRadiusScale })
                          }
                        />
                        <Badge variant="secondary">
                          {customization.badgeRadiusScale}%
                        </Badge>
                      </div>
                    </FieldContent>
                  </Field>
                </FieldGroup>
              </CardContent>
            </Card>
          </div>

          <div className="flex flex-col gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Painel ativo</CardTitle>
                <CardDescription>
                  Resumo do preset atual salvo no navegador deste usuario.
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-4">
                <div className="flex flex-wrap gap-2">
                  <Badge variant="secondary">Tema: {activeTheme.label}</Badge>
                  <Badge variant="secondary">Fonte: {activeFont.label}</Badge>
                  <Badge variant="secondary">
                    Texto: {customization.fontSize}px
                  </Badge>
                  <Badge variant="secondary">
                    Peso: {customization.fontWeight}
                  </Badge>
                  <Badge variant="secondary">
                    Badge: {customization.badgeFontSize}px
                  </Badge>
                </div>
                <Separator />
                <div className="grid gap-3 text-sm text-muted-foreground">
                  <SummaryRow
                    label="Peso base"
                    value={`${customization.fontWeight}`}
                  />
                  <SummaryRow
                    label="Badge"
                    value={`${customization.badgeFontSize}px / ${customization.badgePaddingX}px x ${customization.badgePaddingY}px`}
                  />
                  <SummaryRow
                    label="Badge borda"
                    value={labelFor(
                      borderStyleOptions,
                      customization.badgeBorderStyle,
                    )}
                  />
                  <SummaryRow
                    label="Badge sombra"
                    value={labelFor(
                      shadowDepthOptions,
                      customization.badgeShadowDepth,
                    )}
                  />
                  <SummaryRow
                    label="Tamanho padrao"
                    value={labelFor(
                      componentSizeOptions,
                      customization.componentSize,
                    )}
                  />
                  <SummaryRow
                    label="Altura"
                    value={labelFor(
                      controlHeightOptions,
                      customization.controlHeight,
                    )}
                  />
                  <SummaryRow
                    label="Bordas"
                    value={labelFor(
                      borderStyleOptions,
                      customization.borderStyle,
                    )}
                  />
                  <SummaryRow
                    label="Sombras"
                    value={labelFor(
                      shadowDepthOptions,
                      customization.shadowDepth,
                    )}
                  />
                  <SummaryRow
                    label="Arredondamento"
                    value={`${customization.radiusScale}%`}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <CardTitle>Studio de preview</CardTitle>
                    <CardDescription>
                      Verifique como a personalizacao afeta formularios,
                      dialogos, graficos e o chrome da aplicacao.
                    </CardDescription>
                  </div>
                  <Button
                    variant="outline"
                    onClick={() => setPreviewDialogOpen(true)}
                  >
                    <PanelLeftOpen data-icon="inline-start" />
                    Abrir dialogo
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="interface" className="gap-4">
                  <TabsList className="w-full justify-start">
                    <TabsTrigger value="interface">Interface</TabsTrigger>
                    <TabsTrigger value="chart">Grafico</TabsTrigger>
                    <TabsTrigger value="sidebar">Sidebar</TabsTrigger>
                  </TabsList>

                  <TabsContent value="interface" className="mt-0">
                    <div className="flex flex-col gap-5">
                      <div className="flex flex-wrap gap-3">
                        <Button>Salvar configuracao</Button>
                        <Button variant="outline">Ajuste secundario</Button>
                        <Button variant="ghost">Acao discreta</Button>
                        <Badge>Urgente</Badge>
                        <Badge variant="secondary">Monitorando</Badge>
                        <Badge variant="outline">Planejado</Badge>
                        <Badge className={themeAccentClasses.chart2.badge}>
                          Analise
                        </Badge>
                      </div>

                      <FieldGroup>
                        <Field>
                          <FieldLabel>Campo de exemplo</FieldLabel>
                          <FieldContent>
                            <Input value="Paciente estavel" readOnly />
                            <FieldDescription>
                              Mostra como campos e altura dos controles reagem
                              em tempo real.
                            </FieldDescription>
                          </FieldContent>
                        </Field>
                        <Field>
                          <FieldLabel>Observacoes</FieldLabel>
                          <FieldContent>
                            <Textarea
                              readOnly
                              value="Animal em recuperacao tranquila, sem alteracoes agudas e com parametros dentro da faixa esperada."
                            />
                          </FieldContent>
                        </Field>
                        <Field>
                          <FieldLabel>Alertas compactos</FieldLabel>
                          <FieldContent>
                            <div className="flex items-center justify-between rounded-xl border border-border bg-muted/40 p-4 shadow-xs">
                              <div>
                                <p className="text-sm font-medium">
                                  Monitoramento continuo
                                </p>
                                <p className="text-sm text-muted-foreground">
                                  Mantem o layout vivo enquanto voce ajusta as
                                  densidades.
                                </p>
                              </div>
                              <Switch
                                checked
                                aria-label="Monitoramento continuo"
                              />
                            </div>
                          </FieldContent>
                        </Field>
                      </FieldGroup>

                      <div className="overflow-hidden rounded-xl border border-border bg-background shadow-xs">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Medida</TableHead>
                              <TableHead>Ultimo valor</TableHead>
                              <TableHead>Status</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            <TableRow>
                              <TableCell>FC</TableCell>
                              <TableCell>104 bpm</TableCell>
                              <TableCell>
                                <Badge variant="secondary">Estavel</Badge>
                              </TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell>Temperatura</TableCell>
                              <TableCell>38.3 C</TableCell>
                              <TableCell>
                                <Badge variant="secondary">Monitorando</Badge>
                              </TableCell>
                            </TableRow>
                          </TableBody>
                        </Table>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="chart" className="mt-0">
                    <div className="rounded-xl border border-border bg-background p-4 shadow-xs">
                      <div className="mb-4 flex items-center justify-between gap-3">
                        <div>
                          <p className="text-sm font-medium">
                            Curva de observacao
                          </p>
                          <p className="text-sm text-muted-foreground">
                            O grafico usa tokens semanticos do tema ativo.
                          </p>
                        </div>
                        <Badge variant="secondary">
                          <BarChart3 className="mr-1 size-3.5" />
                          Preview
                        </Badge>
                      </div>
                      <ChartContainer
                        config={previewChartConfig}
                        className="h-64 w-full"
                      >
                        <AreaChart
                          data={previewChartData}
                          margin={{ left: 12, right: 12 }}
                        >
                          <CartesianGrid vertical={false} />
                          <XAxis
                            dataKey="time"
                            tickLine={false}
                            axisLine={false}
                            tickMargin={8}
                          />
                          <ChartTooltip content={<ChartTooltipContent />} />
                          <ChartLegend content={<ChartLegendContent />} />
                          <Area
                            dataKey="fc"
                            type="monotone"
                            fill="var(--color-fc)"
                            fillOpacity={0.18}
                            stroke="var(--color-fc)"
                            strokeWidth={2}
                          />
                          <Area
                            dataKey="pa"
                            type="monotone"
                            fill="var(--color-pa)"
                            fillOpacity={0.1}
                            stroke="var(--color-pa)"
                            strokeWidth={2}
                          />
                        </AreaChart>
                      </ChartContainer>
                    </div>
                  </TabsContent>

                  <TabsContent value="sidebar" className="mt-0">
                    <SidebarProvider
                      defaultOpen
                      className="min-h-0 h-80 overflow-hidden rounded-xl border border-sidebar-border bg-sidebar"
                    >
                      <Sidebar
                        collapsible="none"
                        className="h-full border-r border-sidebar-border"
                      >
                        <SidebarHeader>
                          <SidebarInput placeholder="Buscar paciente" />
                        </SidebarHeader>
                        <SidebarContent>
                          <SidebarGroup>
                            <SidebarGroupLabel>Rotas</SidebarGroupLabel>
                            <SidebarGroupContent>
                              <SidebarMenu>
                                <SidebarMenuItem>
                                  <SidebarMenuButton isActive>
                                    <LayoutDashboard />
                                    <span>Painel</span>
                                  </SidebarMenuButton>
                                </SidebarMenuItem>
                                <SidebarMenuItem>
                                  <SidebarMenuButton>
                                    <PawPrint />
                                    <span>Pacientes</span>
                                  </SidebarMenuButton>
                                </SidebarMenuItem>
                                <SidebarMenuItem>
                                  <SidebarMenuButton>
                                    <Activity />
                                    <span>Tratamentos</span>
                                  </SidebarMenuButton>
                                </SidebarMenuItem>
                              </SidebarMenu>
                            </SidebarGroupContent>
                          </SidebarGroup>
                        </SidebarContent>
                        <SidebarFooter>
                          <Button
                            variant="secondary"
                            className="w-full justify-start"
                          >
                            Nova sessao
                          </Button>
                        </SidebarFooter>
                      </Sidebar>
                      <SidebarInset className="min-h-0 bg-background">
                        <div className="flex h-full flex-col gap-4 p-4">
                          <div className="rounded-xl border border-border bg-card p-4 shadow-xs">
                            <p className="text-sm font-medium">
                              Conteudo principal
                            </p>
                            <p className="mt-1 text-sm text-muted-foreground">
                              O preview usa as mesmas cores e bordas da sidebar
                              real.
                            </p>
                          </div>
                          <div className="grid flex-1 grid-cols-2 gap-4">
                            <div className="rounded-xl border border-border bg-muted/40 p-4" />
                            <div className="rounded-xl border border-border bg-muted/40 p-4" />
                          </div>
                        </div>
                      </SidebarInset>
                    </SidebarProvider>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>
        </div>
      </PageLayout>

      <Dialog open={isPreviewDialogOpen} onOpenChange={setPreviewDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Dialogo de teste</DialogTitle>
            <DialogDescription>
              Use este modal para validar espacamento, radius, altura dos
              controles e a nova tipografia sem sair da pagina.
            </DialogDescription>
          </DialogHeader>
          <FieldGroup>
            <Field>
              <FieldLabel>Observacao rapida</FieldLabel>
              <FieldContent>
                <Input value="Sinais vitais estabilizados" readOnly />
              </FieldContent>
            </Field>
            <Field>
              <FieldLabel>Resumo</FieldLabel>
              <FieldContent>
                <Textarea
                  readOnly
                  value="Sem intercorrencias no periodo. Perfusao preservada, mucosas coradas e plano anestesico adequado."
                />
              </FieldContent>
            </Field>
            <div className="flex items-center justify-between rounded-xl border border-border bg-muted/40 p-4">
              <div>
                <p className="text-sm font-medium">Persistir como padrao</p>
                <p className="text-sm text-muted-foreground">
                  O modal compartilha os mesmos tokens aplicados no resto do
                  app.
                </p>
              </div>
              <Switch checked aria-label="Persistir como padrao" />
            </div>
          </FieldGroup>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setPreviewDialogOpen(false)}
            >
              Fechar
            </Button>
            <Button onClick={() => setPreviewDialogOpen(false)}>Entendi</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span>{label}</span>
      <span className="font-medium text-foreground">{value}</span>
    </div>
  );
}

function labelFor<T extends { id: string; label: string }>(
  options: readonly T[],
  value: string,
) {
  return options.find((option) => option.id === value)?.label ?? value;
}
