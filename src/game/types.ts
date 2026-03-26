import type { CardDefinition } from '../types/cards'

export type Side = 'player' | 'ai'
export type MatchPhase = 'playing' | 'round_end' | 'match_over'
export type LogTone = 'neutral' | 'positive' | 'negative' | 'system'

export interface CardInstance extends CardDefinition {
  instanceId: string
  currentPower: number
  owner: Side
}

export interface PlayerState {
  deck: CardInstance[]
  hand: CardInstance[]
  board: CardInstance[]
  discard: CardInstance[]
  bonusCard: CardInstance | null
  bonusUsed: boolean
  passed: boolean
  roundWins: number
  score: number
}

export interface LogEntry {
  id: string
  message: string
  tone: LogTone
}

export interface GameState {
  phase: MatchPhase
  roundNumber: number
  activePlayer: Side
  player: PlayerState
  ai: PlayerState
  logs: LogEntry[]
  highlightIds: string[]
  roundBanner?: string
  roundWinner?: Side | 'draw'
  matchResult?: Side | 'draw'
}

export type GameAction =
  | { type: 'play_card'; side: Side; instanceId: string }
  | { type: 'play_bonus_card'; side: Side }
  | { type: 'pass_turn'; side: Side }
  | { type: 'next_round' }
  | { type: 'reset_match'; cards: CardDefinition[] }
  | { type: 'clear_highlights' }
