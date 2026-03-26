import { BattleIcon } from './BattleIcon'
import type { LogEntry } from '../game/types'
import styles from './ActionLog.module.css'

interface ActionLogProps {
  entries: LogEntry[]
}

export function ActionLog({ entries }: ActionLogProps) {
  return (
    <section className={styles.log}>
      <div className={styles.header}>
        <p className={styles.label}>
          <BattleIcon name="log" title="Action log" size={13} />
        </p>
      </div>

      <div className={styles.items}>
        {entries.slice(0, 4).map((entry) => (
          <p key={entry.id} className={`${styles.item} ${styles[entry.tone]}`}>
            {entry.message}
          </p>
        ))}
      </div>
    </section>
  )
}
