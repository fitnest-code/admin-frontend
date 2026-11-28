import {
  Users,
  Handshake,
  BadgeCheck,
  QrCode,
} from 'lucide-react'

// --------------- Period & Tier options ---------------

export const PERIOD_OPTIONS = [
  { value: 'daily',   label: 'Günlük'  },
  { value: 'weekly',  label: 'Həftəlik' },
  { value: 'monthly', label: 'Aylıq'   },
  { value: 'yearly',  label: 'İllik'   },
]

export const TIER_OPTIONS = [
  { value: 'bronze',   label: 'Bronze'   },
  { value: 'silver',   label: 'Silver'   },
  { value: 'gold',     label: 'Gold'     },
  { value: 'platinum', label: 'Platinum' },
]

export type TierKey = 'bronze' | 'silver' | 'gold' | 'platinum'

export const STAT_ICONS = [Users, Handshake, BadgeCheck, QrCode]

export const TIER_COLORS: Record<TierKey, string> = {
  bronze: '#CD7F32',
  silver: '#A0ADB8',
  gold: '#F5C842',
  platinum: '#624DE3',
}