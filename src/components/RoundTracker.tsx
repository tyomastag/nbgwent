import { BattleIcon } from './BattleIcon'
import styles from './RoundTracker.module.css'

interface RoundTrackerProps {
  currentRound: number
  playerWins: number
  aiWins: number
}

const toRoman = (value: number) => ['I', 'II', 'III'][value - 1] ?? `${value}`

export function RoundTracker({ currentRound, playerWins, aiWins }: RoundTrackerProps) {
  return (
    <section className={styles.tracker}>
      <div className={styles.roundMark}>
        <p className={styles.label}>
          <BattleIcon name="round" title="Current round" />
        </p>
        <p className={styles.value}>{toRoman(currentRound)}</p>
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
        <span>
          <BattleIcon name="player" title="Player round wins" size={13} />
          {playerWins}
        </span>
        <span>
          <BattleIcon name="opponent" title="AI round wins" size={13} />
          {aiWins}
        </span>
      </div>
    </section>
  )
}
