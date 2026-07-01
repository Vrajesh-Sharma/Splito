import { Utensils, Gamepad2, Plane, Fuel, ShoppingBag, Lightbulb, Package } from 'lucide-react'

const CATEGORIES = {
  food:          { label: 'Food',          icon: Utensils,    color: 'bg-orange-50 text-orange-700 border-orange-200/60' },
  entertainment: { label: 'Entertainment', icon: Gamepad2,    color: 'bg-purple-50 text-purple-700 border-purple-200/60' },
  travel:        { label: 'Travel',        icon: Plane,       color: 'bg-blue-50 text-blue-700 border-blue-200/60'       },
  fuel:          { label: 'Fuel',          icon: Fuel,        color: 'bg-amber-50 text-amber-700 border-amber-200/60'    },
  shopping:      { label: 'Shopping',      icon: ShoppingBag, color: 'bg-pink-50 text-pink-700 border-pink-200/60'       },
  utilities:     { label: 'Utilities',     icon: Lightbulb,   color: 'bg-teal-50 text-teal-700 border-teal-200/60'       },
  other:         { label: 'Other',         icon: Package,     color: 'bg-slate-100 text-slate-700 border-slate-200/60'   },
}

export { CATEGORIES }

export default function CategoryBadge({ category }) {
  const cat = CATEGORIES[category] ?? CATEGORIES.other
  const Icon = cat.icon
  return (
    <span className={`inline-flex items-center justify-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-extrabold border ${cat.color} shadow-[1px_1px_3px_rgba(0,0,0,0.05)] hover:scale-105 transition-all duration-200`}>
      <Icon size={12} className="flex-shrink-0" />
      <span className="whitespace-nowrap text-center leading-none">{cat.label}</span>
    </span>
  )
}