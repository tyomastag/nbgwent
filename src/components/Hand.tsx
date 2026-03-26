import { Card } from './Card'
import type { CardInstance } from '../game/types'
import styles from './Hand.module.css'

interface HandProps {
  cards: CardInstance[]
  highlightIds: string[]
  selectedCardId: string | null
  disabled: boolean
  onCardSelect: (card: CardInstance) => void
}

export function Hand({ cards, highlightIds, selectedCardId, disabled, onCardSelect }: HandProps) {
  return (
    <section className={styles.hand}>
      <div className={styles.header}>
        <div>
          <p className={styles.label}>Your Hand</p>
          <p className={styles.copy}>Tap a card to open its preview and play button.</p>
        </div>
        <p className={styles.count}>{cards.length}</p>
      </div>

      <div className={styles.list}>
        {cards.map((card, index) => (
          <Card
            key={card.instanceId}
            card={card}
            variant="hand"
            disabled={disabled}
            selected={selectedCardId === card.instanceId}
            highlighted={highlightIds.includes(card.instanceId)}
            style={{ animationDelay: `${index * 40}ms` }}
            onClick={() => onCardSelect(card)}
          />
        ))}
      </div>
    </section>
  )
}
