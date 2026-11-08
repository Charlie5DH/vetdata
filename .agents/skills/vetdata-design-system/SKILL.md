---
name: vetdata-design-system
description: The VetData design system (forest, cream and lemon on the Literata serif, pill controls, custom vet icons, dog logo, Pip mascot) — the app's one and only style. Use it for ANY change to VetData's user interface — building or restyling a page, component, form, table, chart, dialog, sidebar, the AI assistant/chat, empty states, icons, the logo or the tokens in frontend/ — even when the request doesn't mention design. It overrides generic design skills for visual decisions.
---

# VetData design system

VetData has exactly one look: this design system, light only. There is no theme picker, no dark mode and no user
customization. The spec is `docs/design-system/DESIGN.md` (written so an agent without vision can apply it); every
component is rendered live in `docs/design-system/vetdata-design-system.html`.

Picking up earlier design-system work? Read `docs/design-system/HANDOFF.md` first: what's done, what's uncommitted
and what's still open.

**Before writing UI code, read `docs/design-system/DESIGN.md` §0 ("Working in this repo") and the section for the
component you are touching.** §0 maps the spec onto this codebase and wins where they differ.

## Precedence
1. The user's explicit request.
2. This design system (DESIGN.md §0, then the rest of DESIGN.md).
3. Existing project conventions (the restyled shadcn components in `frontend/src/components/ui`).
4. Generic skills (`frontend-design`, `apple-design`, `better-interface`, `shadcn`): use them for craft and mechanics
   (motion physics, accessibility, shadcn CLI), never to pick another palette, typeface or shape language. When the
   shadcn CLI adds or updates a component, restyle it to this system before using it.

## The essentials (details in DESIGN.md)
- **Character:** calm and papery. Cream page (`bg-background`), cream-50 cards (`bg-card`), forest ink and brand,
  one lemon call-to-action per view. Flat: 1px hairlines and fill shifts, shadows only on floating layers.
- **Tokens:** all in `frontend/src/index.css`. Use semantic classes (`bg-card`, `bg-muted`, `text-muted-foreground`,
  `border-border`, `bg-brand`, `bg-cta`, `bg-success-soft`/`text-success`, `bg-warning-soft`, `bg-info-soft`,
  `bg-destructive-soft`, `bg-range`). No hex in components. Palette classes (`forest-900`, `lemon-300`, …) only on
  brand surfaces.
- **Type:** Literata for every word (`font-sans`). Mono only for microchips, IDs and code. Headings 600, sentence case.
  Stock Tailwind scale (`text-xs` 12px, `text-sm` 14px), body 15px. Clinical numbers `tabular-nums` with their unit.
- **Buttons:** `<Button>` (default) is forest; `<Button variant="cta">` is the lemon primary action, max one per view;
  `secondary` for in-row actions, `outline` for neutral/third-party, `ghost`, `link`, `destructive`.
- **Shape:** pills for buttons, inputs, selects, badges, nav items, pagination; chips `rounded-sm` (6px); menu rows
  `rounded-md`; alerts and list rows `rounded-lg`; cards `rounded-xl` (14px); dialogs `rounded-2xl`; composer `rounded-3xl`.
- **Icons:** `@/components/icons/vetdata-icons` (`<PawIcon size={16} />`). Lucide only when the set has no equivalent;
  `SparkleIcon` means the assistant only.
- **Brand:** `<VetDataLogo />` / `<VetDataMark />` from `@/components/brand/vetdata-logo`. Pip, the assistant mascot:
  `<AssistantPet />` from `@/components/brand/assistant-pet`, only in assistant empty, onboarding or waiting states,
  once per screen, never as the 28px message avatar.
- **Clinical rules:** patient alerts (allergy, behavior) first, as flags with an icon; units always shown; missing
  values "—", never 0; assistant answers that affect care show inputs, sources and a verification note.
- **Copy:** Brazilian Portuguese, short and friendly. Owners are "tutores". Errors say what happened and how to fix it.

## Workflow for a UI change
1. Read DESIGN.md §0 and the relevant component section (§6–§11); for exact class strings see
   `docs/design-system/component-recipes.md`.
2. Build with the components in `frontend/src/components/ui` (already in this style). Don't re-style them per page.
3. Check before finishing:
   - at most one `variant="cta"` on the screen; no lemon text or thin lemon lines
   - no hex colors, no `dark:` styling, no other fonts; semantic tokens only
   - no shadows on resting cards/buttons; hairline borders instead
   - VetData icons, sized 14/16/18; numbers right-aligned and tabular with units
   - Portuguese copy; "—" for missing values; patient alerts visible
4. Verify with `npm run build` and `npm run lint` in `frontend/` and look at the screen in the running app
   (`npm run dev`).

## Changing the design system itself
Change `frontend/src/index.css` (and the affected `components/ui/*`) and update DESIGN.md in the same change so the
spec and the code don't drift. Don't reintroduce theme switching or per-user customization unless asked.
