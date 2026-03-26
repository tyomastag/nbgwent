import { Card } from './Card'
import type { CardInstance } from '../game/types'
import styles from './CardModal.module.css'

interface CardModalProps {
  card: CardInstance | null
  isOpen: boolean
  canPlay: boolean
  playLabel?: string
  onClose: () => void
  onPlay: () => void
}

export function CardModal({ card, isOpen, canPlay, playLabel = 'Play Card', onClose, onPlay }: CardModalProps) {
  if (!isOpen || !card) {
    return null
  }

  return (
    <div className={styles.overlay} onClick={onClose} aria-modal="true" role="dialog">
      <div className={styles.panel} onClick={(event) => event.stopPropagation()}>
        <Card card={card} variant="modal" />
        <div className={styles.actions}>
          <button type="button" className={styles.ghostButton} onClick={onClose}>
            Close
          </button>
          {canPlay ? (
            <button type="button" className={styles.playButton} onClick={onPlay}>
              {playLabel}
            </button>
          ) : null}
        </div>
      </div>
    </div>
  )
}
