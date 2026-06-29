import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useGroups } from '../hooks/useGroups'
import Layout from '../components/Layout'
import Avatar from '../components/Avatar'
import { Users, LogOut, Zap, ArrowRight, TrendingUp } from 'lucide-react'

export default function HomePage() {
  const { profile, signOut } = useAuth()
  const { groups, loading }  = useGroups()
  const navigate = useNavigate()

  return (
    <Layout>
      <div className="px-5 pt-12 pb-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Zap size={16} className="text-cyan-400" />
              <span className="text-xs font-medium text-cyan-400 uppercase tracking-wider">Splito</span>
            </div>
            <h1 className="font-display font-bold text-2xl text-text">
              Hey, {profile?.full_name?.split(' ')[0]} 👋
            </h1>
            <p className="text-sm text-text-muted mt-0.5">Ready to split some bills?</p>
          </div>
          <div className="flex items-center gap-2">
            <Avatar name={profile?.full_name ?? ''} size="lg" />
            <button onClick={signOut} className="btn-ghost p-2 rounded-xl" title="Sign out">
              <LogOut size={18} />
            </button>
          </div>
        </div>

        {/* Stats card */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
          className="card mb-6 relative overflow-hidden">
          <div className="absolute inset-0 opacity-10"
            style={{ background: 'radial-gradient(ellipse at 80% 0%, rgba(34,211,238,0.5) 0%, transparent 60%)' }} />
          <div className="relative flex items-center justify-between">
            <div>
              <p className="text-text-muted text-sm">Your Groups</p>
              <p className="font-display font-bold text-4xl text-gradient mt-1">{groups.length}</p>
            </div>
            <div className="w-14 h-14 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center">
              <TrendingUp size={24} className="text-cyan-400" />
            </div>
          </div>
        </motion.div>

        {/* Groups */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-text">Recent Groups</h2>
          <button onClick={() => navigate('/groups')} className="text-xs text-cyan-400 hover:text-cyan-300 transition-colors flex items-center gap-1">
            View all <ArrowRight size={12} />
          </button>
        </div>

        {loading ? (
          <div className="space-y-3">
            {[1,2,3].map(i => <div key={i} className="skeleton h-16 rounded-2xl" />)}
          </div>
        ) : groups.length === 0 ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="flex flex-col items-center gap-3 py-12 text-center">
            <div className="w-16 h-16 rounded-full bg-surface2 flex items-center justify-center text-3xl mb-2">🫂</div>
            <p className="font-semibold text-text">No groups yet</p>
            <p className="text-text-muted text-sm max-w-xs">Create a group or join one using an invite code to start splitting expenses.</p>
            <button onClick={() => navigate('/groups')} className="btn-primary mt-2 text-sm">
              Get Started
            </button>
          </motion.div>
        ) : (
          <div className="space-y-3">
            {groups.slice(0, 5).map((group, i) => (
              <motion.button key={group.id}
                initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06 }}
                onClick={() => navigate(`/groups/${group.id}`)}
                className="w-full card flex items-center gap-3 hover:border-cyan-500/30 hover:bg-surface2 transition-all duration-200 active:scale-[0.98]">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500/20 to-teal-500/20 border border-cyan-500/20 flex items-center justify-center flex-shrink-0">
                  <Users size={18} className="text-cyan-400" />
                </div>
                <div className="flex-1 text-left">
                  <p className="font-semibold text-text text-sm">{group.name}</p>
                  <p className="text-xs text-text-muted font-mono">{group.invite_code}</p>
                </div>
                <ArrowRight size={16} className="text-text-muted" />
              </motion.button>
            ))}
          </div>
        )}
      </div>
    </Layout>
  )
}