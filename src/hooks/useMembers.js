import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export function useMembers(groupId) {
  const [members, setMembers] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!groupId) return
    fetchMembers()
  }, [groupId])

  async function fetchMembers() {
    const { data } = await supabase
      .from('group_members')
      .select('user_id, profiles(*)')
      .eq('group_id', groupId)
    setMembers(data?.map(r => r.profiles) ?? [])
    setLoading(false)
  }

  return { members, loading, refetch: fetchMembers }
}