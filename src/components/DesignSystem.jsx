/**
 * DesignSystem.jsx — Reusable UI primitives only.
 * Layout (grids, columns, spacing) lives in each page directly.
 */

import { ArrowLeft, CalendarDays } from 'lucide-react'

// ─── PageHeader ──────────────────────────────────────────────────────────────
// Back button + title + optional subtitle + optional right action slot.
// Does NOT add any outer margin/padding — the page defines its own spacing.
export function PageHeader({ title, subtitle, onBack, action, children }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div className="flex items-start gap-3 min-w-0">
        {onBack && (
          <button
            onClick={onBack}
            className="mt-0.5 w-10 h-10 rounded-full neu-extruded flex items-center justify-center
                       text-text-muted hover:text-text active:shadow-neumorphic-inset active:scale-95
                       transition-all duration-200 cursor-pointer flex-shrink-0 bg-bg"
          >
            <ArrowLeft size={18} />
          </button>
        )}
        <div className="min-w-0">
          <h1 className="font-display font-extrabold text-2xl md:text-3xl text-text leading-tight tracking-tight">
            {title}
          </h1>
          {subtitle && (
            <p className="text-sm text-text-muted mt-1 font-medium">{subtitle}</p>
          )}
          {children}
        </div>
      </div>
      {action && <div className="flex-shrink-0 mt-0.5">{action}</div>}
    </div>
  )
}

// ─── Card ─────────────────────────────────────────────────────────────────────
// Raised neumorphic surface. Clickable variant becomes a <button>.
// Callers control width, padding, and height via className or style prop.
export function Card({ children, className = '', onClick, style, ...rest }) {
  const Tag = onClick ? 'button' : 'div'
  return (
    <Tag
      onClick={onClick}
      style={style}
      {...rest}
      className={`bg-bg rounded-2xl neu-extruded transition-all duration-200 text-left
        ${onClick
          ? 'cursor-pointer hover:-translate-y-0.5 hover:shadow-[8px_14px_22px_#c2cbd6,-8px_-8px_16px_#ffffff] active:shadow-neumorphic-inset active:scale-[0.98]'
          : ''
        } ${className}`}
    >
      {children}
    </Tag>
  )
}

// ─── Buttons ──────────────────────────────────────────────────────────────────
export function PrimaryButton({ children, className = '', ...props }) {
  return (
    <button
      {...props}
      className={`btn-primary font-bold text-sm tracking-wide ${className}`}
    >
      {children}
    </button>
  )
}

export function SecondaryButton({ children, className = '', ...props }) {
  return (
    <button
      {...props}
      className={`btn-secondary font-semibold text-sm ${className}`}
    >
      {children}
    </button>
  )
}

export function IconButton({ children, className = '', ...props }) {
  return (
    <button
      {...props}
      className={`w-10 h-10 rounded-full bg-bg text-text-muted hover:text-text
                  flex items-center justify-center neu-extruded
                  active:shadow-neumorphic-inset active:scale-95
                  transition-all duration-200 cursor-pointer ${className}`}
    >
      {children}
    </button>
  )
}

export function TextButton({ children, className = '', ...props }) {
  return (
    <button
      {...props}
      className={`inline-flex items-center gap-1 text-sm font-bold text-primary
                  hover:underline transition-all duration-200 cursor-pointer ${className}`}
    >
      {children}
    </button>
  )
}

// ─── Form Primitives ──────────────────────────────────────────────────────────
export function FormField({ label, helperText, error, children }) {
  return (
    <div className="flex flex-col gap-2">
      {label && (
        <label className="text-xs font-bold text-text-muted uppercase tracking-wider">
          {label}
        </label>
      )}
      {children}
      {helperText && (
        <p className="text-[11px] font-medium text-text-muted leading-relaxed mt-1.5 pl-0.5">
          {helperText}
        </p>
      )}
      {error && (
        <p className="text-xs text-danger font-semibold mt-1">{error}</p>
      )}
    </div>
  )
}

export function Input({ className = '', startIcon, ...props }) {
  return (
    <div className="relative">
      {startIcon && (
        <span
          className="absolute top-1/2 -translate-y-1/2 text-text-muted pointer-events-none flex items-center"
          style={{ left: 16 }}
        >
          {startIcon}
        </span>
      )}
      <input
        {...props}
        style={startIcon ? { paddingLeft: 44 } : undefined}
        className={`input-field ${className}`}
      />
    </div>
  )
}

export function Textarea({ className = '', ...props }) {
  return (
    <textarea
      {...props}
      className={`input-field resize-none leading-relaxed ${className}`}
    />
  )
}

export function DatePicker({ value, onChange, max, className = '', ...props }) {
  return (
    <div className="relative">
      <CalendarDays
        size={14}
        className="absolute top-1/2 -translate-y-1/2 text-text-muted pointer-events-none"
        style={{ left: 16 }}
      />
      <input
        type="date"
        value={value}
        onChange={onChange}
        max={max}
        className={`input-field ${className}`}
        style={{ paddingLeft: 44 }}
        {...props}
      />
    </div>
  )
}

// ─── Chip ─────────────────────────────────────────────────────────────────────
// Category / filter pill. Callers render them inside their own scroll container.
export function Chip({ children, active, className = '', ...props }) {
  return (
    <button
      type="button"
      {...props}
      style={{ padding: '9px 16px' }}
      className={`inline-flex items-center gap-1.5 rounded-full text-xs font-bold
                  whitespace-nowrap transition-all duration-200 cursor-pointer
                  ${active
                    ? 'bg-primary text-white shadow-[inset_2px_2px_4px_rgba(0,0,0,0.15)] scale-[0.98]'
                    : 'neu-extruded text-text-muted hover:text-text bg-bg active:shadow-neumorphic-inset active:scale-95'
                  } ${className}`}
    >
      {children}
    </button>
  )
}
