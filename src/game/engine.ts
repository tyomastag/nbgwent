import {
  FINISHER_THRESHOLD,
  HAND_SIZE,
  LOG_LIMIT,
  LORD_ARTURS_CARD_ID,
  MAX_ROUNDS,
  ROUND_WINS_TO_WIN,
} from './constants'
import type { CardInstance, GameAction, GameState, LogEntry, LogTone, PlayerState, Side } from './types'
import type { AbilityType, CardDefinition } from '../types/cards'

type PendingLog = Omit<LogEntry, 'id'>

interface AbilityContext {
  actor: PlayerState
  opponent: PlayerState
  playedCard: CardInstance
  prePlayActorScore: number
  prePlayOpponentScore: number
  logs: PendingLog[]
  highlightIds: Set<string>
}

let logSequence = 0

const makeLog = (message: string, tone: LogTone = 'neutral'): LogEntry => ({
  id: `log-${logSequence++}`,
  message,
  tone,
})

const cloneCard = (card: CardInstance): CardInstance => ({
  ...card,
  tags: [...card.tags],
})

const clonePlayerState = (player: PlayerState): PlayerState => ({
  ...player,
  deck: player.deck.map(cloneCard),
  hand: player.hand.map(cloneCard),
  board: player.board.map(cloneCard),
  discard: player.discard.map(cloneCard),
  bonusCard: player.bonusCard ? cloneCard(player.bonusCard) : null,
})

const shuffle = <T,>(items: T[]) => {
  const cloned = [...items]

  for (let index = cloned.length - 1; index > 0; index -= 1) {
    const nextIndex = Math.floor(Math.random() * (index + 1))
    ;[cloned[index], cloned[nextIndex]] = [cloned[nextIndex], cloned[index]]
  }

  return cloned
}

const sumScore = (cards: CardInstance[]) =>
  cards.reduce((total, card) => total + Math.max(0, card.currentPower), 0)

const refreshScores = (player: PlayerState, ai: PlayerState) => {
  player.score = sumScore(player.board)
  ai.score = sumScore(ai.board)
}

const toLogEntries = (logs: PendingLog[]) => logs.map((log) => makeLog(log.message, log.tone))

const mergeLogs = (existing: LogEntry[], additions: PendingLog[]) => [
  ...toLogEntries(additions),
  ...existing,
].slice(0, LOG_LIMIT)

const createCardInstance = (card: CardDefinition, side: Side, index: number): CardInstance => ({
  ...card,
  tags: [...card.tags],
  currentPower: card.power,
  owner: side,
  instanceId: `${side}-${card.id}-${index}`,
})

const createPlayerState = (cards: CardDefinition[], side: Side): PlayerState => {
  const bonusDefinition = cards.find((card) => card.id === LORD_ARTURS_CARD_ID) ?? null
  const baseDeckCards = cards.filter((card) => card.id !== LORD_ARTURS_CARD_ID)
  const deck = shuffle(baseDeckCards.map((card, index) => createCardInstance(card, side, index)))
  const hand = deck.slice(0, HAND_SIZE)

  return {
    deck: deck.slice(HAND_SIZE),
    hand,
    board: [],
    discard: [],
    bonusCard: bonusDefinition ? createCardInstance(bonusDefinition, side, 999) : null,
    bonusUsed: false,
    passed: false,
    roundWins: 0,
    score: 0,
  }
}

export const createInitialState = (cards: CardDefinition[]): GameState => {
  const hasLordArturs = cards.some((card) => card.id === LORD_ARTURS_CARD_ID)

  return {
    phase: 'playing',
    roundNumber: 1,
    activePlayer: 'player',
    player: createPlayerState(cards, 'player'),
    ai: createPlayerState(cards, 'ai'),
    logs: [
      makeLog('Match started. You and the AI drew 10 cards each.', 'system'),
      ...(hasLordArturs ? [makeLog('Lord Artūrs waits at each side as a one-time bonus card.', 'system')] : []),
    ],
    highlightIds: [],
  }
}

const drawCard = (actor: PlayerState) => {
  const [drawnCard, ...restDeck] = actor.deck

  if (!drawnCard) {
    return null
  }

  actor.deck = restDeck
  actor.hand = [...actor.hand, drawnCard]

  return drawnCard
}

const getStrongestCard = (cards: CardInstance[]) =>
  cards
    .slice()
    .sort((left, right) => right.currentPower - left.currentPower || left.instanceId.localeCompare(right.instanceId))[0]

const removeStrongestEnemyCard = (
  opponent: PlayerState,
  playedCard: CardInstance,
  logs: PendingLog[],
  highlightIds: Set<string>,
) => {
  const target = getStrongestCard(opponent.board)

  if (!target) {
    logs.push({
      message: `${playedCard.name} enters as a royal bonus, but no enemy card is on the board.`,
      tone: 'neutral',
    })
    return
  }

  opponent.board = opponent.board.filter((card) => card.instanceId !== target.instanceId)
  opponent.discard = [...opponent.discard, target]
  highlightIds.add(playedCard.instanceId)
  highlightIds.add(target.instanceId)
  logs.push({
    message: `${playedCard.name} defeats ${target.name}, the strongest enemy on the board.`,
    tone: 'negative',
  })
}

const abilityResolvers: Record<AbilityType, (context: AbilityContext) => void> = {
  none: () => undefined,
  boost_self: ({ playedCard, logs, highlightIds }) => {
    playedCard.currentPower += playedCard.abilityValue
    highlightIds.add(playedCard.instanceId)
    logs.push({
      message: `${playedCard.name} boosts itself by +${playedCard.abilityValue}.`,
      tone: 'positive',
    })
  },
  boost_row_random: ({ actor, playedCard, logs, highlightIds }) => {
    const targets = actor.board.filter((card) => card.instanceId !== playedCard.instanceId)

    if (targets.length === 0) {
      return
    }

    const target = targets[Math.floor(Math.random() * targets.length)]
    target.currentPower += playedCard.abilityValue
    highlightIds.add(playedCard.instanceId)
    highlightIds.add(target.instanceId)
    logs.push({
      message: `${playedCard.name} boosts ${target.name} by +${playedCard.abilityValue}.`,
      tone: 'positive',
    })
  },
  damage_enemy_random: ({ opponent, playedCard, logs, highlightIds }) => {
    if (opponent.board.length === 0) {
      return
    }

    const target = opponent.board[Math.floor(Math.random() * opponent.board.length)]
    const actualDamage = Math.min(playedCard.abilityValue, target.currentPower)

    target.currentPower = Math.max(0, target.currentPower - playedCard.abilityValue)
    highlightIds.add(playedCard.instanceId)
    highlightIds.add(target.instanceId)
    logs.push({
      message: `${playedCard.name} deals ${actualDamage} damage to ${target.name}.`,
      tone: 'negative',
    })
  },
  double_if_last_card: ({ actor, playedCard, logs, highlightIds }) => {
    if (actor.hand.length > 0) {
      return
    }

    const nextPower = playedCard.currentPower * Math.max(2, playedCard.abilityValue)
    const bonus = nextPower - playedCard.currentPower

    playedCard.currentPower = nextPower
    highlightIds.add(playedCard.instanceId)
    logs.push({
      message: `${playedCard.name} is your last card and gains +${bonus}.`,
      tone: 'positive',
    })
  },
  morale: ({ actor, playedCard, logs, highlightIds }) => {
    const others = actor.board.filter((card) => card.instanceId !== playedCard.instanceId)

    if (others.length === 0) {
      return
    }

    others.forEach((card) => {
      card.currentPower += playedCard.abilityValue
      highlightIds.add(card.instanceId)
    })
    highlightIds.add(playedCard.instanceId)
    logs.push({
      message: `${playedCard.name} raises morale: +${playedCard.abilityValue} to allied cards.`,
      tone: 'positive',
    })
  },
  spy_light: ({ actor, playedCard, logs, highlightIds }) => {
    const drawnCard = drawCard(actor)

    highlightIds.add(playedCard.instanceId)

    if (!drawnCard) {
      logs.push({
        message: `${playedCard.name} goes scouting, but the deck is empty.`,
        tone: 'neutral',
      })
      return
    }

    logs.push({
      message: `${playedCard.name} brings intel and draws 1 card.`,
      tone: 'positive',
    })
  },
  comeback: ({ playedCard, prePlayActorScore, prePlayOpponentScore, logs, highlightIds }) => {
    if (prePlayActorScore >= prePlayOpponentScore) {
      return
    }

    playedCard.currentPower += playedCard.abilityValue
    highlightIds.add(playedCard.instanceId)
    logs.push({
      message: `${playedCard.name} activates comeback and gains +${playedCard.abilityValue}.`,
      tone: 'positive',
    })
  },
  finisher: ({ playedCard, prePlayOpponentScore, logs, highlightIds }) => {
    if (prePlayOpponentScore < FINISHER_THRESHOLD) {
      return
    }

    playedCard.currentPower += playedCard.abilityValue
    highlightIds.add(playedCard.instanceId)
    logs.push({
      message: `${playedCard.name} triggers as a finisher and gains +${playedCard.abilityValue}.`,
      tone: 'positive',
    })
  },
  slay_strongest: ({ opponent, playedCard, logs, highlightIds }) => {
    removeStrongestEnemyCard(opponent, playedCard, logs, highlightIds)
  },
}

const getZones = (state: GameState, side: Side) =>
  side === 'player'
    ? { actor: clonePlayerState(state.player), opponent: clonePlayerState(state.ai) }
    : { actor: clonePlayerState(state.ai), opponent: clonePlayerState(state.player) }

const hasPlayableCards = (player: PlayerState) => player.hand.length > 0 || (!!player.bonusCard && !player.bonusUsed)

const shouldEndRound = (player: PlayerState, ai: PlayerState) =>
  (player.passed || !hasPlayableCards(player)) && (ai.passed || !hasPlayableCards(ai))

const getNextActivePlayer = (side: Side, actor: PlayerState, opponent: PlayerState): Side => {
  const opposite = side === 'player' ? 'ai' : 'player'
  const actorDone = actor.passed || !hasPlayableCards(actor)
  const opponentDone = opponent.passed || !hasPlayableCards(opponent)

  if (!actorDone && opponentDone) {
    return side
  }

  if (actorDone && !opponentDone) {
    return opposite
  }

  return opposite
}

const finalizeRound = (state: GameState, player: PlayerState, ai: PlayerState) => {
  let roundWinner: Side | 'draw' = 'draw'
  let roundBanner = `Round ${state.roundNumber} ends in a draw`
  let roundTone: LogTone = 'system'

  if (player.score > ai.score) {
    player.roundWins += 1
    roundWinner = 'player'
    roundBanner = `You win round ${state.roundNumber}`
    roundTone = 'positive'
  } else if (ai.score > player.score) {
    ai.roundWins += 1
    roundWinner = 'ai'
    roundBanner = `AI wins round ${state.roundNumber}`
    roundTone = 'negative'
  }

  const logs = mergeLogs(state.logs, [{ message: roundBanner, tone: roundTone }])
  const isMatchFinished =
    player.roundWins >= ROUND_WINS_TO_WIN ||
    ai.roundWins >= ROUND_WINS_TO_WIN ||
    state.roundNumber >= MAX_ROUNDS

  if (!isMatchFinished) {
    return {
      ...state,
      phase: 'round_end' as const,
      activePlayer: roundWinner === 'draw' ? 'player' : roundWinner,
      player,
      ai,
      logs,
      highlightIds: [],
      roundBanner,
      roundWinner,
    }
  }

  let matchResult: Side | 'draw' = 'draw'

  if (player.roundWins > ai.roundWins) {
    matchResult = 'player'
  } else if (ai.roundWins > player.roundWins) {
    matchResult = 'ai'
  }

  return {
    ...state,
    phase: 'match_over' as const,
    activePlayer: roundWinner === 'draw' ? 'player' : roundWinner,
    player,
    ai,
    logs,
    highlightIds: [],
    roundBanner,
    roundWinner,
    matchResult,
  }
}

const resolvePlayCard = (state: GameState, side: Side, instanceId: string): GameState => {
  if (state.phase !== 'playing' || state.activePlayer !== side) {
    return state
  }

  const { actor, opponent } = getZones(state, side)
  const cardIndex = actor.hand.findIndex((card) => card.instanceId === instanceId)

  if (cardIndex === -1) {
    return state
  }

  const [playedCard] = actor.hand.splice(cardIndex, 1)
  const logs: PendingLog[] = [
    { message: `${playedCard.name} enters the board with ${playedCard.power} power.`, tone: 'system' },
  ]
  const highlightIds = new Set<string>([playedCard.instanceId])

  actor.board = [...actor.board, playedCard]

  abilityResolvers[playedCard.abilityType]({
    actor,
    opponent,
    playedCard,
    prePlayActorScore: actor.score,
    prePlayOpponentScore: opponent.score,
    logs,
    highlightIds,
  })

  refreshScores(actor, opponent)

  if (shouldEndRound(side === 'player' ? actor : opponent, side === 'player' ? opponent : actor)) {
    const player = side === 'player' ? actor : opponent
    const ai = side === 'player' ? opponent : actor

    return finalizeRound(state, player, ai)
  }

  const nextActivePlayer = getNextActivePlayer(side, actor, opponent)
  const player = side === 'player' ? actor : opponent
  const ai = side === 'player' ? opponent : actor

  return {
    ...state,
    player,
    ai,
    activePlayer: nextActivePlayer,
    logs: mergeLogs(state.logs, logs),
    highlightIds: [...highlightIds],
  }
}

const resolvePlayBonusCard = (state: GameState, side: Side): GameState => {
  if (state.phase !== 'playing' || state.activePlayer !== side) {
    return state
  }

  const { actor, opponent } = getZones(state, side)
  const playedCard = actor.bonusCard

  if (!playedCard || actor.bonusUsed) {
    return state
  }

  actor.bonusCard = null
  actor.bonusUsed = true

  const logs: PendingLog[] = [
    {
      message: `${playedCard.name} joins the battle from the bonus slot.`,
      tone: 'system',
    },
  ]
  const highlightIds = new Set<string>([playedCard.instanceId])

  actor.board = [...actor.board, playedCard]

  abilityResolvers[playedCard.abilityType]({
    actor,
    opponent,
    playedCard,
    prePlayActorScore: actor.score,
    prePlayOpponentScore: opponent.score,
    logs,
    highlightIds,
  })

  refreshScores(actor, opponent)

  if (shouldEndRound(side === 'player' ? actor : opponent, side === 'player' ? opponent : actor)) {
    const player = side === 'player' ? actor : opponent
    const ai = side === 'player' ? opponent : actor

    return finalizeRound(state, player, ai)
  }

  const nextActivePlayer = getNextActivePlayer(side, actor, opponent)
  const player = side === 'player' ? actor : opponent
  const ai = side === 'player' ? opponent : actor

  return {
    ...state,
    player,
    ai,
    activePlayer: nextActivePlayer,
    logs: mergeLogs(state.logs, logs),
    highlightIds: [...highlightIds],
  }
}

const resolvePassTurn = (state: GameState, side: Side): GameState => {
  if (state.phase !== 'playing' || state.activePlayer !== side) {
    return state
  }

  const { actor, opponent } = getZones(state, side)

  if (actor.passed) {
    return state
  }

  actor.passed = true

  const logs: PendingLog[] = [
    {
      message: side === 'player' ? 'You pass.' : 'AI passes.',
      tone: 'system',
    },
  ]

  refreshScores(actor, opponent)

  if (shouldEndRound(side === 'player' ? actor : opponent, side === 'player' ? opponent : actor)) {
    const player = side === 'player' ? actor : opponent
    const ai = side === 'player' ? opponent : actor

    return finalizeRound(state, player, ai)
  }

  const player = side === 'player' ? actor : opponent
  const ai = side === 'player' ? opponent : actor

  return {
    ...state,
    player,
    ai,
    activePlayer: getNextActivePlayer(side, actor, opponent),
    logs: mergeLogs(state.logs, logs),
    highlightIds: [],
  }
}

const prepareNextRound = (state: GameState): GameState => {
  if (state.phase !== 'round_end') {
    return state
  }

  const nextRoundNumber = state.roundNumber + 1
  const startingPlayer = state.roundWinner === 'draw' ? 'player' : state.roundWinner ?? 'player'

  return {
    ...state,
    phase: 'playing',
    roundNumber: nextRoundNumber,
    activePlayer: startingPlayer,
    roundBanner: undefined,
    roundWinner: undefined,
    highlightIds: [],
    player: {
      ...clonePlayerState(state.player),
      board: [],
      discard: [...state.player.discard.map(cloneCard), ...state.player.board.map(cloneCard)],
      passed: false,
      score: 0,
    },
    ai: {
      ...clonePlayerState(state.ai),
      board: [],
      discard: [...state.ai.discard.map(cloneCard), ...state.ai.board.map(cloneCard)],
      passed: false,
      score: 0,
    },
    logs: mergeLogs(state.logs, [{ message: `Round ${nextRoundNumber} begins.`, tone: 'system' }]),
  }
}

export const gameReducer = (state: GameState, action: GameAction): GameState => {
  switch (action.type) {
    case 'play_card':
      return resolvePlayCard(state, action.side, action.instanceId)
    case 'play_bonus_card':
      return resolvePlayBonusCard(state, action.side)
    case 'pass_turn':
      return resolvePassTurn(state, action.side)
    case 'next_round':
      return prepareNextRound(state)
    case 'reset_match':
      return createInitialState(action.cards)
    case 'clear_highlights':
      return state.highlightIds.length === 0 ? state : { ...state, highlightIds: [] }
    default:
      return state
  }
}
