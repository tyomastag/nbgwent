import { BattleIcon } from './BattleIcon'
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
        <p className={styles.label}>
          <BattleIcon name="player" title="Player" size={14} />
          <BattleIcon name="hand" title="Hand" size={14} />
        </p>
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
