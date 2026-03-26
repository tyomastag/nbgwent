import { useAnimatedNumber } from '../hooks/useAnimatedNumber'
import type { Side } from '../game/types'
import { BattleIcon } from './BattleIcon'
import styles from './ScoreBoard.module.css'

interface ScoreBoardProps {
  playerScore: number
  aiScore: number
  playerDeckCount: number
  aiDeckCount: number
  playerHandCount: number
  aiHandCount: number
  activePlayer: Side
}

export function ScoreBoard({
  playerScore,
  aiScore,
  playerDeckCount,
  aiDeckCount,
  playerHandCount,
  aiHandCount,
  activePlayer,
}: ScoreBoardProps) {
  const animatedPlayerScore = useAnimatedNumber(playerScore)
  const animatedAiScore = useAnimatedNumber(aiScore)

  return (
    <section className={styles.board}>
      <article className={`${styles.side} ${activePlayer === 'ai' ? styles.active : ''}`}>
        <p className={styles.label}>
          <BattleIcon name="opponent" title="Opponent" />
        </p>
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
      </article>

      <div className={styles.total}>
        <p className={styles.totalLabel}>
          <BattleIcon name="board" title="Battle total" size={14} />
        </p>
        <div className={styles.totalScore}>
          <span>{animatedAiScore}</span>
          <span className={styles.totalDivider}>/</span>
          <span>{animatedPlayerScore}</span>
        </div>
        <p className={styles.totalMeta}>
          <BattleIcon
            name="initiative"
            title={activePlayer === 'player' ? 'Player initiative' : 'AI initiative'}
            size={13}
          />
          <BattleIcon name={activePlayer === 'player' ? 'player' : 'opponent'} size={13} />
        </p>
      </div>

      <article className={`${styles.side} ${activePlayer === 'player' ? styles.active : ''}`}>
        <p className={styles.label}>
          <BattleIcon name="player" title="Player" />
        </p>
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
      </article>
    </section>
  )
}
