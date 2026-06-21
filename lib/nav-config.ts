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

export const NAV_ITEMS: NavItem[] = [
  { key: "dashboard", labelKey: "dashboard", icon: LayoutDashboard, href: "/", iconPath: "/Sidebar/Sidebar/dashboard.svg" },
 
  {
    key: "subscriptions",
    labelKey: "subscriptions",
    icon: BadgeCheck,
    href: "/subscriptions",
    iconPath: "/Sidebar/Sidebar/abunelik.svg"
  },
  {
    key: "categories",
    labelKey: "categories",
    icon: CassetteTape,
    href: "/categories",
    iconPath: "/Sidebar/Sidebar/kateqoriyalar.svg"
  },
  {
    key: "goals",
    labelKey: "goals",
    icon: Target,
    href: "/goals",
  },
  { key: "gyms", labelKey: "gyms", icon: Handshake, href: "/gyms", iconPath: "/Sidebar/Sidebar/zallar.svg" },
  { key: "musteriler", labelKey: "customers", icon: Users, href: "/customers", iconPath: "/Sidebar/Sidebar/musteriler.svg" },
  { key: "fitnest-staff", labelKey: "fitnestStaff", icon: Users, href: "/fitnest-staff", iconPath: "/Sidebar/Sidebar/admins.svg" },
  { key: "partners", labelKey: "partners", icon: Users, href: "/partners", iconPath: "/partners.svg" },
  { key: "admins", labelKey: "admins", icon: Users, href: "/admins", iconPath: "/Sidebar/Sidebar/admins.svg" },
  {
    key: "odenisler",
    labelKey: "payments",
    icon: CreditCard,
    href: "/odenisler",
    iconPath: "/Sidebar/Sidebar/odenisler.svg"
  },
  {
    key: "hesabatlar",
    labelKey: "reports",
    icon: BarChart2,
    href: "/hesabatlar",
    iconPath: "/Sidebar/Sidebar/hesabatlar.svg",
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
  { key: "diet", labelKey: "diet", icon: Salad, href: "/diet", iconPath: "/Sidebar/Sidebar/diet.svg" },
  { key: "mesq", labelKey: "training", icon: Dumbbell, href: "/mesq", iconPath: "/Sidebar/Sidebar/mesq.svg" },
  {
    key: "omnichannel",
    labelKey: "omnichannel",
    icon: MessageSquare,
    href: "/omnichannel",
    iconPath: "/Sidebar/Sidebar/omnichanel.svg"
  },
  { key: "stores", labelKey: "stores", icon: Store, href: "/stores", iconPath: "/Sidebar/Sidebar/shop.svg" },
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
    iconPath: "/Sidebar/Sidebar/tenzimlemeler.svg"
  },
];