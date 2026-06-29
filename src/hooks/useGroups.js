import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'

export function useGroups() {
  const { user } = useAuth()
  const [groups, setGroups]   = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return
    fetchGroups()
  }, [user])

  async function fetchGroups() {
    setLoading(true)
    const { data, error } = await supabase
      .from('group_members')
      .select('group_id, groups(*)')
      .eq('user_id', user.id)
      .order('joined_at', { ascending: false })

    if (!error) setGroups(data?.map(r => r.groups).filter(Boolean) ?? [])
    setLoading(false)
  }

  function generateCode() {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
    return Array.from(
      { length: 6 },
      () => chars[Math.floor(Math.random() * chars.length)]
    ).join('')
  }

  async function createGroup(name) {
    // Generate a unique code using a DB-level unique constraint as safety net
    // Try up to 5 times in case of collision (extremely rare)
    let lastError = null

    for (let attempt = 0; attempt < 5; attempt++) {
      const code = generateCode()

      const { data: group, error } = await supabase
        .from('groups')
        .insert({
          name,
          invite_code: code,
          created_by: user.id,
        })
        .select()
        .single()

      if (!error) {
        // Auto-join the creator
        const { error: joinError } = await supabase
          .from('group_members')
          .insert({ group_id: group.id, user_id: user.id })

        if (joinError) return { error: joinError }
        await fetchGroups()
        return { data: group }
      }

      // If it's a unique constraint violation on invite_code, retry
      if (error.code === '23505') {
        lastError = error
        continue
      }

      // Any other error — return immediately
      return { error }
    }

    return { error: lastError ?? { message: 'Failed to create group' } }
  }

  async function joinGroup(code) {
    // Find group by invite code — uses a public lookup
    const { data: group, error } = await supabase
      .from('groups')
      .select('*')
      .eq('invite_code', code.toUpperCase().trim())
      .single()

    if (error || !group) return { error: { message: 'Invalid group code. Please check and try again.' } }

    // Check if already a member
    const { data: existing } = await supabase
      .from('group_members')
      .select('id')
      .eq('group_id', group.id)
      .eq('user_id', user.id)
      .single()

    if (existing) return { error: { message: 'You are already a member of this group.' } }

    const { error: joinError } = await supabase
      .from('group_members')
      .insert({ group_id: group.id, user_id: user.id })

    if (joinError) return { error: joinError }

    await fetchGroups()
    return { data: group }
  }

  return { groups, loading, createGroup, joinGroup, refetch: fetchGroups }
}