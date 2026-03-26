import { BattleIcon } from './BattleIcon'
import styles from './PassButton.module.css'

interface PassButtonProps {
  disabled: boolean
  passed: boolean
  onClick: () => void
}

export function PassButton({ disabled, passed, onClick }: PassButtonProps) {
  return (
    <button
      type="button"
      className={styles.button}
      disabled={disabled || passed}
      onClick={onClick}
    >
      <BattleIcon name="pass" title={passed ? 'Passed' : 'Pass'} size={15} />
      <span>{passed ? 'Passed' : 'Pass'}</span>
    </button>
  )
}
