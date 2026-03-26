import { BattleIcon } from './BattleIcon'
import { Card } from './Card'
import type { CardInstance } from '../game/types'
import styles from './BoardRow.module.css'

interface BoardRowProps {
  side: 'player' | 'ai'
  handCount: number
  discardCount: number
  cards: CardInstance[]
  highlightIds: string[]
  emptyState: string
  alignment: 'top' | 'bottom'
  onCardSelect: (card: CardInstance) => void
}

export function BoardRow({
  side,
  handCount,
  discardCount,
  cards,
  highlightIds,
  emptyState,
  alignment,
  onCardSelect,
}: BoardRowProps) {
  const sideLabel = side === 'player' ? 'Your board' : 'AI board'

  return (
    <section className={`${styles.row} ${alignment === 'top' ? styles.top : styles.bottom}`}>
      <div className={styles.header}>
        <div className={styles.labelGroup}>
          <p className={styles.label}>{sideLabel}</p>
          <p className={styles.subtitle}>
            <span title="Cards in hand">
              <BattleIcon name="hand" size={12} />
              Hand {handCount}
            </span>
            <span title="Discard pile">
              <BattleIcon name="deck" size={12} />
              Discard {discardCount}
            </span>
          </p>
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
