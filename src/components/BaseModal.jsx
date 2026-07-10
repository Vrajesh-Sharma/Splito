/**
 * BaseModal — Header → Body → Footer.
 * Uses inline styles for critical padding so no Tailwind scan is needed.
 */
import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'

export default function BaseModal({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  footer,
  size = 'lg',
}) {
  const maxW = size === 'md' ? 'max-w-[480px]' : 'max-w-[640px]'

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40 bg-slate-900/30 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Positioner */}
          <div
            className="fixed inset-0 z-50 flex items-end justify-center md:items-center pointer-events-none"
            style={{ padding: '0 20px 20px' }}
          >
            <motion.div
              key="modal"
              initial={{ y: 56, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 56, opacity: 0 }}
              transition={{ type: 'spring', damping: 30, stiffness: 340 }}
              className={`pointer-events-auto w-full ${maxW} bg-bg rounded-3xl flex flex-col`}
              style={{
                maxHeight: '88dvh',
                boxShadow: '0 20px 60px rgba(0,0,0,0.16), 8px 8px 24px #d1d9e6, -8px -8px 24px rgba(255, 255, 255, 0.65)',
              }}
            >
              {/* ── Header ── */}
              <div
                className="flex items-start justify-between gap-4 flex-shrink-0"
                style={{ padding: '28px 28px 20px' }}
              >
                <div className="min-w-0 flex-1">
                  <h2 className="font-display font-extrabold text-xl text-text leading-tight">
                    {title}
                  </h2>
                  {subtitle && (
                    <p className="text-xs text-text-muted font-medium leading-relaxed" style={{ marginTop: 8 }}>
                      {subtitle}
                    </p>
                  )}
                </div>
                <button
                  onClick={onClose}
                  className="flex-shrink-0 w-9 h-9 rounded-full neu-extruded flex items-center justify-center text-text-muted hover:text-text active:shadow-neumorphic-inset active:scale-95 transition-all duration-200 cursor-pointer bg-bg"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Divider */}
              <div
                className="flex-shrink-0 bg-slate-200/60"
                style={{ height: 1, margin: '0 28px' }}
              />

              {/* ── Body — scrolls ── */}
              <div
                className="overflow-y-auto overscroll-contain flex-1 min-h-0"
                style={{ padding: '24px 28px' }}
              >
                {children}
              </div>

              {/* ── Footer ── */}
              {footer && (
                <div className="flex-shrink-0">
                  <div
                    className="bg-slate-200/60"
                    style={{ height: 1, margin: '0 28px' }}
                  />
                  <div style={{ padding: '24px 28px 28px' }}>
                    {footer}
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  )
}
