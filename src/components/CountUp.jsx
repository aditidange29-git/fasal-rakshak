import { useEffect, useRef, useState } from 'react'

/**
 * Counts from 0 to `target` over `duration` ms using requestAnimationFrame.
 * `prefix` / `suffix` are rendered as plain text either side of the number.
 * `decimals` controls how many decimal places to show.
 */
export default function CountUp({ target, duration = 1000, prefix = '', suffix = '', decimals = 0 }) {
  const [display, setDisplay] = useState(0)
  const rafRef  = useRef(null)
  const startTs = useRef(null)

  useEffect(() => {
    if (target == null) return

    // Cancel any in-flight animation from a previous target value
    if (rafRef.current) cancelAnimationFrame(rafRef.current)
    startTs.current = null

    const step = (timestamp) => {
      if (!startTs.current) startTs.current = timestamp
      const elapsed  = timestamp - startTs.current
      const progress = Math.min(elapsed / duration, 1)
      // Ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3)
      setDisplay(parseFloat((eased * target).toFixed(decimals)))
      if (progress < 1) rafRef.current = requestAnimationFrame(step)
    }

    rafRef.current = requestAnimationFrame(step)
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current) }
  }, [target, duration, decimals])

  return <>{prefix}{display.toLocaleString('en-IN')}{suffix}</>
}
