const COLORS = [
  'from-cyan-500 to-teal-500',
  'from-purple-500 to-pink-500',
  'from-orange-500 to-amber-500',
  'from-green-500 to-emerald-500',
  'from-blue-500 to-indigo-500',
  'from-rose-500 to-pink-500',
]

export default function Avatar({ name = '', size = 'md' }) {
  const initials = name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
  const colorIndex = name.charCodeAt(0) % COLORS.length
  const sizes = { sm: 'w-7 h-7 text-xs', md: 'w-9 h-9 text-sm', lg: 'w-12 h-12 text-base', xl: 'w-16 h-16 text-xl' }

  return (
    <div className={`${sizes[size]} rounded-full bg-gradient-to-br ${COLORS[colorIndex]}
                     flex items-center justify-center font-bold text-white flex-shrink-0`}>
      {initials}
    </div>
  )
}