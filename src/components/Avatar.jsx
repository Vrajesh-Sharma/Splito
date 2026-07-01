const COLORS = [
  'from-lime-600 to-emerald-600',
  'from-sky-500 to-indigo-500',
  'from-amber-500 to-orange-600',
  'from-rose-500 to-pink-600',
  'from-purple-500 to-violet-600',
  'from-teal-500 to-emerald-600',
]

export default function Avatar({ name = '', size = 'md' }) {
  const initials = name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
  const colorIndex = name.charCodeAt(0) % COLORS.length
  const sizes = { 
    sm: 'w-7 h-7 text-[10px]', 
    md: 'w-9 h-9 text-xs', 
    lg: 'w-12 h-12 text-sm', 
    xl: 'w-16 h-16 text-lg' 
  }

  return (
    <div className={`${sizes[size]} rounded-full bg-gradient-to-br ${COLORS[colorIndex]}
                     flex items-center justify-center font-bold text-white flex-shrink-0 
                     shadow-[4px_4px_8px_#d1d9e6,-4px_-4px_8px_#ffffff] border-2 border-[#eef1f6]/60`}>
      {initials}
    </div>
  )
}