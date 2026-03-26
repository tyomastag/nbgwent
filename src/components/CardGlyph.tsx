import type { AbilityType, CardRarity } from '../types/cards'

interface CardGlyphProps {
  kind: 'role' | 'ability' | 'rarity'
  value: string
  title: string
}

const rolePathByTitle: Record<string, string> = {
  'Product Manager': 'M12 3l5 4v5c0 3.4-2.2 6.4-5 7-2.8-.6-5-3.6-5-7V7l5-4zm0 3.1L9 8.5v3.4c0 2.1 1.2 4.1 3 4.7 1.8-.6 3-2.6 3-4.7V8.5l-3-2.4z',
  Designer: 'M4 17c2.2-4.4 5.8-8.9 10-12l2 2c-3.2 3.8-7.7 7.6-12 10l-1-1zm11.3-11.3l1.4-1.4 2.4 2.4-1.4 1.4-2.4-2.4z',
  'iOS Developer': 'M12 3l1.5 3.6L17 8l-3.5 1.4L12 13l-1.5-3.6L7 8l3.5-1.4L12 3zm-5 11h10v2H7v-2zm2 3h6v2H9v-2z',
  'Android Developer': 'M7 8h10v7a2 2 0 0 1-2 2h-1v2h-2v-2h-2v2H8v-2H7a2 2 0 0 1-2-2V8h2zm1-3l1.3 1.6M16 5l-1.3 1.6M9 10h.01M15 10h.01',
  'Frontend Engineer': 'M4 7l8-4 8 4-8 4-8-4zm2 4l6 3 6-3v6l-6 3-6-3v-6z',
  'Backend Engineer': 'M6 5h9l3 3v8a3 3 0 0 1-3 3H6a3 3 0 0 1-3-3V8l3-3zm1 2L5 9v7a1 1 0 0 0 1 1h9a1 1 0 0 0 1-1V9l-2-2H7z',
  'QA Engineer': 'M12 3l7 3v5c0 4.5-3 8.5-7 10-4-1.5-7-5.5-7-10V6l7-3zm0 3.2L7 8.1v2.8c0 3.1 1.8 5.9 5 7.3 3.2-1.4 5-4.2 5-7.3V8.1l-5-1.9z',
  HR: 'M12 4l7 4v4c0 4.4-3.1 7.6-7 8-3.9-.4-7-3.6-7-8V8l7-4zm-1 5H8v2h3v3h2v-3h3V9h-3V6h-2v3z',
  Recruiter: 'M12 3c4.4 0 8 3.6 8 8a7.9 7.9 0 0 1-2.3 5.7L21 20l-1 1-3.3-3.3A8 8 0 1 1 12 3zm0 2a6 6 0 1 0 0 12 6 6 0 0 0 0-12z',
  'Data Analyst': 'M5 18h14v2H3V4h2v14zm2-2v-5h2v5H7zm4 0V8h2v8h-2zm4 0V6h2v10h-2z',
  'Marketing Lead': 'M5 19V6l11-2v13l-11 2zm2-10v7l7-1.3V7.7L7 9z',
  'Sales Manager': 'M4 17h4l3-7 2 4h7l-4 6H4v-3z',
  'Support Lead': 'M4 10a8 8 0 0 1 16 0c0 4.4-3.6 8-8 8H8l-4 3v-5.2A7.8 7.8 0 0 1 4 10zm4 0h8v2H8v-2z',
  CEO: 'M12 3l2 4 4 .6-3 3 .8 4.4-3.8-2-3.8 2 .8-4.4-3-3 4-.6L12 3zm-5 14h10v2H7v-2z',
  COO: 'M5 18h14v2H5v-2zm2-4h2v4H7v-4zm4-6h2v10h-2V8zm4 3h2v7h-2v-7z',
  'Content Manager': 'M6 4h10l3 3v13H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2zm7 1v3h3',
  'Motion Designer': 'M4 8l8-4 8 4-8 4-8-4zm4 5l4-2 4 2-4 2-4-2zm0 4l4-2 4 2-4 2-4-2z',
  'Brand Manager': 'M7 4h6a4 4 0 0 1 0 8H7V4zm0 8h7a4 4 0 1 1 0 8H7v-8z',
  Researcher: 'M11 4a6 6 0 1 1 0 12 6 6 0 0 1 0-12zm5.7 10.3L20 17.6 18.6 19l-3.3-3.3 1.4-1.4z',
  DevOps: 'M12 4l1.1 2.8 3 .5-2.2 2.1.5 3-2.4-1.3-2.4 1.3.5-3L7.9 7.3l3-.5L12 4zm-7 10h14v2H5v-2zm2 3h10v2H7v-2z',
  'Team Lead': 'M12 4l6 3v4c0 3.5-2.4 6.8-6 7.7C8.4 17.8 6 14.5 6 11V7l6-3zm-5 15h10v2H7v-2z',
  'Operations Manager': 'M4 6h16v3H4V6zm2 5h12v3H6v-3zm-2 5h16v3H4v-3z',
}

const abilityPathByType: Record<AbilityType, string> = {
  none: 'M5 12h14v2H5z',
  boost_self: 'M12 4l4 5h-3v6h-2V9H8l4-5zm-5 12h10v2H7z',
  boost_row_random: 'M12 4l3 4h-2v4h-2V8H9l3-4zm-5 10h2v4H7v-4zm8 0h2v4h-2v-4z',
  damage_enemy_random: 'M14 3L7 13h4l-1 8 7-10h-4l1-8z',
  double_if_last_card: 'M6 7h5v5H6V7zm7 5h5v5h-5v-5zm0-7h5v5h-5V5z',
  morale: 'M12 4l2 4h4l-3 2.5 1.2 4L12 12l-4.2 2.5L9 10.5 6 8h4l2-4z',
  spy_light: 'M12 4c4.4 0 8 3.6 8 8h-3l4 5 4-5h-3c0-5.5-4.5-10-10-10S2 6.5 2 12h2c0-4.4 3.6-8 8-8z',
  comeback: 'M5 16l4-4 3 3 7-7 1 1-8 8-3-3-3 3z',
  finisher: 'M12 3l1.7 5.3H19l-4.3 3.1L16.4 17 12 13.9 7.6 17l1.7-5.6L5 8.3h5.3L12 3z',
  slay_strongest: 'M6 6l12 12M18 6L6 18M12 3l1.6 3.4 3.7.5-2.7 2.7.6 3.8-3.2-1.8-3.2 1.8.6-3.8L6.7 6.9l3.7-.5L12 3z',
}

const rarityPathByValue: Record<CardRarity, string> = {
  common: 'M12 5l6 7-6 7-6-7 6-7z',
  rare: 'M12 4l7 4v8l-7 4-7-4V8l7-4z',
  epic: 'M12 3l5 3v6c0 3.3-2.1 6.2-5 7-2.9-.8-5-3.7-5-7V6l5-3z',
  legendary: 'M12 3l2.3 4.7 5.2.8-3.8 3.7.9 5.1-4.6-2.4-4.6 2.4.9-5.1L4.5 8.5l5.2-.8L12 3z',
}

const pathByRole = (title: string) => rolePathByTitle[title] ?? rolePathByTitle['Operations Manager']

const pathByKind = (kind: CardGlyphProps['kind'], value: string) => {
  if (kind === 'role') {
    return pathByRole(value)
  }

  if (kind === 'ability') {
    return abilityPathByType[value as AbilityType] ?? abilityPathByType.none
  }

  return rarityPathByValue[value as CardRarity] ?? rarityPathByValue.common
}

export function CardGlyph({ kind, value, title }: CardGlyphProps) {
  return (
    <span
      title={title}
      aria-label={title}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
        lineHeight: 0,
      }}
    >
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        aria-hidden="true"
        style={{ display: 'block' }}
      >
        <path
          d={pathByKind(kind, value)}
          stroke="currentColor"
          strokeWidth="1.7"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </span>
  )
}
