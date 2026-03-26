import { useState } from 'react'
import type { CSSProperties } from 'react'
import { CardGlyph } from './CardGlyph'
import type { CardDefinition } from '../types/cards'
import styles from './Card.module.css'

interface CardProps {
  card: CardDefinition & { currentPower?: number }
  variant: 'hand' | 'board' | 'modal'
  highlighted?: boolean
  selected?: boolean
  disabled?: boolean
  style?: CSSProperties
  onClick?: () => void
}

const getInitials = (name: string) =>
  name
    .split(' ')
    .map((part) => part[0] ?? '')
    .join('')
    .slice(0, 2)
    .toUpperCase()

export function Card({
  card,
  variant,
  highlighted = false,
  selected = false,
  disabled = false,
  style,
  onClick,
}: CardProps) {
  const [imageFailed, setImageFailed] = useState(false)
  const power = card.currentPower ?? card.power
  const isInteractive = Boolean(onClick)
  const isModal = variant === 'modal'

  return (
    <button
      type="button"
      className={[
        styles.card,
        styles[variant],
        styles[card.rarity],
        highlighted ? styles.highlighted : '',
        selected ? styles.selected : '',
        disabled ? styles.disabled : '',
      ].join(' ')}
      style={style}
      onClick={onClick}
      disabled={disabled && variant !== 'modal'}
      aria-label={`${card.name}, ${card.title}, power ${power}`}
      data-interactive={isInteractive}
    >
      <div className={styles.media}>
        {!imageFailed ? (
          <img
            className={styles.image}
            src={card.image}
            alt={card.name}
            loading="lazy"
            onError={() => setImageFailed(true)}
          />
        ) : (
          <div className={styles.fallback}>
            <span className={styles.initials}>{getInitials(card.name)}</span>
            <span className={styles.fallbackTitle}>{card.title}</span>
          </div>
        )}

        <div className={styles.powerBadge}>{power}</div>
      </div>

      <div className={styles.content}>
        <div className={styles.headline}>
          <div className={styles.titleBlock}>
            <p className={styles.name}>{card.name}</p>
            <div className={styles.metaRow}>
              <span className={styles.metaIcon}>
                <CardGlyph kind="role" value={card.title} title={card.title} />
              </span>
              <p className={styles.title}>{card.title}</p>
            </div>
          </div>
          <span className={styles.rarityBadge} title={card.rarity}>
            <CardGlyph kind="rarity" value={card.rarity} title={card.rarity} />
          </span>
        </div>

        <p className={styles.ability}>{card.abilityText}</p>

        <div className={styles.footer}>
          <div className={styles.iconTrail}>
            <span className={styles.metaIcon}>
              <CardGlyph kind="ability" value={card.abilityType} title={card.abilityText} />
            </span>
            <span className={styles.metaIcon}>
              <CardGlyph kind="rarity" value={card.rarity} title={card.rarity} />
            </span>
          </div>

          <div className={styles.tags}>
            {card.tags.slice(0, isModal ? 2 : 1).map((tag) => (
              <span key={`${card.id}-${tag}`} className={styles.tag}>
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>
    </button>
  )
}
