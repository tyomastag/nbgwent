import { Card } from './Card'
import type { CardInstance } from '../game/types'
import styles from './BoardRow.module.css'

interface BoardRowProps {
  label: string
  subtitle: string
  cards: CardInstance[]
  highlightIds: string[]
  emptyState: string
  alignment: 'top' | 'bottom'
  onCardSelect: (card: CardInstance) => void
}

export function BoardRow({
  label,
  subtitle,
  cards,
  highlightIds,
  emptyState,
  alignment,
  onCardSelect,
}: BoardRowProps) {
  return (
    <section className={`${styles.row} ${alignment === 'top' ? styles.top : styles.bottom}`}>
      <div className={styles.header}>
        <div>
          <p className={styles.label}>{label}</p>
          <p className={styles.subtitle}>{subtitle}</p>
        </div>
        <p className={styles.count}>{cards.length}</p>
      </div>

      <div className={styles.list}>
        {cards.length > 0 ? (
          cards.map((card) => (
            <Card
              key={card.instanceId}
              card={card}
              variant="board"
              highlighted={highlightIds.includes(card.instanceId)}
              onClick={() => onCardSelect(card)}
            />
          ))
        ) : (
          <div className={styles.empty}>{emptyState}</div>
        )}
      </div>
    </section>
  )
}
