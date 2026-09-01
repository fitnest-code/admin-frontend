export const COIN_TIERS = ['BRONZE', 'SILVER', 'GOLD', 'PLATINUM'] as const
export type CoinTier = (typeof COIN_TIERS)[number]

export const COIN_PERIODS = [1, 3, 6, 12] as const

const TIER_ALIASES: Record<string, CoinTier> = {
  BRONZE: 'BRONZE',
  SILVER: 'SILVER',
  GOLD: 'GOLD',
  PLATINUM: 'PLATINUM',
  BURUNC: 'BRONZE',
  BRONZA: 'BRONZE',
  GUMUS: 'SILVER',
  SEREBRO: 'SILVER',
  QIZIL: 'GOLD',
  ZOLOTO: 'GOLD',
  PLATIN: 'PLATINUM',
  PLATINA: 'PLATINUM',
}

function foldKey(value: string) {
  return value
    .trim()
    .replaceAll('İ', 'I')
    .replaceAll('ı', 'I')
    .toUpperCase()
    .normalize('NFD')
    .replace(/\p{M}+/gu, '')
}

export function toCanonicalTier(name: string | undefined | null): CoinTier | null {
  if (!name?.trim()) return null
  return TIER_ALIASES[foldKey(name)] ?? null
}

export function isCanonicalPeriod(months: number | undefined | null): boolean {
  return months != null && (COIN_PERIODS as readonly number[]).includes(months)
}

export function previewRowKey(packageId?: number, optionId?: number) {
  return `${packageId ?? ''}-${optionId ?? ''}`
}
