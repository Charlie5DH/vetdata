import type { ComponentType } from "react";

import {
  ChartIcon,
  ClinicIcon,
  FileIcon,
  HeartPulseIcon,
  HomeIcon,
  OwnerIcon,
  PawIcon,
  ScaleIcon,
  SyringeIcon,
  UsersIcon,
  VialIcon,
} from "@/components/icons/vetdata-icons";

export type NavIcon = ComponentType<{ className?: string; size?: number }>;

export interface AppNavItem {
  title: string;
  url: string;
  icon: NavIcon;
}

export interface AppSecondaryNavItem {
  title: string;
  url: string;
  icon: NavIcon;
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
    icon: HeartPulseIcon,
  },
  navMain: [
    {
      title: "Painel",
      url: "/",
      icon: HomeIcon,
    },
    {
      title: "Visão Geral",
      url: "/visao-geral",
      icon: ChartIcon,
    },
    {
      title: "Pacientes",
      url: "/patients",
      icon: PawIcon,
    },
    {
      title: "Tutores",
      url: "/tutors",
      icon: OwnerIcon,
    },
    {
      title: "Modelos",
      url: "/templates",
      icon: FileIcon,
    },
    {
      title: "Medidas",
      url: "/measures",
      icon: ScaleIcon,
    },
    {
      title: "Tratamentos",
      url: "/treatments",
      icon: HeartPulseIcon,
    },
    {
      title: "Vacinas",
      url: "/vaccines",
      icon: SyringeIcon,
    },
    {
      title: "Catálogo de Vacinas",
      url: "/vaccines/catalog",
      icon: VialIcon,
    },
  ] satisfies AppNavItem[],
  navSecondary: [
    {
      title: "Clínica",
      url: "/clinic",
      icon: ClinicIcon,
    },
    {
      title: "Equipe",
      url: "/team",
      icon: UsersIcon,
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
  {
    type: "startsWith",
    value: "/vaccines/catalog",
    meta: {
      section: "Vacinas",
      page: "Catálogo",
      sectionUrl: "/vaccines/catalog",
    },
  },
  {
    type: "startsWith",
    value: "/vaccines",
    meta: {
      section: "Vacinas",
      page: "Vacinações",
      sectionUrl: "/vaccines",
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
