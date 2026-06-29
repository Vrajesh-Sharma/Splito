import BottomNav from './BottomNav'

export default function Layout({ children, onAddExpense }) {
  return (
    <div className="min-h-screen bg-bg">
      <main className="max-w-lg mx-auto pb-28 min-h-screen">
        {children}
      </main>
      <BottomNav onAddExpense={onAddExpense} />
    </div>
  )
}