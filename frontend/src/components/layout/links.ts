import {
  Activity,
  Building2,
  FileText,
  HeartPulse,
  LayoutDashboard,
  PanelsTopLeft,
  PawPrint,
  Ruler,
  SlidersHorizontal,
  Users,
  type LucideIcon,
} from "lucide-react";

export interface AppNavItem {
  title: string;
  url: string;
  icon: LucideIcon;
}

export interface AppSecondaryNavItem {
  title: string;
  url: string;
  icon: LucideIcon;
  external?: boolean;
}

export interface RouteMeta {
  section: string;
  page: string;
  sectionUrl: string;
}

type RouteMatcher = {
  type: "exact" | "startsWith";
  value: string;
  meta: RouteMeta;
};

export const appNavigation = {
  brand: {
    title: "VetData",
    subtitle: "Gestao veterinaria",
    icon: HeartPulse,
  },
  navMain: [
    {
      title: "Painel",
      url: "/",
      icon: LayoutDashboard,
    },
    {
      title: "Visão Geral",
      url: "/visao-geral",
      icon: PanelsTopLeft,
    },
    {
      title: "Pacientes",
      url: "/patients",
      icon: PawPrint,
    },
    {
      title: "Tutores",
      url: "/tutors",
      icon: Users,
    },
    {
      title: "Modelos",
      url: "/templates",
      icon: FileText,
    },
    {
      title: "Medidas",
      url: "/measures",
      icon: Ruler,
    },
    {
      title: "Tratamentos",
      url: "/treatments",
      icon: Activity,
    },
  ] satisfies AppNavItem[],
  navSecondary: [
    {
      title: "Clínica",
      url: "/clinic",
      icon: Building2,
    },
    {
      title: "Equipe",
      url: "/team",
      icon: Users,
    },
    {
      title: "Personalizacao",
      url: "/customization",
      icon: SlidersHorizontal,
    },
  ] satisfies AppSecondaryNavItem[],
};

const routeMatchers: RouteMatcher[] = [
  {
    type: "exact",
    value: "/",
    meta: {
      section: "VetData",
      page: "Painel",
      sectionUrl: "/",
    },
  },
  {
    type: "startsWith",
    value: "/clinic/setup",
    meta: {
      section: "Clínica",
      page: "Cadastro inicial",
      sectionUrl: "/clinic",
    },
  },
  {
    type: "exact",
    value: "/clinic",
    meta: {
      section: "Clínica",
      page: "Cadastro",
      sectionUrl: "/clinic",
    },
  },
  {
    type: "exact",
    value: "/team",
    meta: {
      section: "Equipe",
      page: "Equipe",
      sectionUrl: "/team",
    },
  },
  {
    type: "startsWith",
    value: "/customization",
    meta: {
      section: "Configuracoes",
      page: "Personalizacao",
      sectionUrl: "/customization",
    },
  },
  {
    type: "startsWith",
    value: "/visao-geral",
    meta: {
      section: "VetData",
      page: "Visão Geral",
      sectionUrl: "/visao-geral",
    },
  },
  {
    type: "startsWith",
    value: "/patients/new",
    meta: {
      section: "Pacientes",
      page: "Novo paciente",
      sectionUrl: "/patients",
    },
  },
  {
    type: "startsWith",
    value: "/patients/",
    meta: {
      section: "Pacientes",
      page: "Detalhes do paciente",
      sectionUrl: "/patients",
    },
  },
  {
    type: "startsWith",
    value: "/patients",
    meta: {
      section: "Pacientes",
      page: "Lista de pacientes",
      sectionUrl: "/patients",
    },
  },
  {
    type: "startsWith",
    value: "/tutors/new",
    meta: {
      section: "Tutores",
      page: "Novo tutor",
      sectionUrl: "/tutors",
    },
  },
  {
    type: "startsWith",
    value: "/tutors/",
    meta: {
      section: "Tutores",
      page: "Detalhes do tutor",
      sectionUrl: "/tutors",
    },
  },
  {
    type: "startsWith",
    value: "/tutors",
    meta: {
      section: "Tutores",
      page: "Lista de tutores",
      sectionUrl: "/tutors",
    },
  },
  {
    type: "startsWith",
    value: "/templates/new",
    meta: {
      section: "Modelos",
      page: "Novo modelo",
      sectionUrl: "/templates",
    },
  },
  {
    type: "startsWith",
    value: "/templates",
    meta: {
      section: "Modelos",
      page: "Todos os modelos",
      sectionUrl: "/templates",
    },
  },
  {
    type: "startsWith",
    value: "/measures/new",
    meta: {
      section: "Medidas",
      page: "Medida",
      sectionUrl: "/measures",
    },
  },
  {
    type: "startsWith",
    value: "/measures",
    meta: {
      section: "Medidas",
      page: "Catalogo de medidas",
      sectionUrl: "/measures",
    },
  },
  {
    type: "startsWith",
    value: "/treatments/new",
    meta: {
      section: "Tratamentos",
      page: "Nova sessao",
      sectionUrl: "/treatments",
    },
  },
  {
    type: "startsWith",
    value: "/treatments/",
    meta: {
      section: "Tratamentos",
      page: "Sessao de tratamento",
      sectionUrl: "/treatments",
    },
  },
  {
    type: "startsWith",
    value: "/treatments",
    meta: {
      section: "Tratamentos",
      page: "Sessoes ativas",
      sectionUrl: "/treatments",
    },
  },
];

export function getRouteMeta(pathname: string): RouteMeta {
  for (const matcher of routeMatchers) {
    if (matcher.type === "exact" && pathname === matcher.value) {
      return matcher.meta;
    }

    if (matcher.type === "startsWith" && pathname.startsWith(matcher.value)) {
      return matcher.meta;
    }
  }

  return {
    section: "VetData",
    page: "Area da aplicacao",
    sectionUrl: "/",
  };
}
