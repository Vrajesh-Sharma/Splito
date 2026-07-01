/**
 * Layout — Page shell with BottomNav + content area.
 * Uses inline styles for page padding to bypass Tailwind scan issues.
 */
import BottomNav from './BottomNav'

export default function Layout({ children, onAddExpense }) {
  return (
    <div className="min-h-screen bg-bg text-text">
      <BottomNav onAddExpense={onAddExpense} />

      {/* 
        Inline styles ensure padding always applies regardless of Tailwind scanning.
        Mobile: 24px H, 16px top, 96px bottom (clears bottom nav).
        Tablet+: handled by content-area CSS class for top clearance.
      */}
      <main
        className="app-container"
        style={{ paddingLeft: 24, paddingRight: 24 }}
      >
        <div className="content-area">
          {children}
        </div>
      </main>
    </div>
  )
}