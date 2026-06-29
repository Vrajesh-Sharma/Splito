import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'

const PAGE_SIZE = 10

export function useExpenses(groupId) {
  const { user } = useAuth()

  const [expenses,    setExpenses]    = useState([])
  const [loading,     setLoading]     = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [hasMore,     setHasMore]     = useState(false)
  const [page,        setPage]        = useState(0)

  useEffect(() => {
    if (!groupId) return
    fetchExpenses(0, true)
  }, [groupId])

  async function fetchExpenses(pageIndex = 0, reset = false) {
    if (pageIndex === 0) setLoading(true)
    else setLoadingMore(true)

    const from = pageIndex * PAGE_SIZE
    const to   = from + PAGE_SIZE - 1

    const { data } = await supabase
      .from('expenses')
      .select(`
        *,
        profiles!paid_by(id, full_name),
        expense_splits(*, profiles(id, full_name))
      `)
      .eq('group_id', groupId)
      .order('expense_date', { ascending: false })
      .order('created_at',   { ascending: false })
      .range(from, to)

    const rows = data ?? []
    setHasMore(rows.length === PAGE_SIZE)

    if (reset || pageIndex === 0) setExpenses(rows)
    else setExpenses(prev => [...prev, ...rows])

    setPage(pageIndex)
    if (pageIndex === 0) setLoading(false)
    else setLoadingMore(false)
  }

  async function loadMore() {
    await fetchExpenses(page + 1, false)
  }

  async function addExpense({ groupId, paidBy, title, amount, category, notes, splitWith, expenseDate }) {
    const { data: expense, error } = await supabase
      .from('expenses')
      .insert({
        group_id:     groupId,
        paid_by:      paidBy,
        title,
        amount,
        category,
        notes,
        expense_date: expenseDate,
      })
      .select()
      .single()

    if (error) return { error }

    const share  = parseFloat((amount / splitWith.length).toFixed(2))
    const splits = splitWith.map(uid => ({
      expense_id:   expense.id,
      user_id:      uid,
      share_amount: share,
    }))
    await supabase.from('expense_splits').insert(splits)
    await fetchExpenses(0, true)
    return { data: expense }
  }

  async function updateExpense(id, { title, amount, category, notes, expenseDate, splitWith }) {
    const { data: updateData, error: updateError } = await supabase
        .from('expenses')
        .update({ title, amount, category, notes, expense_date: expenseDate })
        .eq('id', id)
        .select() // <-- add this to confirm the row was actually updated

    console.log('Update result:', updateData, updateError)

    if (updateError) return { error: updateError }
    if (!updateData || updateData.length === 0) {
        console.warn('UPDATE silently did nothing — RLS is blocking it')
        return { error: { message: 'Update blocked — check RLS policy on expenses table' } }
    }

    const share  = parseFloat((amount / splitWith.length).toFixed(2))
    const splits = splitWith.map(uid => ({ user_id: uid, share_amount: share }))

    const { error: splitsError } = await supabase.rpc('replace_expense_splits', {
        p_expense_id: id,
        p_user_id:    user.id,
        p_splits:     splits,
    })

    console.log('Splits RPC error:', splitsError)

    if (splitsError) return { error: splitsError }

    await fetchExpenses(0, true)
    return { data: true }
    }

  async function deleteExpense(id) {
    await supabase.from('expenses').delete().eq('id', id)
    await fetchExpenses(0, true)
  }

  function calculateSettlement(members) {
    const balances = {}
    members.forEach(m => { balances[m.id] = { name: m.full_name, net: 0 } })

    expenses.forEach(exp => {
      if (balances[exp.paid_by]) balances[exp.paid_by].net += parseFloat(exp.amount)
      exp.expense_splits?.forEach(split => {
        if (balances[split.user_id]) balances[split.user_id].net -= parseFloat(split.share_amount)
      })
    })

    const creditors = [], debtors = []
    Object.entries(balances).forEach(([id, { name, net }]) => {
      if (net >  0.01) creditors.push({ id, name, amount: net })
      if (net < -0.01) debtors.push({ id, name, amount: -net })
    })

    const transactions = []
    const creds = creditors.map(c => ({ ...c }))
    const debts = debtors.map(d => ({ ...d }))
    let i = 0, j = 0

    while (i < creds.length && j < debts.length) {
      const amt = Math.min(creds[i].amount, debts[j].amount)
      transactions.push({ from: debts[j].name, to: creds[i].name, amount: amt.toFixed(2) })
      creds[i].amount -= amt
      debts[j].amount -= amt
      if (creds[i].amount < 0.01) i++
      if (debts[j].amount < 0.01) j++
    }

    return { transactions, balances }
  }

  return {
    expenses, loading, loadingMore, hasMore,
    addExpense, updateExpense, deleteExpense,
    calculateSettlement, loadMore,
    refetch: () => fetchExpenses(0, true),
  }
}