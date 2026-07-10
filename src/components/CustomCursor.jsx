import { useEffect, useState, useRef } from 'react'

export default function CustomCursor() {
  const cursorRef = useRef(null)
  const dotRef = useRef(null)
  const [isHovered, setIsHovered] = useState(false)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    // Check if device supports fine pointer (mouse)
    const mediaQuery = window.matchMedia('(pointer: fine)')
    if (!mediaQuery.matches) return

    const cursor = cursorRef.current
    const dot = dotRef.current

    let reqId
    let mouseX = -100
    let mouseY = -100
    let currentX = -100
    let currentY = -100
    let hasMoved = false

    const handleMouseMove = (e) => {
      mouseX = e.clientX
      mouseY = e.clientY
      
      if (!hasMoved) {
        currentX = mouseX
        currentY = mouseY
        hasMoved = true
      }
      
      if (!isVisible) setIsVisible(true)
    }

    const updatePosition = () => {
      if (cursor && mouseX !== -100) {
        // Instant position for the pointer arrow (offset slightly for cursor hotspot)
        cursor.style.transform = `translate3d(${mouseX}px, ${mouseY}px, 0)`
        cursor.style.opacity = '1'
      }

      if (dot && mouseX !== -100) {
        // Smooth trailing lag for the trailing dot/ring
        const dx = mouseX - currentX
        const dy = mouseY - currentY
        currentX += dx * 0.15
        currentY += dy * 0.15
        dot.style.transform = `translate3d(${currentX}px, ${currentY}px, 0)`
        dot.style.opacity = '1'
      }

      reqId = requestAnimationFrame(updatePosition)
    }

    reqId = requestAnimationFrame(updatePosition)

    const handleMouseLeave = () => {
      setIsVisible(false)
      if (cursor) cursor.style.opacity = '0'
      if (dot) dot.style.opacity = '0'
    }

    const handleMouseEnter = () => {
      setIsVisible(true)
    }

    const handleMouseOver = (e) => {
      const target = e.target
      if (!target) return
      
      const isInteractive = target.closest('button, a, input, select, textarea, [role="button"], .interactive-card, .btn-primary, .btn-secondary, .btn-icon')
      setIsHovered(!!isInteractive)
    }

    window.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseleave', handleMouseLeave)
    document.addEventListener('mouseenter', handleMouseEnter)
    document.addEventListener('mouseover', handleMouseOver)

    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseleave', handleMouseLeave)
      document.removeEventListener('mouseenter', handleMouseEnter)
      document.removeEventListener('mouseover', handleMouseOver)
      cancelAnimationFrame(reqId)
    }
  }, [isVisible])

  return (
    <>
      {/* 1. Main Green Arrow Pointer (follows mouse instantly) */}
      <div
        ref={cursorRef}
        className="fixed top-0 left-0 pointer-events-none z-[99999] opacity-0 transition-opacity duration-200 hidden md:block"
        style={{
          left: 0,
          top: 0,
        }}
      >
        <svg 
          width="24" 
          height="24" 
          viewBox="0 0 24 24" 
          fill="none" 
          className={`drop-shadow-[0_2px_4px_rgba(101,163,13,0.3)] transition-transform duration-200
            ${isHovered ? 'scale-110 rotate-12' : 'scale-100'}`}
        >
          <path 
            d="M4.5 3V17.25L9 12.75L13.5 21L16.5 19.5L12 11.25H18L4.5 3Z" 
            fill="#65a30d" 
            stroke="white" 
            strokeWidth="1.5" 
            strokeLinejoin="round"
          />
        </svg>
      </div>

      {/* 2. Trailing Ring (lags behind for smooth flow, expands on hover) */}
      <div
        ref={dotRef}
        className={`fixed top-0 left-0 pointer-events-none z-[99998] opacity-0 rounded-full border border-[#65a30d]/30 -translate-x-1/2 -translate-y-1/2 transition-all duration-300 ease-out hidden md:block
          ${isHovered 
            ? 'w-10 h-10 bg-[#65a30d]/10 border-[#65a30d]/40 shadow-[0_0_12px_rgba(101,163,13,0.2)]' 
            : 'w-6 h-6 bg-transparent'
          }`}
        style={{
          left: 0,
          top: 0,
          transition: 'width 0.2s ease, height 0.2s ease, background-color 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease',
        }}
      />
    </>
  )
}
