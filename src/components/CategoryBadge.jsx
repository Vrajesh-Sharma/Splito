const CATEGORIES = {
  food:          { label: 'Food',          icon: '🍔', color: 'bg-orange-500/15 text-orange-400 border-orange-500/20' },
  entertainment: { label: 'Entertainment', icon: '🎮', color: 'bg-purple-500/15 text-purple-400 border-purple-500/20' },
  travel:        { label: 'Travel',        icon: '✈️', color: 'bg-blue-500/15 text-blue-400 border-blue-500/20'       },
  fuel:          { label: 'Fuel',          icon: '⛽', color: 'bg-yellow-500/15 text-yellow-400 border-yellow-500/20' },
  shopping:      { label: 'Shopping',      icon: '🛍️', color: 'bg-pink-500/15 text-pink-400 border-pink-500/20'       },
  utilities:     { label: 'Utilities',     icon: '💡', color: 'bg-teal-500/15 text-teal-400 border-teal-500/20'       },
  other:         { label: 'Other',         icon: '📦', color: 'bg-gray-500/15 text-gray-400 border-gray-500/20'       },
}

export { CATEGORIES }

export default function CategoryBadge({ category }) {
  const cat = CATEGORIES[category] ?? CATEGORIES.other
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border ${cat.color}`}>
      <span>{cat.icon}</span>
      {cat.label}
    </span>
  )
}