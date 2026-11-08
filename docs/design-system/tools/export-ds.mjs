// Extracts the hand-off files from the design system page into an output folder.
// usage (from the repo root): node docs/design-system/tools/export-ds.mjs docs/design-system/vetdata-design-system.html <outDir>
// Write to a scratch folder and merge by hand: the repo copies carry edits the page doesn't have
// (DESIGN.md §0, the eslint-disable line in vetdata-icons.tsx, the @layer wrapper in assistant-pet.tsx).
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";

const [, , pagePath, outDir] = process.argv;
const html = readFileSync(pagePath, "utf8");
mkdirSync(outDir, { recursive: true });

const block = (id) => {
  const m = html.match(new RegExp(`<script type="text/plain" id="${id}">([\\s\\S]*?)</script>`));
  if (!m) throw new Error(`missing ${id}`);
  return m[1].replace(/^\n/, "");
};

// Icon groups, same order as the page
const GROUPS = [
  ["Patients & species", ["paw", "dog", "cat", "rabbit", "bird", "bone", "bowl", "microchip", "owner", "kennel"]],
  ["Clinical", ["stethoscope", "heart-pulse", "thermometer", "scale", "syringe", "vial", "pill", "rx", "scalpel", "bandage", "tooth", "ear", "eye", "cross", "flag"]],
  ["Lab & diagnostics", ["test-tube", "droplet", "microscope", "xray"]],
  ["Practice", ["clinic", "appointment", "record", "invoice", "calendar", "clock", "users", "chart"]],
  ["Assistant", ["sparkle", "mic", "send", "paperclip", "at", "stop", "thumb-up", "thumb-down"]],
  ["Interface", ["home", "search", "bell", "cog", "panel", "plus", "minus", "check", "x", "chev-d", "chev-r", "chev-l", "chev-ud", "arrow-l", "more", "filter", "download", "upload", "copy", "link", "edit", "trash", "mail", "phone", "info", "alert", "ok", "help", "file", "logout"]],
];
const inner = (name) => {
  const m = html.match(new RegExp(`<symbol id="i-${name}" viewBox="0 0 24 24">([\\s\\S]*?)</symbol>`));
  if (!m) throw new Error(`missing icon ${name}`);
  return m[1].trim();
};
const pascal = (n) => n.split("-").map((p) => p[0].toUpperCase() + p.slice(1)).join("") + "Icon";

let tsx = `// VetData Icons v1 · 24x24 · stroke 1.75 · round caps/joins · currentColor
// Exported from docs/design-system/vetdata-design-system.html. Usage: <PawIcon size={16} className="text-muted-foreground" />
import type { SVGProps } from "react";

export type IconProps = SVGProps<SVGSVGElement> & { size?: number };

const base = (size = 16) => ({
  width: size,
  height: size,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.75,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
});

`;
const all = [];
let sprite = "";
for (const [title, names] of GROUPS) {
  tsx += `// ${title}\n`;
  for (const n of names) {
    all.push(n);
    tsx += `export const ${pascal(n)} = ({ size, ...p }: IconProps) => (\n  <svg {...base(size)} aria-hidden="true" data-vd-icon="${n}" {...p}>${inner(n)}</svg>\n);\n`;
    sprite += `  <symbol id="vd-${n}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">${inner(n)}</symbol>\n`;
  }
  tsx += "\n";
}
tsx += `export const vetdataIcons = {\n${all.map((n) => `  "${n}": ${pascal(n)},`).join("\n")}\n} as const;\n\nexport type VetDataIconName = keyof typeof vetdataIcons;\n`;

writeFileSync(join(outDir, "vetdata-icons.tsx"), tsx);
writeFileSync(join(outDir, "vetdata-icons.svg"), `<svg xmlns="http://www.w3.org/2000/svg" style="display:none">\n${sprite}</svg>\n`);
writeFileSync(join(outDir, "vetdata-logo.tsx"), block("logo-text"));
writeFileSync(join(outDir, "assistant-pet.tsx"), block("pet-text"));
writeFileSync(join(outDir, "DESIGN.md"), block("spec-text"));
writeFileSync(join(outDir, "globals.reference.css"), block("css-text"));
writeFileSync(join(outDir, "component-recipes.md"), "# Component recipes (Tailwind class strings)\n\n```text\n" + block("cva-text") + "\n```\n");
console.log(`icons: ${all.length}`);
