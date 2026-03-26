import { BattleIcon } from './BattleIcon'
import { Card } from './Card'
import type { CardInstance } from '../game/types'
import styles from './Hand.module.css'

interface HandProps {
  bonusCard: CardInstance | null
  bonusUsed: boolean
  cards: CardInstance[]
  highlightIds: string[]
  selectedCardId: string | null
  disabled: boolean
  onCardSelect: (card: CardInstance) => void
  onBonusSelect: (card: CardInstance) => void
}

export function Hand({
  bonusCard,
  bonusUsed,
  cards,
  highlightIds,
  selectedCardId,
  disabled,
  onCardSelect,
  onBonusSelect,
}: HandProps) {
  return (
    <section className={styles.hand}>
      <div className={styles.header}>
        <div>
          <p className={styles.label}>Your hand</p>
          <p className={styles.copy}>
            <BattleIcon name="hand" title="Hand" size={12} />
            Tap a card to preview and play it.
          </p>
        </div>
        <p className={styles.count}>{cards.length}</p>
      </div>

      <div className={styles.list}>
        {bonusCard || bonusUsed ? (
          <div className={styles.bonusLead}>
            {bonusCard ? (
              <Card
                card={bonusCard}
                variant="bonus"
                disabled={disabled || bonusUsed}
                selected={selectedCardId === bonusCard.instanceId}
                highlighted={highlightIds.includes(bonusCard.instanceId)}
                onClick={() => onBonusSelect(bonusCard)}
              />
            ) : (
              <div className={styles.usedSlot}>Used</div>
            )}
          </div>
        ) : null}

        <div className={styles.cardsTrack}>
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
      </div>
    </section>
  )
}
