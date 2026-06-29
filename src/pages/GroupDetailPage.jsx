import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, Copy, Users, Zap, Filter, ChevronDown } from 'lucide-react'
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

  const [addOpen,      setAddOpen]      = useState(false)
  const [editExpense,  setEditExpense]  = useState(null)  // expense object being edited
  const [sortOpen,     setSortOpen]     = useState(false)
  const [filter,       setFilter]       = useState('all')
  const [settlement,   setSettlement]   = useState(null)

  const filteredExpenses = filter === 'all'
    ? expenses
    : expenses.filter(e => e.category === filter)

  function copyCode() {
    navigator.clipboard.writeText(group?.invite_code ?? '')
    toast.success('Code copied!')
  }

  function openSortOut() {
    setSettlement(calculateSettlement(members))
    setSortOpen(true)
  }

  const totalSpent = expenses.reduce((sum, e) => sum + parseFloat(e.amount), 0)
  const mySpent    = expenses
    .filter(e => e.paid_by === user?.id)
    .reduce((sum, e) => sum + parseFloat(e.amount), 0)

  if (!group && groups.length > 0) {
    return (
      <Layout>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', gap: '1rem' }}>
          <p style={{ color: '#718096' }}>Group not found.</p>
          <button onClick={() => navigate('/groups')} className="btn-secondary">Back to Groups</button>
        </div>
      </Layout>
    )
  }

  return (
    <>
      <Layout onAddExpense={() => setAddOpen(true)}>
        <div className="px-5 pt-10 pb-6">

          {/* ── Header ── */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
            <button onClick={() => navigate(-1)} style={{
              background: 'none', border: 'none', cursor: 'pointer', color: '#718096',
              padding: '0.5rem', borderRadius: '0.75rem', display: 'flex', alignItems: 'center',
              marginLeft: '-0.5rem', transition: 'color 0.2s',
            }}
              onMouseEnter={e => e.currentTarget.style.color = '#e2e8f0'}
              onMouseLeave={e => e.currentTarget.style.color = '#718096'}
            >
              <ArrowLeft size={20} />
            </button>
            <div style={{ flex: 1, minWidth: 0 }}>
              <h1 style={{
                fontFamily: "'Cabinet Grotesk', sans-serif", fontWeight: 700,
                fontSize: '1.25rem', color: '#e2e8f0',
                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
              }}>
                {group?.name ?? '...'}
              </h1>
              <button onClick={copyCode} style={{
                display: 'flex', alignItems: 'center', gap: '0.375rem',
                background: 'none', border: 'none', cursor: 'pointer',
                color: '#718096', fontSize: '0.75rem', marginTop: '0.125rem',
                padding: 0, transition: 'color 0.2s',
              }}
                onMouseEnter={e => e.currentTarget.style.color = '#22d3ee'}
                onMouseLeave={e => e.currentTarget.style.color = '#718096'}
              >
                <span style={{ fontFamily: 'monospace', letterSpacing: '0.05em' }}>{group?.invite_code}</span>
                <Copy size={11} />
              </button>
            </div>
          </div>

          {/* ── Stats ── */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '0.75rem', marginBottom: '1.5rem' }}>
            {[
              { label: 'Total Spent', value: `₹${totalSpent.toFixed(0)}`, color: '#22d3ee' },
              { label: 'You Paid',    value: `₹${mySpent.toFixed(0)}`,    color: '#2dd4bf' },
              { label: 'Members',     value: members.length,               color: '#a78bfa' },
            ].map((stat, i) => (
              <motion.div key={i}
                initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.07 }}
                style={{
                  backgroundColor: '#131720', borderRadius: '1rem', border: '1px solid #1e2535',
                  padding: '1rem 0.5rem', textAlign: 'center', boxShadow: '0 4px 24px rgba(0,0,0,0.4)',
                }}>
                <p style={{ fontFamily: "'Cabinet Grotesk',sans-serif", fontWeight: 700, fontSize: '1.25rem', color: stat.color, fontVariantNumeric: 'tabular-nums' }}>
                  {stat.value}
                </p>
                <p style={{ fontSize: '0.6875rem', color: '#718096', marginTop: '0.125rem', lineHeight: 1.3 }}>{stat.label}</p>
              </motion.div>
            ))}
          </div>

          {/* ── Members ── */}
          <div style={{
            backgroundColor: '#131720', borderRadius: '1rem', border: '1px solid #1e2535',
            padding: '1.25rem', boxShadow: '0 4px 24px rgba(0,0,0,0.4)', marginBottom: '1.25rem',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
              <Users size={15} color="#718096" />
              <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#718096', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Members</span>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
              {membersLoading
                ? [1,2,3].map(i => <div key={i} className="skeleton" style={{ width: '2.25rem', height: '2.25rem', borderRadius: '9999px' }} />)
                : members.map(m => (
                    <div key={m.id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.25rem' }}>
                      <Avatar name={m.full_name} size="md" />
                      <span style={{ fontSize: '0.6875rem', color: '#718096', maxWidth: '3rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', textAlign: 'center' }}>
                        {m.full_name.split(' ')[0]}
                      </span>
                    </div>
                  ))
              }
            </div>
          </div>

          {/* ── Filter chips ── */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', overflowX: 'auto', marginBottom: '1rem', paddingBottom: '0.25rem', scrollbarWidth: 'none' }}>
            <Filter size={13} color="#718096" style={{ flexShrink: 0 }} />
            {[{ key: 'all', label: 'All', icon: null }, ...Object.entries(CATEGORIES).map(([key, cat]) => ({ key, label: cat.label, icon: cat.icon }))].map(item => (
              <button key={item.key} onClick={() => setFilter(item.key)}
                style={{
                  flexShrink: 0, display: 'flex', alignItems: 'center', gap: '0.25rem',
                  padding: '0.375rem 0.75rem', borderRadius: '9999px',
                  fontSize: '0.75rem', fontWeight: 500, cursor: 'pointer', border: 'none',
                  transition: 'all 0.15s',
                  background: filter === item.key ? 'rgba(34,211,238,0.15)' : '#181d28',
                  color:      filter === item.key ? '#22d3ee' : '#718096',
                  boxShadow:  filter === item.key ? 'inset 0 0 0 1px rgba(34,211,238,0.4)' : 'inset 0 0 0 1px #1e2535',
                }}>
                {item.icon && <span>{item.icon}</span>}
                {item.label}
              </button>
            ))}
          </div>

          {/* ── Expenses Table ── */}
          <div style={{
            backgroundColor: '#131720', borderRadius: '1rem', border: '1px solid #1e2535',
            overflow: 'hidden', boxShadow: '0 4px 24px rgba(0,0,0,0.4)', marginBottom: '1.25rem',
          }}>
            {/* Table header */}
            <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid #1e2535', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <h2 style={{ fontSize: '0.875rem', fontWeight: 600, color: '#e2e8f0' }}>Expenses</h2>
              <span style={{ fontSize: '0.75rem', color: '#718096', background: '#181d28', border: '1px solid #1e2535', borderRadius: '9999px', padding: '0.125rem 0.625rem' }}>
                {filteredExpenses.length}{hasMore ? '+' : ''}
              </span>
            </div>

            {expLoading ? (
              <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {[1,2,3].map(i => <div key={i} className="skeleton" style={{ height: '5rem', borderRadius: '0.75rem' }} />)}
              </div>

            ) : filteredExpenses.length === 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', padding: '3rem 1.25rem', textAlign: 'center' }}>
                <span style={{ fontSize: '2rem' }}>💸</span>
                <p style={{ fontWeight: 600, color: '#e2e8f0', fontSize: '0.875rem' }}>No expenses yet</p>
                <p style={{ color: '#718096', fontSize: '0.75rem' }}>Tap the + button to add your first expense.</p>
              </div>

            ) : (
              <>
                {filteredExpenses.map((exp, i) => {
                  const splitNames  = exp.expense_splits?.map(s => s.profiles?.full_name?.split(' ')[0]).join(', ')
                  const isMyExpense = exp.paid_by === user?.id
                  const dateLabel   = exp.expense_date
                    ? format(new Date(exp.expense_date + 'T00:00:00'), 'dd MMM yyyy')
                    : format(new Date(exp.created_at), 'dd MMM yyyy')

                  return (
                    <motion.div key={exp.id}
                      initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }}
                      style={{ borderBottom: i < filteredExpenses.length - 1 ? '1px solid #1e2535' : 'none' }}
                    >
                      <div
                        style={{ padding: '1rem 1.25rem', display: 'flex', alignItems: 'flex-start', gap: '0.75rem', transition: 'background 0.15s' }}
                        onMouseEnter={e => e.currentTarget.style.background = '#181d28'}
                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                      >
                        {/* Icon */}
                        <div style={{
                          width: '2.5rem', height: '2.5rem', borderRadius: '0.625rem',
                          backgroundColor: '#181d28', border: '1px solid #1e2535',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: '1.125rem', flexShrink: 0,
                        }}>
                          {CATEGORIES[exp.category]?.icon ?? '📦'}
                        </div>

                        {/* Content */}
                        <div style={{ flex: 1, minWidth: 0 }}>

                          {/* Row 1: Title + Amount */}
                          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '0.5rem', marginBottom: '0.25rem' }}>
                            <p style={{ fontWeight: 600, color: '#e2e8f0', fontSize: '0.9375rem', wordBreak: 'break-word', lineHeight: 1.3 }}>
                              {exp.title}
                            </p>
                            <p style={{ fontWeight: 700, color: '#e2e8f0', fontSize: '0.9375rem', flexShrink: 0, fontVariantNumeric: 'tabular-nums' }}>
                              ₹{parseFloat(exp.amount).toFixed(2)}
                            </p>
                          </div>

                          {/* Row 2: Paid by + badge */}
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.25rem' }}>
                            <span style={{ fontSize: '0.75rem', fontWeight: 500, color: isMyExpense ? '#22d3ee' : '#718096' }}>
                              {isMyExpense ? '⚡ You paid' : `${exp.profiles?.full_name?.split(' ')[0]} paid`}
                            </span>
                            <CategoryBadge category={exp.category} />
                          </div>

                          {/* Row 3: Split */}
                          {splitNames && (
                            <p style={{ fontSize: '0.6875rem', color: '#4a5568', marginBottom: '0.3rem' }}>
                              Split: {splitNames}
                            </p>
                          )}

                          {/* Row 4: Date + Actions */}
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem', marginTop: '0.25rem' }}>
                            {/* Date pill */}
                            <span style={{
                              display: 'inline-flex', alignItems: 'center', gap: '0.25rem',
                              fontSize: '0.6875rem', color: '#718096',
                              background: '#181d28', border: '1px solid #1e2535',
                              borderRadius: '9999px', padding: '0.125rem 0.625rem',
                              fontVariantNumeric: 'tabular-nums',
                            }}>
                              📅 {dateLabel}
                            </span>

                            {/* Edit + Delete — only for own expenses */}
                            {isMyExpense && (
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                {/* Edit */}
                                <button
                                  onClick={() => setEditExpense(exp)}
                                  style={{
                                    background: 'none', border: 'none', cursor: 'pointer',
                                    color: 'rgba(34,211,238,0.5)', fontSize: '0.6875rem',
                                    fontWeight: 500, padding: '0.125rem 0.5rem',
                                    borderRadius: '0.375rem', transition: 'all 0.15s',
                                    display: 'flex', alignItems: 'center', gap: '0.25rem',
                                  }}
                                  onMouseEnter={e => {
                                    e.currentTarget.style.color = '#22d3ee'
                                    e.currentTarget.style.background = 'rgba(34,211,238,0.08)'
                                  }}
                                  onMouseLeave={e => {
                                    e.currentTarget.style.color = 'rgba(34,211,238,0.5)'
                                    e.currentTarget.style.background = 'none'
                                  }}
                                  title="Edit expense"
                                >
                                  ✏️ Edit
                                </button>

                                {/* Divider */}
                                <span style={{ color: '#1e2535', fontSize: '0.75rem' }}>|</span>

                                {/* Delete */}
                                <button
                                  onClick={() => deleteExpense(exp.id)}
                                  style={{
                                    background: 'none', border: 'none', cursor: 'pointer',
                                    color: 'rgba(244,63,94,0.45)', fontSize: '0.6875rem',
                                    fontWeight: 500, padding: '0.125rem 0.5rem',
                                    borderRadius: '0.375rem', transition: 'all 0.15s',
                                    display: 'flex', alignItems: 'center', gap: '0.25rem',
                                  }}
                                  onMouseEnter={e => {
                                    e.currentTarget.style.color = '#f43f5e'
                                    e.currentTarget.style.background = 'rgba(244,63,94,0.08)'
                                  }}
                                  onMouseLeave={e => {
                                    e.currentTarget.style.color = 'rgba(244,63,94,0.45)'
                                    e.currentTarget.style.background = 'none'
                                  }}
                                  title="Delete expense"
                                >
                                  ✕ Delete
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )
                })}

                {/* ── Load More ── */}
                {hasMore && (
                  <div style={{ padding: '0.875rem 1.25rem', borderTop: '1px solid #1e2535' }}>
                    <button
                      onClick={loadMore}
                      disabled={loadingMore}
                      style={{
                        width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        gap: '0.5rem', padding: '0.625rem',
                        background: 'none', border: '1px solid #1e2535',
                        borderRadius: '0.75rem', cursor: loadingMore ? 'not-allowed' : 'pointer',
                        color: loadingMore ? '#4a5568' : '#718096',
                        fontSize: '0.8125rem', fontWeight: 500,
                        transition: 'all 0.15s',
                      }}
                      onMouseEnter={e => {
                        if (!loadingMore) {
                          e.currentTarget.style.color       = '#22d3ee'
                          e.currentTarget.style.borderColor = 'rgba(34,211,238,0.3)'
                          e.currentTarget.style.background  = 'rgba(34,211,238,0.05)'
                        }
                      }}
                      onMouseLeave={e => {
                        e.currentTarget.style.color       = '#718096'
                        e.currentTarget.style.borderColor = '#1e2535'
                        e.currentTarget.style.background  = 'none'
                      }}
                    >
                      {loadingMore ? (
                        <>
                          <div style={{
                            width: '14px', height: '14px', borderRadius: '9999px',
                            border: '2px solid #4a5568', borderTopColor: '#22d3ee',
                            animation: 'spin 0.7s linear infinite',
                          }} />
                          Loading...
                        </>
                      ) : (
                        <>
                          <ChevronDown size={15} />
                          Load 10 more
                        </>
                      )}
                    </button>
                  </div>
                )}
              </>
            )}
          </div>

          {/* ── Sort Out ── */}
          <button onClick={openSortOut}
            style={{
              width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center',
              gap: '0.5rem', padding: '1rem', borderRadius: '1rem',
              fontWeight: 700, fontSize: '0.9375rem', letterSpacing: '0.05em',
              cursor: 'pointer', border: '1px solid rgba(34,211,238,0.35)',
              background: 'linear-gradient(135deg, rgba(34,211,238,0.1) 0%, rgba(45,212,191,0.1) 100%)',
              color: '#22d3ee', transition: 'all 0.2s', boxShadow: '0 0 20px rgba(34,211,238,0.08)',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background  = 'linear-gradient(135deg, rgba(34,211,238,0.2) 0%, rgba(45,212,191,0.2) 100%)'
              e.currentTarget.style.borderColor = 'rgba(34,211,238,0.6)'
              e.currentTarget.style.boxShadow   = '0 0 28px rgba(34,211,238,0.18)'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background  = 'linear-gradient(135deg, rgba(34,211,238,0.1) 0%, rgba(45,212,191,0.1) 100%)'
              e.currentTarget.style.borderColor = 'rgba(34,211,238,0.35)'
              e.currentTarget.style.boxShadow   = '0 0 20px rgba(34,211,238,0.08)'
            }}
            onMouseDown={e => e.currentTarget.style.transform = 'scale(0.98)'}
            onMouseUp={e => e.currentTarget.style.transform = 'scale(1)'}
          >
            <Zap size={18} />
            SORT OUT
          </button>

        </div>
      </Layout>

      {/* Add expense modal */}
      <ExpenseModal
        isOpen={addOpen}
        onClose={() => setAddOpen(false)}
        groupId={id}
        members={members}
        onAdd={addExpense}
        onUpdate={updateExpense}
        expense={null}
      />

      {/* Edit expense modal */}
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

      {/* Spinner keyframe */}
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </>
  )
}