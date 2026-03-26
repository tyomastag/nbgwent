import { useAnimatedNumber } from '../hooks/useAnimatedNumber'
import type { Side } from '../game/types'
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
  const activeLabel = activePlayer === 'player' ? 'Player initiative' : 'AI initiative'

  return (
    <section className={styles.board}>
      <article className={`${styles.side} ${activePlayer === 'ai' ? styles.active : ''}`}>
        <p className={styles.label}>Opponent</p>
        <p className={styles.score}>{animatedAiScore}</p>
        <p className={styles.meta}>H {aiHandCount}</p>
        <p className={styles.meta}>D {aiDeckCount}</p>
      </article>

      <div className={styles.total}>
        <p className={styles.totalLabel}>Total</p>
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
        <p className={styles.meta}>H {playerHandCount}</p>
        <p className={styles.meta}>D {playerDeckCount}</p>
      </article>
    </section>
  )
}
