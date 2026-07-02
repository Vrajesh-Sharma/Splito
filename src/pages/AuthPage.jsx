import { useState } from 'react'
import { motion } from 'framer-motion'
import { Eye, EyeOff, Zap } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'
import { PrimaryButton, FormField, Input } from '../components/DesignSystem'

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
    if (!email.trim())  return toast.error('Enter your email')
    if (!password)      return toast.error('Enter your password')
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
    <div className="min-h-screen bg-bg flex flex-col items-center justify-center p-5 relative overflow-hidden">

      {/* Ambient glow */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] pointer-events-none opacity-30 z-0"
        style={{ background: 'radial-gradient(circle, rgba(101,163,13,0.2) 0%, transparent 70%)' }}
      />

      {/* Logo */}
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8 text-center z-10"
      >
        <div className="flex items-center justify-center gap-2.5 mb-2">
          <div className="w-11 h-11 rounded-2xl neu-extruded flex items-center justify-center bg-bg">
            <Zap size={20} className="text-primary fill-primary" />
          </div>
          <span className="font-display font-black text-3xl text-gradient">Splito</span>
        </div>
        <p className="text-text-muted text-xs font-bold uppercase tracking-widest">
          Split expenses. No drama.
        </p>
      </motion.div>

      {/* Card */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.08 }}
        className="w-full max-w-[420px] z-10 card p-6 md:p-8"
      >
        {/* Tab switcher */}
        <div className="flex p-1.5 mb-6 rounded-2xl neu-inset bg-bg">
          {[
            { key: 'login',  label: 'Sign In' },
            { key: 'signup', label: 'Sign Up' },
          ].map(tab => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setMode(tab.key)}
              className={`flex-1 py-2.5 text-xs font-extrabold uppercase tracking-wider
                          transition-all duration-200 cursor-pointer rounded-xl border-none
                          flex items-center justify-center min-h-[40px]
                          ${mode === tab.key
                            ? 'neu-extruded text-primary'
                            : 'text-text-muted hover:text-text bg-transparent'}`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          {mode === 'signup' && (
            <FormField label="Full Name">
              <Input
                type="text"
                value={fullName}
                onChange={e => setFullName(e.target.value)}
                placeholder="Narendra Modi"
                autoComplete="name"
              />
            </FormField>
          )}

          <FormField label="Email Address">
            <Input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="you@example.com"
              autoComplete="email"
            />
          </FormField>

          <FormField label="Password">
            <div className="relative">
              <Input
                type={showPass ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
              />
              <button
                type="button"
                onClick={() => setShowPass(p => !p)}
                className="absolute right-4 top-1/2 -translate-y-1/2
                           text-text-muted hover:text-text cursor-pointer p-1"
              >
                {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </FormField>

          <PrimaryButton
            type="submit"
            disabled={loading}
            className="w-full mt-2"
          >
            {loading ? 'Please wait…' : mode === 'login' ? 'Sign In' : 'Create Account'}
          </PrimaryButton>
        </form>
      </motion.div>

      <p className="mt-8 text-[10px] font-bold text-text-muted text-center max-w-[280px]
                    uppercase tracking-wider z-10 leading-relaxed">
        By signing up you agree that math decides who owes what. No arguments.
      </p>
    </div>
  )
}