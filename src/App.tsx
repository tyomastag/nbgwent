import { useEffect, useState } from 'react'
import { GameScreen } from './components/GameScreen'
import type { CardDefinition } from './types/cards'
import styles from './App.module.css'

function isCardDefinition(value: unknown): value is CardDefinition {
  if (!value || typeof value !== 'object') {
    return false
  }

  const card = value as Record<string, unknown>

  return (
    typeof card.id === 'string' &&
    typeof card.name === 'string' &&
    typeof card.title === 'string' &&
    typeof card.image === 'string' &&
    typeof card.power === 'number' &&
    typeof card.abilityType === 'string' &&
    typeof card.abilityValue === 'number' &&
    typeof card.abilityText === 'string' &&
    typeof card.rarity === 'string' &&
    Array.isArray(card.tags)
  )
}

function App() {
  const [cards, setCards] = useState<CardDefinition[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let isMounted = true

    const loadCards = async () => {
      try {
        const response = await fetch('/data/cards.json')

        if (!response.ok) {
          throw new Error(`Failed to load cards.json (${response.status})`)
        }

        const json = (await response.json()) as unknown

        if (!Array.isArray(json) || json.length === 0 || !json.every(isCardDefinition)) {
          throw new Error('cards.json has an invalid structure.')
        }

        if (isMounted) {
          setCards(json)
          setError(null)
        }
      } catch (loadError) {
        if (isMounted) {
          setError(loadError instanceof Error ? loadError.message : 'Unknown loading error.')
        }
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    void loadCards()

    return () => {
      isMounted = false
    }
  }, [])

  if (isLoading) {
    return (
      <main className={styles.shell}>
        <section className={styles.panel}>
          <p className={styles.kicker}>Internal Card League</p>
          <h1 className={styles.title}>Loading deck...</h1>
          <p className={styles.copy}>Preparing the match and loading cards from JSON.</p>
        </section>
      </main>
    )
  }

  if (error) {
    return (
      <main className={styles.shell}>
        <section className={styles.panel}>
          <p className={styles.kicker}>Load Error</p>
          <h1 className={styles.title}>Cards data is unavailable</h1>
          <p className={styles.copy}>{error}</p>
        </section>
      </main>
    )
  }

  return (
    <main className={styles.shell}>
      <GameScreen cards={cards} />
    </main>
  )
}

export default App
