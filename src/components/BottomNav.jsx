import { NavLink } from 'react-router-dom'
import { Home, Users, Plus, Zap, LogOut } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import Avatar from './Avatar'

export default function BottomNav({ onAddExpense }) {
  const { profile, signOut } = useAuth()

  return (
    <nav
      className="fixed left-1/2 -translate-x-1/2 z-40 
                  bottom-4 md:bottom-auto
                  md:top-5 lg:top-6 xl:top-7
                  w-[calc(100%-32px)] md:w-[calc(100%-48px)] lg:w-[calc(100%-64px)] xl:w-[calc(100%-80px)]
                  max-w-[1600px] app-navbar-pad
                  rounded-3xl md:rounded-2xl neu-extruded bg-bg backdrop-blur-md flex items-center justify-between border-none md:shadow-neumorphic-extruded"
    >

      {/* Brand logo - Left (Desktop only) */}
      <div className="hidden md:flex items-center gap-2">
        <div className="w-9 h-9 rounded-xl neu-extruded flex items-center justify-center bg-bg">
          <Zap size={16} className="text-primary fill-primary" />
        </div>
        <span className="font-display font-extrabold text-lg text-gradient">Splito</span>
      </div>

      {/* Navigation links - Center */}
      <div className="flex items-center justify-around w-full md:w-auto md:gap-6">
        {/* Home */}
        <NavLink
          to="/"
          className={({ isActive }) => `flex flex-col items-center justify-center gap-0.5 px-4 py-2 rounded-2xl transition-all duration-200 min-w-[70px] min-h-[48px]
            md:flex-row md:min-h-[42px] md:min-w-[125px] md:gap-2.5 md:px-5 md:py-2.5
            ${isActive
              ? 'shadow-neumorphic-inset text-primary font-extrabold'
              : 'text-text-muted hover:text-text hover:shadow-neumorphic-inset active:scale-95 font-bold'}`}
        >
          <Home size={18} />
          <span className="text-[10px] md:text-sm">Home</span>
        </NavLink>

        {/* Floating Add Button for Mobile */}
        {onAddExpense && (
          <button
            onClick={onAddExpense}
            className="flex flex-col items-center justify-center md:hidden active:scale-95 transition-transform"
            aria-label="Add Expense"
          >
            <div className="w-12 h-12 rounded-full bg-bg flex items-center justify-center shadow-neumorphic-extruded active:shadow-neumorphic-inset text-primary">
              <Plus size={22} strokeWidth={3} />
            </div>
          </button>
        )}

        {/* Groups */}
        <NavLink
          to="/groups"
          className={({ isActive }) => `flex flex-col items-center justify-center gap-0.5 px-4 py-2 rounded-2xl transition-all duration-200 min-w-[70px] min-h-[48px]
            md:flex-row md:min-h-[42px] md:min-w-[125px] md:gap-2.5 md:px-5 md:py-2.5
            ${isActive
              ? 'shadow-neumorphic-inset text-primary font-extrabold'
              : 'text-text-muted hover:text-text hover:shadow-neumorphic-inset active:scale-95 font-bold'}`}
        >
          <Users size={18} />
          <span className="text-[10px] md:text-sm">Groups</span>
        </NavLink>
      </div>

      {/* User Controls & Add Expense CTA - Right (Desktop only) */}
      <div className="hidden md:flex items-center gap-4">
        {onAddExpense && (
          <button
            onClick={onAddExpense}
            className="flex items-center gap-2 rounded-xl text-primary font-bold text-sm neu-extruded active:shadow-neumorphic-inset active:scale-95 transition-all duration-200 cursor-pointer"
            style={{ padding: '10px 20px' }}
          >
            <Plus size={16} strokeWidth={2.5} />
            <span>Add Expense</span>
          </button>
        )}

        <div className="w-px h-6 bg-slate-200/50" />

        <div className="flex items-center gap-3">
          <div className="hover:scale-105 transition-transform duration-200 ease-out cursor-pointer" title={profile?.full_name ?? 'Profile'}>
            <Avatar name={profile?.full_name ?? ''} size="md" />
          </div>
          <button
            onClick={signOut}
            className="w-9 h-9 rounded-xl neu-extruded flex items-center justify-center text-text-muted hover:text-danger active:shadow-neumorphic-inset active:scale-95 transition-all duration-200 cursor-pointer bg-bg"
            title="Sign out"
          >
            <LogOut size={14} />
          </button>
        </div>
      </div>

    </nav>
  )
}