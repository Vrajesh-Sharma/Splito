import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Hash, Users, ArrowRight } from 'lucide-react'
import { useGroups } from '../hooks/useGroups'
import toast from 'react-hot-toast'
import Layout from '../components/Layout'
import BaseModal from '../components/BaseModal'
import { PageHeader, Card, PrimaryButton, FormField, Input } from '../components/DesignSystem'

export default function GroupPage() {
  const navigate = useNavigate()
  const { groups, loading, createGroup, joinGroup } = useGroups()
  const [modal, setModal] = useState(null)   // 'create' | 'join'
  const [groupName, setGroupName] = useState('')
  const [code, setCode] = useState('')
  const [busy, setBusy] = useState(false)

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
      <div className="animate-fade-up flex flex-col gap-8">

        {/* ── Page Header ── */}
        <PageHeader
          title="Groups"
          subtitle="Create or join a group to split expenses"
        />

        {/* ── 12-col grid ──
              Mobile  : single column (actions stacked above ledger)
              ≥1024px : 4 cols (actions) + 8 cols (ledger)                    */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

          {/* Left — Action tiles */}
          <div className="lg:col-span-4">
            <h2 className="text-xs font-bold text-text-muted uppercase tracking-wider mb-4">
              Quick Actions
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <Card
                onClick={() => setModal('create')}
                className="flex flex-col items-center justify-center gap-3 text-center min-h-[140px]"
                style={{ padding: 28 }}
              >
                <div className="w-12 h-12 rounded-xl neu-inset flex items-center justify-center text-primary bg-bg">
                  <Plus size={22} strokeWidth={2.5} />
                </div>
                <span className="text-xs font-extrabold text-text uppercase tracking-wider">
                  New Group
                </span>
              </Card>

              <Card
                onClick={() => setModal('join')}
                className="flex flex-col items-center justify-center gap-3 text-center min-h-[140px]"
                style={{ padding: 28 }}
              >
                <div className="w-12 h-12 rounded-xl neu-inset flex items-center justify-center text-primary bg-bg">
                  <Hash size={20} strokeWidth={2.5} />
                </div>
                <span className="text-xs font-extrabold text-text uppercase tracking-wider">
                  Join Group
                </span>
              </Card>
            </div>
          </div>

          {/* Right — Groups ledger */}
          <div className="lg:col-span-8">
            <h2 className="text-xs font-bold text-text-muted uppercase tracking-wider mb-4">
              Active Ledgers
            </h2>

            {loading ? (
              <div className="flex flex-col gap-3">
                {[1, 2, 3].map(i => (
                  <div key={i} className="skeleton h-[72px] rounded-2xl" />
                ))}
              </div>
            ) : groups.length === 0 ? (
              <div className="card-inset rounded-2xl flex flex-col items-center justify-center gap-4 py-16 text-center min-h-[220px]">
                <div className="w-14 h-14 rounded-full neu-extruded flex items-center justify-center text-primary bg-bg">
                  <Users size={22} />
                </div>
                <div>
                  <p className="font-bold text-text text-sm">No groups yet</p>
                  <p className="text-text-muted text-xs mt-1 max-w-[26ch] mx-auto">
                    Create a group to get started splitting bills with friends.
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {groups.map(group => (
                  <button
                    key={group.id}
                    onClick={() => navigate(`/groups/${group.id}`)}
                    className="w-full flex items-center gap-4 rounded-2xl neu-extruded bg-bg interactive-card text-left border-none cursor-pointer"
                    style={{ padding: 20 }}
                  >
                    <div className="w-11 h-11 rounded-xl neu-inset flex items-center justify-center flex-shrink-0 text-primary bg-bg">
                      <Users size={18} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-extrabold text-text text-sm truncate">{group.name}</p>
                      <p className="text-[10px] text-text-muted font-bold font-mono tracking-wider mt-0.5">
                        CODE: {group.invite_code}
                      </p>
                    </div>
                    <div className="w-8 h-8 rounded-full neu-inset flex items-center justify-center text-text-muted hover:text-primary flex-shrink-0">
                      <ArrowRight size={14} />
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

        </div>
      </div>

      {/* ── Modals ── */}
      <BaseModal
        isOpen={modal === 'create'}
        onClose={closeModal}
        title="Create Group"
        size="md"
        footer={
          <PrimaryButton
            type="submit"
            form="create-group-form"
            disabled={busy}
            className="w-full"
          >
            <span>{busy ? 'Creating…' : 'Create Group'}</span>
          </PrimaryButton>
        }
      >
        <form id="create-group-form" onSubmit={handleCreate} className="flex flex-col gap-5">
          <FormField
            label="Group Name"
            helperText="A unique 6-character invite code is generated automatically."
          >
            <Input
              value={groupName}
              onChange={e => setGroupName(e.target.value)}
              placeholder="e.g. Goa Trip 2026"
              autoFocus
            />
          </FormField>
        </form>
      </BaseModal>

      <BaseModal
        isOpen={modal === 'join'}
        onClose={closeModal}
        title="Join Group"
        size="md"
        footer={
          <PrimaryButton
            type="submit"
            form="join-group-form"
            disabled={busy}
            className="w-full"
          >
            <span>{busy ? 'Joining…' : 'Join Group'}</span>
          </PrimaryButton>
        }
      >
        <form id="join-group-form" onSubmit={handleJoin} className="flex flex-col gap-5">
          <FormField
            label="Group Code"
            helperText="Ask your group admin for the 6-character code."
          >
            <Input
              value={code}
              onChange={e => setCode(e.target.value.toUpperCase())}
              placeholder="FX9KQ2"
              className="font-mono tracking-widest text-center text-lg uppercase"
              maxLength={6}
              autoFocus
            />
          </FormField>
        </form>
      </BaseModal>
    </Layout>
  )
}