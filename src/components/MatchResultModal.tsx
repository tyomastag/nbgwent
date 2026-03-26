import type { Side } from '../game/types'
import styles from './MatchResultModal.module.css'

interface MatchResultModalProps {
  isOpen: boolean
  result?: Side | 'draw'
  playerRoundWins: number
  aiRoundWins: number
  onRestart: () => void
}

export function MatchResultModal({
  isOpen,
  result,
  playerRoundWins,
  aiRoundWins,
  onRestart,
}: MatchResultModalProps) {
  if (!isOpen) {
    return null
  }

  const title =
    result === 'player' ? 'You Win the Match' : result === 'ai' ? 'AI Wins the Match' : 'Draw'
  const copy =
    result === 'player'
      ? 'The round management was clean and efficient. Ready for another duel.'
      : result === 'ai'
        ? 'The AI won on tempo. Try saving your strongest swings for the right round.'
        : 'The match stayed perfectly balanced. The next set should settle it.'

  return (
    <div className={styles.overlay} aria-modal="true" role="dialog">
      <div className={styles.panel}>
        <p className={styles.kicker}>Match Result</p>
        <h2 className={styles.title}>{title}</h2>
        <p className={styles.copy}>{copy}</p>
        <p className={styles.score}>
          You {playerRoundWins} : {aiRoundWins} AI
        </p>
        <button type="button" className={styles.button} onClick={onRestart}>
          Play Again
        </button>
      </div>
    </div>
  )
}
