import { useEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'
import './PillNav.css'

const springValues = { damping: 30, stiffness: 100, mass: 2 }

/**
 * Adapted PillNav — uses buttons instead of react-router Links.
 * Props match the React Bits spec except `items` uses { key, label }
 * instead of { href, label }, and onSelect(key) replaces routing.
 */
export default function PillNav({
  items,
  activeKey,
  onSelect,
  className = '',
  ease = 'power3.out',
  baseColor = '#14181f',
  pillColor = '#a8d95a',
  hoveredPillTextColor = '#14181f',
  pillTextColor,
}) {
  const resolvedPillTextColor = pillTextColor ?? baseColor

  const [menuOpen, setMenuOpen] = useState(false)
  const circleRefs    = useRef([])
  const tlRefs        = useRef([])
  const activeTweens  = useRef([])
  const hamburgerRef  = useRef(null)
  const mobileMenuRef = useRef(null)
  const navItemsRef   = useRef(null)

  useEffect(() => {
    function layout() {
      circleRefs.current.forEach((circle, i) => {
        if (!circle?.parentElement) return
        const pill   = circle.parentElement
        const rect   = pill.getBoundingClientRect()
        const { width: w, height: h } = rect
        const R      = ((w * w) / 4 + h * h) / (2 * h)
        const D      = Math.ceil(2 * R) + 2
        const delta  = Math.ceil(R - Math.sqrt(Math.max(0, R * R - (w * w) / 4))) + 1
        const originY = D - delta

        circle.style.width  = `${D}px`
        circle.style.height = `${D}px`
        circle.style.bottom = `-${delta}px`

        gsap.set(circle, { xPercent: -50, scale: 0, transformOrigin: `50% ${originY}px` })

        const label = pill.querySelector('.pill-label')
        const hover = pill.querySelector('.pill-label-hover')
        if (label) gsap.set(label, { y: 0 })
        if (hover) gsap.set(hover, { y: h + 12, opacity: 0 })

        tlRefs.current[i]?.kill()
        const tl = gsap.timeline({ paused: true })
        tl.to(circle, { scale: 1.2, xPercent: -50, duration: 2, ease, overwrite: 'auto' }, 0)
        if (label) tl.to(label, { y: -(h + 8), duration: 2, ease, overwrite: 'auto' }, 0)
        if (hover) {
          gsap.set(hover, { y: Math.ceil(h + 100), opacity: 0 })
          tl.to(hover, { y: 0, opacity: 1, duration: 2, ease, overwrite: 'auto' }, 0)
        }
        tlRefs.current[i] = tl
      })
    }

    layout()
    window.addEventListener('resize', layout)
    document.fonts?.ready?.then(layout)

    if (mobileMenuRef.current) {
      gsap.set(mobileMenuRef.current, { visibility: 'hidden', opacity: 0 })
    }

    return () => window.removeEventListener('resize', layout)
  }, [items, ease])

  function handleEnter(i) {
    const tl = tlRefs.current[i]
    if (!tl) return
    activeTweens.current[i]?.kill()
    activeTweens.current[i] = tl.tweenTo(tl.duration(), { duration: 0.3, ease, overwrite: 'auto' })
  }

  function handleLeave(i) {
    const tl = tlRefs.current[i]
    if (!tl) return
    activeTweens.current[i]?.kill()
    activeTweens.current[i] = tl.tweenTo(0, { duration: 0.2, ease, overwrite: 'auto' })
  }

  function toggleMobileMenu() {
    const next = !menuOpen
    setMenuOpen(next)
    const hamburger = hamburgerRef.current
    const menu      = mobileMenuRef.current

    if (hamburger) {
      const lines = hamburger.querySelectorAll('.hamburger-line')
      if (next) {
        gsap.to(lines[0], { rotation:  45, y:  3, duration: 0.3, ease })
        gsap.to(lines[1], { rotation: -45, y: -3, duration: 0.3, ease })
      } else {
        gsap.to(lines[0], { rotation: 0, y: 0, duration: 0.3, ease })
        gsap.to(lines[1], { rotation: 0, y: 0, duration: 0.3, ease })
      }
    }

    if (menu) {
      if (next) {
        gsap.set(menu, { visibility: 'visible' })
        gsap.fromTo(menu, { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.3, ease })
      } else {
        gsap.to(menu, {
          opacity: 0, y: 10, duration: 0.2, ease,
          onComplete: () => gsap.set(menu, { visibility: 'hidden' }),
        })
      }
    }
  }

  function handleSelect(key) {
    onSelect(key)
    setMenuOpen(false)
    const menu = mobileMenuRef.current
    if (menu) {
      gsap.to(menu, {
        opacity: 0, y: 10, duration: 0.2, ease,
        onComplete: () => gsap.set(menu, { visibility: 'hidden' }),
      })
    }
  }

  const cssVars = {
    '--base':       baseColor,
    '--pill-bg':    pillColor,
    '--hover-text': hoveredPillTextColor,
    '--pill-text':  resolvedPillTextColor,
  }

  return (
    <div className={`pill-nav-container ${className}`} style={{ position: 'relative' }}>
      <nav className="pill-nav" aria-label="Primary" style={cssVars}>

        {/* Desktop pill row */}
        <div className="pill-nav-items desktop-only" ref={navItemsRef}>
          <ul className="pill-list" role="menubar">
            {items.map((item, i) => (
              <li key={item.key} role="none">
                <button
                  role="menuitem"
                  className={`pill${activeKey === item.key ? ' is-active' : ''}`}
                  aria-label={item.label}
                  onClick={() => handleSelect(item.key)}
                  onMouseEnter={() => handleEnter(i)}
                  onMouseLeave={() => handleLeave(i)}
                >
                  <span
                    className="hover-circle"
                    aria-hidden="true"
                    ref={el => { circleRefs.current[i] = el }}
                  />
                  <span className="label-stack">
                    <span className="pill-label">{item.label}</span>
                    <span className="pill-label-hover" aria-hidden="true">{item.label}</span>
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </div>

        {/* Mobile hamburger */}
        <button
          className="mobile-menu-button mobile-only"
          onClick={toggleMobileMenu}
          aria-label="Toggle menu"
          ref={hamburgerRef}
          style={cssVars}
        >
          <span className="hamburger-line" />
          <span className="hamburger-line" />
        </button>
      </nav>

      {/* Mobile popover */}
      <div className="mobile-menu-popover mobile-only" ref={mobileMenuRef} style={cssVars}>
        <ul className="mobile-menu-list">
          {items.map(item => (
            <li key={item.key}>
              <button
                className={`mobile-menu-link${activeKey === item.key ? ' is-active' : ''}`}
                onClick={() => handleSelect(item.key)}
              >
                {item.label}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
