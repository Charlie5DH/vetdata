# Design system handoff

Status of the VetData design-system work, for whoever picks it up next (another person or another Claude
session). Last updated 2026-11-07.

## Where things stand

- **The design system is the app's only style.** Theme switching, the Personalização page, the 17 themes, dark mode
  and the extra font packages were removed. Every component in `frontend/src/components/ui` and every page was
  restyled to it.
- **Committed on `main` as `ea65358`** ("Adopt VetData design system as the only style…", 149 files). `git show ea65358`
  shows the whole change.
- **Checks at handoff:** `npm run build` passes in `frontend/`. `npm run lint` shows 26 errors, the same 26 the last
  commit already had (none are from this work).
- **Seen in the running app:** dashboard (Painel), patient list, patient details, treatment session with its chart,
  assistant panel with Pip, Tutores, Vacinas, sign-up, clinic setup, and the patient list at phone width.
- **Not yet seen in the browser:** the template builder, the team page and the create forms. They build, but nobody
  has looked at them in the running app.

## What lives where

| Path | What |
| --- | --- |
| `docs/design-system/DESIGN.md` | The spec, written for agents without vision. §0 maps it onto this codebase. **Source of truth.** |
| `docs/design-system/vetdata-design-system.html` | The reference page: every token and component rendered, plus the icon sprite and logo. Open it in a browser. |
| `docs/design-system/component-recipes.md` | Exact Tailwind class strings per component. |
| `docs/design-system/globals.reference.css` | The tokens as a standalone Tailwind v4 stylesheet. |
| `docs/design-system/tools/export-ds.mjs` | Regenerates icons, logo, Pip, spec and recipes from the reference page (see below). |
| `frontend/src/index.css` | The live tokens. Change these together with DESIGN.md. |
| `frontend/src/components/icons/vetdata-icons.tsx` | 75 custom icons (`<PawIcon size={16} />`), sprite at `frontend/public/vetdata-icons.svg`. |
| `frontend/src/components/brand/` | `VetDataLogo`, `VetDataMark` and `AssistantPet` (Pip). |
| `.agents/skills/vetdata-design-system/SKILL.md` | The agent skill (symlinked from `.claude/skills/`). Agents load it for any UI work. |

## Editing the reference page

The page was first published as a private claude.ai artifact on the original author's account. Other accounts
can't open it, so **the copy in this repo is the one to edit.** It already has the doctype wrapper and opens directly
in a browser.

After changing the page, regenerate the hand-off files into a scratch folder and merge them by hand:

```bash
node docs/design-system/tools/export-ds.mjs docs/design-system/vetdata-design-system.html /tmp/vetdata-export
```

Don't copy the output over the repo blindly. The repo copies carry edits the page doesn't have: DESIGN.md §0 (the
single-style rewrite), the `eslint-disable` line at the top of `vetdata-icons.tsx`, and the `@layer components`
wrapper around Pip's CSS in `assistant-pet.tsx` (without it, utility classes can't resize Pip).

## Decisions already made

- `primary` is forest (#2A3F2E). The lemon call-to-action is `<Button variant="cta">`, at most one per view.
- Literata for every word; IBM Plex Mono only for microchips, IDs and code.
- Stock Tailwind text scale (`text-sm` = 14px), body text 15px.
- Light only. Dark mode was dropped because it was only reachable from Personalização. Bring it back only if asked,
  as a plain toggle, not the old theme engine.
- UI copy is Brazilian Portuguese; pet owners are "tutores".
- Lucide stays only for icons the set lacks (ChevronsLeft/Right, GripVertical, ShieldCheck, Loader2).

## Changes beyond restyling (review before committing)

- New "Novo paciente", "Novo tutor" and "Novo tratamento" buttons on list pages that had none. They link to routes
  that already existed.
- Patient details shows a red flag at the top when an active treatment has a measurement out of its limits
  (from `useSessionsAlerts`).
- Patient list: species and breed moved under the pet's name; the breed column became "Motivo".
- Dashboard: the hardcoded "+0% em relação ao mês anterior" line was removed.
- Chat: a fourth suggestion, "Mostre os tutores cadastrados". It only works if the assistant can actually list tutors.
- Some titles and labels changed wording or moved to sentence case.

## Known issues left alone

- The species filter on Pacientes points to a column that doesn't exist, so it does nothing. This was broken before
  the restyle.
- A leftover `console.log` in `owner-selection-table`.

## Running it locally

The usual way is the repo's own setup (`docker-compose.yml`, see `DOCKER.md`). The quick preview used for the checks
above was the backend on port 8020 and `npm run dev` in `frontend/` with `VITE_API_BASE_URL=http://localhost:8020/api/v1`.
That preview and its test data have been removed. A new session needs to create its own account and sample data.
