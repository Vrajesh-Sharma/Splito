import { useState } from 'react'

const COLORS = [
  'from-lime-600 to-emerald-600',
  'from-sky-500 to-indigo-500',
  'from-amber-500 to-orange-600',
  'from-rose-500 to-pink-600',
  'from-purple-500 to-violet-600',
  'from-teal-500 to-emerald-600',
]

export default function Avatar({ name = '', url = null, size = 'md' }) {
  const initials = name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
  const colorIndex = name.charCodeAt(0) % COLORS.length
  const sizes = { 
    sm: 'w-7 h-7 text-[10px]', 
    md: 'w-9 h-9 text-xs', 
    lg: 'w-12 h-12 text-sm', 
    xl: 'w-16 h-16 text-lg' 
  }

  const rounded = {
    sm: 'rounded-lg',
    md: 'rounded-xl',
    lg: 'rounded-xl',
    xl: 'rounded-2xl'
  }

  const [imgError, setImgError] = useState(false)
  const avatarUrl = url || `https://api.dicebear.com/10.x/fun-emoji/svg?seed=${encodeURIComponent(name.trim() || 'default')}`

  return (
    <div className={`${sizes[size]} ${rounded[size]} bg-white flex items-center justify-center font-bold text-text-muted flex-shrink-0 
                     shadow-[4px_4px_8px_#d1d9e6,-4px_-4px_8px_rgba(255,255,255,0.65)] border-2 border-[#eef1f6]/60 overflow-hidden`}>
      {!imgError && avatarUrl ? (
        <img 
          src={avatarUrl} 
          alt={name} 
          className="w-full h-full object-cover"
          onError={() => setImgError(true)}
        />
      ) : (
        <div className={`w-full h-full bg-gradient-to-br ${COLORS[colorIndex]} text-white flex items-center justify-center`}>
          {initials}
        </div>
      )}
    </div>
  )
}