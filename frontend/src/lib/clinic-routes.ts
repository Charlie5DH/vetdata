import { useMemo } from "react";
import { useLocation, useParams } from "react-router-dom";

const clinicScopedTopLevelPaths = new Set([
  "clinic",
  "team",
  "visao-geral",
  "customization",
  "perfil",
  "patients",
  "tutors",
  "templates",
  "measures",
  "treatments",
]);

const nonClinicPrefixes = new Set(["sign-in", "sign-up", "clinic"]);

function ensureLeadingSlash(path: string) {
  if (!path) {
    return "/";
  }

  return path.startsWith("/") ? path : `/${path}`;
}

export function slugifyClinicName(name: string) {
  const slug = name
    .normalize("NFKD")
    .replaceAll(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replaceAll(/[^a-z0-9]+/g, "-")
    .replaceAll(/^-+|-+$/g, "");

  return slug || "clinica";
}

export function normalizeClinicScopedPath(path: string) {
  const withLeadingSlash = ensureLeadingSlash(path);

  if (withLeadingSlash === "/") {
    return "/";
  }

  const trimmed = withLeadingSlash.replace(/\/+$/, "") || "/";

  if (trimmed === "/clinic/team") {
    return "/team";
  }

  if (trimmed.startsWith("/clinic/team/")) {
    return trimmed.replace("/clinic/team", "/team");
  }

  return trimmed;
}

export function isClinicScopedAppPath(path: string) {
  const normalizedPath = normalizeClinicScopedPath(path);

  if (normalizedPath === "/") {
    return true;
  }

  const firstSegment = normalizedPath.split("/").find(Boolean);
  return firstSegment ? clinicScopedTopLevelPaths.has(firstSegment) : false;
}

export function buildClinicPath(
  clinicSlug: string | null | undefined,
  path = "/",
) {
  const normalizedPath = normalizeClinicScopedPath(path);

  if (!clinicSlug) {
    return normalizedPath;
  }

  if (normalizedPath === "/") {
    return `/${clinicSlug}`;
  }

  return `/${clinicSlug}${normalizedPath}`;
}

export function stripClinicPrefix(
  pathname: string,
  clinicSlug: string | null | undefined,
) {
  if (!clinicSlug) {
    return normalizeClinicScopedPath(pathname);
  }

  const prefix = `/${clinicSlug}`;

  if (pathname === prefix) {
    return "/";
  }

  if (pathname.startsWith(`${prefix}/`)) {
    return normalizeClinicScopedPath(pathname.slice(prefix.length));
  }

  return normalizeClinicScopedPath(pathname);
}

export function getCanonicalClinicPath(pathname: string, clinicSlug: string) {
  if (
    pathname.startsWith("/sign-in") ||
    pathname.startsWith("/sign-up") ||
    pathname.startsWith("/clinic/setup")
  ) {
    return null;
  }

  if (pathname === "/") {
    return buildClinicPath(clinicSlug);
  }

  const currentClinicPrefix = `/${clinicSlug}`;
  if (
    pathname === currentClinicPrefix ||
    pathname.startsWith(`${currentClinicPrefix}/`)
  ) {
    const normalizedPath = buildClinicPath(
      clinicSlug,
      stripClinicPrefix(pathname, clinicSlug),
    );

    return normalizedPath === pathname ? null : normalizedPath;
  }

  const segments = pathname.split("/").filter(Boolean);
  if (segments.length > 1 && clinicScopedTopLevelPaths.has(segments[1])) {
    return buildClinicPath(clinicSlug, `/${segments.slice(1).join("/")}`);
  }

  if (isClinicScopedAppPath(pathname)) {
    return buildClinicPath(clinicSlug, pathname);
  }

  if (segments.length === 1) {
    return buildClinicPath(clinicSlug);
  }

  return buildClinicPath(clinicSlug, pathname);
}

export function getClinicSlugFromPathname(pathname: string) {
  const segments = pathname.split("/").filter(Boolean);
  const [firstSegment, secondSegment] = segments;

  if (!firstSegment) {
    return null;
  }

  if (nonClinicPrefixes.has(firstSegment)) {
    return null;
  }

  if (clinicScopedTopLevelPaths.has(firstSegment)) {
    return null;
  }

  if (!secondSegment) {
    return firstSegment;
  }

  if (clinicScopedTopLevelPaths.has(secondSegment)) {
    return firstSegment;
  }

  return null;
}

export function useClinicPath() {
  const { clinicSlug: clinicSlugParam } = useParams<{ clinicSlug: string }>();
  const { pathname } = useLocation();
  const clinicSlug = clinicSlugParam ?? getClinicSlugFromPathname(pathname);

  return useMemo(
    () => ({
      clinicSlug,
      clinicPath: (path = "/") => buildClinicPath(clinicSlug, path),
      stripClinicPath: (pathname: string) =>
        stripClinicPrefix(pathname, clinicSlug),
    }),
    [clinicSlug],
  );
}
