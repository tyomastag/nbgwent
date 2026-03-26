import { useAnimatedNumber } from '../hooks/useAnimatedNumber'
import type { CardInstance, Side } from '../game/types'
import { BattleIcon } from './BattleIcon'
import { Card } from './Card'
import styles from './ScoreBoard.module.css'

interface ScoreBoardProps {
  playerScore: number
  aiScore: number
  playerDeckCount: number
  aiDeckCount: number
  playerHandCount: number
  aiHandCount: number
  playerBonusCard: CardInstance | null
  aiBonusCard: CardInstance | null
  playerBonusUsed: boolean
  aiBonusUsed: boolean
  activePlayer: Side
  onPlayerBonusSelect: (card: CardInstance) => void
  onAiBonusSelect: (card: CardInstance) => void
}

export function ScoreBoard({
  playerScore,
  aiScore,
  playerDeckCount,
  aiDeckCount,
  playerHandCount,
  aiHandCount,
  playerBonusCard,
  aiBonusCard,
  playerBonusUsed,
  aiBonusUsed,
  activePlayer,
  onPlayerBonusSelect,
  onAiBonusSelect,
}: ScoreBoardProps) {
  const animatedPlayerScore = useAnimatedNumber(playerScore)
  const animatedAiScore = useAnimatedNumber(aiScore)
  const activeLabel = activePlayer === 'player' ? 'Your turn' : 'AI turn'

  return (
    <section className={styles.board}>
      <article className={`${styles.side} ${activePlayer === 'ai' ? styles.active : ''}`}>
        <p className={styles.label}>AI</p>
        <p className={styles.score}>{animatedAiScore}</p>
        <div className={styles.metaRow}>
          <span className={styles.meta} title="Cards in hand">
            <BattleIcon name="hand" title="Cards in hand" size={13} />
            {aiHandCount}
          </span>
          <span className={styles.meta} title="Cards in deck">
            <BattleIcon name="deck" title="Cards in deck" size={13} />
            {aiDeckCount}
          </span>
        </div>
        <div className={styles.bonusArea}>
          <p className={styles.bonusLabel}>Bonus</p>
          {aiBonusCard ? (
            <Card
              card={aiBonusCard}
              variant="bonus"
              disabled={aiBonusUsed}
              onClick={() => onAiBonusSelect(aiBonusCard)}
            />
          ) : (
            <div className={styles.bonusPlaceholder}>{aiBonusUsed ? 'Used' : 'Ready'}</div>
          )}
        </div>
      </article>

      <div className={styles.total}>
        <p className={styles.totalLabel}>Round total</p>
        <div className={styles.totalScore}>
          <span>{animatedAiScore}</span>
          <span className={styles.totalDivider}>/</span>
          <span>{animatedPlayerScore}</span>
        </div>
        <p className={styles.totalMeta}>{activeLabel}</p>
      </div>

      <article className={`${styles.side} ${activePlayer === 'player' ? styles.active : ''}`}>
        <p className={styles.label}>You</p>
        <p className={styles.score}>{animatedPlayerScore}</p>
        <div className={styles.metaRow}>
          <span className={styles.meta} title="Cards in hand">
            <BattleIcon name="hand" title="Cards in hand" size={13} />
            {playerHandCount}
          </span>
          <span className={styles.meta} title="Cards in deck">
            <BattleIcon name="deck" title="Cards in deck" size={13} />
            {playerDeckCount}
          </span>
        </div>
        <div className={styles.bonusArea}>
          <p className={styles.bonusLabel}>Bonus</p>
          {playerBonusCard ? (
            <Card
              card={playerBonusCard}
              variant="bonus"
              disabled={playerBonusUsed}
              onClick={() => onPlayerBonusSelect(playerBonusCard)}
            />
          ) : (
            <div className={styles.bonusPlaceholder}>{playerBonusUsed ? 'Used' : 'Ready'}</div>
          )}
        </div>
      </article>
    </section>
  )
}
