/* eslint-disable react-refresh/only-export-components -- the name→component map is exported alongside the icons */
// VetData Icons v1 · 24x24 · stroke 1.75 · round caps/joins · currentColor
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

// Patients & species
export const PawIcon = ({ size, ...p }: IconProps) => (
  <svg {...base(size)} aria-hidden="true" data-vd-icon="paw" {...p}><ellipse cx="5.6" cy="10.2" rx="1.8" ry="2.3"/><ellipse cx="9.4" cy="5.8" rx="1.8" ry="2.3"/><ellipse cx="14.6" cy="5.8" rx="1.8" ry="2.3"/><ellipse cx="18.4" cy="10.2" rx="1.8" ry="2.3"/><path d="M12 11.6c-3 0-6 3.3-6 5.8 0 1.7 1.2 2.8 2.8 2.8 1.3 0 2-.7 3.2-.7s1.9.7 3.2.7c1.6 0 2.8-1.1 2.8-2.8 0-2.5-3-5.8-6-5.8z"/></svg>
);
export const DogIcon = ({ size, ...p }: IconProps) => (
  <svg {...base(size)} aria-hidden="true" data-vd-icon="dog" {...p}><path d="M7 9.5C7 6.5 9.2 4 12 4s5 2.5 5 5.5v5a5 5 0 0 1-10 0z"/><path d="M7 7.4 4.6 6.3a1 1 0 0 0-1.4.8L2.8 12a1.6 1.6 0 0 0 2.1 1.6L7 13"/><path d="m17 7.4 2.4-1.1a1 1 0 0 1 1.4.8l.4 4.9a1.6 1.6 0 0 1-2.1 1.6L17 13"/><path d="M10 10.5h.01M14 10.5h.01"/><path d="M10.9 14.2h2.2L12 15.4z"/><path d="M12 15.4v1.2"/></svg>
);
export const CatIcon = ({ size, ...p }: IconProps) => (
  <svg {...base(size)} aria-hidden="true" data-vd-icon="cat" {...p}><path d="M5 4l3.6 3.2c2.2-.9 4.6-.9 6.8 0L19 4v8a7 7 0 0 1-14 0z"/><path d="M9.5 12h.01M14.5 12h.01"/><path d="M11 15h2l-1 1z"/><path d="M2.5 14.2l3 .5M2.5 17l3-.5M21.5 14.2l-3 .5M21.5 17l-3-.5"/></svg>
);
export const RabbitIcon = ({ size, ...p }: IconProps) => (
  <svg {...base(size)} aria-hidden="true" data-vd-icon="rabbit" {...p}><path d="M10.5 10.3V4.5a1.5 1.5 0 0 0-3 0v6.6"/><path d="M13.5 10.3V4.5a1.5 1.5 0 0 1 3 0v6.6"/><circle cx="12" cy="15.5" r="5.5"/><path d="M10 15h.01M14 15h.01"/><path d="M11.2 17.3h1.6"/></svg>
);
export const BirdIcon = ({ size, ...p }: IconProps) => (
  <svg {...base(size)} aria-hidden="true" data-vd-icon="bird" {...p}><path d="M16 7h.01"/><path d="M3.4 18H12a8 8 0 0 0 8-8V7a4 4 0 0 0-7.3-2.3L2 20"/><path d="m20 7 2 .5-2 .5"/><path d="M10 18v3M14 17.7V21"/><path d="M7 18a6 6 0 0 0 3.8-10.6"/></svg>
);
export const BoneIcon = ({ size, ...p }: IconProps) => (
  <svg {...base(size)} aria-hidden="true" data-vd-icon="bone" {...p}><path d="M17 10c.7-.7 1.7 0 2.5 0a2.5 2.5 0 1 0 0-5 .5.5 0 0 1-.5-.5 2.5 2.5 0 1 0-5 0c0 .8.7 1.8 0 2.5l-7 7c-.7.7-1.7 0-2.5 0a2.5 2.5 0 0 0 0 5c.3 0 .5.2.5.5a2.5 2.5 0 1 0 5 0c0-.8-.7-1.8 0-2.5z"/></svg>
);
export const BowlIcon = ({ size, ...p }: IconProps) => (
  <svg {...base(size)} aria-hidden="true" data-vd-icon="bowl" {...p}><path d="M3 12h18l-1.4 5.4A3.4 3.4 0 0 1 16.3 20H7.7a3.4 3.4 0 0 1-3.3-2.6z"/><path d="M8.5 9h.01M12 8h.01M15.5 9h.01M10.2 5.5h.01M13.8 5.5h.01"/></svg>
);
export const MicrochipIcon = ({ size, ...p }: IconProps) => (
  <svg {...base(size)} aria-hidden="true" data-vd-icon="microchip" {...p}><rect x="6" y="6" width="12" height="12" rx="2"/><rect x="9.5" y="9.5" width="5" height="5" rx="1"/><path d="M9 2.5V6M15 2.5V6M9 18v3.5M15 18v3.5M2.5 9H6M2.5 15H6M18 9h3.5M18 15h3.5"/></svg>
);
export const OwnerIcon = ({ size, ...p }: IconProps) => (
  <svg {...base(size)} aria-hidden="true" data-vd-icon="owner" {...p}><circle cx="9" cy="7.5" r="3.5"/><path d="M2.5 20v-.5a6.5 6.5 0 0 1 10.6-5"/><path d="M18 15.2c-1.4 0-2.8 1.5-2.8 2.7 0 .8.6 1.3 1.3 1.3.6 0 .9-.3 1.5-.3s.9.3 1.5.3c.7 0 1.3-.5 1.3-1.3 0-1.2-1.4-2.7-2.8-2.7z"/><path d="M15.4 13.8h.01M18 13h.01M20.6 13.8h.01"/></svg>
);
export const KennelIcon = ({ size, ...p }: IconProps) => (
  <svg {...base(size)} aria-hidden="true" data-vd-icon="kennel" {...p}><path d="M3.5 20.5V10L12 3.5l8.5 6.5v10.5"/><path d="M8.5 20.5V16a3.5 3.5 0 0 1 7 0v4.5"/><path d="M2 20.5h20"/></svg>
);

// Clinical
export const StethoscopeIcon = ({ size, ...p }: IconProps) => (
  <svg {...base(size)} aria-hidden="true" data-vd-icon="stethoscope" {...p}><path d="M6 3H5v5a5 5 0 0 0 10 0V3h-1"/><path d="M10 13v2a5 5 0 0 0 10 0v-2"/><circle cx="20" cy="11" r="2"/></svg>
);
export const HeartPulseIcon = ({ size, ...p }: IconProps) => (
  <svg {...base(size)} aria-hidden="true" data-vd-icon="heart-pulse" {...p}><path d="M19 14c1.5-1.5 3-3.2 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.8 0-3 .5-4.5 2-1.5-1.5-2.7-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4 3 5.5l7 7z"/><path d="M3.5 12H8l1.5-3 2.5 6 1.5-3h7"/></svg>
);
export const ThermometerIcon = ({ size, ...p }: IconProps) => (
  <svg {...base(size)} aria-hidden="true" data-vd-icon="thermometer" {...p}><path d="M14 4v10.5a4 4 0 1 1-4 0V4a2 2 0 0 1 4 0z"/><path d="M12 11v5"/><path d="M17 6h2M17 9h2M17 12h2"/></svg>
);
export const ScaleIcon = ({ size, ...p }: IconProps) => (
  <svg {...base(size)} aria-hidden="true" data-vd-icon="scale" {...p}><rect x="3" y="4" width="18" height="16" rx="3"/><path d="M7.5 11.5a4.5 4.5 0 0 1 9 0"/><path d="m12 11.5 1.8-2.4"/><path d="M8 16h8"/></svg>
);
export const SyringeIcon = ({ size, ...p }: IconProps) => (
  <svg {...base(size)} aria-hidden="true" data-vd-icon="syringe" {...p}><path d="m18 2 4 4"/><path d="m17 7 3-3"/><path d="M19 9 8.7 19.3a1 1 0 0 1-1.4 0l-2.6-2.6a1 1 0 0 1 0-1.4L15 5"/><path d="m9 11 4 4"/><path d="m5 19-3 3"/><path d="m14 4 6 6"/></svg>
);
export const VialIcon = ({ size, ...p }: IconProps) => (
  <svg {...base(size)} aria-hidden="true" data-vd-icon="vial" {...p}><path d="M9 2.5h6"/><path d="M10 2.5v4M14 2.5v4"/><path d="M8.5 6.5h7l-.4 12.6a2.5 2.5 0 0 1-2.5 2.4h-1.2a2.5 2.5 0 0 1-2.5-2.4z"/><path d="M8.8 13h6.4"/></svg>
);
export const PillIcon = ({ size, ...p }: IconProps) => (
  <svg {...base(size)} aria-hidden="true" data-vd-icon="pill" {...p}><path d="m10.5 20.5 10-10a4.95 4.95 0 1 0-7-7l-10 10a4.95 4.95 0 1 0 7 7z"/><path d="m8.5 8.5 7 7"/></svg>
);
export const RxIcon = ({ size, ...p }: IconProps) => (
  <svg {...base(size)} aria-hidden="true" data-vd-icon="rx" {...p}><path d="M6 20V4h5a4 4 0 0 1 0 8H6"/><path d="m10 12 9 9"/><path d="m19 14-6 6"/></svg>
);
export const ScalpelIcon = ({ size, ...p }: IconProps) => (
  <svg {...base(size)} aria-hidden="true" data-vd-icon="scalpel" {...p}><path d="m14 10 6.3-6.3a1.4 1.4 0 0 1 2 2L16 12"/><path d="M14 10 3 21h5l8-9z"/></svg>
);
export const BandageIcon = ({ size, ...p }: IconProps) => (
  <svg {...base(size)} aria-hidden="true" data-vd-icon="bandage" {...p}><rect x="2.5" y="8" width="19" height="8" rx="4" transform="rotate(-45 12 12)"/><path d="M10 12h.01M12 10h.01M14 12h.01M12 14h.01"/></svg>
);
export const ToothIcon = ({ size, ...p }: IconProps) => (
  <svg {...base(size)} aria-hidden="true" data-vd-icon="tooth" {...p}><path d="M7 3C4.5 3 3 5 3 7.5c0 2 1 3.5 1.5 5.5.5 2.5.8 8 2.8 8 1.7 0 1.7-6 4.7-6s3 6 4.7 6c2 0 2.3-5.5 2.8-8 .5-2 1.5-3.5 1.5-5.5C21 5 19.5 3 17 3c-2 0-3 1-5 1S9 3 7 3z"/></svg>
);
export const EarIcon = ({ size, ...p }: IconProps) => (
  <svg {...base(size)} aria-hidden="true" data-vd-icon="ear" {...p}><path d="M6 8.5a6.5 6.5 0 1 1 13 0c0 6-6 6-6 10a3.5 3.5 0 1 1-7 0"/><path d="M15 8.5a2.5 2.5 0 0 0-5 0v1a2 2 0 1 1 0 4"/></svg>
);
export const EyeIcon = ({ size, ...p }: IconProps) => (
  <svg {...base(size)} aria-hidden="true" data-vd-icon="eye" {...p}><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/></svg>
);
export const CrossIcon = ({ size, ...p }: IconProps) => (
  <svg {...base(size)} aria-hidden="true" data-vd-icon="cross" {...p}><path d="M9 3h6v6h6v6h-6v6H9v-6H3V9h6z"/></svg>
);
export const FlagIcon = ({ size, ...p }: IconProps) => (
  <svg {...base(size)} aria-hidden="true" data-vd-icon="flag" {...p}><path d="M4 22V4a1 1 0 0 1 .4-.8A6 6 0 0 1 8 2c3 0 5 2 7.3 2a6 6 0 0 0 4-1.2 1 1 0 0 1 1.7.7v9.6a1 1 0 0 1-.4.8A6 6 0 0 1 16.6 15c-2.3 0-4.3-2-7.3-2a6 6 0 0 0-5.3 1.5"/></svg>
);

// Lab & diagnostics
export const TestTubeIcon = ({ size, ...p }: IconProps) => (
  <svg {...base(size)} aria-hidden="true" data-vd-icon="test-tube" {...p}><path d="M14.5 2.5v17a2.5 2.5 0 0 1-5 0v-17"/><path d="M8.5 2.5h7"/><path d="M9.5 14h5"/></svg>
);
export const DropletIcon = ({ size, ...p }: IconProps) => (
  <svg {...base(size)} aria-hidden="true" data-vd-icon="droplet" {...p}><path d="M12 3c-3 4-6 7-6 10.5a6 6 0 0 0 12 0C18 10 15 7 12 3z"/><path d="M9.5 14a2.5 2.5 0 0 0 2.5 2.5"/></svg>
);
export const MicroscopeIcon = ({ size, ...p }: IconProps) => (
  <svg {...base(size)} aria-hidden="true" data-vd-icon="microscope" {...p}><path d="M6 18h8"/><path d="M3 22h18"/><path d="M14 22a7 7 0 1 0 0-14h-1"/><path d="M9 14h2"/><path d="M9 12a2 2 0 0 1-2-2V6h6v4a2 2 0 0 1-2 2z"/><path d="M12 6V3a1 1 0 0 0-1-1H9a1 1 0 0 0-1 1v3"/></svg>
);
export const XrayIcon = ({ size, ...p }: IconProps) => (
  <svg {...base(size)} aria-hidden="true" data-vd-icon="xray" {...p}><rect x="3" y="3" width="18" height="18" rx="3"/><path d="M12 6.5v11"/><path d="M8 9.5c1.5-.7 2.8-.7 4 0 1.2-.7 2.5-.7 4 0"/><path d="M7.5 12.5c1.7-.7 3.2-.7 4.5 0 1.3-.7 2.8-.7 4.5 0"/><path d="M8 15.5c1.5-.7 2.8-.7 4 0 1.2-.7 2.5-.7 4 0"/></svg>
);

// Practice
export const ClinicIcon = ({ size, ...p }: IconProps) => (
  <svg {...base(size)} aria-hidden="true" data-vd-icon="clinic" {...p}><path d="M3.5 20.5V9L12 3.5 20.5 9v11.5"/><path d="M12 9.5v6M9 12.5h6"/><path d="M2 20.5h20"/></svg>
);
export const AppointmentIcon = ({ size, ...p }: IconProps) => (
  <svg {...base(size)} aria-hidden="true" data-vd-icon="appointment" {...p}><rect x="3" y="4" width="18" height="17" rx="3"/><path d="M8 2.5v3M16 2.5v3M3 9.5h18"/><path d="M12 14c-1.4 0-2.8 1.5-2.8 2.6 0 .8.6 1.3 1.3 1.3.6 0 .9-.3 1.5-.3s.9.3 1.5.3c.7 0 1.3-.5 1.3-1.3 0-1.1-1.4-2.6-2.8-2.6z"/><path d="M9.5 12.8h.01M12 12h.01M14.5 12.8h.01"/></svg>
);
export const RecordIcon = ({ size, ...p }: IconProps) => (
  <svg {...base(size)} aria-hidden="true" data-vd-icon="record" {...p}><rect x="5" y="4" width="14" height="18" rx="2"/><path d="M9 4V3a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v1"/><path d="M12 10v6M9 13h6"/></svg>
);
export const InvoiceIcon = ({ size, ...p }: IconProps) => (
  <svg {...base(size)} aria-hidden="true" data-vd-icon="invoice" {...p}><path d="M5 2.5h14v19l-2.5-1.5-2 1.5-2.5-1.5-2.5 1.5-2-1.5L5 21.5z"/><path d="M9 7.5h6M9 11h6M9 14.5h4"/></svg>
);
export const CalendarIcon = ({ size, ...p }: IconProps) => (
  <svg {...base(size)} aria-hidden="true" data-vd-icon="calendar" {...p}><rect x="3" y="4" width="18" height="17" rx="3"/><path d="M8 2.5v3M16 2.5v3M3 9.5h18"/></svg>
);
export const ClockIcon = ({ size, ...p }: IconProps) => (
  <svg {...base(size)} aria-hidden="true" data-vd-icon="clock" {...p}><circle cx="12" cy="12" r="9.5"/><path d="M12 7v5l3.5 2"/></svg>
);
export const UsersIcon = ({ size, ...p }: IconProps) => (
  <svg {...base(size)} aria-hidden="true" data-vd-icon="users" {...p}><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.9M16 3.1a4 4 0 0 1 0 7.8"/></svg>
);
export const ChartIcon = ({ size, ...p }: IconProps) => (
  <svg {...base(size)} aria-hidden="true" data-vd-icon="chart" {...p}><path d="M3 3v18h18"/><path d="M7.5 16v-4M12 16V8M16.5 16v-6"/></svg>
);

// Assistant
export const SparkleIcon = ({ size, ...p }: IconProps) => (
  <svg {...base(size)} aria-hidden="true" data-vd-icon="sparkle" {...p}><path d="M11 3.5l1.8 5.2 5.2 1.8-5.2 1.8L11 17.5l-1.8-5.2L4 10.5l5.2-1.8z"/><path d="M18.5 15l.8 2.2 2.2.8-2.2.8-.8 2.2-.8-2.2-2.2-.8 2.2-.8z"/></svg>
);
export const MicIcon = ({ size, ...p }: IconProps) => (
  <svg {...base(size)} aria-hidden="true" data-vd-icon="mic" {...p}><rect x="9" y="2.5" width="6" height="11.5" rx="3"/><path d="M19 10.5v.5a7 7 0 0 1-14 0v-.5"/><path d="M12 18v3.5"/></svg>
);
export const SendIcon = ({ size, ...p }: IconProps) => (
  <svg {...base(size)} aria-hidden="true" data-vd-icon="send" {...p}><path d="M12 19V5"/><path d="m5.5 11.5 6.5-6.5 6.5 6.5"/></svg>
);
export const PaperclipIcon = ({ size, ...p }: IconProps) => (
  <svg {...base(size)} aria-hidden="true" data-vd-icon="paperclip" {...p}><path d="m21.4 11.1-9.2 9.2a6 6 0 0 1-8.5-8.5l8.6-8.6a4 4 0 0 1 5.7 5.7l-8.6 8.6a2 2 0 0 1-2.8-2.8l8.5-8.5"/></svg>
);
export const AtIcon = ({ size, ...p }: IconProps) => (
  <svg {...base(size)} aria-hidden="true" data-vd-icon="at" {...p}><circle cx="12" cy="12" r="4"/><path d="M16 8v5a3 3 0 0 0 6 0v-1a10 10 0 1 0-3.9 7.9"/></svg>
);
export const StopIcon = ({ size, ...p }: IconProps) => (
  <svg {...base(size)} aria-hidden="true" data-vd-icon="stop" {...p}><rect x="6" y="6" width="12" height="12" rx="2"/></svg>
);
export const ThumbUpIcon = ({ size, ...p }: IconProps) => (
  <svg {...base(size)} aria-hidden="true" data-vd-icon="thumb-up" {...p}><path d="M7 10v11"/><path d="M15 5.9 14 10h5.8a2 2 0 0 1 1.9 2.6l-2.3 7a2 2 0 0 1-1.9 1.4H4a1 1 0 0 1-1-1v-9a1 1 0 0 1 1-1h2.8a2 2 0 0 0 1.8-1.1L12 2a3.1 3.1 0 0 1 3 3.9z"/></svg>
);
export const ThumbDownIcon = ({ size, ...p }: IconProps) => (
  <svg {...base(size)} aria-hidden="true" data-vd-icon="thumb-down" {...p}><g transform="rotate(180 12 12)"><path d="M7 10v11"/><path d="M15 5.9 14 10h5.8a2 2 0 0 1 1.9 2.6l-2.3 7a2 2 0 0 1-1.9 1.4H4a1 1 0 0 1-1-1v-9a1 1 0 0 1 1-1h2.8a2 2 0 0 0 1.8-1.1L12 2a3.1 3.1 0 0 1 3 3.9z"/></g></svg>
);

// Interface
export const HomeIcon = ({ size, ...p }: IconProps) => (
  <svg {...base(size)} aria-hidden="true" data-vd-icon="home" {...p}><path d="M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z"/></svg>
);
export const SearchIcon = ({ size, ...p }: IconProps) => (
  <svg {...base(size)} aria-hidden="true" data-vd-icon="search" {...p}><circle cx="11" cy="11" r="7.5"/><path d="m20.5 20.5-4.2-4.2"/></svg>
);
export const BellIcon = ({ size, ...p }: IconProps) => (
  <svg {...base(size)} aria-hidden="true" data-vd-icon="bell" {...p}><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/></svg>
);
export const CogIcon = ({ size, ...p }: IconProps) => (
  <svg {...base(size)} aria-hidden="true" data-vd-icon="cog" {...p}><circle cx="12" cy="12" r="3"/><path d="M12 2.5v3M12 18.5v3M5.3 5.3l2.1 2.1M16.6 16.6l2.1 2.1M2.5 12h3M18.5 12h3M5.3 18.7l2.1-2.1M16.6 7.4l2.1-2.1"/></svg>
);
export const PanelIcon = ({ size, ...p }: IconProps) => (
  <svg {...base(size)} aria-hidden="true" data-vd-icon="panel" {...p}><rect x="3" y="3" width="18" height="18" rx="3"/><path d="M9 3v18"/></svg>
);
export const PlusIcon = ({ size, ...p }: IconProps) => (
  <svg {...base(size)} aria-hidden="true" data-vd-icon="plus" {...p}><path d="M5 12h14M12 5v14"/></svg>
);
export const MinusIcon = ({ size, ...p }: IconProps) => (
  <svg {...base(size)} aria-hidden="true" data-vd-icon="minus" {...p}><path d="M5 12h14"/></svg>
);
export const CheckIcon = ({ size, ...p }: IconProps) => (
  <svg {...base(size)} aria-hidden="true" data-vd-icon="check" {...p}><path d="M20 6 9 17l-5-5"/></svg>
);
export const XIcon = ({ size, ...p }: IconProps) => (
  <svg {...base(size)} aria-hidden="true" data-vd-icon="x" {...p}><path d="M18 6 6 18M6 6l12 12"/></svg>
);
export const ChevDIcon = ({ size, ...p }: IconProps) => (
  <svg {...base(size)} aria-hidden="true" data-vd-icon="chev-d" {...p}><path d="m6 9 6 6 6-6"/></svg>
);
export const ChevRIcon = ({ size, ...p }: IconProps) => (
  <svg {...base(size)} aria-hidden="true" data-vd-icon="chev-r" {...p}><path d="m9 18 6-6-6-6"/></svg>
);
export const ChevLIcon = ({ size, ...p }: IconProps) => (
  <svg {...base(size)} aria-hidden="true" data-vd-icon="chev-l" {...p}><path d="m15 18-6-6 6-6"/></svg>
);
export const ChevUdIcon = ({ size, ...p }: IconProps) => (
  <svg {...base(size)} aria-hidden="true" data-vd-icon="chev-ud" {...p}><path d="m7 15 5 5 5-5M7 9l5-5 5 5"/></svg>
);
export const ArrowLIcon = ({ size, ...p }: IconProps) => (
  <svg {...base(size)} aria-hidden="true" data-vd-icon="arrow-l" {...p}><path d="m12 19-7-7 7-7M19 12H5"/></svg>
);
export const MoreIcon = ({ size, ...p }: IconProps) => (
  <svg {...base(size)} aria-hidden="true" data-vd-icon="more" {...p}><path d="M5 12h.01M12 12h.01M19 12h.01"/></svg>
);
export const FilterIcon = ({ size, ...p }: IconProps) => (
  <svg {...base(size)} aria-hidden="true" data-vd-icon="filter" {...p}><path d="M3 5h18M6.5 12h11M10 19h4"/></svg>
);
export const DownloadIcon = ({ size, ...p }: IconProps) => (
  <svg {...base(size)} aria-hidden="true" data-vd-icon="download" {...p}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"/></svg>
);
export const UploadIcon = ({ size, ...p }: IconProps) => (
  <svg {...base(size)} aria-hidden="true" data-vd-icon="upload" {...p}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12"/></svg>
);
export const CopyIcon = ({ size, ...p }: IconProps) => (
  <svg {...base(size)} aria-hidden="true" data-vd-icon="copy" {...p}><rect x="8" y="8" width="13" height="13" rx="2"/><path d="M4 16a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2"/></svg>
);
export const LinkIcon = ({ size, ...p }: IconProps) => (
  <svg {...base(size)} aria-hidden="true" data-vd-icon="link" {...p}><path d="M10 13a5 5 0 0 0 7.5.5l3-3a5 5 0 0 0-7-7l-1.7 1.7"/><path d="M14 11a5 5 0 0 0-7.5-.5l-3 3a5 5 0 0 0 7 7l1.7-1.7"/></svg>
);
export const EditIcon = ({ size, ...p }: IconProps) => (
  <svg {...base(size)} aria-hidden="true" data-vd-icon="edit" {...p}><path d="M21.2 6.8a2.8 2.8 0 0 0-4-4L4 16v4h4z"/><path d="m14.5 5.5 4 4"/></svg>
);
export const TrashIcon = ({ size, ...p }: IconProps) => (
  <svg {...base(size)} aria-hidden="true" data-vd-icon="trash" {...p}><path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
);
export const MailIcon = ({ size, ...p }: IconProps) => (
  <svg {...base(size)} aria-hidden="true" data-vd-icon="mail" {...p}><rect x="2.5" y="4.5" width="19" height="15" rx="2.5"/><path d="m21.5 7.5-9.5 6-9.5-6"/></svg>
);
export const PhoneIcon = ({ size, ...p }: IconProps) => (
  <svg {...base(size)} aria-hidden="true" data-vd-icon="phone" {...p}><path d="M21.5 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 1.6 4.2 2 2 0 0 1 3.6 2h3a2 2 0 0 1 2 1.7c.1 1 .4 1.9.7 2.8a2 2 0 0 1-.5 2.1L7.5 9.9a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.8.7a2 2 0 0 1 1.8 2z"/></svg>
);
export const InfoIcon = ({ size, ...p }: IconProps) => (
  <svg {...base(size)} aria-hidden="true" data-vd-icon="info" {...p}><circle cx="12" cy="12" r="9.5"/><path d="M12 16v-4.5M12 8h.01"/></svg>
);
export const AlertIcon = ({ size, ...p }: IconProps) => (
  <svg {...base(size)} aria-hidden="true" data-vd-icon="alert" {...p}><path d="m21.7 18-8-14a2 2 0 0 0-3.5 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.7-3"/><path d="M12 9v4M12 17h.01"/></svg>
);
export const OkIcon = ({ size, ...p }: IconProps) => (
  <svg {...base(size)} aria-hidden="true" data-vd-icon="ok" {...p}><circle cx="12" cy="12" r="9.5"/><path d="m8.5 12 2.5 2.5 4.5-5"/></svg>
);
export const HelpIcon = ({ size, ...p }: IconProps) => (
  <svg {...base(size)} aria-hidden="true" data-vd-icon="help" {...p}><circle cx="12" cy="12" r="9.5"/><path d="M9.1 9a3 3 0 0 1 5.8 1c0 2-3 3-3 3M12 17h.01"/></svg>
);
export const FileIcon = ({ size, ...p }: IconProps) => (
  <svg {...base(size)} aria-hidden="true" data-vd-icon="file" {...p}><path d="M14 2.5H6.5a2 2 0 0 0-2 2v15a2 2 0 0 0 2 2h11a2 2 0 0 0 2-2V8z"/><path d="M14 2.5V8h5.5M15.5 13h-7M15.5 17h-7"/></svg>
);
export const LogoutIcon = ({ size, ...p }: IconProps) => (
  <svg {...base(size)} aria-hidden="true" data-vd-icon="logout" {...p}><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"/></svg>
);

export const vetdataIcons = {
  "paw": PawIcon,
  "dog": DogIcon,
  "cat": CatIcon,
  "rabbit": RabbitIcon,
  "bird": BirdIcon,
  "bone": BoneIcon,
  "bowl": BowlIcon,
  "microchip": MicrochipIcon,
  "owner": OwnerIcon,
  "kennel": KennelIcon,
  "stethoscope": StethoscopeIcon,
  "heart-pulse": HeartPulseIcon,
  "thermometer": ThermometerIcon,
  "scale": ScaleIcon,
  "syringe": SyringeIcon,
  "vial": VialIcon,
  "pill": PillIcon,
  "rx": RxIcon,
  "scalpel": ScalpelIcon,
  "bandage": BandageIcon,
  "tooth": ToothIcon,
  "ear": EarIcon,
  "eye": EyeIcon,
  "cross": CrossIcon,
  "flag": FlagIcon,
  "test-tube": TestTubeIcon,
  "droplet": DropletIcon,
  "microscope": MicroscopeIcon,
  "xray": XrayIcon,
  "clinic": ClinicIcon,
  "appointment": AppointmentIcon,
  "record": RecordIcon,
  "invoice": InvoiceIcon,
  "calendar": CalendarIcon,
  "clock": ClockIcon,
  "users": UsersIcon,
  "chart": ChartIcon,
  "sparkle": SparkleIcon,
  "mic": MicIcon,
  "send": SendIcon,
  "paperclip": PaperclipIcon,
  "at": AtIcon,
  "stop": StopIcon,
  "thumb-up": ThumbUpIcon,
  "thumb-down": ThumbDownIcon,
  "home": HomeIcon,
  "search": SearchIcon,
  "bell": BellIcon,
  "cog": CogIcon,
  "panel": PanelIcon,
  "plus": PlusIcon,
  "minus": MinusIcon,
  "check": CheckIcon,
  "x": XIcon,
  "chev-d": ChevDIcon,
  "chev-r": ChevRIcon,
  "chev-l": ChevLIcon,
  "chev-ud": ChevUdIcon,
  "arrow-l": ArrowLIcon,
  "more": MoreIcon,
  "filter": FilterIcon,
  "download": DownloadIcon,
  "upload": UploadIcon,
  "copy": CopyIcon,
  "link": LinkIcon,
  "edit": EditIcon,
  "trash": TrashIcon,
  "mail": MailIcon,
  "phone": PhoneIcon,
  "info": InfoIcon,
  "alert": AlertIcon,
  "ok": OkIcon,
  "help": HelpIcon,
  "file": FileIcon,
  "logout": LogoutIcon,
} as const;

export type VetDataIconName = keyof typeof vetdataIcons;
