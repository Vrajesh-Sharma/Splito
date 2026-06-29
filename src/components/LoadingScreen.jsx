export default function LoadingScreen() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-bg gap-4">
      <div className="relative w-16 h-16">
        <div className="absolute inset-0 rounded-full border-2 border-cyan-500/20" />
        <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-cyan-500 animate-spin" />
        <div className="absolute inset-2 rounded-full bg-gradient-to-br from-cyan-500/20 to-teal-500/20 flex items-center justify-center">
          <span className="text-xl">⚡</span>
        </div>
      </div>
      <p className="text-text-muted text-sm animate-pulse">Loading Splito...</p>
    </div>
  )
}