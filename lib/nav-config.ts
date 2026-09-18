import {
  LayoutDashboard,
  Users,
  Handshake,
  CreditCard,
  BadgeCheck,
  BarChart2,
  Salad,
  Dumbbell,
  MessageSquare,
  Store,
  Settings,
  Star,
  type LucideIcon,
  CassetteTape,
  HelpCircle,
  Target,
  Scale,
  PhoneCall,
  Ban,
  Coins,
} from "lucide-react";

export interface NavItem {
  key: string;
  labelKey: keyof typeof import("@/lib/i18n/locales/az").default.nav;
  icon: LucideIcon;
  href: string;
  iconPath?: string;
  children?: {
    key: string;
    labelKey: keyof typeof import("@/lib/i18n/locales/az").default.nav;
    href: string;
  }[];
}

const ICONS = "/admin-panel-icons";

export const NAV_ITEMS: NavItem[] = [
  { key: "dashboard", labelKey: "dashboard", icon: LayoutDashboard, href: "/", iconPath: `${ICONS}/status-up.svg` },

  {
    key: "subscriptions",
    labelKey: "subscriptions",
    icon: BadgeCheck,
    href: "/subscriptions",
    iconPath: `${ICONS}/ticket-star.svg`
  },
  {
    key: "categories",
    labelKey: "categories",
    icon: CassetteTape,
    href: "/categories",
    iconPath: `${ICONS}/category.svg`
  },
  {
    key: "goals",
    labelKey: "goals",
    icon: Target,
    href: "/goals",
  },
  { key: "gyms", labelKey: "gyms", icon: Handshake, href: "/gyms", iconPath: "/Sidebar/Sidebar/zallar.svg" },
  { key: "musteriler", labelKey: "customers", icon: Users, href: "/customers", iconPath: `${ICONS}/UsersFour.svg` },
  { key: "bmi", labelKey: "bmi", icon: Scale, href: "/bmi", iconPath: `${ICONS}/scale.svg` },
  { key: "fitnest-staff", labelKey: "fitnestStaff", icon: Users, href: "/fitnest-staff", iconPath: `${ICONS}/UsersFour.svg` },
  { key: "partners", labelKey: "partners", icon: Users, href: "/partners", iconPath: `${ICONS}/UsersFour.svg`, children: [
    { key: "partners", labelKey: "partners", href: "/partners" },
    { key: "partnerApplications", labelKey: "partnerApplications", href: "/partners/applications" },
  ] },
  { key: "admins", labelKey: "admins", icon: Users, href: "/admins", iconPath: `${ICONS}/UsersFour.svg` },
  {
    key: "odenisler",
    labelKey: "payments",
    icon: CreditCard,
    href: "/odenisler",
    iconPath: `${ICONS}/money-send.svg`
  },
  {
    key: "campaign",
    labelKey: "campaign",
    icon: Coins,
    href: "/campaign",
  },
  {
    key: "hesabatlar",
    labelKey: "reports",
    icon: BarChart2,
    href: "/hesabatlar",
    iconPath: `${ICONS}/ChartLineUp.svg`,
    children: [
      {
        key: "zallar-uzre-odenis",
        labelKey: "reportsGymPayments",
        href: "/hesabatlar/zallar-uzre-odenis",
      },
      {
        key: "umumi-hesabatlar",
        labelKey: "reportsGeneral",
        href: "/hesabatlar/umumi-hesabatlar",
      }
    ]
  },
  { key: "diet", labelKey: "diet", icon: Salad, href: "/diet", iconPath: `${ICONS}/health.svg` },
  { key: "mesq", labelKey: "training", icon: Dumbbell, href: "/mesq", iconPath: `${ICONS}/Muscle.svg` },
  {
    key: "omnichannel",
    labelKey: "omnichannel",
    icon: MessageSquare,
    href: "/omnichannel",
    iconPath: `${ICONS}/messages-2.svg`
  },
  { key: "stores", labelKey: "stores", icon: Store, href: "/stores", iconPath: `${ICONS}/shop.svg` },
  {
    key: "faq",
    labelKey: "faq",
    icon: HelpCircle,
    href: "/faq"
  },
  {
    key: "tenzimlemeler",
    labelKey: "settings",
    icon: Settings,
    href: "/settings",
    iconPath: `${ICONS}/setting-2.svg`
  },
];
