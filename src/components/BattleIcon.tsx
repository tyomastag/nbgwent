interface BattleIconProps {
  name:
    | 'player'
    | 'opponent'
    | 'hand'
    | 'deck'
    | 'round'
    | 'board'
    | 'initiative'
    | 'pass'
    | 'log'
    | 'turn'
  title?: string
  size?: number
}

const iconPaths: Record<BattleIconProps['name'], string> = {
  player: 'M12 3l5 3v5c0 3.6-2.2 6.8-5 7.6C9.2 17.8 7 14.6 7 11V6l5-3zm-2 7h4m-2-2v4',
  opponent: 'M12 4l7 4v4c0 3.8-2.7 6.9-7 7.8C7.7 18.9 5 15.8 5 12V8l7-4zm-3 6h6m-3-3v6',
  hand: 'M5 16l1.8-8 3.2 4 2.2-6 2.2 7 3.8-3L19 16H5z',
  deck: 'M7 5h8l3 3v10H7a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2zm6 1v3h3',
  round: 'M12 3l2.1 4.2 4.6.7-3.4 3.3.8 4.6-4.1-2.2-4.1 2.2.8-4.6L5.3 7.9l4.6-.7L12 3z',
  board: 'M4 7h16M4 12h16M4 17h16',
  initiative: 'M12 4l4 4h-3v5h-2V8H8l4-4zm-5 12h10v2H7v-2z',
  pass: 'M6 6l12 12M18 6L6 18',
  log: 'M7 5h10M7 10h10M7 15h6',
  turn: 'M12 4c4.4 0 8 3.6 8 8h-3l4 5 4-5h-3c0-5.5-4.5-10-10-10S2 6.5 2 12h2c0-4.4 3.6-8 8-8z',
}

export function BattleIcon({ name, title, size = 16 }: BattleIconProps) {
  return (
    <span
      title={title}
      aria-label={title}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
        lineHeight: 0,
      }}
    >
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        aria-hidden="true"
        style={{ display: 'block' }}
      >
        <path
          d={iconPaths[name]}
          stroke="currentColor"
          strokeWidth="1.7"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </span>
  )
}
