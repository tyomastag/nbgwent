import styles from './RoundTracker.module.css'

interface RoundTrackerProps {
  currentRound: number
  playerWins: number
  aiWins: number
}

export function RoundTracker({ currentRound, playerWins, aiWins }: RoundTrackerProps) {
  return (
    <section className={styles.tracker}>
      <div>
        <p className={styles.label}>Round</p>
        <p className={styles.value}>0{currentRound}</p>
      </div>

      <div className={styles.pips} aria-label="Round wins">
        {[0, 1].map((index) => (
          <span
            key={`player-${index}`}
            className={`${styles.pip} ${index < playerWins ? styles.filled : ''}`}
            aria-hidden="true"
          />
        ))}
        <span className={styles.separator} />
        {[0, 1].map((index) => (
          <span
            key={`ai-${index}`}
            className={`${styles.pip} ${index < aiWins ? styles.filled : ''}`}
            aria-hidden="true"
          />
        ))}
      </div>

      <div className={styles.legend}>
        <span>You {playerWins}</span>
        <span>AI {aiWins}</span>
      </div>
    </section>
  )
}
