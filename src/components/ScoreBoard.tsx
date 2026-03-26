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

  return (
    <section className={styles.board}>
      <article className={`${styles.panel} ${activePlayer === 'ai' ? styles.active : ''}`}>
        <p className={styles.label}>AI</p>
        <p className={styles.score}>{animatedAiScore}</p>
        <p className={styles.meta}>Hand {aiHandCount}</p>
        <p className={styles.meta}>Deck {aiDeckCount}</p>
      </article>

      <article className={`${styles.panel} ${activePlayer === 'player' ? styles.active : ''}`}>
        <p className={styles.label}>You</p>
        <p className={styles.score}>{animatedPlayerScore}</p>
        <p className={styles.meta}>Hand {playerHandCount}</p>
        <p className={styles.meta}>Deck {playerDeckCount}</p>
      </article>
    </section>
  )
}
