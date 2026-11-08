# Component recipes (Tailwind class strings)

```text
// Button
base: "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full font-semibold
       transition-[background-color,border-color,box-shadow,color] duration-150 ease-out outline-none
       focus-visible:ring-[3px] focus-visible:ring-forest-900/12
       disabled:pointer-events-none disabled:bg-cream-300 disabled:text-stone-400 disabled:border-transparent disabled:shadow-none
       [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0"
variant:
  default:     "bg-primary text-primary-foreground border border-lemon-400 shadow-lemon hover:bg-lemon-200"
  brand:       "bg-brand text-brand-foreground hover:bg-forest-800"
  secondary:   "bg-secondary text-secondary-foreground hover:bg-cream-300"
  outline:     "bg-white border border-input text-foreground font-medium shadow-xs hover:bg-cream-50 hover:border-cream-500"
  ghost:       "text-foreground hover:bg-accent"
  link:        "text-foreground rounded-none px-0 h-auto underline-offset-4 hover:underline"
  destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90"
size:
  xs: "h-[26px] px-[11px] text-xs gap-1.5"   sm: "h-[30px] px-[13px] text-[13px] gap-1.5 [&_svg]:size-3.5"
  default: "h-9 px-4 text-sm"   lg: "h-[42px] px-[22px] text-[15px]"   block: "h-10 w-full text-sm"
  icon: "size-9"   icon-sm: "size-[30px]"   icon-xs: "size-[26px]"

// Input
"h-10 w-full rounded-full border border-input bg-transparent px-5 text-[15px] text-foreground
 placeholder:text-stone-500 transition-[background-color,border-color,box-shadow] duration-150
 hover:bg-cream-200 hover:border-forest-500
 focus-visible:bg-cream-200 focus-visible:border-forest-600 focus-visible:ring-[3px] focus-visible:ring-forest-900/10
 aria-invalid:border-destructive aria-invalid:ring-[3px] aria-invalid:ring-destructive/12
 disabled:cursor-not-allowed disabled:opacity-55 disabled:bg-cream-200"
sm (toolbars): "h-[34px] px-3.5 text-[13.5px]"   dense settings: "h-[38px] rounded-[10px] px-3.5 text-sm"
leading icon: wrapper "relative", icon "absolute left-4 top-1/2 -translate-y-1/2 size-4 text-stone-500", input "pl-10"
unit suffix: "absolute right-5 top-1/2 -translate-y-1/2 text-[13px] text-muted-foreground" (always show kg, °C, mg/kg)
inline action: Button size="sm" variant="secondary" "absolute right-[5px] top-1/2 -translate-y-1/2", input "pr-[84px]"
number stepper: "flex items-center h-10 rounded-full border border-input px-1 gap-0.5" + ghost icon buttons size-8 (minus/plus) + centered tabular value with unit
tag input: "flex flex-wrap items-center gap-1.5 min-h-10 rounded-[20px] border border-input py-[5px] pl-1.5 pr-3.5" with context chips
Field: Label "text-[13px] font-semibold"  hint "text-xs text-muted-foreground min-h-[17px]"  error "text-xs text-destructive"  gap "gap-1.5"

// Textarea
"min-h-24 w-full rounded-xl border border-input bg-transparent px-4 py-3 text-sm placeholder:text-stone-500
 focus-visible:bg-cream-200 focus-visible:border-forest-600 focus-visible:ring-[3px] focus-visible:ring-forest-900/10"

// Select / Popover / Dropdown / Command content
Trigger: Input classes + "justify-between pl-[18px] pr-3.5 [&_svg]:text-stone-600 data-[state=open]:bg-cream-200 data-[state=open]:border-forest-600"
Content: "rounded-xl border border-border bg-popover text-popover-foreground shadow-md p-1.5 min-w-[220px]
          data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-[0.98] duration-200"
Item:    "flex items-center gap-2.5 rounded-md px-2.5 py-[7px] min-h-[34px] text-sm outline-none data-[highlighted]:bg-accent
          data-[disabled]:text-stone-400 [&_svg]:size-4 [&_svg]:text-stone-600"
selected: Check size-3.5 ml-auto text-forest-900   destructive item: "text-destructive [&_svg]:text-destructive"
two-line item: title text-sm + small "block text-xs text-muted-foreground"
Label: "px-2.5 pt-2 pb-1 text-[11px] font-semibold uppercase tracking-[0.08em] text-stone-500"
Separator: "-mx-1.5 my-1 h-px bg-border"
Kbd: "font-mono text-[11px] text-stone-600 bg-cream-200 border border-cream-400 border-b-2 rounded-[5px] px-1.5 py-0.5"

// Command palette (CommandDialog)
content: "max-w-[520px] rounded-2xl border border-border bg-card shadow-lg p-0 overflow-hidden"
input row: "flex items-center gap-2.5 px-4 py-3.5 border-b border-border text-[15px] [&_svg]:text-stone-500"
list: "p-1.5"   groups: Patients (species avatar 24 + name + breed/owner), Actions (icon + label + Kbd), Assistant ("Ask VetData about …" with sparkle)
footer: "flex gap-3.5 px-4 py-2.5 border-t border-border text-xs text-muted-foreground" (↑↓ Move · ↵ Open · ⌘J Ask assistant)

// Checkbox / Radio / Switch / Slider
Checkbox: "size-4 rounded-[4px] border border-cream-500 bg-white data-[state=checked]:bg-forest-900 data-[state=checked]:border-forest-900 data-[state=checked]:text-lemon-300"  indicator Check size-3 stroke-[3]
Radio:    "size-4 rounded-full border border-cream-500 bg-white data-[state=checked]:border-forest-900"  indicator "size-2 rounded-full bg-forest-900"
Switch:   root "h-5 w-9 rounded-full bg-cream-400 data-[state=checked]:bg-forest-900"  thumb "size-4 rounded-full bg-white shadow-sm data-[state=checked]:translate-x-[18px] translate-x-0.5 duration-200"
Slider:   track "h-1 rounded-full bg-cream-300"  range "bg-forest-900"  thumb "size-[18px] rounded-full bg-white border-2 border-forest-900 shadow-sm"
Label row: "flex items-start gap-2.5 text-sm" + description "block text-[12.5px] text-muted-foreground mt-0.5"

// Toggle chip (ToggleGroup type="multiple")
"inline-flex h-7 items-center gap-1.5 rounded-sm border border-cream-400 bg-cream-50 px-2.5 text-[12.5px] font-medium hover:bg-cream-200
 [&_svg]:size-[13px] [&_svg]:text-stone-600 data-[state=on]:bg-lemon-100 data-[state=on]:border-forest-900 data-[state=on]:[&_svg]:text-forest-900"
Context chip (composer, tag input): "inline-flex h-[26px] items-center gap-1.5 rounded-md bg-cream-200 border border-cream-300 pl-2 pr-1.5 text-[12.5px] font-medium" meta "text-[11.5px] text-stone-500" remove X size-3.5 text-stone-500

// InputOTP slot
"h-[42px] w-[38px] rounded-md border border-cream-300 bg-cream-200 text-base font-medium tabular-nums data-[active=true]:bg-cream-300 data-[active=true]:border-forest-500"  future slot "bg-cream-100"  group gap-2

// Calendar (react-day-picker)
caption: "flex items-center justify-between mb-2.5 text-[14.5px] font-semibold"  nav: ghost icon buttons size-8
head cell: "text-[11px] font-semibold text-stone-500 pb-1.5"
day: "size-9 rounded-full text-[13px] tabular-nums hover:bg-accent"
selected: "bg-forest-900 text-brand-foreground font-semibold"  today: "ring-1 ring-inset ring-forest-500"  outside: "text-stone-400"
has appointments: after-dot "size-1 rounded-full bg-ochre-500 absolute bottom-1 left-1/2 -translate-x-1/2" (lemon-300 on selected)
Time slot: "h-[34px] rounded-full border border-cream-400 bg-cream-50 text-[13px] tabular-nums" selected "bg-forest-900 text-brand-foreground border-forest-900 font-semibold" booked "border-dashed bg-transparent text-stone-400 line-through"

// Dropzone + file row
drop: "flex flex-col items-center text-center gap-2 rounded-xl border-[1.5px] border-dashed border-cream-500 bg-cream-50 px-5 py-7"
drag-over: "bg-lemon-100 border-lemon-600"   icon: "size-11 rounded-full bg-cream-200 grid place-items-center"
file row: "grid grid-cols-[36px_1fr_auto] gap-3 items-center rounded-xl border border-border bg-card px-3 py-2.5" icon tile "size-9 rounded-md bg-cream-200" progress "h-1 mt-1.5"

// Badge
base: "inline-flex items-center gap-1.5 h-[22px] rounded-full px-[9px] text-xs font-semibold border border-transparent whitespace-nowrap [&_svg]:size-3"
  lemon: "h-5 bg-primary text-primary-foreground border-forest-900 text-[10.5px] uppercase tracking-[0.08em]"
  default: "bg-brand text-brand-foreground"   secondary: "bg-cream-200 border-cream-300"   outline: "border-cream-400"
  success: "bg-success-soft text-success"  warning: "bg-warning-soft text-warning"  destructive: "bg-destructive-soft text-destructive"  info: "bg-info-soft text-info"
  status dot: "size-1.5 rounded-full bg-current"
Patient flag: "inline-flex items-center gap-1.5 h-[26px] rounded-md px-2.5 text-[12.5px] font-semibold [&_svg]:size-[13px]" + soft semantic fill (destructive = allergy, warning = behavior, info = condition/medication)

// Avatar
person: "size-8 rounded-full bg-mint-300 text-forest-900 text-xs font-semibold"
pet: same circle with the species icon (size-4) instead of initials; fills bg-mint-300 | bg-lemon-200 | bg-mint-100 | bg-cream-300
group: "flex -space-x-2 [&>*]:ring-2 [&>*]:ring-card"
Pet photo (patient header): "size-[72px] rounded-full bg-mint-300" + species badge "absolute -right-0.5 -bottom-0.5 size-[26px] rounded-full bg-card border border-border ring-2 ring-card"

// Tabs
underline list: "flex gap-6 border-b border-border bg-transparent p-0 h-auto rounded-none"
underline trigger: "inline-flex items-center gap-[7px] py-2.5 -mb-px border-b-2 border-transparent text-sm text-stone-600 rounded-none
                    data-[state=active]:text-foreground data-[state=active]:font-semibold data-[state=active]:border-forest-900 [&_svg]:size-3.5"
segmented list: "inline-flex p-[3px] gap-0.5 rounded-full bg-cream-200 border border-cream-300 h-auto"
segmented trigger: "rounded-full px-3.5 py-1.5 text-[13px] font-medium text-stone-600 data-[state=active]:bg-white data-[state=active]:text-foreground data-[state=active]:font-semibold data-[state=active]:shadow-sm"
Stepper item: "inline-flex items-center gap-1.5 py-1.5 text-[12.5px] border-b-2 border-transparent" done "font-semibold" current "font-semibold border-forest-900" upcoming "text-stone-400"; "·" separators text-stone-400 gap-2.5
Breadcrumb: "flex items-center gap-2 text-[13px] text-muted-foreground" separator ChevronRight size-3.5, current "font-semibold text-foreground"

// Sidebar (shadcn sidebar)
Sidebar: "w-[--sidebar-width] bg-sidebar text-sidebar-foreground border-none p-3" collapsible="icon" → "w-[--sidebar-width-icon]"
Header switcher: "flex items-center gap-2.5 rounded-xl px-2 py-1.5 hover:bg-sidebar-accent" logo 32, name "text-[13.5px] font-semibold text-sidebar-accent-foreground", meta "text-[11.5px]", ChevronsUpDown size-3.5 text-forest-500
Search trigger: "flex items-center gap-2.5 h-[34px] rounded-full bg-sidebar-accent pl-3 pr-2 text-[13px]" + Kbd "bg-forest-700 border-forest-600 text-forest-200"
SidebarGroupLabel: "px-3 pt-3.5 pb-1.5 text-[10.5px] uppercase tracking-[0.1em] text-forest-500 font-semibold"
SidebarMenuButton: "h-9 rounded-full pl-3 pr-2.5 gap-2.5 text-[13.5px] text-sidebar-foreground [&_svg]:size-[18px]
                    hover:bg-sidebar-accent hover:text-sidebar-accent-foreground
                    data-[active=true]:bg-sidebar-accent data-[active=true]:text-sidebar-accent-foreground data-[active=true]:font-semibold"
SidebarMenuBadge: "ml-auto min-w-5 h-[18px] px-1.5 rounded-full bg-forest-700 text-[11px] font-semibold tabular-nums text-cream-300"  new: "bg-sidebar-primary text-sidebar-primary-foreground"
SidebarMenuSub: "pl-10 py-0.5 border-none"  sub button: "h-[30px] rounded-full px-3 text-[13px]" active "bg-sidebar-accent font-semibold text-sidebar-accent-foreground"
Assistant entry: "mt-auto flex items-center gap-2.5 h-10 rounded-full bg-sidebar-accent px-3 text-[13.5px] font-semibold text-sidebar-accent-foreground [&_svg]:text-lemon-300" + Kbd ⌘J
SidebarFooter user: "flex items-center gap-2.5 mt-2 pt-2.5 px-2 border-t border-sidebar-border" avatar 32, name 13px/600, email 11.5px, more icon button
Collapsed rail item: "size-10 rounded-xl grid place-items-center [&_svg]:size-[18px] hover:bg-sidebar-accent data-[active=true]:bg-sidebar-accent"; unread pip "absolute top-[7px] right-[7px] size-[7px] rounded-full bg-lemon-300 ring-2 ring-sidebar"; Tooltip side="right"
SidebarInset: "m-2 ml-0 rounded-xl bg-background" (cream work area inset into the forest frame)
Keyboard: ⌘B toggles; ≤1024px defaults to rail; ≤720px becomes an off-canvas Sheet

// Assistant composer
wrapper: "flex flex-col gap-1.5 rounded-[20px] border border-cream-400 bg-cream-50 px-2.5 pt-2.5 pb-2 transition-[border-color,box-shadow]
          focus-within:border-forest-600 focus-within:ring-[3px] focus-within:ring-forest-900/10"   floating: + "shadow-md"
context row: "flex flex-wrap gap-1.5 px-0.5" (context chips: patient with species icon, files with size)
textarea: "w-full resize-none border-0 bg-transparent px-1.5 py-1 text-[15px] leading-normal placeholder:text-stone-500 focus:outline-none min-h-12 max-h-[12rem]" (auto-grow 2 to 8 rows)
toolbar: "flex items-center gap-0.5"
  icon buttons: "size-8 rounded-full grid place-items-center text-stone-600 hover:bg-cream-200 hover:text-foreground" (Paperclip, AtSign, Mic)
  mode select: "inline-flex items-center gap-1.5 h-7 rounded-full border border-cream-400 pl-2.5 pr-2 text-[12.5px] font-semibold ml-1"
  hint: "ml-auto mr-2 text-[11.5px] text-stone-500" ("↵ send · ⇧↵ new line")
  send: "size-8 rounded-full bg-forest-900 text-brand-foreground grid place-items-center hover:bg-forest-800 disabled:bg-cream-300 disabled:text-stone-400 [&_svg]:size-4 [&_svg]:stroke-[2.25]"
  stop: same circle with Stop icon filled, size-3
slash menu: Popover content above the textarea, items "font-mono text-[12.5px] min-w-[92px]" + description text-[13px] text-muted-foreground
inline composer: "flex items-center gap-2.5 h-11 rounded-full border border-cream-400 bg-cream-50 pl-4 pr-1.5" sparkle icon forest + placeholder + mic + send

// Assistant conversation
panel: "flex flex-col rounded-[18px] border border-border bg-background overflow-hidden" docked width 400-440px
header: "flex items-center gap-2.5 px-4 py-3 border-b border-border" AI avatar + "VetData Assistant" 14.5/600 + context badge + New chat / Close icon buttons
body: "flex-1 flex flex-col gap-5 px-[18px] py-5 overflow-y-auto"
user message: "self-end max-w-[82%] rounded-2xl rounded-br-md bg-cream-250 px-3.5 py-2.5 text-[14.5px] text-foreground"
assistant message: "grid grid-cols-[28px_1fr] gap-3" avatar "size-7 rounded-full bg-forest-900 text-lemon-300 [&_svg]:size-[15px]" (Sparkle)
  text: "flex flex-col gap-2.5 text-[14.5px] leading-relaxed text-stone-700 [&_b]:text-foreground"
  step line: "inline-flex items-center gap-2 text-[12.5px] text-muted-foreground" with CheckCircle text-success
  result card: "rounded-xl border border-border bg-card overflow-hidden" header row + dl rows (label muted left, value right tabular, total bold)
  citation: "inline-flex items-center gap-1.5 h-6 rounded-sm bg-cream-200 border border-cream-300 px-2 text-xs" index "font-mono text-[11px]"
  actions: Copy, ThumbUp, ThumbDown icon buttons + Button size="xs" variant="secondary" (e.g. "Add to prescription")
  thinking: "Reading Bella's last 3 visits" + three 5px forest-500 dots pulsing 1.2s
empty state: greeting h3 22px + one line + 2x2 suggestion buttons "grid grid-cols-[16px_1fr] gap-2.5 rounded-xl border border-border bg-card p-3 text-[13.5px] text-left hover:bg-cream-200"
disclaimer under composer: "text-center text-[11.5px] text-stone-500" ("VetData Assistant can make mistakes. Verify doses before administering.")

// Card / Stat / Vital
Card: "rounded-xl border border-border bg-card p-5 flex flex-col gap-2.5" (no shadow, never nested)
Stat: label "flex justify-between items-center text-[13px] text-muted-foreground [&_svg]:size-3.5 [&_svg]:text-stone-500"
      value "text-[28px] leading-tight font-semibold tracking-[-0.02em] tabular-nums" + unit "text-sm font-medium text-muted-foreground ml-[3px]"
      context "text-[12.5px] text-muted-foreground" delta "font-semibold text-success | text-destructive"
Vital range: track "relative h-1.5 rounded-full bg-cream-300" normal band "absolute inset-y-0 rounded-full bg-mint-300" marker "absolute top-1/2 size-3 -mt-1.5 -ml-1.5 rounded-full bg-forest-900 ring-2 ring-card" (bg-warning when outside); scale row "flex justify-between text-[11px] text-stone-500 tabular-nums"

// Patient header
"grid grid-cols-[auto_1fr_auto] gap-5 items-center"
name "text-2xl font-semibold" + status badge; meta row "flex flex-wrap gap-x-4 gap-y-1.5 text-[13.5px] text-muted-foreground" items with 14px icons (calendar age, scale weight, owner, microchip in mono)
flags row "flex flex-wrap gap-1.5 mt-2.5"; actions: outline icon (call), outline "Message owner", default "Start visit"; then underline tabs

// Medical timeline
item: "grid grid-cols-[72px_32px_1fr] gap-x-3.5"
date: "pt-1.5 text-right text-[12.5px] text-muted-foreground tabular-nums" + day "block text-[13px] font-semibold text-foreground"
node: "size-8 rounded-full bg-cream-200 border border-cream-300 grid place-items-center" current "bg-forest-900 border-forest-900 text-lemon-300"; connector "w-px flex-1 bg-cream-400 my-1"
body: "pt-[5px] pb-[22px] flex flex-col gap-1.5" title 14.5/600, notes 13.5 stone-700, attachments as citations, vet name 12.5 muted

// Day schedule
row: "grid grid-cols-[56px_1fr] gap-3.5"  time "pt-3 text-right text-[12.5px] text-muted-foreground tabular-nums"
appointment: "grid grid-cols-[32px_1fr_auto] gap-3 items-center rounded-xl border border-border bg-card px-3 py-2.5 my-1"
current: "bg-lemon-100 border-lemon-400"   blocked: "border-dashed bg-[repeating-linear-gradient(-45deg,var(--color-cream-200)_0_6px,var(--color-cream-100)_6px_12px)]"
now line: "grid grid-cols-[56px_1fr] gap-3.5 items-center" label 11px/600 + "h-0.5 rounded bg-forest-900" with 8px dot at the left

// Alert / Toast / Tooltip
Alert: "grid grid-cols-[16px_1fr] gap-x-3 gap-y-[3px] rounded-xl border px-4 py-3.5 text-[13.5px] [&>svg]:row-span-2 [&>svg]:mt-0.5"
  lemon "bg-lemon-100 border-lemon-400" (assistant drafts, trial)  info "bg-info-soft border-[#CFDAE0]"  warning "bg-warning-soft border-[#EED9A7]"  destructive "bg-destructive-soft border-[#EBC7BB]"
Toast (sonner): "rounded-xl border border-border bg-popover shadow-md px-4 py-3.5 text-[13.5px]" title 600, description muted; undo variant "bg-forest-900 text-brand-foreground" with forest-800 xs action
Tooltip: "rounded-[7px] bg-forest-900 px-[9px] py-1.5 text-xs text-brand-foreground shadow-md" arrow fill-forest-900

// Dialog
overlay "bg-[rgb(30_46_34/0.42)]"  content "rounded-2xl border border-border bg-card p-6 shadow-lg max-w-[420px] gap-3.5"
title "text-[19px] font-semibold pr-8"  description "text-sm text-muted-foreground"  footer "flex justify-end gap-2 pt-1.5"
close "absolute right-3.5 top-3.5 size-8 rounded-full text-stone-600 hover:bg-accent"

// Table
wrapper "rounded-xl border border-border bg-card overflow-hidden"; toolbar "flex flex-wrap items-center gap-2 px-4 py-3 border-b border-border"
TableHeader row "bg-cream-100 border-b border-cream-400"; TableHead "px-4 py-2.5 text-xs font-semibold text-muted-foreground whitespace-nowrap" (sentence case)
TableRow "border-b border-border hover:bg-cream-100 data-[state=selected]:bg-lemon-100"; TableCell "px-4 py-3 text-[13.5px] text-stone-700 whitespace-nowrap align-middle"
checkbox column "w-12 pr-0"; actions column "w-14 pl-0 text-right"; numeric "text-right tabular-nums" (with units); empty "—" text-stone-500
primary cell: pet avatar + name 600 + breed 12.5 muted; owner cell: name + phone 12.5 muted
footer "flex justify-between items-center px-4 py-2.5 border-t border-border text-[12.5px] text-muted-foreground"; pagination "min-w-[30px] h-[30px] rounded-full" active "bg-forest-900 text-brand-foreground font-semibold"

// Progress / Skeleton / Accordion / Separator / Empty state
Progress "h-2 rounded-full bg-cream-300" indicator "bg-forest-900" (lemon-400 for trials; h-1 inside file rows)
Skeleton "rounded-md bg-cream-300 animate-pulse"
Accordion item "border-b border-border" trigger "py-3.5 text-[14.5px] font-semibold hover:no-underline [&>svg]:text-stone-600" content "pb-4 text-sm text-stone-700"
Separator "h-px bg-border"
Empty state: card row with "size-12 rounded-full bg-cream-200" icon (20px) + h4 + one sentence + one default Button
Help pill: "fixed left-3 bottom-3 inline-flex items-center gap-1.5 h-7 pl-2 pr-[11px] rounded-full bg-cream-250 text-stone-700 text-[13px] font-semibold"
```
