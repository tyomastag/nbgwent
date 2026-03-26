import { useEffect, useReducer, useRef, useState } from 'react'
import { ActionLog } from './ActionLog'
import { BoardRow } from './BoardRow'
import { CardModal } from './CardModal'
import { Hand } from './Hand'
import { MatchResultModal } from './MatchResultModal'
import { PassButton } from './PassButton'
import { RoundTracker } from './RoundTracker'
import { ScoreBoard } from './ScoreBoard'
import { chooseAiAction } from '../game/ai'
import { AI_DELAY_MS, HIGHLIGHT_CLEAR_MS, MAX_ROUNDS, ROUND_BREAK_MS } from '../game/constants'
import { createInitialState, gameReducer } from '../game/engine'
import type { CardInstance } from '../game/types'
import type { CardDefinition } from '../types/cards'
import styles from './GameScreen.module.css'

type SelectionTarget = 'playerHand' | 'playerBoard' | 'aiBoard'

interface SelectedCardState {
  instanceId: string
  target: SelectionTarget
}

interface GameScreenProps {
  cards: CardDefinition[]
}

const findSelectedCard = (state: ReturnType<typeof createInitialState>, selection: SelectedCardState | null) => {
  if (!selection) {
    return null
  }

  switch (selection.target) {
    case 'playerHand':
      return state.player.hand.find((card) => card.instanceId === selection.instanceId) ?? null
    case 'playerBoard':
      return state.player.board.find((card) => card.instanceId === selection.instanceId) ?? null
    case 'aiBoard':
      return state.ai.board.find((card) => card.instanceId === selection.instanceId) ?? null
    default:
      return null
  }
}

export function GameScreen({ cards }: GameScreenProps) {
  const [state, dispatch] = useReducer(gameReducer, cards, createInitialState)
  const [selectedCardState, setSelectedCardState] = useState<SelectedCardState | null>(null)
  const previousCards = useRef(cards)

  useEffect(() => {
    if (previousCards.current !== cards) {
      previousCards.current = cards
      dispatch({ type: 'reset_match', cards })
      setSelectedCardState(null)
    }
  }, [cards])

  useEffect(() => {
    if (state.phase !== 'playing' || state.activePlayer !== 'ai') {
      return
    }

    const timeoutId = window.setTimeout(() => {
      const decision = chooseAiAction(state)

      if (decision.type === 'play') {
        dispatch({ type: 'play_card', side: 'ai', instanceId: decision.instanceId })
        return
      }

      dispatch({ type: 'pass_turn', side: 'ai' })
    }, AI_DELAY_MS)

    return () => {
      window.clearTimeout(timeoutId)
    }
  }, [state])

  useEffect(() => {
    if (state.highlightIds.length === 0) {
      return
    }

    const timeoutId = window.setTimeout(() => {
      dispatch({ type: 'clear_highlights' })
    }, HIGHLIGHT_CLEAR_MS)

    return () => {
      window.clearTimeout(timeoutId)
    }
  }, [state.highlightIds])

  useEffect(() => {
    if (state.phase !== 'round_end') {
      return
    }

    const timeoutId = window.setTimeout(() => {
      dispatch({ type: 'next_round' })
    }, ROUND_BREAK_MS)

    return () => {
      window.clearTimeout(timeoutId)
    }
  }, [state.phase])

  useEffect(() => {
    if (!selectedCardState) {
      return
    }

    const exists = findSelectedCard(state, selectedCardState)

    if (!exists) {
      setSelectedCardState(null)
    }
  }, [selectedCardState, state])

  const selectedCard = findSelectedCard(state, selectedCardState)
  const isPlayableSelection = selectedCardState?.target === 'playerHand'
  const canPlayerAct =
    state.phase === 'playing' && state.activePlayer === 'player' && !state.player.passed

  const centerTitle =
    state.phase === 'match_over'
      ? state.matchResult === 'player'
        ? 'Match won'
        : state.matchResult === 'ai'
          ? 'AI wins the match'
          : 'Match ends in a draw'
      : state.phase === 'round_end'
        ? state.roundBanner ?? 'Round complete'
        : canPlayerAct
          ? state.ai.passed
            ? 'AI passed. You can bank extra points'
            : 'Your turn'
          : state.player.passed
            ? 'You passed. AI is finishing the round'
            : 'AI turn'

  const centerSubtitle = state.logs[0]?.message ?? 'Game ready.'

  const openCard = (card: CardInstance, target: SelectionTarget) => {
    setSelectedCardState({ instanceId: card.instanceId, target })
  }

  const handlePlayFromModal = () => {
    if (!selectedCard || !isPlayableSelection || !canPlayerAct) {
      return
    }

    dispatch({ type: 'play_card', side: 'player', instanceId: selectedCard.instanceId })
    setSelectedCardState(null)
  }

  const handlePass = () => {
    if (!canPlayerAct) {
      return
    }

    dispatch({ type: 'pass_turn', side: 'player' })
  }

  const restartMatch = () => {
    dispatch({ type: 'reset_match', cards })
    setSelectedCardState(null)
  }

  return (
    <section className={styles.screen}>
      <header className={styles.header}>
        <div>
          <p className={styles.kicker}>Internal Card League</p>
          <h1 className={styles.title}>NBGwent</h1>
        </div>
        <p className={styles.meta}>Best of {MAX_ROUNDS} rounds</p>
      </header>

      <div className={styles.hud}>
        <ScoreBoard
          playerScore={state.player.score}
          aiScore={state.ai.score}
          playerDeckCount={state.player.deck.length}
          aiDeckCount={state.ai.deck.length}
          playerHandCount={state.player.hand.length}
          aiHandCount={state.ai.hand.length}
          activePlayer={state.activePlayer}
        />

        <RoundTracker
          currentRound={state.roundNumber}
          playerWins={state.player.roundWins}
          aiWins={state.ai.roundWins}
        />
      </div>

      <section className={styles.boardStack}>
        <BoardRow
          label="Opponent Board"
          subtitle={`AI hand ${state.ai.hand.length} • discard ${state.ai.discard.length}`}
          cards={state.ai.board}
          highlightIds={state.highlightIds}
          onCardSelect={(card) => openCard(card, 'aiBoard')}
          emptyState="The AI has not played any cards yet."
          alignment="top"
        />

        <div className={styles.centerLane}>
          <div className={styles.turnPanel}>
            <p className={styles.turnLabel}>{centerTitle}</p>
            <p className={styles.turnCopy}>{centerSubtitle}</p>
          </div>

          <ActionLog entries={state.logs} />

          {state.phase === 'round_end' && state.roundBanner ? (
            <div className={styles.roundBanner}>{state.roundBanner}</div>
          ) : null}
        </div>

        <BoardRow
          label="Your Board"
          subtitle={`Your hand ${state.player.hand.length} • discard ${state.player.discard.length}`}
          cards={state.player.board}
          highlightIds={state.highlightIds}
          onCardSelect={(card) => openCard(card, 'playerBoard')}
          emptyState="Your played cards will appear here."
          alignment="bottom"
        />
      </section>

      <Hand
        cards={state.player.hand}
        highlightIds={state.highlightIds}
        selectedCardId={selectedCardState?.target === 'playerHand' ? selectedCardState.instanceId : null}
        disabled={!canPlayerAct}
        onCardSelect={(card) => openCard(card, 'playerHand')}
      />

      <PassButton
        disabled={!canPlayerAct}
        passed={state.player.passed}
        onClick={handlePass}
      />

      <CardModal
        card={selectedCard}
        isOpen={Boolean(selectedCard)}
        canPlay={Boolean(selectedCard && isPlayableSelection && canPlayerAct)}
        onClose={() => setSelectedCardState(null)}
        onPlay={handlePlayFromModal}
      />

      <MatchResultModal
        isOpen={state.phase === 'match_over'}
        result={state.matchResult}
        playerRoundWins={state.player.roundWins}
        aiRoundWins={state.ai.roundWins}
        onRestart={restartMatch}
      />
    </section>
  )
}
