# VetData design system (DESIGN.md)

VetData is practice software for veterinarians: patients, medical records, schedule, lab results, billing and an
AI assistant that drafts notes and checks doses. The visual language was extracted from a set of onboarding
screenshots; items marked (imagined) were extrapolated to match. Stack: React + shadcn/ui + Tailwind v4.
Icons: the custom VetData icon set (components/icons/vetdata-icons.tsx). Do not use another icon library.

Visual reference: open `docs/design-system/vetdata-design-system.html` in a browser (every component rendered live).

## 0. Working in this repo (read first)
The sections after this one are the design system as designed. This section says how it maps onto the VetData
frontend (`frontend/`). Where they differ, this section wins.

### One style, no customization
VetData has exactly one look: this design system, light only. There is no theme picker, no dark theme and no
per-user customization (the old Personalização page, `lib/themes.ts`, `lib/customization.ts` and
`components/theme-provider.tsx` were removed). Every token is a fixed CSS variable in `frontend/src/index.css`.

### Files
- Tokens, fonts, radii, shadows: `frontend/src/index.css` (`:root` and the `@theme` blocks).
- shadcn components restyled to this system: `frontend/src/components/ui/*`.
- Icons: `frontend/src/components/icons/vetdata-icons.tsx` (`PawIcon`, `DogIcon`, … and the `vetdataIcons` map);
  sprite `frontend/public/vetdata-icons.svg` (`<use href="/vetdata-icons.svg#vd-paw"/>`).
- Logo: `frontend/src/components/brand/vetdata-logo.tsx` (`VetDataLogo`, `VetDataMark`); favicon `frontend/public/favicon.svg`.
- Mascot: `frontend/src/components/brand/assistant-pet.tsx` (`AssistantPet`, "Pip").
- Class recipes per component: `docs/design-system/component-recipes.md`. Visual reference:
  `docs/design-system/vetdata-design-system.html`. `globals.reference.css` is the design page's stylesheet, kept for
  reference only.

### Tokens (Tailwind utilities)
- Surfaces/ink: `bg-background` (cream-100 page), `bg-card`/`bg-popover` (cream-50), `bg-muted`/`bg-accent` (cream-200,
  hover and focus fills), `bg-secondary` (cream-250), `border-border` (cream-300 hairlines), `border-input` (cream-400),
  `text-foreground` (forest-900), `text-muted-foreground` (stone-600), `ring-ring` (forest-500).
- `primary` = `brand` = FOREST (#2A3F2E). The app uses `primary` for icon tints, rings and active states, which need
  contrast on cream. `<Button>` (default variant) is therefore the forest "brand" button.
- `cta` = LEMON (#F3DC7E, border `cta-border` #E5C658, lip `shadow-lemon`). `<Button variant="cta">` is the single
  primary call-to-action per view. Never lemon text or thin lemon lines.
- Semantic: `success`, `warning`, `info`, `destructive` (+ `-foreground`) and soft fills `bg-success-soft`,
  `bg-warning-soft`, `bg-info-soft`, `bg-destructive-soft`; clinical range `bg-range`, `border-range-edge`.
- Charts `chart-1…5`; sidebar tokens put the sidebar on forest (`sidebar-primary` is lemon, used only on forest).
- Fixed palette `forest-*`, `cream-*`, `stone-*`, `lemon-*`, `mint-*`, `ochre-500` exists for brand surfaces (logo, Pip,
  illustrations). UI code uses the semantic tokens, never hex.
- Radii: `rounded-sm` 6px (chips), `rounded-md` 8px (menu items, OTP, flags), `rounded-lg` 12px (alerts, list rows),
  `rounded-xl` 14px (cards, popovers, tables), `rounded-2xl` 18px (dialogs), `rounded-3xl` 20px (composer),
  `rounded-full` (buttons, inputs, selects, badges, nav items, pagination).
- Shadows: none at rest; `shadow-xs` outline button; `shadow-sm` active segment/thumbs; `shadow-md` menus, popovers,
  toasts; `shadow-lg` dialogs; `shadow-lemon` the cta lip.

### Typography in this repo
- Literata (`@fontsource-variable/literata`) for every word, IBM Plex Mono for IDs/microchips/code. `font-sans` IS
  Literata. No other font packages are installed.
- The Tailwind text scale is STOCK (`text-xs` 12px, `text-sm` 14px, `text-base` 16px) and `1rem` = 16px, so the
  recipes in this document apply as written. Body text is 15px (set on `body`).

### Sizes
- Components size themselves with the recipes (buttons 36px default, inputs 40px, …). A few legacy `--app-*`
  variables remain in `index.css` with fixed VetData values (`--app-control-height` 36px, `--app-card-padding` 20px,
  …) for pages that still read them; prefer the component props and recipes in new code.

### Language and domain words
- UI copy is Brazilian Portuguese. Examples in this document are English; translate them, keep the tone (short,
  friendly, sentence case). Pet owners are "tutores" (Tutor), patients are "pacientes", species values are stored
  in Portuguese ("Cachorro", "Gato"; see `frontend/src/lib/species.ts`).
- Units and formats: kg, °C, bpm, mg/kg; decimal comma (28,4 kg); dates "4 nov." in lists, "4 de nov. de 2026" in
  records; 24-hour time.

### Icons
- UI uses VetData icons. Where the set has no equivalent, a lucide icon at stroke 1.75 is acceptable (the global
  CSS sets that stroke); never add another icon library. `sparkle` means the AI assistant and nothing else.

### Assistant
- The chat lives in `frontend/src/components/chat/chat-widget.tsx`. Its composer and messages follow §8
  (composer, conversation) and it uses `AssistantPet` only in its empty state.

## 1. Character
Calm, warm and papery, built for busy exam rooms. Cream "paper" background, deep forest-green ink and brand
surfaces, one soft lemon-yellow accent for the single primary action per screen. EVERY word is set in one warm
text serif (Literata), including buttons, chips, labels, table cells and the assistant composer. Controls are
pills. The UI is flat: depth comes from fill changes and 1px hairlines; shadows only on floating layers.
Generous whitespace, small UI type (12-15px), restrained headings (24px semibold).

## 2. Color tokens
### Forest (brand, ink, dark panels)
forest-950 #1E2E22 code bg · forest-900 #2A3F2E BRAND: headings, ink, logo tile, sidebar, checked controls, send button
forest-800 #355039 hover/active on forest · forest-700 #46634B sidebar counts, decor strokes · forest-600 #5E7B63 focus border
forest-500 #7E957F hover border, ring, sidebar group labels · forest-300 #B8C5B4 text on forest · forest-200 #D5DDD0
mint-300 #97CFA3 pet/person avatar fill, normal-range bar · mint-100 #DCEFDF chart reference band, pet avatar alt
### Cream (surfaces, borders)
white #FFFFFF only outline button, checkbox/radio off, active segment · cream-50 #FCFAF4 cards, popovers, composer
cream-100 #F8F5EA PAGE · cream-200 #F1EEE2 hover/focus fill, menu highlight · cream-250 #ECE9DC secondary button, user message
cream-300 #E9E6D8 hairlines, card borders, disabled fill · cream-400 #DEDAC8 control borders · cream-500 #C9C5B1 checkbox, dropzone
### Ink
foreground #2A3F2E (10.4:1) · stone-700 #4A574C body (7.0:1) · stone-600 #686E62 muted (4.8:1) · stone-500 #8A8F80 placeholder (3.0:1) · stone-400 #B2B4A4 disabled
### Lemon (accent)
lemon-100 #FBF3CF selected chip/row, current appointment · lemon-200 #F8E9A8 hover · lemon-300 #F3DC7E PRIMARY button, trial badge, sidebar "new" count
lemon-400 #E5C658 lemon button border, logo ears · lemon-600 #A88A24 lemon-tinted icons on cream · ochre-500 #C98424 unread dots, calendar dots, chart-2
### Semantic (imagined)
success #3F7A4F on #E1EEDC (checked in, normal, up to date) · warning #9A6410 on #F8EACB (waiting, due soon, borderline vital)
destructive #B4493B on #F6E2DA (allergy, overdue, critical, delete) · info #4E6A80 on #E2E9EC (in treatment, syncing)
### Charts
chart-1 #2A3F2E forest · chart-2 #C98424 ochre · chart-3 #7FA88A sage · chart-4 #DDB940 lemon (with 1px #A88A24 edge) · chart-5 #5F7A8C slate · range band #DCEFDF
### Rules
~78% cream, 14% forest, 5% stone text, 3% lemon. One lemon element per view. Lemon never carries text or thin lines.

## 3. Typography
Literata (Google, variable, opsz on), fallback Merriweather, Georgia. Map to font-sans. Mono (IBM Plex Mono) ONLY for
microchip numbers, patient IDs, code and slash commands.
display 32/38 600 -0.02em · h1 24/30 600 -0.01em · h2 20/28 600 · h3 16/24 600 · quote 19/28 400 cream on forest
lead 15-16/24 stone-600 · body 14/22 stone-700 · label 13/18 600 · small 12.5/18 500 · caption 12/18 stone-500
overline 10.5/14 600 UPPERCASE +0.08em (badges). Clinical numbers: tabular-nums, value in foreground + unit in
14px/500 stone-600 (28.4 kg, 38.6 °C, 96 bpm). Headings text-wrap: balance, sentence case.

## 4. Space, shape, elevation, motion
4px grid. Form stack 12px. Heading → hairline → content 16px. Card padding 20. Stage/dialog padding 24. Sections 32-48.
Radius: full (buttons, inputs, selects, badges, nav items, pagination, time slots) · 20 composer · 18 dialogs, command palette
· 14 cards, popovers, tables · 12 alerts, list rows (appointments, files), rail items · 8 OTP, menu items, flags, context chips
· 6 chips, citations · 4 checkbox · logo tile 25%.
Borders 1px: cream-300 hairlines, cream-400 controls, forest-500 hover, forest-600 focus. Focus ring 3px rgb(42 63 46/.10-.12).
Shadows: none at rest · xs outline button · sm active segment, thumbs · md menus, popovers, toasts, floating composer ·
lg dialogs, command palette · lemon lip inset 0 -1px 0 rgb(140 105 10/.2). Overlay rgb(30 46 34/.42).
Motion: 150ms ease-out color; 180-200ms popovers (fade + scale .98), switches, sidebar collapse; no bounce; honor reduced motion.
Alignment: use shared label columns for variant rows, fixed-width checkbox (48px) and action (56px) table columns, right-aligned
tabular numbers, reserved hint lines under fields, and 16px leading icons at a 16px inset.

## 5. Brand
### Logo
A little dog's head on a forest tile (#2A3F2E, radius 25%): two floppy ears (lemon-400 ellipses tilted ±18°), lemon-300
face, cream muzzle #FBF3CF, forest eyes and nose. Sizes 88/40/28/20; at 16px use the mono mark (head + ears, currentColor,
no tile). Lockup: tile 36 + "VetData" 22px/700 -0.02em, gap 10. On forest: mono mark in lemon-300 + cream wordmark.
Source: components/brand/logo.tsx (VetDataLogo, VetDataMark).
### Icon set (VetData Icons v1)
24×24 grid, 2px keyline, stroke 1.75, round caps and joins, no fills, color = currentColor. Sizes: 16 UI, 14 chips/dense rows/
meta, 18 sidebar, 20-24 empty states. Components: <PawIcon/>, <DogIcon/>, … (PascalCase name + "Icon"), prop size.
Patients & species: paw (patient/pets), dog, cat, rabbit (exotics), bird (avian), bone (orthopedics), bowl (nutrition),
  microchip, owner (client), kennel (boarding/hospitalization)
Clinical: stethoscope (exam), heart-pulse (heart rate), thermometer (temperature), scale (weight), syringe (injection/vaccine),
  vial (vaccine/drug vial), pill (medication), rx (prescription), scalpel (surgery), bandage (wound care), tooth (dental),
  ear (otic), eye (ophthalmic), cross (medical/emergency), flag (patient alert)
Lab & diagnostics: test-tube (lab test), droplet (blood work), microscope (cytology), xray (radiograph/imaging)
Practice: clinic, appointment (calendar with paw), record (medical record), invoice, calendar, clock, users (team), chart (reports)
Assistant: sparkle (AI assistant, used for nothing else), mic (dictation), send (arrow up), paperclip, at (mention patient),
  stop, thumb-up, thumb-down
Interface: home (Today), search, bell, cog, panel (toggle sidebar), plus, minus, check, x, chev-d, chev-r, chev-l, chev-ud
  (switcher), arrow-l (back), more, filter, download, upload, copy, link, edit, trash, mail, phone, info, alert, ok, help, file, logout
Color use: forest-900 beside labels, stone-600 beside muted text, semantic colors in alerts/flags, lemon-300 only on forest.
### Illustration
Flat hand-drawn objects (kennel, dog, pill bottle, clipboard) with #3A3F44 outlines, greys #9AA0A6/#C9CDD1, ochre #E3A63A,
on a pale #EEEADB organic blob, anchored to and cropped by the bottom-right corner; never behind text.

## 6. Patterns
### Sign in (source)
Window background forest. Cream panel inset 8px top/left/bottom, radius 12, ~65% width; right 35% testimonial on forest
with outlined decor shapes (1.5px forest-700). Form column 340px, centered, text centered: logo 40 → h1 "Welcome back to
VetData" → lead "Sign in to your clinic workspace" → E-mail, Password (placeholder as label) → full-width primary
"Continue" (disabled = cream-300/stone-400) → "OR" divider → white outline "Continue with Google" (500) → 12px legal caption
with forest links. Help pill fixed bottom-left. Testimonial: 56px avatar on mint, quote 19px cream, name 14/600, role 13 forest-300.
### Verify email (source)
Same frame. 6 OTP cells 38×42 gap 8 radius 8 (filled cream-200, active cream-300 + forest-500 border + caret, future cream-100),
full-width lemon Continue, "Didn't receive the code?" + clock "44 seconds" countdown, then a resend link.
### Onboarding (source)
Window with traffic lights; title-bar stepper "Account · Clinic · Team · Assistant" (icons owner, clinic, users, sparkle; done
forest 600, current forest 600 + 2px underline, upcoming stone-400, "·" separators). Inset content area (8px margin, 1px
cream-300, radius 10). "← Back" top-left. Content column 420px, left-aligned, ~25% from top: h1 (may break in 2 lines,
"What kind of practice / do you run?") → hairline → helper 13px → wrapping chips with species icons (Small animal, Exotics,
Avian, Equine, Emergency, Specialty referral, Shelter, Mobile vet, Something else) → hairline → small Continue pill.
Illustration bottom-right on a #EEEADB blob. Help pill bottom-left. "Clinic is ready" step: logo 32 → lemon badge
"14-DAY FREE TRIAL" → h1 → 13.5px body → hairline → feature rows (14px icon + 13px/600) → hairline → small lemon "Go to today".
Team invite step: h1 two lines, "How it works" list, invite link input with inline secondary Copy, small lemon "Finish".
### App shell (imagined)
Forest window frame. Sidebar on the frame (see Sidebar). Work area cream-100 inset 8px (top/right/bottom), radius 12,
padding 20-24. Page header: h1 22-24 + 13.5px muted subtitle left; actions right (outline + one lemon). Today page:
inline assistant composer under the header, stat cards (3-4 col), then schedule, tables and charts in flat cards.

## 7. Navigation
### Sidebar (imagined)
Expanded 248px, bg forest-900, padding 12, full height:
- Clinic switcher: logo 32 + clinic name 13.5/600 cream + meta 11.5 forest-300 ("3 vets · Pro") + chevrons-up-down; radius 12; hover forest-800.
- Search trigger: 34px pill forest-800, search icon, "Search patients", ⌘K kbd (forest-700 fill, forest-600 border).
- Items (36px pill, pl 12, gap 10, icon 18, 13.5px forest-300): Today (home), Schedule (calendar) count 18, Patients (paw),
  Records (record), Lab results (test-tube) NEW count 3, Pharmacy (pill). Group label "PRACTICE" (10.5px caps +0.1em forest-500,
  pt 14): Billing (invoice), Reports (chart, expandable: Revenue, Vaccinations due, Inventory), Team (users), Settings (cog).
- Hover/active: forest-800 fill + cream text; active weight 600. Counts: 18px pill forest-700, 11px/600 tabular; new: lemon-300 + forest text.
- Sub-items: indent 40px, 30px pills, 13px; active forest-800 + 600.
- Bottom: "Ask VetData" 40px pill forest-800, lemon-300 sparkle, ⌘J; user row under a forest-800 rule: avatar 32 + "Dr. Sam Okafor"
  13/600 + email 11.5 + more button.
Collapsed rail 64px: logo 32, 40×40 radius-12 icon items (18px icons), 24px separators, unread = 7px lemon pip with 2px forest
ring, tooltips on the right ("Schedule · 18"). ⌘B toggles; remember per user; ≤1024px rail by default; ≤720px off-canvas sheet.
### Tabs, stepper, breadcrumbs
Underline tabs: gap 24, 14px stone-600, active forest 600 + 2px underline on a 1px cream-300 baseline, 14px icons, optional
warning count badge (patient page: Overview, Records, Vaccines, Lab, Imaging, Billing). Segmented: cream-200 track, white
active segment with shadow-sm (Day/Week/Month; Dogs/Cats/Exotics with species icons). Breadcrumb: 13px muted, chevron-right 14,
current forest 600. Back link: arrow-left + 12.5px muted.
### Command palette (imagined)
⌘K. 520px, radius 18, shadow-lg. Search row (15px, search icon, Esc kbd) → groups: Patients (species avatar 24 + name + breed ·
owner, "Open ↵"), Actions (Record weight ⌘W, New appointment ⌘N), Assistant ("Ask VetData about …" with sparkle) → footer
(↑↓ Move · ↵ Open · ⌘J Ask assistant).

## 8. Assistant
### Composer (imagined)
cream-50, 1px cream-400, radius 20, padding 10/10/8; focus-within forest-600 border + 3px ring; floating over content adds shadow-md.
Top: context chips (26px, radius 8, cream-200, cream-300 border): patient (species icon + "Bella · patient" + x), files
(file icon + name + size + x). Middle: auto-growing textarea 15px/1.5, 2-8 rows, placeholder "Ask about Bella, a dose, or type
/ for commands". Toolbar: 32px ghost icon buttons (paperclip attach, at mention), mode pill 28px outline ("Clinical ▾" with
stethoscope; modes Clinical / Client message / Practice data), spacer, hint 11.5px stone-500 "↵ send · ⇧↵ new line", mic
button, send = 32px forest circle with arrow-up (stroke 2.25); disabled cream-300/stone-400 while empty; while generating
the send becomes a stop button (filled 12px square). Send is forest, not lemon, so the page keeps one lemon action.
Slash menu (popover above the textarea): /soap Draft SOAP notes · /dose Check a dose by weight · /summarize Summarize history ·
/discharge Discharge instructions · /vaccines Vaccines due; command in mono 12.5px, description 13px muted.
Inline variant (Today and patient pages): 44px pill, sparkle (forest) + placeholder "Ask about Bella…" + mic + send.
### Conversation (imagined)
Panel docks right (400-440px) or full page: cream-100, 1px cream-300, radius 18. Header: AI avatar + "VetData Assistant" + context
badge (Bella) + New chat (edit) + Close. User messages: right-aligned bubble cream-250, radius 16 with 6px bottom-right, 14.5px
foreground, max 82%. Assistant messages: no bubble; 28px forest avatar with lemon sparkle; text 14.5/1.6 stone-700 with key
values bold forest; a "step" line (check-circle success + "Read weight (Nov 4) and CBC results"); structured result card
(cream-50, radius 12, header row with a "Checked" success badge, label/value rows with values right-aligned tabular, total
bold) e.g. Meloxicam 1.5 mg/mL: Weight 28.4 kg, Dose 0.1 mg/kg, Total 2.84 mg, Volume 1.9 mL once daily; citations ([1] Plumb's ·
Meloxicam, [2] Bella · CBC Nov 4); actions row: copy, thumb-up, thumb-down, secondary xs "Add to prescription". Thinking state:
"Reading Bella's last 3 visits" + three pulsing 5px forest-500 dots. Empty state: "Good morning, Dr. Okafor", one line, 2×2
suggestion buttons (icon + prompt + category). Disclaimer under the composer: "VetData Assistant can make mistakes. Verify
doses before administering." (11.5px stone-500, centered). Clinical answers always show inputs, units and sources.
### Mascot: Pip (new)
Pip is the face of the assistant: component <AssistantPet shape="dog"|"cat" color="forest"|"lemon" background followPointer />
(components/brand/assistant-pet.tsx, a "use client" component adapted from the Frost Cloud pattern). viewBox 240.
- Construction: simple shapes merged into one soft silhouette by a goo filter (blur 3.5 + alpha matrix 28/-12), filled with a
  frosted cream gradient (#FCFAF4 → #EEE9D8); the backdrop tint shines through softly at the bottom; white shine top-left;
  a soft halo and a fine edge around the silhouette.
- Dog: round head (r50) + two jowls (r27) + muzzle fill, floppy ear ellipses tilted ±16° with a lemon tint inside, pill eyes
  16×27, oval nose, small "w" mouth. Ears flap outward up to 16°.
- Cat: head ellipse 112×96 + two cheeks (r28), triangle ears with lemon inner ears, pill eyes 16×25, triangle nose, "y" mouth,
  four whiskers outside the head. Ears flick outward up to 12°.
- Features in forest #2A3F2E → #3A5640 with a 2.6px cream glint in each eye.
- Backdrops: forest (#2A3F2E → #46634B, lemon glow, cream halo) or lemon (#E5C658 → #F8E9A8, forest outline). background=false
  sits on the page with a faint forest halo and outline.
- Motion (springs, rAF only while on screen): float ±5px, breathe ±1.2%, glance around every 1.4–3.6 s, blink every 2.4–5.4 s
  (25% double blink), ear twitch every 3–7 s, eyes follow the pointer, click = squish + ears perk + wink. Reduced motion: still
  pose; a click plays one bounce.
- Use: assistant empty state (96–160px, no backdrop), onboarding "Assistant" step and first run (200–320px with backdrop), long
  assistant tasks, empty states that invite asking the assistant. Never as the 28px message avatar (keep the sparkle avatar),
  never in clinical data views, alerts, dialogs or invoices, never next to bad news, never more than one per screen.
  Dog by default; a clinic can switch to the cat in Settings → Assistant.

## 9. Forms
Buttons: pills, 600. default = lemon (#F3DC7E, 1px #E5C658, lemon lip, hover #F8E9A8); brand = forest (hover #355039);
secondary = cream-250; outline = white + cream-400 + shadow-xs, 500; ghost; link; destructive #B4493B. Disabled for all:
cream-300 fill, stone-400 text. Sizes xs 26, sm 30, default 36, lg 42, block 40 full width, icon 36/30/26.
Inputs: 40px pill, transparent, cream-400 border, px 20, 15px; hover/focus cream-200 fill; focus forest-600 + ring; error
destructive border + ring + 12px message with alert icon; disabled cream-200 opacity .55. Label 13/600 above, hint 12 below
(reserve the line). Toolbar size 34px. Units as a muted suffix. Number stepper pill with minus/plus. Tag input with context
chips. Inline action button inside the input at 5px from the right. Textarea radius 14.
Select/menus: trigger = input + chevron; content cream-50, cream-300 border, radius 14, shadow-md, padding 6; items radius 8,
min-height 34, highlight cream-200, selected forest check, two-line items with 12px description, destructive items red.
Notifications popover: rows with 32px icon avatar, title 13.5/600, meta 12.5 muted, ochre unread dot.
Checkbox 16 radius 4 (checked forest with LEMON check); radio 16 (forest dot); switch 36×20 (on forest); slider 4px track,
forest range, 18px white thumb with 2px forest border (body condition score 1-9 with scale labels).
Chips: 28px, radius 6, cream-50, cream-400 border, 12.5/500, 13px icon; selected lemon-100 + forest border.
OTP: as in Verify email; error = destructive borders.
Calendar: 36px round days, selected forest, today ring forest-500, ochre dot for days with appointments, outside days stone-400,
Sunday-first week. Time slots: 34px pills in a 3-col grid; selected forest; booked dashed + struck through.
Dropzone: 1.5px dashed cream-500, radius 14, cream-50, 44px icon circle, "Drop lab results or X-rays", "PDF, DICOM, JPG or PNG up
to 50 MB", secondary "Browse files"; drag-over lemon-100 + lemon-600. File rows: 36px icon tile, name 13.5/600, meta 12, 4px progress.

## 10. Clinical data
Patient header: 72px pet photo (or species icon on mint) with a 26px species badge; name 24/600 + status badge; meta row
(breed · sex/neuter, age, weight, owner, microchip in mono) with 14px icons; flags row BEFORE anything else (allergy =
destructive flag, behavior = warning flag, condition/medication = info flag; 26px, radius 8, icon + 12.5/600); actions: outline
call icon, outline "Message owner", lemon "Start visit"; underline tabs below a hairline.
Vitals: stat cards with value + unit and a range bar (6px cream-300 track, mint-300 normal band, 12px forest marker with a
2px card ring; amber marker when outside; scale labels 11px tabular). Temperature dog 38.0-39.2 °C, heart 60-120 bpm, resp 10-30 rpm.
Stat cards: 13px label + 14px icon right, 28px/600 tabular value + unit, 12.5px context with success/destructive delta.
Medical timeline: newest first; 72px right-aligned date column (day bold), 32px icon nodes (cream-200; open visit forest with
lemon icon) joined by a 1px cream-400 line; body title 14.5/600, notes 13.5, attachments as citation chips, vet name muted.
Day schedule: 56px right-aligned time column; appointment rows (radius 12, cream-50, 1px cream-300): species avatar, "Patient ·
reason" 14/600, "breed · owner · vet · room" 12.5 muted, status badge (Done secondary, In room success, Waiting warning, Booked
outline); current appointment lemon-100 + lemon-400; "now" line = 2px forest rule with dot and time label; surgery blocks hatched + dashed.
Patients table: flat card; toolbar (34px search pill, filter chips, outline Export, lemon New patient); header cream-100, 12px/600
sentence case; columns: checkbox (48px) · Patient (pet avatar + name + breed) · Owner (name + phone) · Age (right) · Weight
(right, kg) · Last visit · Next due (overdue in destructive 600) · Status badge · actions (56px, ghost more). Rows hover
cream-100, selected lemon-100. Missing values "—". Footer with selection count and pill pagination. Bulk selection replaces
the lemon action with "Send reminder · Export".
Charts: flat cards, cream-300 gridlines, 11px stone-500 labels with units, bars forest with 4px top radius and the current bar
lemon + lemon-600 edge with a value label, lines 2px forest with 3px points and a 4.5px end point, reference range = mint-100
band behind the line, donut 18px ring with total in the center and a legend list with tabular percentages, forest tooltip bubble.

## 11. Feedback
Badges 22px pills, 12/600; lemon trial badge 20px uppercase with forest outline. Visit status: Checked in (success), In
treatment (info), Waiting/Follow-up (warning), Overdue (destructive), Discharged (secondary). Avatars: pets = species icon on
mint-300 / lemon-200 / mint-100 / cream-300; people = initials; groups overlap -8px with a 2px ring.
Alerts: radius 12, tinted fill + border, 16px icon spanning two lines. lemon = assistant drafts and trial; info; warning (vital out
of range: "132 bpm is above 60–120 bpm for a resting adult dog. Recheck after 10 minutes."); destructive (drug allergy conflict:
"Amoxicillin-clavulanate is a penicillin. Choose another antibiotic or confirm the override.").
Toasts: cream-50, radius 14, shadow-md, icon + title + description ("Record signed"); undo toast on forest with forest-800 Undo.
Tooltip: forest bubble 12px cream text radius 7. Dialogs: overlay rgb(30 46 34/.42), cream-50 panel radius 18, padding 24,
shadow-lg, title 19/600, description muted, footer right (ghost/secondary cancel + one primary or destructive). Destructive
copy names the exact consequence ("The 12:00 OR booking is released and Elliot Brooks gets a cancellation email.").
Progress 8px forest (lemon-400 for trials). Skeleton cream-300 with shimmer. Accordion hairline rows, 14.5/600 trigger.
Empty state: 48px cream-200 icon circle + title + one sentence on how to start + one lemon button ("Connect a lab").

## 12. Content rules (clinical)
- Always show units (kg, °C, bpm, rpm, mg/kg, mL). Use the clinic's unit setting; never mix.
- Dates "Nov 4" in lists, "Nov 4, 2026" in records; times 24-hour by default (14:30), with a setting.
- Patient alerts first, in words plus an icon, never color alone.
- Missing values are "—", never 0.
- Address vets as "Dr. Lastname". Owners by full name. Pets by name.
- Assistant output that affects care (doses, drug choices) must show inputs, sources and a verification note.

## 13. Rules for the implementing model
1. Serif as font-sans globally; no sans-serif. Mono only for IDs, microchips, code, slash commands.
2. Page cream-100; cards/popovers/composer cream-50; no white surfaces.
3. Exactly one lemon button per view; the assistant send button is forest.
4. Pills for controls; chips 6px; cards 14px; dialogs 18px; composer 20px.
5. No shadows at rest; md for floating layers, lg for dialogs.
6. Hover on inputs/chips changes the fill to cream-200; focus adds forest-600 border + soft ring.
7. Disabled = flat cream-300 + stone-400, not opacity (except disabled inputs).
8. Use the VetData icon components only, 1.75 stroke; sparkle means the assistant and nothing else.
9. Sidebar on forest with pill items; collapsed rail 64px with tooltips.
10. Align with shared label columns, fixed table utility columns, right-aligned tabular numbers with units.
11. Pip (AssistantPet) appears at most once per screen, only in assistant-related empty, onboarding or waiting states.
