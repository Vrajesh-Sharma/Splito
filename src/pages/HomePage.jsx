import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useGroups } from '../hooks/useGroups'
import Layout from '../components/Layout'
import Avatar from '../components/Avatar'
import { PageHeader, Card, PrimaryButton, IconButton, TextButton } from '../components/DesignSystem'
import { Users, LogOut, Zap, ArrowRight, TrendingUp, Hand, WavesVerticalIcon, HeartHandshake } from 'lucide-react'

export default function HomePage() {
  const { profile, signOut } = useAuth()
  const { groups, loading } = useGroups()
  const navigate = useNavigate()

  return (
    <Layout>
      <div className="animate-fade-up flex flex-col gap-8">

        {/* ── Page Header ── */}
        <PageHeader
          title={
            <span className="flex items-center gap-2">
              Hey, {profile?.full_name?.split(' ')[0] || 'there'} <HeartHandshake size={28} className="text-pink-500" />
            </span>
          }
          subtitle="Ready to split some bills?"
          action={
            <div className="flex items-center gap-2 md:hidden">
              <div title={profile?.full_name ?? 'Profile'}>
                <Avatar name={profile?.full_name ?? ''} size="lg" />
              </div>
              <IconButton onClick={signOut} title="Sign out">
                <LogOut size={15} />
              </IconButton>
            </div>
          }
        >
          {/* Splito brand chip — mobile only, sits below subtitle */}
          <div className="inline-flex items-center gap-1.5 mt-2 md:hidden">
            <div className="w-5 h-5 rounded-md neu-extruded flex items-center justify-center bg-bg">
              <Zap size={10} className="text-primary fill-primary" />
            </div>
            <span className="text-[10px] font-extrabold text-primary uppercase tracking-widest font-display">
              Splito
            </span>
          </div>
        </PageHeader>

        {/* ── 12-col dashboard grid ──
              Mobile  : single column
              ≥1024px : 4 cols (stat) + 8 cols (ledger)                       */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

          {/* Left — Stats card */}
          <div className="lg:col-span-4">
            <Card className="relative h-full min-h-[160px]" style={{ padding: 28 }}>
              {/* Subtle primary glow */}
              <div
                className="absolute inset-0 pointer-events-none opacity-20"
                style={{ background: 'radial-gradient(ellipse at 85% 10%, rgba(101,163,13,0.35) 0%, transparent 65%)' }}
              />
              <div className="relative flex items-center justify-between h-full">
                <div>
                  <p className="text-xs font-bold text-text-muted uppercase tracking-wider">
                    Your Groups
                  </p>
                  <p className="font-display font-black text-6xl text-primary mt-2 leading-none tabular-nums">
                    {groups.length}
                  </p>
                </div>
                <div className="w-14 h-14 rounded-2xl neu-inset flex items-center justify-center bg-bg text-primary">
                  <TrendingUp size={22} />
                </div>
              </div>
            </Card>
          </div>

          {/* Right — Recent groups ledger */}
          <div className="lg:col-span-8">
            {/* Section label row */}
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xs font-bold text-text-muted uppercase tracking-wider">
                Recent Groups
              </h2>
              <TextButton onClick={() => navigate('/groups')}>
                View all <ArrowRight size={12} />
              </TextButton>
            </div>

            {loading ? (
              <div className="flex flex-col gap-3">
                {[1, 2, 3].map(i => (
                  <div key={i} className="skeleton h-[68px] rounded-2xl" />
                ))}
              </div>
            ) : groups.length === 0 ? (
              <Card className="flex flex-col items-center justify-center gap-4 text-center card-inset min-h-[180px]" style={{ padding: 40 }}>
                <div className="w-14 h-14 rounded-full neu-extruded flex items-center justify-center text-primary bg-bg">
                  <Users size={22} />
                </div>
                <div>
                  <p className="font-bold text-text text-sm">No groups yet</p>
                  <p className="text-text-muted text-xs mt-1 max-w-[22ch] mx-auto">
                    Create a group or join one using an invite code.
                  </p>
                </div>
                <PrimaryButton onClick={() => navigate('/groups')}>
                  Get Started
                </PrimaryButton>
              </Card>
            ) : (
              <div className="flex flex-col gap-3">
                {groups.slice(0, 5).map(group => (
                  <button
                    key={group.id}
                    onClick={() => navigate(`/groups/${group.id}`)}
                    className="w-full flex items-center gap-4 rounded-2xl neu-extruded bg-bg
                               interactive-card text-left cursor-pointer border-none"
                    style={{ padding: 20 }}
                  >
                    {/* Icon */}
                    <div className="w-11 h-11 rounded-xl neu-inset flex items-center justify-center flex-shrink-0 text-primary bg-bg">
                      <Users size={18} />
                    </div>
                    {/* Text */}
                    <div className="flex-1 min-w-0">
                      <p className="font-extrabold text-text text-sm truncate">{group.name}</p>
                      <p className="text-[10px] text-text-muted font-bold font-mono tracking-wider mt-0.5">
                        CODE: {group.invite_code}
                      </p>
                    </div>
                    {/* Arrow */}
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
    </Layout>
  )
}