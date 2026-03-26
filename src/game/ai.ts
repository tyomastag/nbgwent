import { FINISHER_THRESHOLD } from './constants'
import type { CardInstance, GameState } from './types'

export type AiDecision = { type: 'play'; instanceId: string } | { type: 'bonus' } | { type: 'pass' }

const getStrongestEnemy = (state: GameState) =>
  state.player.board
    .slice()
    .sort((left, right) => right.currentPower - left.currentPower || left.instanceId.localeCompare(right.instanceId))[0]

const estimateProjectedGain = (card: CardInstance, state: GameState) => {
  let gain = card.currentPower

  switch (card.abilityType) {
    case 'boost_self':
      gain += card.abilityValue
      break
    case 'boost_row_random':
      gain += state.ai.board.length > 0 ? card.abilityValue : 0
      break
    case 'damage_enemy_random':
      gain += state.player.board.length > 0 ? Math.min(card.abilityValue, 3) : 0
      break
    case 'double_if_last_card':
      gain = state.ai.hand.length === 1 ? gain * Math.max(2, card.abilityValue) : gain
      break
    case 'morale':
      gain += state.ai.board.length * card.abilityValue
      break
    case 'spy_light':
      gain += state.ai.deck.length > 0 ? 2.2 : 0
      break
    case 'comeback':
      gain += state.ai.score < state.player.score ? card.abilityValue : 0
      break
    case 'finisher':
      gain += state.player.score >= FINISHER_THRESHOLD ? card.abilityValue : 0
      break
    case 'none':
      break
  }

  return gain
}

const estimateRating = (card: CardInstance, state: GameState) => {
  let rating = estimateProjectedGain(card, state)

  if (state.player.passed && state.ai.score <= state.player.score) {
    rating += 3
  }

  if (state.ai.score < state.player.score) {
    rating += 1.5
  }

  if (card.abilityType === 'spy_light' && state.ai.deck.length > 0) {
    rating += 1.25
  }

  return rating + Math.random() * 0.35
}

export const chooseAiAction = (state: GameState): AiDecision => {
  const hasBonusCard = Boolean(state.ai.bonusCard && !state.ai.bonusUsed)
  const hasAnyPlay = state.ai.hand.length > 0 || hasBonusCard

  if (state.phase !== 'playing' || state.ai.passed || !hasAnyPlay) {
    return { type: 'pass' }
  }

  const strongestEnemy = getStrongestEnemy(state)
  const bonusCard = state.ai.bonusCard

  if (hasBonusCard && bonusCard) {
    const bonusSwing = bonusCard.power + (strongestEnemy?.currentPower ?? 0)
    const canFlipTheRound = state.ai.score + bonusSwing > state.player.score
    const isBigThreat = (strongestEnemy?.currentPower ?? 0) >= 8
    const isGoodCatchUp = state.ai.score < state.player.score && bonusSwing >= 11

    if (
      (strongestEnemy && (isBigThreat || isGoodCatchUp || (state.player.passed && canFlipTheRound))) ||
      (!strongestEnemy && state.player.passed && state.ai.score + bonusCard.power > state.player.score)
    ) {
      return { type: 'bonus' }
    }
  }

  const scoreLead = state.ai.score - state.player.score
  const hasLateRoundLead = scoreLead > 0 && (state.player.passed || state.ai.hand.length <= 2)
  const canSafelyBankRound = scoreLead >= 6 && state.ai.hand.length <= state.player.hand.length

  if ((hasLateRoundLead || canSafelyBankRound) && Math.random() > 0.2) {
    return { type: 'pass' }
  }

  const evaluatedCards = state.ai.hand
    .map((card) => ({
      card,
      gain: estimateProjectedGain(card, state),
      rating: estimateRating(card, state),
    }))
    .sort((left, right) => right.rating - left.rating)

  if (state.player.passed && state.ai.score <= state.player.score) {
    const needed = state.player.score - state.ai.score + 1
    const efficientPlay = evaluatedCards
      .filter((entry) => entry.gain >= needed)
      .sort((left, right) => left.gain - right.gain || right.rating - left.rating)[0]

    if (efficientPlay) {
      return { type: 'play', instanceId: efficientPlay.card.instanceId }
    }
  }

  const topPool = evaluatedCards.slice(0, Math.min(3, evaluatedCards.length))
  const chosen =
    topPool.length > 1 && Math.random() < 0.28
      ? topPool[Math.floor(Math.random() * topPool.length)]
      : topPool[0]

  return chosen ? { type: 'play', instanceId: chosen.card.instanceId } : { type: 'pass' }
}
