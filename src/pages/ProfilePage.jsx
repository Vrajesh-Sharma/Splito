import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Layout from '../components/Layout'
import Avatar from '../components/Avatar'
import { PageHeader, Card, PrimaryButton, FormField, Input } from '../components/DesignSystem'
import { Sparkles, Save, Globe, RefreshCw } from 'lucide-react'
import toast from 'react-hot-toast'

const PRESET_AVATARS = [
  { id: 'fun1', label: 'Snuggles', url: 'https://api.dicebear.com/10.x/fun-emoji/svg?seed=Snuggles' },
  { id: 'fun2', label: 'Sassy', url: 'https://api.dicebear.com/10.x/fun-emoji/svg?seed=Sassy' },
  { id: 'fun3', label: 'Oscar', url: 'https://api.dicebear.com/10.x/fun-emoji/svg?seed=Oscar' },
  { id: 'fun4', label: 'Scooter', url: 'https://api.dicebear.com/10.x/fun-emoji/svg?seed=Scooter' },
  { id: 'lor1', label: 'Bella', url: 'https://api.dicebear.com/10.x/lorelei/svg?seed=Bella' },
  { id: 'lor2', label: 'Sophie', url: 'https://api.dicebear.com/10.x/lorelei/svg?seed=Sophie' },
  { id: 'lor3', label: 'Milo', url: 'https://api.dicebear.com/10.x/lorelei/svg?seed=Milo' },
  { id: 'bot1', label: 'Buster', url: 'https://api.dicebear.com/10.x/bottts/svg?seed=Buster' },
  { id: 'bot2', label: 'Aero', url: 'https://api.dicebear.com/10.x/bottts/svg?seed=Aero' },
  { id: 'adv1', label: 'Felix', url: 'https://api.dicebear.com/10.x/adventurer/svg?seed=Felix' },
  { id: 'adv2', label: 'Aneka', url: 'https://api.dicebear.com/10.x/adventurer/svg?seed=Aneka' },
  { id: 'adv3', label: 'Ruby', url: 'https://api.dicebear.com/10.x/adventurer/svg?seed=Ruby' },
]

export default function ProfilePage() {
  const { profile, updateProfile } = useAuth()
  const navigate = useNavigate()

  const [fullName, setFullName] = useState('')
  const [selectedUrl, setSelectedUrl] = useState('')
  const [customUrl, setCustomUrl] = useState('')
  const [isCustom, setIsCustom] = useState(false)
  const [saving, setSaving] = useState(false)

  // Initialize form state
  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name ?? '')
      const url = profile.avatar_url ?? ''
      
      const isPreset = PRESET_AVATARS.some(p => p.url === url)
      if (url === '') {
        // Dynamic name-based
        setSelectedUrl('')
        setCustomUrl('')
        setIsCustom(false)
      } else if (isPreset) {
        setSelectedUrl(url)
        setCustomUrl('')
        setIsCustom(false)
      } else {
        setSelectedUrl(url)
        setCustomUrl(url)
        setIsCustom(true)
      }
    }
  }, [profile])

  // Compute live preview avatar URL
  const previewAvatarUrl = isCustom ? customUrl : selectedUrl

  async function handleSave(e) {
    e.preventDefault()
    if (!fullName.trim()) {
      return toast.error('Name cannot be empty')
    }

    setSaving(true)
    const finalUrl = isCustom ? customUrl.trim() : selectedUrl

    const { error } = await updateProfile({
      full_name: fullName.trim(),
      avatar_url: finalUrl || null,
    })

    setSaving(false)
    if (error) {
      toast.error(error.message)
    } else {
      toast.success('Profile updated successfully!')
    }
  }

  return (
    <Layout>
      <div className="animate-fade-up flex flex-col gap-8 max-w-4xl mx-auto">
        {/* ── Page Header ── */}
        <PageHeader
          title="Your Profile"
          subtitle="Customize your name and avatar preferences"
          onBack={() => navigate('/')}
        />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column — Preview Card & Basic Form */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            <h2 className="text-xs font-bold text-text-muted uppercase tracking-wider pl-1">
              Live Preview
            </h2>
            <Card className="flex flex-col items-center justify-center p-8 gap-4 text-center relative overflow-hidden">
              {/* Decorative radial gradient */}
              <div 
                className="absolute inset-0 pointer-events-none opacity-20"
                style={{ background: 'radial-gradient(circle at center, rgba(101,163,13,0.3) 0%, transparent 70%)' }}
              />
              
              <div className="relative group">
                <Avatar 
                  name={fullName || 'User'} 
                  url={previewAvatarUrl} 
                  size="xl" 
                />
                {!previewAvatarUrl && (
                  <div className="absolute -top-1 -right-1 bg-primary text-white p-1 rounded-full shadow-lg" title="Dynamic Dicebear seed avatar">
                    <Sparkles size={12} className="animate-pulse" />
                  </div>
                )}
              </div>

              <div className="mt-2 min-w-0 w-full">
                <h3 className="font-display font-extrabold text-xl text-text truncate">
                  {fullName || 'No Name Set'}
                </h3>
                <p className="text-[10px] text-text-muted font-bold font-mono tracking-wider mt-1 uppercase">
                  {profile?.email}
                </p>
                <div className="inline-flex items-center gap-1.5 mt-2 bg-primary/10 border border-primary/20 rounded-full px-2.5 py-0.5 text-[10px] font-extrabold text-primary uppercase">
                  {previewAvatarUrl ? (isCustom ? 'Custom Avatar' : 'Preset Avatar') : 'Dynamic Seed Avatar'}
                </div>
              </div>
            </Card>

            <form id="profile-form" onSubmit={handleSave} className="flex flex-col gap-5">
              <FormField label="Full Name" helperText="Your display name in bill splits.">
                <Input
                  value={fullName}
                  onChange={e => setFullName(e.target.value)}
                  placeholder="e.g. Narendra Modi"
                />
              </FormField>

              <PrimaryButton
                type="submit"
                disabled={saving}
                className="w-full flex items-center justify-center gap-2 mt-2 cursor-pointer"
              >
                <Save size={16} />
                <span>{saving ? 'Saving changes...' : 'Save Changes'}</span>
              </PrimaryButton>
            </form>
          </div>

          {/* Right Column — Avatar Customizer */}
          <div className="lg:col-span-7 flex flex-col gap-6">
            <h2 className="text-xs font-bold text-text-muted uppercase tracking-wider pl-1">
              Select Avatar
            </h2>

            <Card className="flex flex-col gap-6 p-6">
              {/* Standard presets / type tabs */}
              <div className="flex p-1.5 rounded-2xl neu-inset bg-bg">
                <button
                  type="button"
                  onClick={() => setIsCustom(false)}
                  className={`flex-1 py-2 text-xs font-extrabold uppercase tracking-wider transition-all duration-200 cursor-pointer rounded-xl border-none flex items-center justify-center gap-1.5
                    ${!isCustom ? 'neu-extruded text-primary bg-bg font-extrabold' : 'text-text-muted hover:text-text bg-transparent font-bold'}`}
                >
                  <Sparkles size={13} />
                  <span>Presets & Dynamic</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsCustom(true)}
                  className={`flex-1 py-2 text-xs font-extrabold uppercase tracking-wider transition-all duration-200 cursor-pointer rounded-xl border-none flex items-center justify-center gap-1.5
                    ${isCustom ? 'neu-extruded text-primary bg-bg font-extrabold' : 'text-text-muted hover:text-text bg-transparent font-bold'}`}
                >
                  <Globe size={13} />
                  <span>Custom URL</span>
                </button>
              </div>

              {!isCustom ? (
                <div className="flex flex-col gap-5">
                  {/* Dynamic Option */}
                  <div>
                    <h3 className="text-[11px] font-bold text-text-muted uppercase tracking-wider mb-2">
                      Dynamic Choice
                    </h3>
                    <button
                      type="button"
                      onClick={() => setSelectedUrl('')}
                      className={`w-full flex items-center gap-4 p-4 rounded-2xl transition-all duration-200 border-none cursor-pointer text-left
                        ${selectedUrl === ''
                          ? 'neu-inset bg-bg border-primary/20'
                          : 'neu-extruded bg-bg hover:-translate-y-0.5'}`}
                    >
                      <div className="relative">
                        <Avatar name={fullName || 'default'} url={null} size="md" />
                        <div className="absolute -top-1 -right-1 bg-primary text-white p-0.5 rounded-full">
                          <RefreshCw size={10} className="animate-spin" style={{ animationDuration: '6s' }} />
                        </div>
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-extrabold text-text">Name-Based Avatar</p>
                        <p className="text-xs text-text-muted mt-0.5">
                          Generates a fun character dynamically based on your name.
                        </p>
                      </div>
                      {selectedUrl === '' && (
                        <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                          <span className="w-2 h-2 rounded-full bg-white" />
                        </div>
                      )}
                    </button>
                  </div>

                  {/* Preset Grid */}
                  <div>
                    <h3 className="text-[11px] font-bold text-text-muted uppercase tracking-wider mb-3">
                      Preset Designs
                    </h3>
                    <div className="grid grid-cols-4 sm:grid-cols-6 gap-3">
                      {PRESET_AVATARS.map(preset => {
                        const isSelected = selectedUrl === preset.url
                        return (
                          <button
                            key={preset.id}
                            type="button"
                            onClick={() => setSelectedUrl(preset.url)}
                            className={`relative aspect-square rounded-2xl flex items-center justify-center p-1 cursor-pointer transition-all duration-200 border-none bg-bg
                              ${isSelected 
                                ? 'neu-inset scale-95 ring-2 ring-primary ring-offset-1' 
                                : 'neu-extruded hover:-translate-y-0.5'}`}
                            title={preset.label}
                          >
                            <img 
                              src={preset.url} 
                              alt={preset.label} 
                              className="w-full h-full object-contain rounded-xl"
                            />
                            {isSelected && (
                              <div className="absolute -top-1 -right-1 bg-primary text-white w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-black">
                                ✓
                              </div>
                            )}
                          </button>
                        )
                      })}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col gap-4">
                  <FormField 
                    label="Custom Image URL" 
                    helperText="Paste a URL to any online SVG, PNG, or JPG image to set it as your profile picture."
                  >
                    <Input
                      type="url"
                      value={customUrl}
                      onChange={e => setCustomUrl(e.target.value)}
                      placeholder="https://example.com/avatar.png"
                      startIcon={<Globe size={14} />}
                    />
                  </FormField>
                  
                  {customUrl && (
                    <div className="flex items-center gap-3 p-4 rounded-2xl neu-inset bg-bg mt-2">
                      <Avatar name={fullName || 'User'} url={customUrl} size="md" />
                      <div>
                        <p className="text-xs font-bold text-text">Preview of Custom URL</p>
                        <p className="text-[10px] text-text-muted break-all mt-0.5 max-w-[300px]">
                          {customUrl}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  )
}
