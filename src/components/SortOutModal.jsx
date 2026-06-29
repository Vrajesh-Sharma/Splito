import { motion, AnimatePresence } from 'framer-motion'
import { X, ArrowRight, CheckCircle2 } from 'lucide-react'
import Avatar from './Avatar'

export default function SortOutModal({ isOpen, onClose, settlement, members }) {
  const { transactions = [], balances = {} } = settlement || {}

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50" onClick={onClose} />

          <motion.div
            initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 z-50 glass-strong rounded-t-3xl max-h-[88vh] overflow-y-auto"
          >
            <div className="sticky top-0 glass-strong rounded-t-3xl px-5 pt-5 pb-3 flex items-center justify-between">
              <div>
                <h2 className="font-display font-bold text-lg text-text">Sort Out</h2>
                <p className="text-xs text-text-muted">Who pays whom to settle up</p>
              </div>
              <button onClick={onClose} className="btn-ghost p-2 rounded-full"><X size={20} /></button>
            </div>

            <div className="px-5 pb-10 space-y-5">
              {/* Net Balances */}
              <div className="card space-y-3">
                <h3 className="text-sm font-semibold text-text-muted uppercase tracking-wider">Net Balances</h3>
                {Object.entries(balances).map(([id, { name, net }]) => {
                  const isPositive = net > 0.01
                  const isNegative = net < -0.01
                  return (
                    <div key={id} className="flex items-center gap-3">
                      <Avatar name={name} size="sm" />
                      <span className="flex-1 text-sm text-text">{name}</span>
                      <span className={`text-sm font-semibold tabular-nums ${
                        isPositive ? 'text-emerald-400' : isNegative ? 'text-rose-400' : 'text-text-muted'
                      }`}>
                        {isPositive ? '+' : ''}{parseFloat(net).toFixed(2)}
                      </span>
                    </div>
                  )
                })}
              </div>

              {/* Transactions */}
              {transactions.length === 0 ? (
                <div className="flex flex-col items-center gap-3 py-8">
                  <CheckCircle2 size={40} className="text-emerald-400" />
                  <p className="text-text font-semibold">All settled up! 🎉</p>
                  <p className="text-text-muted text-sm text-center">No payments needed. Everyone is even.</p>
                </div>
              ) : (
                <div>
                  <h3 className="text-sm font-semibold text-text-muted uppercase tracking-wider mb-3">
                    Payments to Make ({transactions.length})
                  </h3>
                  <div className="space-y-3">
                    {transactions.map((t, i) => (
                      <motion.div key={i} initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.07 }}
                        className="flex items-center gap-3 p-4 rounded-2xl border border-border bg-surface2">
                        <Avatar name={t.from} size="sm" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-text font-medium truncate">{t.from}</p>
                          <p className="text-xs text-text-muted">pays</p>
                        </div>
                        <div className="flex flex-col items-center px-2">
                          <span className="text-cyan-400 font-bold text-sm tabular-nums">₹{t.amount}</span>
                          <ArrowRight size={14} className="text-cyan-400 mt-0.5" />
                        </div>
                        <div className="flex-1 min-w-0 flex flex-col items-end">
                          <p className="text-sm text-text font-medium truncate">{t.to}</p>
                          <p className="text-xs text-text-muted">receives</p>
                        </div>
                        <Avatar name={t.to} size="sm" />
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}