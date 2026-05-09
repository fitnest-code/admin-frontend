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
}

export const NAV_ITEMS: NavItem[] = [
  { key: "dashboard", label: "Dashboard", icon: LayoutDashboard, href: "/" },
 
  {
    key: "subscriptions",
    label: "Abunəlik",
    icon: BadgeCheck,
    href: "/subscriptions",
  },
   {
    key: "categories",
    label: "Kateqoriyalar",
    icon: CassetteTape,
    href: "/categories",
  },
  { key: "gyms", label: "Zallar", icon: Handshake, href: "/gyms" },
  { key: "musteriler", label: "Müştərilər", icon: Users, href: "/customers" },
  {
    key: "odenisler",
    label: "Ödənişlər",
    icon: CreditCard,
    href: "/odenisler",
  },
  {
    key: "hesabatlar",
    label: "Hesabatlar",
    icon: BarChart2,
    href: "/hesabatlar",
  },
  { key: "diet", label: "Diet", icon: Salad, href: "/diet" },
  { key: "mesq", label: "Məşq", icon: Dumbbell, href: "/mesq" },
  {
    key: "omnichannel",
    label: "Omnichannel",
    icon: MessageSquare,
    href: "/omnichannel",
  },
  { key: "stores", label: "Mağazalar", icon: Store, href: "/stores" },
  { key: "reviews", label: "Reytinqlər", icon: Star, href: "/reviews" },
  {
    key: "tenzimlemeler",
    label: "Tənzimləmələr",
    icon: Settings,
    href: "/settings",
  },
];
