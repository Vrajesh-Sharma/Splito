import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Check, IndianRupee, CalendarDays } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { CATEGORIES } from './CategoryBadge'
import Avatar from './Avatar'
import toast from 'react-hot-toast'
import { format } from 'date-fns'

function todayString() {
  return format(new Date(), 'yyyy-MM-dd')
}

// expense prop = existing expense object when editing, null when adding
export default function ExpenseModal({ isOpen, onClose, groupId, members, onAdd, onUpdate, expense }) {
  const { user }  = useAuth()
  const isEditing = !!expense

  const [title,       setTitle]       = useState('')
  const [amount,      setAmount]      = useState('')
  const [category,    setCategory]    = useState('other')
  const [notes,       setNotes]       = useState('')
  const [splitWith,   setSplitWith]   = useState([])
  const [expenseDate, setExpenseDate] = useState(todayString())
  const [loading,     setLoading]     = useState(false)

  // Populate fields when editing
  useEffect(() => {
    if (expense) {
      setTitle(expense.title ?? '')
      setAmount(String(expense.amount ?? ''))
      setCategory(expense.category ?? 'other')
      setNotes(expense.notes ?? '')
      setExpenseDate(expense.expense_date ?? todayString())
      setSplitWith(expense.expense_splits?.map(s => s.user_id) ?? [])
    } else {
      reset()
    }
  }, [expense, isOpen])

  function toggleMember(id) {
    setSplitWith(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])
  }

  function selectAll() { setSplitWith(members.map(m => m.id)) }

  function reset() {
    setTitle(''); setAmount(''); setCategory('other')
    setNotes(''); setSplitWith([]); setExpenseDate(todayString()); setLoading(false)
  }

  function handleClose() { if (!isEditing) reset(); onClose() }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!title.trim())                                       return toast.error('Enter a title')
    if (!amount || isNaN(amount) || parseFloat(amount) <= 0) return toast.error('Enter a valid amount')
    if (splitWith.length === 0)                              return toast.error('Select at least one member to split with')
    if (!expenseDate)                                        return toast.error('Select a date')

    setLoading(true)

    if (isEditing) {
      const { error } = await onUpdate(expense.id, {
        title: title.trim(), amount: parseFloat(amount),
        category, notes: notes.trim(), expenseDate, splitWith,
      })
      setLoading(false)
      if (error) { toast.error(error.message); return }
      toast.success('Expense updated!')
    } else {
      const { error } = await onAdd({
        groupId, paidBy: user.id,
        title: title.trim(), amount: parseFloat(amount),
        category, notes: notes.trim(), expenseDate, splitWith,
      })
      setLoading(false)
      if (error) { toast.error(error.message); return }
      toast.success('Expense added!')
      reset()
    }
    onClose()
  }

  const perPerson = splitWith.length > 0 && amount
    ? (parseFloat(amount || 0) / splitWith.length).toFixed(2)
    : null

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{
              position: 'fixed', inset: 0,
              background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(4px)', zIndex: 50,
            }}
            onClick={handleClose}
          />

          <motion.div
            initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 32, stiffness: 320 }}
            style={{
              position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 51,
              background: 'rgba(18, 22, 32, 0.98)',
              backdropFilter: 'blur(20px)',
              borderTop: '1px solid rgba(255,255,255,0.08)',
              borderRadius: '1.5rem 1.5rem 0 0',
              maxHeight: '94dvh', overflowY: 'auto',
            }}
          >
            {/* Header */}
            <div style={{
              position: 'sticky', top: 0, zIndex: 2,
              background: 'rgba(18, 22, 32, 0.98)',
              borderRadius: '1.5rem 1.5rem 0 0',
              padding: '1.25rem 1.25rem 0.75rem',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              borderBottom: '1px solid #1e2535',
            }}>
              <div>
                <h2 style={{ fontFamily: "'Cabinet Grotesk',sans-serif", fontWeight: 700, fontSize: '1.125rem', color: '#e2e8f0' }}>
                  {isEditing ? 'Edit Expense' : 'Add Expense'}
                </h2>
                {isEditing && (
                  <p style={{ fontSize: '0.75rem', color: '#718096', marginTop: '0.125rem' }}>
                    Only you can edit your own expenses
                  </p>
                )}
              </div>
              <button onClick={handleClose} style={{
                background: 'none', border: 'none', cursor: 'pointer',
                color: '#718096', padding: '0.375rem', borderRadius: '9999px',
                display: 'flex', alignItems: 'center',
              }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1.125rem', paddingBottom: '2.5rem' }}>

              {/* Title */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
                <label style={labelStyle}>What was it for?</label>
                <input
                  value={title} onChange={e => setTitle(e.target.value)}
                  placeholder="e.g. Dinner at Zara's"
                  style={inputStyle} onFocus={focusStyle} onBlur={blurStyle}
                  autoFocus
                />
              </div>

              {/* Amount + Date */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
                  <label style={labelStyle}>Amount (₹)</label>
                  <div style={{ position: 'relative' }}>
                    <IndianRupee size={15} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#718096', pointerEvents: 'none' }} />
                    <input
                      value={amount} onChange={e => setAmount(e.target.value)}
                      type="number" min="0.01" step="0.01" placeholder="0.00"
                      style={{ ...inputStyle, paddingLeft: '2.25rem' }}
                      onFocus={focusStyle} onBlur={blurStyle}
                    />
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
                  <label style={labelStyle}>Date</label>
                  <div style={{ position: 'relative' }}>
                    <CalendarDays size={15} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#718096', pointerEvents: 'none' }} />
                    <input
                      type="date" value={expenseDate}
                      onChange={e => setExpenseDate(e.target.value)}
                      max={todayString()}
                      style={{ ...inputStyle, paddingLeft: '2.25rem', colorScheme: 'dark' }}
                      onFocus={focusStyle} onBlur={blurStyle}
                    />
                  </div>
                </div>
              </div>

              {/* Category */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <label style={labelStyle}>Category</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                  {Object.entries(CATEGORIES).map(([key, cat]) => (
                    <button key={key} type="button" onClick={() => setCategory(key)}
                      style={{
                        display: 'flex', alignItems: 'center', gap: '0.375rem',
                        padding: '0.375rem 0.75rem', borderRadius: '9999px',
                        fontSize: '0.75rem', fontWeight: 500, cursor: 'pointer', transition: 'all 0.15s',
                        border: category === key ? '1px solid rgba(34,211,238,0.5)' : '1px solid #1e2535',
                        background: category === key ? 'rgba(34,211,238,0.15)' : '#181d28',
                        color:   category === key ? '#22d3ee' : '#718096',
                      }}>
                      <span>{cat.icon}</span>{cat.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Notes */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
                <label style={labelStyle}>Notes <span style={{ color: '#4a5568' }}>(optional)</span></label>
                <textarea
                  value={notes} onChange={e => setNotes(e.target.value)}
                  placeholder="Any extra details..." rows={2}
                  style={{ ...inputStyle, resize: 'none', lineHeight: '1.5' }}
                  onFocus={focusStyle} onBlur={blurStyle}
                />
              </div>

              {/* Split with */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <label style={labelStyle}>Split with</label>
                  <button type="button" onClick={selectAll} style={{
                    background: 'none', border: 'none', cursor: 'pointer',
                    color: '#22d3ee', fontSize: '0.75rem', fontWeight: 500,
                  }}>
                    Select All
                  </button>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {members.map(member => {
                    const selected = splitWith.includes(member.id)
                    return (
                      <button key={member.id} type="button" onClick={() => toggleMember(member.id)}
                        style={{
                          display: 'flex', alignItems: 'center', gap: '0.75rem',
                          padding: '0.75rem', borderRadius: '0.75rem', cursor: 'pointer',
                          transition: 'all 0.15s', width: '100%',
                          border: selected ? '1px solid rgba(34,211,238,0.4)' : '1px solid #1e2535',
                          background: selected ? 'rgba(34,211,238,0.08)' : '#181d28',
                        }}>
                        <Avatar name={member.full_name} size="sm" />
                        <span style={{ flex: 1, textAlign: 'left', fontSize: '0.875rem', color: '#e2e8f0' }}>
                          {member.full_name}
                        </span>
                        {selected && (
                          <div style={{
                            width: '1.25rem', height: '1.25rem', borderRadius: '9999px',
                            background: '#06b6d4', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                          }}>
                            <Check size={12} color="#0d0f14" />
                          </div>
                        )}
                      </button>
                    )
                  })}
                </div>

                {perPerson && (
                  <p style={{ fontSize: '0.75rem', color: '#718096', textAlign: 'center', marginTop: '0.25rem' }}>
                    <span style={{ color: '#22d3ee', fontWeight: 600 }}>₹{perPerson}</span> per person
                    &nbsp;·&nbsp; {splitWith.length} member{splitWith.length > 1 ? 's' : ''}
                  </p>
                )}
              </div>

              {/* Submit */}
              <button type="submit" disabled={loading}
                style={{
                  width: '100%', padding: '0.875rem',
                  background: loading ? 'rgba(6,182,212,0.5)' : '#06b6d4',
                  color: '#0d0f14', fontWeight: 700, fontSize: '0.9375rem',
                  border: 'none', borderRadius: '0.75rem',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  boxShadow: '0 0 16px rgba(34,211,238,0.25)', transition: 'all 0.2s',
                }}>
                {loading
                  ? (isEditing ? 'Saving...' : 'Adding...')
                  : (isEditing ? 'Save Changes' : 'Add Expense')}
              </button>
            </form>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

const labelStyle = { fontSize: '0.8125rem', color: '#718096', fontWeight: 500 }

const inputStyle = {
  width: '100%', backgroundColor: '#181d28', border: '1px solid #1e2535',
  borderRadius: '0.75rem', padding: '0.75rem 1rem',
  color: '#e2e8f0', fontSize: '0.9375rem', outline: 'none',
  transition: 'border-color 0.2s, box-shadow 0.2s',
}

function focusStyle(e) {
  e.target.style.borderColor = 'rgba(34,211,238,0.5)'
  e.target.style.boxShadow   = '0 0 0 3px rgba(34,211,238,0.1)'
}
function blurStyle(e) {
  e.target.style.borderColor = '#1e2535'
  e.target.style.boxShadow   = 'none'
}