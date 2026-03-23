const primaryButtonClass =
  "!inline-flex !items-center !justify-center !rounded-full !bg-primary !px-4 !py-2 !text-sm !font-medium !text-primary-foreground hover:!bg-primary/90 !shadow-none";

const secondaryButtonClass =
  "!inline-flex !items-center !justify-center !rounded-full !border !border-border !bg-background !px-4 !py-2 !text-sm !font-medium !text-foreground hover:!bg-muted !shadow-none";

export const clerkAppearance = {
  elements: {
    rootBox: "!w-full",
    cardBox: "!w-full !shadow-none !border-none !m-0 !bg-transparent",
    card: "!w-full !shadow-none !bg-transparent !border-0 !p-0 !m-0",
    navbar: "!bg-transparent !border-r !border-border/70",
    navbarMobileMenuButton:
      "!rounded-full !border !border-border !bg-background !text-foreground",
    pageScrollBox: "!p-0",
    profileSectionPrimaryButton: primaryButtonClass,
    profileSectionSecondaryButton: secondaryButtonClass,
    socialButtonsBlockButton:
      "!w-full !rounded-full !border !border-border !bg-background !text-foreground hover:!bg-muted !shadow-none",
    formButtonPrimary:
      "!w-full !rounded-full !bg-primary !text-primary-foreground hover:!bg-primary/90 !shadow-none",
    formFieldInput:
      "!w-full !h-12 !rounded-2xl !border !border-border !bg-background !text-foreground !shadow-none focus:!ring-2 focus:!ring-primary/20",
    formFieldLabel: "!text-sm !font-medium !text-foreground",
    headerTitle: "hidden",
    headerSubtitle: "hidden",
    dividerRow: "",
    dividerText: "!bg-transparent !text-muted-foreground",
    dividerLine: "!bg-border",
    footerActionText: "!text-muted-foreground",
    footerActionLink: "!text-primary hover:!text-primary/80 font-medium",
    footer: "!bg-transparent !border-0",
    identityPreviewText: "!text-foreground",
    formResendCodeLink: "!text-primary hover:!text-primary/80",
    otpCodeFieldInput:
      "!h-12 !w-10 !rounded-2xl !border !border-border !bg-background !text-foreground !shadow-none",
    badge: "!rounded-full !border !border-border !bg-muted/60 !text-foreground",
    modalBackdrop: "!bg-black/45 !backdrop-blur-sm",
    modalContent:
      "!rounded-3xl !border !border-border !bg-background !shadow-2xl",
  },
} as const;

export const clerkProfileAppearance = {
  ...clerkAppearance,
  elements: {
    ...clerkAppearance.elements,
    scrollBox: "!w-full !p-0",
    page: "!gap-6",
    pageScrollBox: "!p-0",
    navbar:
      "!rounded-[28px] !border !border-border/70 !bg-muted/20 !p-3 !shadow-none xl:!sticky xl:!top-6",
    navbarButtons: "!gap-1.5",
    navbarButton:
      "!min-h-11 !rounded-2xl !px-3 !py-2.5 !transition-colors hover:!bg-background/80 data-[active=true]:!bg-background data-[active=true]:!shadow-sm",
    navbarButtonIcon: "!text-muted-foreground data-[active=true]:!text-primary",
    navbarButtonText:
      "!text-sm !font-medium !text-foreground data-[active=true]:!text-foreground",
    profilePage:
      "!rounded-[28px] !border !border-border/70 !bg-background/95 !shadow-none",
    profileSection:
      "!mx-4 !mb-4 !overflow-hidden !rounded-[24px] !border !border-border/60 !bg-card/85 !shadow-none sm:!mx-6",
    profileSectionHeader: "!px-5 !pt-5 !pb-3 sm:!px-6",
    profileSectionTitle: "!gap-2",
    profileSectionTitleText: "!text-base !font-semibold !text-foreground",
    profileSectionSubtitleText: "!text-sm !leading-6 !text-muted-foreground",
    profileSectionContent: "!px-5 !pb-5 !pt-0 sm:!px-6 sm:!pb-6",
    profileSectionItemList: "!gap-4",
    profileSectionItem:
      "!rounded-2xl !border !border-border/60 !bg-background/90 !px-4 !py-3",
    profileSectionButtonGroup: "!mt-4 !flex !flex-wrap !gap-3",
    profileSectionPrimaryButton: `${primaryButtonClass} !h-10 !w-auto !px-4`,
    formButtonPrimary: `${primaryButtonClass} !h-10 !w-auto !px-4`,
    formButtonReset: `${secondaryButtonClass} !h-10 !w-auto !px-4`,
    menuButton:
      "!rounded-full !border !border-border/60 !bg-background !text-foreground hover:!bg-muted",
    badge:
      "!rounded-full !border !border-border !bg-muted/70 !px-2.5 !py-1 !text-xs !font-medium !text-foreground",
  },
} as const;
