export type AbilityType =
  | 'none'
  | 'boost_self'
  | 'boost_row_random'
  | 'damage_enemy_random'
  | 'double_if_last_card'
  | 'morale'
  | 'spy_light'
  | 'comeback'
  | 'finisher'

export type CardRarity = 'common' | 'rare' | 'epic' | 'legendary'

export interface CardDefinition {
  id: string
  name: string
  title: string
  image: string
  power: number
  abilityType: AbilityType
  abilityValue: number
  abilityText: string
  rarity: CardRarity
  tags: string[]
}
