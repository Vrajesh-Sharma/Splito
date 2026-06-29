import { NavLink, useParams } from 'react-router-dom'
import { Home, Users, Plus } from 'lucide-react'

export default function BottomNav({ onAddExpense }) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-border"
      style={{ background: 'rgba(13,15,20,0.95)', backdropFilter: 'blur(20px)', paddingBottom: 'max(env(safe-area-inset-bottom), 12px)' }}>
      <div className="flex items-center justify-around max-w-lg mx-auto px-4 pt-2 pb-1">
        <NavLink to="/"
          className={({ isActive }) => `flex flex-col items-center gap-0.5 px-4 py-2 rounded-xl transition-all duration-200 min-w-[60px]
            ${isActive ? 'text-cyan-400' : 'text-text-muted hover:text-text'}`}>
          <Home size={20} />
          <span className="text-xs font-medium">Home</span>
        </NavLink>

        {onAddExpense && (
          <button onClick={onAddExpense}
            className="flex flex-col items-center gap-0.5 px-2 -mt-4">
            <div className="w-14 h-14 rounded-full bg-cyan-500 flex items-center justify-center shadow-[0_0_20px_rgba(34,211,238,0.4)] active:scale-95 transition-transform">
              <Plus size={24} className="text-bg" />
            </div>
            <span className="text-xs text-text-muted mt-1">Add</span>
          </button>
        )}

        <NavLink to="/groups"
          className={({ isActive }) => `flex flex-col items-center gap-0.5 px-4 py-2 rounded-xl transition-all duration-200 min-w-[60px]
            ${isActive ? 'text-cyan-400' : 'text-text-muted hover:text-text'}`}>
          <Users size={20} />
          <span className="text-xs font-medium">Groups</span>
        </NavLink>
      </div>
    </nav>
  )
}