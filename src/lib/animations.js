// Shared framer-motion variants used across the app.
// Keeping them centralised means one tweak updates every page at once.

/** Fade-in + slight upward slide. Use on any top-level page/view mount. */
export const pageVariants = {
  hidden:  { opacity: 0, y: 18 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: 'easeOut' } },
}

/** Staggered child list — parent staggers children by 0.07s each. */
export const listParent = {
  hidden:  {},
  visible: { transition: { staggerChildren: 0.07 } },
}
export const listChild = {
  hidden:  { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0,  transition: { duration: 0.28, ease: 'easeOut' } },
}

/** Smooth reveal — uses y + opacity only (avoids height:auto framer-motion issues). */
export const revealVariants = {
  hidden:  { opacity: 0, y: -8 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.28, ease: 'easeOut' } },
  exit:    { opacity: 0, y: -8, transition: { duration: 0.18 } },
}

/** Gentle hover scale for buttons and table rows — applied via whileHover. */
export const hoverScale = { scale: 1.02, transition: { duration: 0.15 } }
