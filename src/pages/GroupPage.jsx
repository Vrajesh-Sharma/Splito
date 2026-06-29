import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { Plus, Hash, Users, X, ArrowRight } from 'lucide-react'
import { useGroups } from '../hooks/useGroups'
import Layout from '../components/Layout'
import toast from 'react-hot-toast'

export default function GroupPage() {
  const navigate = useNavigate()
  const { groups, loading, createGroup, joinGroup } = useGroups()
  const [modal,     setModal]     = useState(null)  // 'create' | 'join'
  const [groupName, setGroupName] = useState('')
  const [code,      setCode]      = useState('')
  const [busy,      setBusy]      = useState(false)

  function closeModal() { setModal(null); setGroupName(''); setCode('') }

  async function handleCreate(e) {
    e.preventDefault()
    if (!groupName.trim()) return toast.error('Enter a group name')
    setBusy(true)
    const { data, error } = await createGroup(groupName.trim())
    setBusy(false)
    if (error) { toast.error(error.message); return }
    toast.success(`Group "${data.name}" created! Code: ${data.invite_code}`)
    closeModal()
    navigate(`/groups/${data.id}`)
  }

  async function handleJoin(e) {
    e.preventDefault()
    if (!code.trim()) return toast.error('Enter a group code')
    setBusy(true)
    const { data, error } = await joinGroup(code.trim())
    setBusy(false)
    if (error) { toast.error(error.message); return }
    toast.success(`Joined "${data.name}"!`)
    closeModal()
    navigate(`/groups/${data.id}`)
  }

  return (
    <Layout>
      <div className="px-5 pt-12 pb-6">
        <h1 className="font-display font-bold text-2xl text-text mb-1">Groups</h1>
        <p className="text-text-muted text-sm mb-6">Create or join a group to split expenses</p>

        {/* Action buttons */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <button onClick={() => setModal('create')}
            className="flex flex-col items-center gap-2 p-5 rounded-2xl border border-border bg-surface2 hover:border-cyan-500/40 hover:bg-surface active:scale-95 transition-all duration-200">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/15 flex items-center justify-center">
              <Plus size={20} className="text-cyan-400" />
            </div>
            <span className="text-sm font-semibold text-text">New Group</span>
          </button>
          <button onClick={() => setModal('join')}
            className="flex flex-col items-center gap-2 p-5 rounded-2xl border border-border bg-surface2 hover:border-teal-500/40 hover:bg-surface active:scale-95 transition-all duration-200">
            <div className="w-10 h-10 rounded-xl bg-teal-500/15 flex items-center justify-center">
              <Hash size={20} className="text-teal-400" />
            </div>
            <span className="text-sm font-semibold text-text">Join Group</span>
          </button>
        </div>

        {/* Groups list */}
        {loading ? (
          <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="skeleton h-16 rounded-2xl" />)}</div>
        ) : groups.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-12 text-center">
            <div className="text-4xl mb-2">🏠</div>
            <p className="font-semibold text-text">No groups yet</p>
            <p className="text-text-muted text-sm">Create a group to get started splitting bills with friends.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {groups.map((group, i) => (
              <motion.button key={group.id}
                initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                onClick={() => navigate(`/groups/${group.id}`)}
                className="w-full card flex items-center gap-3 hover:border-cyan-500/30 hover:bg-surface2 transition-all duration-200 active:scale-[0.98] text-left">
                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-cyan-500/20 to-teal-500/20 border border-cyan-500/20 flex items-center justify-center flex-shrink-0">
                  <Users size={20} className="text-cyan-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-text text-sm truncate">{group.name}</p>
                  <p className="text-xs text-text-muted font-mono mt-0.5">Code: {group.invite_code}</p>
                </div>
                <ArrowRight size={16} className="text-text-muted flex-shrink-0" />
              </motion.button>
            ))}
          </div>
        )}
      </div>

      {/* Modals */}
      <AnimatePresence>
        {modal && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50" onClick={closeModal} />
            <motion.div
              initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="fixed bottom-0 left-0 right-0 z-50 glass-strong rounded-t-3xl px-5 pt-6 pb-10">
              <div className="flex items-center justify-between mb-5">
                <h2 className="font-display font-bold text-lg text-text">
                  {modal === 'create' ? 'Create Group' : 'Join Group'}
                </h2>
                <button onClick={closeModal} className="btn-ghost p-2 rounded-full"><X size={20} /></button>
              </div>

              {modal === 'create' ? (
                <form onSubmit={handleCreate} className="space-y-4">
                  <div>
                    <label className="block text-sm text-text-muted mb-1.5">Group Name</label>
                    <input value={groupName} onChange={e => setGroupName(e.target.value)}
                      placeholder="e.g. Goa Trip 2026" className="input-field" autoFocus />
                    <p className="text-xs text-text-muted mt-1.5">A unique 6-character code will be generated automatically.</p>
                  </div>
                  <button type="submit" disabled={busy} className="btn-primary w-full">{busy ? 'Creating...' : 'Create Group'}</button>
                </form>
              ) : (
                <form onSubmit={handleJoin} className="space-y-4">
                  <div>
                    <label className="block text-sm text-text-muted mb-1.5">Group Code</label>
                    <input value={code} onChange={e => setCode(e.target.value.toUpperCase())}
                      placeholder="e.g. FX9KQ2" className="input-field font-mono tracking-widest text-center text-lg uppercase"
                      maxLength={6} autoFocus />
                    <p className="text-xs text-text-muted mt-1.5 text-center">Ask your group admin for the 6-character code.</p>
                  </div>
                  <button type="submit" disabled={busy} className="btn-primary w-full">{busy ? 'Joining...' : 'Join Group'}</button>
                </form>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </Layout>
  )
}