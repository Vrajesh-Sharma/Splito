import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Layout from '../components/Layout'
import Avatar from '../components/Avatar'
import { PageHeader, Card, PrimaryButton, FormField, Input } from '../components/DesignSystem'
import { Save, Search, Type, Shuffle, Globe } from 'lucide-react'
import toast from 'react-hot-toast'

// All official Dicebear 10.x styles
const DICEBEAR_STYLES = [
  { id: 'adventurer', label: 'Adventurer' },
  { id: 'adventurer-neutral', label: 'Adventurer Neutral' },
  { id: 'avataaars', label: 'Avataaars' },
  { id: 'avataaars-neutral', label: 'Avataaars Neutral' },
  { id: 'big-ears', label: 'Big Ears' },
  { id: 'big-ears-neutral', label: 'Big Ears Neutral' },
  { id: 'big-smile', label: 'Big Smile' },
  { id: 'bottts', label: 'Bottts' },
  { id: 'bottts-neutral', label: 'Bottts Neutral' },
  { id: 'croodles', label: 'Croodles' },
  { id: 'croodles-neutral', label: 'Croodles Neutral' },
  { id: 'dylan', label: 'Dylan' },
  { id: 'fun-emoji', label: 'Fun Emoji' },
  { id: 'glass', label: 'Glass' },
  { id: 'icons', label: 'Icons' },
  { id: 'identicon', label: 'Identicon' },
  { id: 'initials', label: 'Initials' },
  { id: 'lorelei', label: 'Lorelei' },
  { id: 'lorelei-neutral', label: 'Lorelei Neutral' },
  { id: 'micah', label: 'Micah' },
  { id: 'miniavs', label: 'Miniavs' },
  { id: 'open-peeps', label: 'Open Peeps' },
  { id: 'personas', label: 'Personas' },
  { id: 'pixel-art', label: 'Pixel Art' },
  { id: 'pixel-art-neutral', label: 'Pixel Art Neutral' },
  { id: 'rings', label: 'Rings' },
  { id: 'shapes', label: 'Shapes' },
  { id: 'thumbs', label: 'Thumbs' },
]

// Helper to generate a batch of random cool seeds
function generateRandomSeeds(count = 8) {
  const adjectives = ['Happy', 'Cool', 'Sassy', 'Brave', 'Sunny', 'Clever', 'Wild', 'Chill', 'Jolly', 'Fancy', 'Swift', 'Gentle']
  const nouns = ['Panda', 'Tiger', 'Koala', 'Fox', 'Otter', 'Badger', 'Sloth', 'Rabbit', 'Eagle', 'Owl', 'Dolphin', 'Cat']
  const seeds = []
  for (let i = 0; i < count; i++) {
    const adj = adjectives[Math.floor(Math.random() * adjectives.length)]
    const noun = nouns[Math.floor(Math.random() * nouns.length)]
    const num = Math.floor(Math.random() * 100)
    seeds.push(`${adj}${noun}${num}`)
  }
  return seeds
}

export default function ProfilePage() {
  const { profile, updateProfile } = useAuth()
  const navigate = useNavigate()

  const [fullName, setFullName] = useState('')
  const [selectedStyle, setSelectedStyle] = useState('fun-emoji')
  const [avatarMode, setAvatarMode] = useState('dynamic') // 'dynamic', 'preset', 'custom-seed'
  const [customSeed, setCustomSeed] = useState('')
  const [randomSeeds, setRandomSeeds] = useState([])
  const [selectedPresetSeed, setSelectedPresetSeed] = useState('')
  const [customUrl, setCustomUrl] = useState('')
  const [isCustom, setIsCustom] = useState(false)
  const [saving, setSaving] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  // Generate initial random seeds on mount
  useEffect(() => {
    setRandomSeeds(generateRandomSeeds(8))
  }, [])

  // Initialize form state from loaded profile
  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name ?? '')
      const url = profile.avatar_url ?? ''
      
      if (url === '') {
        setSelectedStyle('fun-emoji')
        setAvatarMode('dynamic')
        setIsCustom(false)
        setCustomUrl('')
      } else {
        const dicebearRegex = /^https:\/\/api\.dicebear\.com\/10\.x\/([^/]+)\/svg\?seed=(.+)$/
        const match = url.match(dicebearRegex)
        
        if (match) {
          const style = match[1]
          const seed = decodeURIComponent(match[2])
          setSelectedStyle(style)
          setIsCustom(false)
          
          if (seed === (profile.full_name || '')) {
            setAvatarMode('dynamic')
          } else {
            setAvatarMode('custom-seed')
            setCustomSeed(seed)
          }
        } else {
          setIsCustom(true)
          setCustomUrl(url)
        }
      }
    }
  }, [profile])

  const activePresetSeed = selectedPresetSeed || (randomSeeds.length > 0 ? randomSeeds[0] : 'default')

  // Compute live preview avatar URL
  const previewAvatarUrl = isCustom 
    ? customUrl 
    : `https://api.dicebear.com/10.x/${selectedStyle}/svg?seed=${encodeURIComponent(
        avatarMode === 'dynamic' 
          ? (fullName.trim() || 'default') 
          : avatarMode === 'preset' 
            ? activePresetSeed 
            : (customSeed.trim() || 'default')
      )}`

  async function handleSave(e) {
    e.preventDefault()
    if (!fullName.trim()) {
      return toast.error('Name cannot be empty')
    }

    setSaving(true)
    let finalUrl = null

    if (isCustom) {
      finalUrl = customUrl.trim() || null
    } else {
      if (avatarMode === 'dynamic') {
        finalUrl = `https://api.dicebear.com/10.x/${selectedStyle}/svg?seed=${encodeURIComponent(fullName.trim())}`
      } else if (avatarMode === 'preset') {
        finalUrl = `https://api.dicebear.com/10.x/${selectedStyle}/svg?seed=${encodeURIComponent(activePresetSeed)}`
      } else {
        finalUrl = `https://api.dicebear.com/10.x/${selectedStyle}/svg?seed=${encodeURIComponent(customSeed.trim() || 'default')}`
      }
    }

    const { error } = await updateProfile({
      full_name: fullName.trim(),
      avatar_url: finalUrl,
    })

    setSaving(false)
    if (error) {
      toast.error(error.message)
    } else {
      toast.success('Profile updated successfully!')
    }
  }

  const filteredStyles = DICEBEAR_STYLES.filter(style =>
    style.label.toLowerCase().includes(searchQuery.toLowerCase())
  )

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
              </div>

              <div className="mt-2 min-w-0 w-full">
                <h3 className="font-display font-extrabold text-xl text-text truncate">
                  {fullName || 'No Name Set'}
                </h3>
                <p className="text-[10px] text-text-muted font-bold font-mono tracking-wider mt-1 uppercase">
                  {profile?.email}
                </p>
                <div className="inline-flex items-center gap-1.5 mt-2 bg-primary/10 border border-primary/20 rounded-full px-2.5 py-0.5 text-[10px] font-extrabold text-primary uppercase">
                  {isCustom 
                    ? 'Custom URL' 
                    : `${DICEBEAR_STYLES.find(s => s.id === selectedStyle)?.label || selectedStyle} (${avatarMode})`}
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
              {/* Tabs */}
              <div className="flex p-1.5 rounded-2xl neu-inset bg-bg">
                <button
                  type="button"
                  onClick={() => setIsCustom(false)}
                  className={`flex-1 py-2 text-xs font-extrabold uppercase tracking-wider transition-all duration-200 cursor-pointer rounded-xl border-none flex items-center justify-center
                    ${!isCustom ? 'neu-extruded text-primary bg-bg font-extrabold' : 'text-text-muted hover:text-text bg-transparent font-bold'}`}
                >
                  <span>Dicebear Styles</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsCustom(true)}
                  className={`flex-1 py-2 text-xs font-extrabold uppercase tracking-wider transition-all duration-200 cursor-pointer rounded-xl border-none flex items-center justify-center
                    ${isCustom ? 'neu-extruded text-primary bg-bg font-extrabold' : 'text-text-muted hover:text-text bg-transparent font-bold'}`}
                >
                  <span>Custom URL</span>
                </button>
              </div>

              {!isCustom ? (
                <div className="flex flex-col gap-5">
                  {/* Style Categories Grid */}
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center justify-between">
                      <h3 className="text-[11px] font-bold text-text-muted uppercase tracking-wider pl-1">
                        Choose Style Category ({filteredStyles.length})
                      </h3>
                      <div className="w-44 scale-90 origin-right">
                        <Input
                          value={searchQuery}
                          onChange={e => setSearchQuery(e.target.value)}
                          placeholder="Search styles..."
                          startIcon={<Search size={13} />}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2 max-h-56 overflow-y-auto p-2 rounded-2xl neu-inset bg-bg">
                      {filteredStyles.map(style => {
                        const isSelected = selectedStyle === style.id
                        return (
                          <button
                            key={style.id}
                            type="button"
                            onClick={() => setSelectedStyle(style.id)}
                            className={`flex flex-col items-center gap-1.5 p-2 rounded-xl border-none transition-all duration-200 cursor-pointer text-left w-full
                              ${isSelected 
                                ? 'neu-inset bg-bg text-primary scale-95 ring-2 ring-primary/40' 
                                : 'neu-extruded bg-bg hover:-translate-y-0.5 text-text-muted hover:text-text'}`}
                          >
                            <div className="w-10 h-10 rounded-lg overflow-hidden bg-white/80 flex items-center justify-center border border-[#d1d9e6]/50">
                              <img 
                                src={`https://api.dicebear.com/10.x/${style.id}/svg?seed=${encodeURIComponent(fullName.trim() || 'User')}`} 
                                alt={style.label} 
                                className="w-full h-full object-contain"
                                loading="lazy"
                              />
                            </div>
                            <span className="text-[9px] font-bold text-center truncate w-full leading-tight">
                              {style.label}
                            </span>
                          </button>
                        )
                      })}
                    </div>
                  </div>

                  {/* Seed / Flavor Configuration */}
                  <div className="flex flex-col gap-4 pt-4 border-t border-[#d1d9e6]/30">
                    <h3 className="text-[11px] font-bold text-text-muted uppercase tracking-wider pl-1">
                      Configure Avatar Seed
                    </h3>

                    <div className="flex p-1.5 rounded-2xl neu-inset bg-bg">
                      <button
                        type="button"
                        onClick={() => setAvatarMode('dynamic')}
                        className={`flex-1 py-2 text-[10px] font-extrabold uppercase tracking-wider transition-all duration-200 cursor-pointer rounded-xl border-none flex items-center justify-center
                          ${avatarMode === 'dynamic' ? 'neu-extruded text-primary bg-bg' : 'text-text-muted hover:text-text bg-transparent'}`}
                      >
                        <span>Dynamic (Name)</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setAvatarMode('preset')
                          if (!selectedPresetSeed && randomSeeds.length > 0) {
                            setSelectedPresetSeed(randomSeeds[0])
                          }
                        }}
                        className={`flex-1 py-2 text-[10px] font-extrabold uppercase tracking-wider transition-all duration-200 cursor-pointer rounded-xl border-none flex items-center justify-center
                          ${avatarMode === 'preset' ? 'neu-extruded text-primary bg-bg' : 'text-text-muted hover:text-text bg-transparent'}`}
                      >
                        <span>Presets</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setAvatarMode('custom-seed')}
                        className={`flex-1 py-2 text-[10px] font-extrabold uppercase tracking-wider transition-all duration-200 cursor-pointer rounded-xl border-none flex items-center justify-center
                          ${avatarMode === 'custom-seed' ? 'neu-extruded text-primary bg-bg' : 'text-text-muted hover:text-text bg-transparent'}`}
                      >
                        <span>Custom Seed</span>
                      </button>
                    </div>

                    {/* Mode Panels */}
                    {avatarMode === 'dynamic' && (
                      <div className="flex flex-col gap-1.5 p-4 rounded-2xl neu-inset bg-bg/50 text-left">
                        <p className="text-xs font-bold text-text">
                          Dynamic Seed: {fullName.trim() || 'default'}
                        </p>
                        <p className="text-[11px] text-text-muted leading-relaxed">
                          Your avatar is generated dynamically using your display name. Changing your name on the left will instantly update your look!
                        </p>
                      </div>
                    )}

                    {avatarMode === 'preset' && (
                      <div className="flex flex-col gap-3 text-left">
                        <div className="flex items-center justify-between pl-1">
                          <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider">
                            Choose a seed or shuffle for new ones:
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              const fresh = generateRandomSeeds(8)
                              setRandomSeeds(fresh)
                              setSelectedPresetSeed(fresh[0])
                            }}
                            className="bg-bg hover:-translate-y-0.5 text-text-muted hover:text-text active:scale-95 shadow-[4px_4px_8px_#d1d9e6,-4px_-4px_8px_rgba(255,255,255,0.65)] rounded-xl py-1.5 px-3.5 text-[10px] font-extrabold uppercase tracking-wider border-none flex items-center gap-1 cursor-pointer transition-all duration-200"
                          >
                            <Shuffle size={10} />
                            <span>Shuffle</span>
                          </button>
                        </div>

                        <div className="grid grid-cols-4 gap-3 p-1">
                          {randomSeeds.map(seed => {
                            const isSelected = activePresetSeed === seed
                            return (
                              <button
                                key={seed}
                                type="button"
                                onClick={() => setSelectedPresetSeed(seed)}
                                className={`relative aspect-square rounded-2xl flex flex-col items-center justify-center p-1.5 cursor-pointer transition-all duration-200 border-none bg-bg
                                  ${isSelected 
                                    ? 'neu-inset scale-95 ring-2 ring-primary/40' 
                                    : 'neu-extruded hover:-translate-y-0.5'}`}
                                title={seed}
                              >
                                <img 
                                  src={`https://api.dicebear.com/10.x/${selectedStyle}/svg?seed=${encodeURIComponent(seed)}`} 
                                  alt={seed} 
                                  className="w-full h-full object-contain rounded-xl"
                                />
                                <span className="text-[8px] font-mono text-text-muted truncate w-full text-center mt-1 font-bold">
                                  {seed}
                                </span>
                              </button>
                            )
                          })}
                        </div>
                      </div>
                    )}

                    {avatarMode === 'custom-seed' && (
                      <div className="flex flex-col gap-2">
                        <FormField 
                          label="Custom Seed Text" 
                          helperText="Type any words to generate a unique combination of attributes for the selected style."
                        >
                          <Input
                            value={customSeed}
                            onChange={e => setCustomSeed(e.target.value)}
                            placeholder="e.g. IronMan, FlyingPanda, Batman"
                            startIcon={<Type size={14} />}
                          />
                        </FormField>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="flex flex-col gap-4 text-left">
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
