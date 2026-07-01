import BaseModal from './BaseModal'
import Avatar from './Avatar'
import { ArrowRight, CheckCircle2, Sparkles } from 'lucide-react'

export default function SortOutModal({ isOpen, onClose, settlement }) {
  const { transactions = [], balances = {} } = settlement || {}

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title="Sort Out"
      subtitle="Who pays whom to settle all debts"
      size="lg"
    >
      <div className="flex flex-col gap-6">

        {/* Net balances */}
        <div>
          <h3 className="text-xs font-bold text-text-muted uppercase tracking-wider mb-3">
            Net Balances
          </h3>
          <div className="flex flex-col">
            {Object.entries(balances).map(([id, { name, net }]) => {
              const pos = net > 0.01
              const neg = net < -0.01
              return (
                <div
                  key={id}
                  className="flex items-center gap-3 py-3 border-b border-slate-200/20 last:border-0"
                >
                  <Avatar name={name} size="sm" />
                  <span className="flex-1 text-sm font-semibold text-text truncate">{name}</span>
                  <span className={`text-sm font-bold tabular-nums flex-shrink-0 ${pos ? 'text-primary' : neg ? 'text-danger' : 'text-text-muted'}`}>
                    {pos ? '+' : ''}₹{Math.abs(net).toFixed(2)}
                  </span>
                </div>
              )
            })}
          </div>
        </div>

        {/* Transactions */}
        {transactions.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-8 text-center rounded-2xl card-inset">
            <div className="w-14 h-14 rounded-full neu-extruded flex items-center justify-center bg-bg">
              <CheckCircle2 size={26} className="text-primary" />
            </div>
            <p className="font-bold text-text text-base flex items-center gap-1.5">
              All settled up! <Sparkles size={15} className="text-primary fill-primary" />
            </p>
            <p className="text-text-muted text-xs max-w-[28ch] mx-auto">
              No payments needed. Everyone is even.
            </p>
          </div>
        ) : (
          <div>
            <h3 className="text-xs font-bold text-text-muted uppercase tracking-wider mb-3">
              Payments to Make ({transactions.length})
            </h3>
            <div className="flex flex-col gap-3">
              {transactions.map((t, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 p-4 rounded-2xl neu-extruded bg-bg"
                >
                  <Avatar name={t.from} size="sm" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-text truncate">{t.from}</p>
                    <p className="text-[10px] text-text-muted uppercase font-medium mt-0.5">Pays</p>
                  </div>

                  <div className="flex flex-col items-center px-3 py-1.5 rounded-xl neu-inset min-w-[72px]">
                    <span className="text-primary font-extrabold text-xs tabular-nums">₹{t.amount}</span>
                    <ArrowRight size={11} className="text-primary mt-1" />
                  </div>

                  <div className="flex-1 min-w-0 text-right">
                    <p className="text-xs font-bold text-text truncate pl-2">{t.to}</p>
                    <p className="text-[10px] text-text-muted uppercase font-medium mt-0.5">Receives</p>
                  </div>
                  <Avatar name={t.to} size="sm" />
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </BaseModal>
  )
}