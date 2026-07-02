import { useState, useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Copy, Users, Zap, Filter, Pencil, Trash2, Receipt, LayoutGrid, ChevronDown } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useGroups } from '../hooks/useGroups'
import { useMembers } from '../hooks/useMembers'
import { useExpenses } from '../hooks/useExpenses'
import Layout from '../components/Layout'
import Avatar from '../components/Avatar'
import CategoryBadge, { CATEGORIES } from '../components/CategoryBadge'
import ExpenseModal from '../components/ExpenseModal'
import SortOutModal from '../components/SortOutModal'
import { format } from 'date-fns'
import toast from 'react-hot-toast'
import { PageHeader, Card, PrimaryButton, SecondaryButton, Chip } from '../components/DesignSystem'

export default function GroupDetailPage() {
  const { id }   = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const { groups } = useGroups()
  const { members, loading: membersLoading } = useMembers(id)
  const {
    expenses, loading: expLoading, loadingMore, hasMore,
    addExpense, updateExpense, deleteExpense,
    calculateSettlement, loadMore,
  } = useExpenses(id)

  const group = groups.find(g => g.id === id)

  const [addOpen,     setAddOpen]     = useState(false)
  const [editExpense, setEditExpense] = useState(null)
  const [sortOpen,    setSortOpen]    = useState(false)
  const [filter,      setFilter]      = useState('all')
  const [settlement,  setSettlement]  = useState(null)

  // Per-member net balances
  const memberBalances = useMemo(() => {
    if (!members?.length) return {}
    const bals = Object.fromEntries(members.map(m => [m.id, 0]))
    expenses.forEach(exp => {
      if (bals[exp.paid_by] !== undefined) bals[exp.paid_by] += parseFloat(exp.amount || 0)
      exp.expense_splits?.forEach(s => {
        if (bals[s.user_id] !== undefined) bals[s.user_id] -= parseFloat(s.share_amount || 0)
      })
    })
    return bals
  }, [members, expenses])

  const filteredExpenses = filter === 'all' ? expenses : expenses.filter(e => e.category === filter)

  const totalSpent = expenses.reduce((s, e) => s + parseFloat(e.amount), 0)
  const mySpent    = expenses.filter(e => e.paid_by === user?.id).reduce((s, e) => s + parseFloat(e.amount), 0)

  function copyCode() {
    navigator.clipboard.writeText(group?.invite_code ?? '')
    toast.success('Code copied!')
  }

  function openSortOut() {
    setSettlement(calculateSettlement(members))
    setSortOpen(true)
  }

  // ── Group-not-found fallback 
  if (!group && groups.length > 0) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4 text-center">
          <p className="text-text-muted font-semibold">Group not found.</p>
          <SecondaryButton onClick={() => navigate('/groups')}>
            Back to Groups
          </SecondaryButton>
        </div>
      </Layout>
    )
  }

  return (
    <Layout onAddExpense={() => setAddOpen(true)}>
      <div className="animate-fade-up flex flex-col gap-6 md:gap-8">

        {/* ── Page Header ── */}
        <div className="flex flex-col gap-3">
          <PageHeader
            title={group?.name ?? 'Loading…'}
            onBack={() => navigate(-1)}
          />
          {/* Invite code pill */}
          <button
            onClick={copyCode}
            className="self-start inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl
                       neu-extruded text-[10px] font-bold text-text-muted hover:text-primary
                       font-mono tracking-wider uppercase active:shadow-neumorphic-inset
                       active:scale-95 transition-all duration-200 cursor-pointer bg-bg"
          >
            <Copy size={10} />
            <span>CODE: {group?.invite_code}</span>
          </button>
        </div>

        {/* ── 12-col dashboard grid ──
              Mobile      : single column
              ≥1024px (lg): 4 cols sidebar (stats + members) | 8 cols main (filter + ledger) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

          {/* ── LEFT SIDEBAR ── */}
          <div className="lg:col-span-4 flex flex-col gap-5">

            {/* Stats row — 3 equal cards */}
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: 'Total',    value: `₹${totalSpent.toFixed(0)}`, primary: false },
                { label: 'You Paid', value: `₹${mySpent.toFixed(0)}`,   primary: true  },
                { label: 'Members',  value: members.length,               primary: false },
              ].map((stat, i) => (
                <Card key={i} className="flex flex-col items-center justify-center text-center" style={{ padding: 16 }}>
                  <p className={`font-display font-black text-base tabular-nums leading-tight
                                 ${stat.primary ? 'text-primary' : 'text-text'}`}>
                    {stat.value}
                  </p>
                  <p className="text-[9px] font-bold text-text-muted uppercase tracking-wider" style={{ marginTop: 6 }}>
                    {stat.label}
                  </p>
                </Card>
              ))}
            </div>

            {/* Members card */}
            <Card style={{ padding: 24 }}>
              <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-200/30">
                <Users size={13} className="text-text-muted" />
                <span className="text-[10px] font-extrabold text-text-muted uppercase tracking-wider">
                  Members ({members.length})
                </span>
              </div>
              <div className="flex flex-col">
                {membersLoading
                  ? [1, 2, 3].map(i => (
                      <div key={i} className="flex items-center gap-3 py-2.5 border-b border-slate-200/20 last:border-0">
                        <div className="skeleton w-7 h-7 rounded-full" />
                        <div className="skeleton h-3 w-20 rounded" />
                        <div className="ml-auto skeleton h-3 w-12 rounded" />
                      </div>
                    ))
                  : members.map(m => {
                      const bal = memberBalances[m.id] || 0
                      const pos = bal > 0.01
                      const neg = bal < -0.01
                      return (
                        <div key={m.id} className="flex items-center gap-3 py-2.5 border-b border-slate-200/20 last:border-0">
                          <Avatar name={m.full_name} size="sm" />
                          <span className="text-sm font-semibold text-text truncate flex-1" title={m.full_name}>
                            {m.full_name}
                          </span>
                          <span className={`text-xs font-bold font-mono tabular-nums flex-shrink-0 ${pos ? 'text-primary' : neg ? 'text-danger' : 'text-text-muted'}`}>
                            {pos ? '+' : ''}₹{Math.abs(bal).toFixed(2)}
                          </span>
                        </div>
                      )
                    })
                }
              </div>
            </Card>

            {/* Settle Up CTA — sidebar on desktop only */}
            <div className="hidden lg:flex">
              <PrimaryButton onClick={openSortOut} className="w-full">
                <Zap size={15} className="fill-white flex-shrink-0" />
                <span>Sort Out Debt</span>
              </PrimaryButton>
            </div>

          </div>

          {/* ── RIGHT MAIN ── */}
          <div className="lg:col-span-8 flex flex-col gap-5">

            {/* Filter chips — horizontally scrollable, inset from page edges */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
              <div className="w-9 h-9 rounded-full neu-inset flex items-center justify-center text-text-muted flex-shrink-0 bg-bg">
                <Filter size={13} />
              </div>
              {[
                { key: 'all', label: 'All', icon: LayoutGrid },
                ...Object.entries(CATEGORIES).map(([k, c]) => ({ key: k, label: c.label, icon: c.icon })),
              ].map(item => {
                const Icon = item.icon
                return (
                  <Chip
                    key={item.key}
                    active={filter === item.key}
                    onClick={() => setFilter(item.key)}
                  >
                    <Icon size={12} />
                    {item.label}
                  </Chip>
                )
              })}
              {/* Trailing spacer so last chip isn't flush against scroll edge */}
              <span className="flex-shrink-0 w-1" />
            </div>

            {/* Ledger card */}
            <Card style={{ padding: 24 }}>
              {/* Card header */}
              <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-200/25">
                <h2 className="text-xs font-bold text-text uppercase tracking-wider">Ledger Entries</h2>
                <span className="text-[10px] font-bold text-text-muted px-2.5 py-1 rounded-full neu-extruded">
                  {filteredExpenses.length}{hasMore ? '+' : ''} item{filteredExpenses.length !== 1 ? 's' : ''}
                </span>
              </div>

              {/* Entries */}
              {expLoading ? (
                <div className="flex flex-col gap-4">
                  {[1, 2, 3].map(i => <div key={i} className="skeleton h-24 rounded-2xl" />)}
                </div>
              ) : filteredExpenses.length === 0 ? (
                <div className="flex flex-col items-center justify-center gap-4 py-12 text-center min-h-[200px]">
                  <div className="w-14 h-14 rounded-full neu-extruded flex items-center justify-center text-primary bg-bg">
                    <Receipt size={20} />
                  </div>
                  <div>
                    <p className="font-bold text-text text-sm">No expenses yet</p>
                    <p className="text-text-muted text-xs mt-1 max-w-[28ch] mx-auto">
                      Tap "+" in the nav bar to add your first expense.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col gap-4">
                  {filteredExpenses.map(exp => {
                    const isMine    = exp.paid_by === user?.id
                    const CatIcon   = CATEGORIES[exp.category]?.icon ?? CATEGORIES.other.icon
                    const dateLabel = exp.expense_date
                      ? format(new Date(exp.expense_date + 'T00:00:00'), 'dd MMM yyyy')
                      : format(new Date(exp.created_at), 'dd MMM yyyy')
                    const paidByName = isMine ? 'You' : exp.profiles?.full_name?.split(' ')[0] || 'Member'
                    const splitCount = exp.expense_splits?.length ?? 0

                    return (
                      <div
                        key={exp.id}
                        className="flex items-start gap-4 rounded-2xl neu-extruded bg-bg hover:-translate-y-0.5 transition-all duration-200"
                        style={{ padding: 20 }}
                      >
                        {/* Category icon */}
                        <div className="w-11 h-11 rounded-xl neu-inset flex items-center justify-center flex-shrink-0 bg-bg text-primary">
                          <CatIcon size={18} />
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <p className="font-extrabold text-text text-sm md:text-base leading-snug break-words">
                            {exp.title}
                          </p>
                          <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 mt-1.5 text-xs text-text-muted font-semibold leading-relaxed">
                            <span className="text-primary font-bold">• Paid by {paidByName}</span>
                            <span>• {splitCount} member{splitCount !== 1 ? 's' : ''}</span>
                            <span>• {dateLabel}</span>
                          </div>
                          {/* Category badge — small, inline */}
                          <div className="mt-2">
                            <CategoryBadge category={exp.category} />
                          </div>
                        </div>

                        {/* Amount + actions */}
                        <div className="flex flex-col items-end gap-2 flex-shrink-0">
                          <p className="font-black text-text text-base md:text-lg tabular-nums leading-none">
                            ₹{parseFloat(exp.amount).toFixed(2)}
                          </p>
                          {isMine && (
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => setEditExpense(exp)}
                                className="p-1.5 rounded-lg text-text-muted hover:text-primary transition-colors cursor-pointer"
                                title="Edit"
                              >
                                <Pencil size={13} />
                              </button>
                              <button
                                onClick={() => deleteExpense(exp.id)}
                                className="p-1.5 rounded-lg text-text-muted hover:text-danger transition-colors cursor-pointer"
                                title="Delete"
                              >
                                <Trash2 size={13} />
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    )
                  })}

                  {/* Load more */}
                  {hasMore && (
                    <SecondaryButton
                      onClick={loadMore}
                      disabled={loadingMore}
                      className="w-full gap-2"
                    >
                      {loadingMore
                        ? <><div className="w-3.5 h-3.5 rounded-full border-2 border-slate-400 border-t-primary animate-spin" />Loading…</>
                        : <><ChevronDown size={14} />Load 10 More</>
                      }
                    </SecondaryButton>
                  )}
                </div>
              )}
            </Card>

            {/* Settle Up CTA — below ledger on mobile */}
            <div className="lg:hidden">
              <PrimaryButton onClick={openSortOut} className="w-full">
                <Zap size={15} className="fill-white flex-shrink-0" />
                <span>Sort Out Debt</span>
              </PrimaryButton>
            </div>

          </div>
        </div>
      </div>

      {/* ── Modals ── */}
      <ExpenseModal
        isOpen={addOpen}
        onClose={() => setAddOpen(false)}
        groupId={id}
        members={members}
        onAdd={addExpense}
        onUpdate={updateExpense}
        expense={null}
      />

      <ExpenseModal
        isOpen={!!editExpense}
        onClose={() => setEditExpense(null)}
        groupId={id}
        members={members}
        onAdd={addExpense}
        onUpdate={updateExpense}
        expense={editExpense}
      />

      <SortOutModal
        isOpen={sortOpen}
        onClose={() => setSortOpen(false)}
        settlement={settlement}
        members={members}
      />
    </Layout>
  )
}