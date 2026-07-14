// Shared framer-motion variants used across the app.

/** Fade-in + slight upward slide. Use on any top-level page/view mount. */
export const pageVariants = {
  hidden:  { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] } },
}

/** Staggered child list — parent staggers children by 0.07s each. */
export const listParent = {
  hidden:  {},
  visible: { transition: { staggerChildren: 0.07 } },
}
export const listChild = {
  hidden:  { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3, ease: [0.22, 1, 0.36, 1] } },
}

/** Smooth reveal */
export const revealVariants = {
  hidden:  { opacity: 0, y: -8 },
  visible: { opacity: 1, y: 0,  transition: { duration: 0.28, ease: 'easeOut' } },
  exit:    { opacity: 0, y: -8, transition: { duration: 0.18 } },
}

/** Gentle hover scale */
export const hoverScale = { scale: 1.02, transition: { duration: 0.15 } }
