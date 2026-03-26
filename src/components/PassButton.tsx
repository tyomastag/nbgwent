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
      {passed ? 'Passed' : 'Pass'}
    </button>
  )
}
