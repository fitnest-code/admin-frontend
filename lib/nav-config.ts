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
} from "lucide-react";

export interface NavItem {
  key: string;
  label: string;
  icon: LucideIcon;
  href: string;
  iconPath?: string;
}

export const NAV_ITEMS: NavItem[] = [
  { key: "dashboard", label: "Dashboard", icon: LayoutDashboard, href: "/", iconPath: "/Sidebar/Sidebar/dashboard.svg" },
 
  {
    key: "subscriptions",
    label: "Abunəlik",
    icon: BadgeCheck,
    href: "/subscriptions",
    iconPath: "/Sidebar/Sidebar/abunelik.svg"
  },
   {
    key: "categories",
    label: "Kateqoriyalar",
    icon: CassetteTape,
    href: "/categories",
    iconPath: "/Sidebar/Sidebar/kateqoriyalar.svg"
  },
  { key: "gyms", label: "Zallar", icon: Handshake, href: "/gyms", iconPath: "/Sidebar/Sidebar/zallar.svg" },
  { key: "musteriler", label: "Müştərilər", icon: Users, href: "/customers", iconPath: "/Sidebar/Sidebar/musteriler.svg" },
  {
    key: "odenisler",
    label: "Ödənişlər",
    icon: CreditCard,
    href: "/payments",
    iconPath: "/Sidebar/Sidebar/odenisler.svg"
  },
  {
    key: "hesabatlar",
    label: "Hesabatlar",
    icon: BarChart2,
    href: "/hesabatlar",
    iconPath: "/Sidebar/Sidebar/hesabatlar.svg"
  },
  { key: "diet", label: "Diet", icon: Salad, href: "/diet", iconPath: "/Sidebar/Sidebar/diet.svg" },
  { key: "mesq", label: "Məşq", icon: Dumbbell, href: "/mesq", iconPath: "/Sidebar/Sidebar/mesq.svg" },
  {
    key: "omnichannel",
    label: "Omnichannel",
    icon: MessageSquare,
    href: "/omnichannel",
    iconPath: "/Sidebar/Sidebar/omnichanel.svg"
  },
  { key: "stores", label: "Mağazalar", icon: Store, href: "/stores", iconPath: "/Sidebar/Sidebar/shop.svg" },
  { key: "reviews", label: "Reytinqlər", icon: Star, href: "/reviews", iconPath: "/Sidebar/Sidebar/shop.svg" },
  {
    key: "tenzimlemeler",
    label: "Tənzimləmələr",
    icon: Settings,
    href: "/settings",
    iconPath: "/Sidebar/Sidebar/tenzimlemeler.svg"
  },
];
