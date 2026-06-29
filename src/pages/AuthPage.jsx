import { useState } from 'react'
import { motion } from 'framer-motion'
import { Eye, EyeOff, Zap } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'

export default function AuthPage() {
  const { signIn, signUp } = useAuth()
  const [mode,     setMode]     = useState('login')
  const [fullName, setFullName] = useState('')
  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [loading,  setLoading]  = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    if (mode === 'signup' && !fullName.trim()) return toast.error('Enter your full name')
    if (!email.trim()) return toast.error('Enter your email')
    if (!password) return toast.error('Enter your password')
    if (password.length < 6) return toast.error('Password must be at least 6 characters')

    setLoading(true)
    if (mode === 'login') {
      const { error } = await signIn(email.trim(), password)
      if (error) toast.error(error.message)
    } else {
      const { error } = await signUp(email.trim(), password, fullName.trim())
      if (error) toast.error(error.message)
      else toast.success('Account created! Check your email to verify.')
    }
    setLoading(false)
  }

  return (
    <div
      style={{
        minHeight: '100dvh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1.25rem',
        backgroundColor: '#0d0f14',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Background glow — pointer-events none so it never blocks clicks */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: '50%',
          transform: 'translateX(-50%)',
          width: '500px',
          height: '400px',
          borderRadius: '50%',
          background: 'radial-gradient(ellipse, rgba(34,211,238,0.12) 0%, transparent 70%)',
          pointerEvents: 'none',
        }}
      />

      {/* Logo */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        style={{ marginBottom: '2rem', textAlign: 'center', position: 'relative', zIndex: 1 }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', marginBottom: '0.375rem' }}>
          <div style={{
            width: '2.5rem', height: '2.5rem', borderRadius: '0.75rem',
            background: 'rgba(34,211,238,0.15)', border: '1px solid rgba(34,211,238,0.3)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Zap size={20} color="#22d3ee" />
          </div>
          <span style={{
            fontFamily: "'Cabinet Grotesk', sans-serif",
            fontWeight: 800, fontSize: '1.875rem',
            background: 'linear-gradient(135deg, #22d3ee 0%, #2dd4bf 50%, #34d399 100%)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}>
            Splito
          </span>
        </div>
        <p style={{ color: '#718096', fontSize: '0.875rem' }}>Split expenses. No drama.</p>
      </motion.div>

      {/* Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        style={{
          width: '100%', maxWidth: '400px', position: 'relative', zIndex: 1,
          backgroundColor: '#131720', borderRadius: '1.25rem',
          border: '1px solid #1e2535', padding: '1.75rem',
          boxShadow: '0 4px 40px rgba(0,0,0,0.5)',
        }}
      >
        {/* Tabs */}
        <div style={{
          display: 'flex', marginBottom: '1.5rem',
          backgroundColor: '#181d28', borderRadius: '0.75rem', padding: '0.25rem',
        }}>
          {[
            { key: 'login',  label: 'Sign In'  },
            { key: 'signup', label: 'Sign Up'  },
          ].map(tab => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setMode(tab.key)}
              style={{
                flex: 1, padding: '0.5rem', fontSize: '0.875rem', fontWeight: 600,
                borderRadius: '0.5rem', border: 'none', cursor: 'pointer',
                transition: 'all 0.2s',
                backgroundColor: mode === tab.key ? 'rgba(34,211,238,0.15)' : 'transparent',
                color:           mode === tab.key ? '#22d3ee' : '#718096',
                boxShadow:       mode === tab.key ? 'inset 0 0 0 1px rgba(34,211,238,0.3)' : 'none',
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

          {/* Full Name — only shown in signup */}
          {mode === 'signup' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
              <label style={{ fontSize: '0.875rem', color: '#718096' }}>Full Name</label>
              <input
                type="text"
                value={fullName}
                onChange={e => setFullName(e.target.value)}
                placeholder="Vrajesh Sharma"
                autoComplete="name"
                style={{
                  width: '100%', backgroundColor: '#181d28', border: '1px solid #1e2535',
                  borderRadius: '0.75rem', padding: '0.75rem 1rem',
                  color: '#e2e8f0', fontSize: '0.9375rem', outline: 'none',
                  transition: 'border-color 0.2s, box-shadow 0.2s',
                }}
                onFocus={e => {
                  e.target.style.borderColor = 'rgba(34,211,238,0.5)'
                  e.target.style.boxShadow   = '0 0 0 3px rgba(34,211,238,0.1)'
                }}
                onBlur={e => {
                  e.target.style.borderColor = '#1e2535'
                  e.target.style.boxShadow   = 'none'
                }}
              />
            </div>
          )}

          {/* Email */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
            <label style={{ fontSize: '0.875rem', color: '#718096' }}>Email</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="you@example.com"
              autoComplete="email"
              style={{
                width: '100%', backgroundColor: '#181d28', border: '1px solid #1e2535',
                borderRadius: '0.75rem', padding: '0.75rem 1rem',
                color: '#e2e8f0', fontSize: '0.9375rem', outline: 'none',
                transition: 'border-color 0.2s, box-shadow 0.2s',
              }}
              onFocus={e => {
                e.target.style.borderColor = 'rgba(34,211,238,0.5)'
                e.target.style.boxShadow   = '0 0 0 3px rgba(34,211,238,0.1)'
              }}
              onBlur={e => {
                e.target.style.borderColor = '#1e2535'
                e.target.style.boxShadow   = 'none'
              }}
            />
          </div>

          {/* Password */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
            <label style={{ fontSize: '0.875rem', color: '#718096' }}>Password</label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPass ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                style={{
                  width: '100%', backgroundColor: '#181d28', border: '1px solid #1e2535',
                  borderRadius: '0.75rem', padding: '0.75rem 3rem 0.75rem 1rem',
                  color: '#e2e8f0', fontSize: '0.9375rem', outline: 'none',
                  transition: 'border-color 0.2s, box-shadow 0.2s',
                }}
                onFocus={e => {
                  e.target.style.borderColor = 'rgba(34,211,238,0.5)'
                  e.target.style.boxShadow   = '0 0 0 3px rgba(34,211,238,0.1)'
                }}
                onBlur={e => {
                  e.target.style.borderColor = '#1e2535'
                  e.target.style.boxShadow   = 'none'
                }}
              />
              <button
                type="button"
                onClick={() => setShowPass(p => !p)}
                style={{
                  position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)',
                  background: 'none', border: 'none', cursor: 'pointer',
                  color: '#718096', padding: '0.25rem', display: 'flex', alignItems: 'center',
                }}
              >
                {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%', marginTop: '0.5rem',
              backgroundColor: loading ? 'rgba(6,182,212,0.5)' : '#06b6d4',
              color: '#0d0f14', fontWeight: 700, fontSize: '0.9375rem',
              padding: '0.875rem 1.25rem', borderRadius: '0.75rem', border: 'none',
              cursor: loading ? 'not-allowed' : 'pointer',
              boxShadow: '0 0 16px rgba(34,211,238,0.3)',
              transition: 'all 0.2s',
            }}
            onMouseEnter={e => { if (!loading) e.target.style.backgroundColor = '#22d3ee' }}
            onMouseLeave={e => { if (!loading) e.target.style.backgroundColor = '#06b6d4' }}
          >
            {loading
              ? 'Please wait...'
              : mode === 'login' ? 'Sign In' : 'Create Account'}
          </button>
        </form>
      </motion.div>

      <p style={{
        marginTop: '1.5rem', fontSize: '0.75rem', color: '#4a5568',
        textAlign: 'center', maxWidth: '280px', position: 'relative', zIndex: 1,
      }}>
        By signing up you agree that math decides who owes what. No arguments. ⚡
      </p>
    </div>
  )
}