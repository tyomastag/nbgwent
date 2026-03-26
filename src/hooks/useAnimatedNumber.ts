import { useEffect, useRef, useState } from 'react'

export const useAnimatedNumber = (value: number, duration = 360) => {
  const [displayValue, setDisplayValue] = useState(value)
  const previousValue = useRef(value)

  useEffect(() => {
    const startValue = previousValue.current
    const delta = value - startValue

    if (delta === 0) {
      return
    }

    let frameId = 0
    let startTime = 0

    const tick = (timestamp: number) => {
      if (!startTime) {
        startTime = timestamp
      }

      const progress = Math.min(1, (timestamp - startTime) / duration)
      const easedProgress = 1 - (1 - progress) * (1 - progress)

      setDisplayValue(Math.round(startValue + delta * easedProgress))

      if (progress < 1) {
        frameId = window.requestAnimationFrame(tick)
      } else {
        previousValue.current = value
      }
    }

    frameId = window.requestAnimationFrame(tick)

    return () => {
      window.cancelAnimationFrame(frameId)
    }
  }, [duration, value])

  return displayValue
}
