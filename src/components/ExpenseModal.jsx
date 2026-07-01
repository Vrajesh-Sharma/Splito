import { useState, useEffect } from 'react'
import { Check, IndianRupee } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { CATEGORIES } from './CategoryBadge'
import Avatar from './Avatar'
import BaseModal from './BaseModal'
import toast from 'react-hot-toast'
import { format } from 'date-fns'
import { FormField, Input, DatePicker, Textarea, Chip, PrimaryButton } from './DesignSystem'

function todayString() {
  return format(new Date(), 'yyyy-MM-dd')
}

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

  // Populate when editing
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
    setSplitWith(p => p.includes(id) ? p.filter(x => x !== id) : [...p, id])
  }
  function selectAll() { setSplitWith(members.map(m => m.id)) }

  function reset() {
    setTitle(''); setAmount(''); setCategory('other')
    setNotes(''); setSplitWith([]); setExpenseDate(todayString()); setLoading(false)
  }

  function handleClose() { if (!isEditing) reset(); onClose() }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!title.trim())                                        return toast.error('Enter a title')
    if (!amount || isNaN(amount) || parseFloat(amount) <= 0) return toast.error('Enter a valid amount')
    if (splitWith.length === 0)                              return toast.error('Select at least one member')
    if (!expenseDate)                                         return toast.error('Select a date')

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
    ? (parseFloat(amount) / splitWith.length).toFixed(2)
    : null

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={handleClose}
      title={isEditing ? 'Edit Expense' : 'Add Expense'}
      subtitle={isEditing ? 'Only you can edit your own expenses' : undefined}
      size="lg"
      footer={
        <PrimaryButton
          type="submit"
          form="expense-form"
          disabled={loading}
          className="w-full"
        >
          <span>
            {loading
              ? (isEditing ? 'Saving…' : 'Adding…')
              : (isEditing ? 'Save Changes' : 'Add Expense')}
          </span>
        </PrimaryButton>
      }
    >
      <form id="expense-form" onSubmit={handleSubmit} className="flex flex-col gap-5">

        {/* Title */}
        <FormField label="What was it for?">
          <Input
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="e.g. Dinner at Zara's"
            autoFocus
          />
        </FormField>

        {/* Amount + Date */}
        <div className="grid grid-cols-2 gap-4">
          <FormField label="Amount (₹)">
            <Input
              type="number"
              value={amount}
              onChange={e => setAmount(e.target.value)}
              min="0.01"
              step="0.01"
              placeholder="0.00"
              startIcon={<IndianRupee size={14} />}
            />
          </FormField>

          <FormField label="Date">
            <DatePicker
              value={expenseDate}
              onChange={e => setExpenseDate(e.target.value)}
              max={todayString()}
            />
          </FormField>
        </div>

        {/* Category chips — scrollable row */}
        <FormField label="Category">
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide -mx-1 px-1">
            {Object.entries(CATEGORIES).map(([key, cat]) => {
              const Icon = cat.icon
              return (
                <Chip
                  key={key}
                  active={category === key}
                  onClick={() => setCategory(key)}
                  className="flex-shrink-0"
                >
                  <Icon size={13} />
                  {cat.label}
                </Chip>
              )
            })}
          </div>
        </FormField>

        {/* Notes */}
        <FormField label="Notes (optional)">
          <Textarea
            value={notes}
            onChange={e => setNotes(e.target.value)}
            placeholder="Any extra details…"
            rows={2}
          />
        </FormField>

        {/* Split with */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-text-muted uppercase tracking-wider">Split With</span>
            <button
              type="button"
              onClick={selectAll}
              className="text-xs font-bold text-primary hover:underline cursor-pointer"
            >
              Select All
            </button>
          </div>

          <div className="flex flex-col gap-2">
            {members.map(member => {
              const selected = splitWith.includes(member.id)
              return (
                <button
                  key={member.id}
                  type="button"
                  onClick={() => toggleMember(member.id)}
                  className={`flex items-center gap-3 p-3 rounded-xl transition-all duration-200 cursor-pointer
                              w-full text-left border-none
                              ${selected
                                ? 'neu-inset bg-bg'
                                : 'neu-extruded bg-bg hover:-translate-y-0.5'}`}
                >
                  <Avatar name={member.full_name} size="sm" />
                  <span className="flex-1 text-sm font-semibold text-text truncate">
                    {member.full_name}
                  </span>
                  {selected
                    ? <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                        <Check size={11} className="text-white" strokeWidth={3} />
                      </div>
                    : <div className="w-5 h-5 rounded-full neu-inset flex-shrink-0 bg-bg" />
                  }
                </button>
              )
            })}
          </div>

          {perPerson && (
            <div className="text-center py-2 px-4 rounded-xl neu-inset mt-1">
              <p className="text-xs text-text-muted font-semibold">
                <span className="text-primary font-extrabold text-sm tabular-nums">₹{perPerson}</span>
                {' '}per person · {splitWith.length} member{splitWith.length > 1 ? 's' : ''}
              </p>
            </div>
          )}
        </div>

      </form>
    </BaseModal>
  )
}