import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { differenceInDays, parseISO, format } from 'date-fns'
import { Heart, CheckCircle } from 'lucide-react'

const EVENT_EMOJIS = {
  'Mayoon':'💛','Mehndi':'🌿','Barat':'🌹',
  'Walima':'✨','Bachelor Trip':'🎉','Honeymoon':'🌴'
}

function Countdown({ date }) {
  const [days, setDays] = useState(null)
  useEffect(() => {
    try { setDays(differenceInDays(parseISO(date), new Date())) } catch {}
  }, [date])
  if (days === null || days <= 0) return null
  return (
    <div className="text-center py-3">
      <p className="font-display text-5xl font-bold" style={{color:'var(--rose)'}}>{days}</p>
      <p className="text-sm mt-1" style={{color:'var(--text-soft)'}}>days until the wedding</p>
    </div>
  )
}

export default function Invitation() {
  const { token } = useParams()
  const [guest,       setGuest]       = useState(null)
  const [events,      setEvents]      = useState([])
  const [settings,    setSettings]    = useState({})
  const [loading,     setLoading]     = useState(true)
  const [notFound,    setNotFound]    = useState(false)
  const [verified,    setVerified]    = useState(false)
  const [nameInput,   setNameInput]   = useState('')
  const [nameError,   setNameError]   = useState('')
  const [submitted,   setSubmitted]   = useState(false)
  const [selected,    setSelected]    = useState([])
  const [saving,      setSaving]      = useState(false)

  // Load guest by token directly from Supabase
  useEffect(() => {
    const load = async () => {
      setLoading(true)
      // Load guest
      const { data: guestData } = await supabase
        .from('guests')
        .select('*')
        .eq('invite_token', token)
        .single()

      if (!guestData) { setNotFound(true); setLoading(false); return }
      setGuest(guestData)
      setSelected(guestData.events_confirmed || [])

      // Load events
      const { data: eventsData } = await supabase
        .from('events')
        .select('*')
        .order('date', { ascending: true })
      if (eventsData) setEvents(eventsData)

      // Load settings
      const { data: settingsData } = await supabase.from('settings').select('*')
      if (settingsData) {
        const obj = {}
        settingsData.forEach(s => { obj[s.key] = s.value })
        setSettings(obj)
      }

      setLoading(false)
    }
    load()
  }, [token])

  const weddingTitle = settings.wedding_title || 'Our Wedding'
  const weddingDate  = settings.wedding_date  || ''
  const invitedEvents = events.filter(e => (guest?.events_invited || []).includes(e.id))

  const verify = (e) => {
    e.preventDefault()
    const firstName = guest.name.split(' ')[0].toLowerCase()
    if (nameInput.trim().toLowerCase().includes(firstName)) {
      setVerified(true)
    } else {
      setNameError('Name does not match. Please enter your name as it appears on the invitation.')
    }
  }

  const toggleEvent = (id) => {
    setSelected(p => p.includes(id) ? p.filter(x => x !== id) : [...p, id])
  }

  const submitRsvp = async () => {
    setSaving(true)
    const newStatus = selected.length > 0 ? 'confirmed' : 'declined'
    const { error } = await supabase
      .from('guests')
      .update({
        events_confirmed: selected,
        rsvp_status: newStatus,
      })
      .eq('id', guest.id)

    if (error) {
      alert('Something went wrong. Please try again.')
      setSaving(false)
      return
    }
    setSubmitted(true)
    setSaving(false)
  }

  // ── Loading ──
  if (loading) {
    return (
      <div className="invite-page">
        <div className="text-center">
          <p className="text-5xl mb-3 animate-pulse-soft">🌹</p>
          <p className="font-display text-xl font-semibold" style={{color:'var(--text-dark)'}}>
            Loading your invitation…
          </p>
        </div>
      </div>
    )
  }

  // ── Not found ──
  if (notFound) {
    return (
      <div className="invite-page">
        <div className="text-center max-w-md">
          <p className="text-5xl mb-4">💔</p>
          <h2 className="font-display text-2xl font-bold mb-2" style={{color:'var(--text-dark)'}}>
            Invitation Not Found
          </h2>
          <p style={{color:'var(--text-soft)'}}>
            This invitation link is invalid or has expired. Please contact the family for a new link.
          </p>
        </div>
      </div>
    )
  }

  // ── Name verification ──
  if (!verified) {
    return (
      <div className="invite-page floral-bg">
        <div className="w-full max-w-md">
          <div className="card text-center">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-5"
              style={{background:'var(--rose)'}}>
              <Heart size={28} className="text-white fill-white"/>
            </div>
            <h1 className="font-display text-3xl font-bold mb-1" style={{color:'var(--text-dark)'}}>
              You're Invited
            </h1>
            <p className="font-display text-xl mb-5" style={{color:'var(--gold)'}}>
              {weddingTitle}
            </p>
            <div className="gold-divider"/>
            <p className="text-sm my-4" style={{color:'var(--text-soft)'}}>
              Please confirm your name to access your invitation
            </p>
            <form onSubmit={verify} className="space-y-4 text-left">
              <div>
                <label className="label">Your Name</label>
                <input
                  className="input-field"
                  placeholder="Enter your full name"
                  value={nameInput}
                  onChange={e => { setNameInput(e.target.value); setNameError('') }}
                  required
                />
                {nameError && (
                  <p className="text-xs mt-1.5 text-red-600">{nameError}</p>
                )}
              </div>
              <button type="submit" className="btn-primary w-full justify-center py-2.5">
                View My Invitation →
              </button>
            </form>
          </div>
        </div>
      </div>
    )
  }

  // ── Thank you ──
  if (submitted) {
    return (
      <div className="invite-page floral-bg">
        <div className="w-full max-w-md text-center">
          <div className="card">
            <p className="text-6xl mb-4">{selected.length > 0 ? '🌹' : '💌'}</p>
            <h2 className="font-display text-2xl font-bold mb-2" style={{color:'var(--text-dark)'}}>
              {selected.length > 0 ? "See you there!" : "We'll miss you!"}
            </h2>
            <p className="mb-5" style={{color:'var(--text-soft)'}}>
              {selected.length > 0
                ? `Thank you ${guest.name.split(' ')[0]}! Your RSVP has been saved. We can't wait to celebrate with you!`
                : `Thank you for letting us know, ${guest.name.split(' ')[0]}. We hope to see you another time.`
              }
            </p>
            {selected.length > 0 && (
              <div className="space-y-2">
                {invitedEvents.filter(e => selected.includes(e.id)).map(e => (
                  <div key={e.id} className="flex items-center gap-2 px-3 py-2 rounded-xl"
                    style={{background:'var(--champagne)'}}>
                    <span>{EVENT_EMOJIS[e.name] || '💍'}</span>
                    <span className="text-sm font-medium" style={{color:'var(--text-dark)'}}>{e.name}</span>
                    {e.date && (
                      <span className="text-xs ml-auto" style={{color:'var(--text-soft)'}}>
                        {(() => { try { return format(parseISO(e.date), 'dd MMM') } catch { return '' } })()}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
            <p className="text-xs mt-6" style={{color:'var(--text-muted)'}}>
              Your response has been saved ✓
            </p>
          </div>
        </div>
      </div>
    )
  }

  // ── Main invitation ──
  return (
    <div className="invite-page floral-bg">
      <div className="w-full max-w-lg space-y-5">

        {/* Header */}
        <div className="card text-center relative overflow-hidden">
          <div className="absolute -top-6 -right-6 w-24 h-24 rounded-full opacity-30"
            style={{background:'var(--gold)'}}/>
          <div className="absolute -bottom-4 -left-4 w-16 h-16 rounded-full opacity-20"
            style={{background:'var(--rose)'}}/>
          <div className="relative z-10">
            <p className="text-5xl mb-3">🌹</p>
            <p className="text-xs font-medium uppercase tracking-widest mb-1"
              style={{color:'var(--gold)'}}>
              You are cordially invited to
            </p>
            <h1 className="font-display text-3xl font-bold" style={{color:'var(--text-dark)'}}>
              {weddingTitle}
            </h1>
            <p className="font-display text-lg mt-1" style={{color:'var(--rose)'}}>
              Wedding Celebrations
            </p>
            <div className="gold-divider"/>
            <p className="font-medium" style={{color:'var(--text-mid)'}}>
              Dear {guest.name} 💌
            </p>
            <Countdown date={weddingDate}/>
          </div>
        </div>

        {/* RSVP card */}
        <div className="card">
          <h3 className="font-display text-lg font-semibold mb-1"
            style={{color:'var(--text-dark)'}}>
            Your Invitation
          </h3>
          <p className="text-sm mb-4" style={{color:'var(--text-soft)'}}>
            Select which events you will be attending:
          </p>

          <div className="space-y-3">
            {invitedEvents.length === 0 && (
              <p className="text-sm text-center py-4" style={{color:'var(--text-muted)'}}>
                No events have been assigned to your invitation yet.
              </p>
            )}
            {invitedEvents.map(evt => {
              const isSelected = selected.includes(evt.id)
              let dateStr = ''
              try { if (evt.date) dateStr = format(parseISO(evt.date), 'EEEE, MMMM d, yyyy') } catch {}

              return (
                <button
                  key={evt.id}
                  onClick={() => toggleEvent(evt.id)}
                  className="w-full flex items-center gap-3 p-3.5 rounded-xl border-2 transition-all text-left"
                  style={{
                    borderColor: isSelected ? 'var(--rose)' : 'var(--champagne-border)',
                    background:  isSelected ? 'var(--rose-pale)' : 'white',
                  }}
                >
                  <span className="text-2xl">{EVENT_EMOJIS[evt.name] || '💍'}</span>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm" style={{color:'var(--text-dark)'}}>
                      {evt.name}
                    </p>
                    {dateStr && (
                      <p className="text-xs mt-0.5" style={{color:'var(--text-soft)'}}>{dateStr}</p>
                    )}
                    {evt.location && (
                      <p className="text-xs" style={{color:'var(--text-muted)'}}>{evt.location}</p>
                    )}
                  </div>
                  <div className="w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0"
                    style={{
                      borderColor: isSelected ? 'var(--rose)' : 'var(--champagne-border)',
                      background:  isSelected ? 'var(--rose)' : 'transparent',
                    }}>
                    {isSelected && <CheckCircle size={14} className="text-white fill-white"/>}
                  </div>
                </button>
              )
            })}
          </div>

          {/* Logistics note */}
          {(guest.transport_needed || guest.accommodation_needed) && (
            <div className="mt-4 p-3 rounded-xl" style={{background:'var(--champagne)'}}>
              <p className="text-xs font-semibold mb-1" style={{color:'var(--gold)'}}>
                ARRANGEMENTS NOTED FOR YOU
              </p>
              {guest.transport_needed && (
                <p className="text-sm" style={{color:'var(--text-mid)'}}>🚗 Transport has been arranged</p>
              )}
              {guest.accommodation_needed && (
                <p className="text-sm mt-0.5" style={{color:'var(--text-mid)'}}>🏨 Accommodation has been arranged</p>
              )}
            </div>
          )}

          <div className="mt-5 space-y-2">
            <button
              onClick={submitRsvp}
              disabled={selected.length === 0 || saving}
              className="btn-primary w-full justify-center py-3 text-base disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {saving
                ? 'Saving your RSVP…'
                : `✅ Confirm Attendance (${selected.length} event${selected.length !== 1 ? 's' : ''})`
              }
            </button>
            <button
              onClick={() => { setSelected([]); setTimeout(submitRsvp, 50) }}
              className="btn-secondary w-full justify-center py-2.5 text-sm"
              disabled={saving}
            >
              Unable to attend
            </button>
          </div>
        </div>

        <p className="text-center text-xs" style={{color:'var(--text-muted)'}}>
          Made with ❤️ · Shaadi Planner
        </p>
      </div>
    </div>
  )
}
