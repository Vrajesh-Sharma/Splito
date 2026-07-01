import { Zap } from 'lucide-react'

export default function LoadingScreen() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-bg gap-4">
      <div className="w-20 h-20 rounded-full neu-extruded flex items-center justify-center relative">
        <div className="absolute inset-2 rounded-full neu-inset flex items-center justify-center">
          <Zap size={24} className="text-primary animate-pulse" />
        </div>
      </div>
      <p className="text-text-muted text-sm font-semibold tracking-wide animate-pulse">Loading Splito...</p>
    </div>
  )
}