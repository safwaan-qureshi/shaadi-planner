import { useState, useRef } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { format, parseISO, differenceInDays } from 'date-fns'
import {
  Mail, Globe, MessageCircle, Copy, Check, Eye,
  Sparkles, ChevronRight, Heart, MapPin, CalendarDays,
  Users, Download, Share2, X
} from 'lucide-react'

const EVENT_EMOJIS = { 'Mayoon':'💛','Mehndi':'🌿','Barat':'🌹','Walima':'✨','Bachelor Trip':'🎉','Honeymoon':'🌴' }
const EVENT_GRADIENTS = {
  'Mayoon':'linear-gradient(135deg,#f59e0b,#d97706)',
  'Mehndi':'linear-gradient(135deg,#10b981,#059669)',
  'Barat':'linear-gradient(135deg,#e11d48,#9f1239)',
  'Walima':'linear-gradient(135deg,#8b5cf6,#6d28d9)',
  'Bachelor Trip':'linear-gradient(135deg,#3b82f6,#1d4ed8)',
  'Honeymoon':'linear-gradient(135deg,#14b8a6,#0f766e)',
}

// ── Digital Card Preview ──────────────────────────────────────────────────────
function DigitalCardPreview({ event, weddingTitle, guestName = 'Guest Name' }) {
  const emoji    = EVENT_EMOJIS[event.name] || '💍'
  const gradient = EVENT_GRADIENTS[event.name] || 'linear-gradient(135deg,#b5484a,#7c2d12)'

  let dateStr = '', timeStr = ''
  try {
    if (event.date) {
      dateStr = format(parseISO(event.date), 'EEEE, MMMM d, yyyy')
    }
  } catch {}

  return (
    <div className="w-full max-w-sm mx-auto rounded-3xl overflow-hidden shadow-2xl"
      style={{fontFamily:'"Playfair Display", serif'}}>

      {/* Top gradient section */}
      <div className="relative p-8 text-white text-center" style={{background: gradient, minHeight: 220}}>
        {/* Decorative circles */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden">
          <div className="absolute -top-8 -right-8 w-40 h-40 rounded-full bg-white/10"/>
          <div className="absolute -bottom-8 -left-8 w-32 h-32 rounded-full bg-white/10"/>
          <div className="absolute top-4 left-4 w-16 h-16 rounded-full bg-white/5"/>
        </div>

        <div className="relative z-10">
          <p className="text-5xl mb-3">{emoji}</p>
          <p className="text-xs font-medium tracking-widest uppercase mb-1" style={{color:'rgba(255,255,255,0.7)', fontFamily:'"DM Sans",sans-serif'}}>
            You are invited to
          </p>
          <h2 className="text-3xl font-bold text-white leading-tight">{event.name}</h2>
          <div className="mt-2 w-16 h-0.5 mx-auto" style={{background:'rgba(255,255,255,0.4)'}}/>
          <p className="mt-3 text-lg font-semibold" style={{color:'rgba(255,255,255,0.9)'}}>
            {weddingTitle}
          </p>
        </div>
      </div>

      {/* White content section */}
      <div className="bg-white px-7 py-6 space-y-4">
        {/* Dear guest */}
        <div className="text-center">
          <p className="text-xs uppercase tracking-widest mb-1" style={{color:'var(--text-muted)', fontFamily:'"DM Sans",sans-serif'}}>Dear</p>
          <p className="text-xl font-semibold" style={{color:'var(--text-dark)'}}>{guestName}</p>
        </div>

        <div className="h-px" style={{background:'linear-gradient(to right, transparent, var(--champagne-border), transparent)'}}/>

        {/* Event details */}
        <div className="space-y-2.5">
          {dateStr && (
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                style={{background:'var(--champagne)'}}>
                <CalendarDays size={14} style={{color:'var(--rose)'}}/>
              </div>
              <p className="text-sm" style={{color:'var(--text-mid)', fontFamily:'"DM Sans",sans-serif'}}>{dateStr}</p>
            </div>
          )}
          {event.location && (
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                style={{background:'var(--champagne)'}}>
                <MapPin size={14} style={{color:'var(--rose)'}}/>
              </div>
              <p className="text-sm" style={{color:'var(--text-mid)', fontFamily:'"DM Sans",sans-serif'}}>{event.location}</p>
            </div>
          )}
          {event.guest_count && (
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                style={{background:'var(--champagne)'}}>
                <Users size={14} style={{color:'var(--rose)'}}/>
              </div>
              <p className="text-sm" style={{color:'var(--text-mid)', fontFamily:'"DM Sans",sans-serif'}}>{event.guest_count} guests</p>
            </div>
          )}
        </div>

        <div className="h-px" style={{background:'linear-gradient(to right, transparent, var(--champagne-border), transparent)'}}/>

        {/* Footer */}
        <div className="text-center pb-1">
          <p className="text-xs" style={{color:'var(--text-muted)', fontFamily:'"DM Sans",sans-serif'}}>
            With love & joy 🌹
          </p>
          <p className="text-sm font-semibold mt-0.5" style={{color:'var(--rose)'}}>
            {weddingTitle}
          </p>
        </div>
      </div>
    </div>
  )
}

// ── Mini Website Preview ──────────────────────────────────────────────────────
function MiniWebsitePreview({ event, weddingTitle, weddingDate }) {
  const emoji    = EVENT_EMOJIS[event.name] || '💍'

  let days = null
  let dateStr = ''
  try {
    if (weddingDate) days = differenceInDays(parseISO(weddingDate), new Date())
    if (event.date)  dateStr = format(parseISO(event.date), 'EEE, MMM d, yyyy')
  } catch {}

  return (
    <div className="w-full max-w-sm mx-auto rounded-3xl overflow-hidden shadow-2xl border"
      style={{borderColor:'var(--champagne-border)', fontFamily:'"DM Sans",sans-serif',
              background:'linear-gradient(180deg,#fdf8f0 0%,#f7e9d0 100%)'}}>

      {/* Header */}
      <div className="px-6 pt-8 pb-5 text-center">
        <p className="text-5xl mb-2">{emoji}</p>
        <p className="text-xs font-medium uppercase tracking-widest" style={{color:'var(--gold)'}}>
          Wedding Invitation
        </p>
        <h2 className="font-display text-2xl font-bold mt-1" style={{color:'var(--text-dark)'}}>
          {weddingTitle}
        </h2>
        <p className="font-display text-lg mt-0.5" style={{color:'var(--rose)'}}>
          {event.name} Celebrations
        </p>
      </div>

      {/* Countdown */}
      {days !== null && days > 0 && (
        <div className="mx-4 mb-4 py-3 rounded-2xl text-center"
          style={{background:'var(--rose)', color:'white'}}>
          <p className="font-display text-3xl font-bold">{days}</p>
          <p className="text-xs mt-0.5" style={{color:'rgba(255,255,255,0.8)'}}>days to go</p>
        </div>
      )}

      {/* Details card */}
      <div className="mx-4 mb-4 p-4 rounded-2xl bg-white space-y-2.5">
        {dateStr && (
          <div className="flex items-center gap-2.5">
            <CalendarDays size={15} style={{color:'var(--rose)', flexShrink:0}}/>
            <p className="text-sm" style={{color:'var(--text-mid)'}}>{dateStr}</p>
          </div>
        )}
        {event.location && (
          <div className="flex items-center gap-2.5">
            <MapPin size={15} style={{color:'var(--rose)', flexShrink:0}}/>
            <p className="text-sm" style={{color:'var(--text-mid)'}}>{event.location}</p>
          </div>
        )}
      </div>

      {/* RSVP buttons preview */}
      <div className="mx-4 mb-6 space-y-2">
        <div className="py-2.5 rounded-xl text-center text-sm font-medium text-white"
          style={{background:'var(--rose)'}}>
          ✅ Yes, I'll be there!
        </div>
        <div className="py-2.5 rounded-xl text-center text-sm font-medium border"
          style={{color:'var(--text-mid)', borderColor:'var(--champagne-border)', background:'white'}}>
          Unable to attend
        </div>
      </div>

      <div className="pb-4 text-center">
        <p className="text-xs" style={{color:'var(--text-muted)'}}>
          🔗 Guests can RSVP directly from this link
        </p>
      </div>
    </div>
  )
}

// ── Invite Link Card ──────────────────────────────────────────────────────────
function InviteLinkCard({ guest, eventId, weddingTitle, type }) {
  const [copied, setCopied] = useState(false)
  const inviteUrl = `${window.location.origin}/invite/${guest.invite_token}`

  const copyLink = () => {
    navigator.clipboard.writeText(inviteUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const eventNames = (guest.events_invited || [])
    .map(id => {
      const names = { '1':'Mayoon','2':'Mehndi','3':'Barat','4':'Walima','5':'Bachelor Trip','6':'Honeymoon' }
      return names[id] || id
    }).join(', ')

  const whatsappMsg = encodeURIComponent(
    `Assalamu Alaikum ${guest.name.split(' ')[0]}! 🌹\n\nYou are cordially invited to the *${weddingTitle}* wedding celebrations.\n\nEvents: ${eventNames}\n\nPlease click your personal invitation link to RSVP:\n\n${inviteUrl}\n\nWe look forward to celebrating with you! 💌`
  )
  const phone = guest.phone?.replace(/[^0-9]/g, '')
  const waUrl = phone ? `https://wa.me/${phone}?text=${whatsappMsg}` : `https://wa.me/?text=${whatsappMsg}`

  return (
    <div className="card py-3 px-4 flex items-center gap-3">
      <div className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 text-white font-bold"
        style={{background:'var(--rose)', fontSize:'0.875rem'}}>
        {guest.name.charAt(0)}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-medium text-sm truncate" style={{color:'var(--text-dark)'}}>{guest.name}</p>
        <p className="text-xs truncate" style={{color:'var(--text-muted)'}}>{eventNames || 'No events assigned'}</p>
      </div>
      <div className="flex items-center gap-1.5 flex-shrink-0">
        <span className={`badge text-xs ${guest.rsvp_status === 'confirmed' ? 'status-confirmed' : guest.rsvp_status === 'declined' ? 'status-declined' : 'status-pending'}`}>
          {guest.rsvp_status === 'confirmed' ? 'Confirmed' : guest.rsvp_status === 'declined' ? 'Declined' : 'Pending'}
        </span>
        <button onClick={copyLink} className="btn-ghost py-1 px-1.5" title="Copy invite link">
          {copied ? <Check size={13} className="text-green-600"/> : <Copy size={13}/>}
        </button>
        <a href={waUrl} target="_blank" rel="noopener noreferrer"
          className="btn-whatsapp py-1 px-2 text-xs">
          <MessageCircle size={12}/>Send
        </a>
      </div>
    </div>
  )
}

// ── Main Invitations Page ─────────────────────────────────────────────────────
export default function Invitations() {
  const { events, guests, weddingTitle, weddingDate } = useApp()
  const [searchParams] = useSearchParams()

  const preselectedEventId = searchParams.get('event')
  const [selectedEventId, setSelectedEventId] = useState(preselectedEventId || events[0]?.id || '')
  const [inviteType, setInviteType]           = useState('website')   // 'card' | 'website'
  const [previewGuest, setPreviewGuest]       = useState('Zara Aunt')
  const [showAllGuests, setShowAllGuests]     = useState(false)

  const selectedEvent = events.find(e => e.id === selectedEventId) || events[0]
  const eventGuests   = guests.filter(g => (g.events_invited || []).includes(selectedEventId))
  const displayGuests = showAllGuests ? eventGuests : eventGuests.slice(0, 6)

  const allLinks = guests.map(g => `${window.location.origin}/invite/${g.invite_token}`).join('\n')

  const copyAllLinks = () => {
    navigator.clipboard.writeText(allLinks)
  }

  if (!selectedEvent) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div>
          <h1 className="section-title">Invitations 💌</h1>
          <p className="text-sm mt-1" style={{color:'var(--text-soft)'}}>Create and send digital invitations to your guests</p>
        </div>
        <div className="card text-center py-16">
          <p className="text-4xl mb-3">📅</p>
          <p className="font-display text-lg font-semibold" style={{color:'var(--text-dark)'}}>No events yet</p>
          <p className="text-sm mt-1 mb-4" style={{color:'var(--text-soft)'}}>Add wedding events first, then create invitations for each one</p>
          <Link to="/events" className="btn-primary inline-flex">Go to Events</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="section-title flex items-center gap-2">Invitations 💌</h1>
        <p className="text-sm mt-1" style={{color:'var(--text-soft)'}}>
          Create beautiful digital invitations and send them via WhatsApp
        </p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">

        {/* ── Left panel: Controls ── */}
        <div className="space-y-5">

          {/* Step 1: Select event */}
          <div className="card">
            <h3 className="font-display font-semibold mb-3" style={{color:'var(--text-dark)'}}>
              Step 1 · Select Event
            </h3>
            <div className="grid grid-cols-2 gap-2">
              {events.map(evt => {
                const isActive = selectedEventId === evt.id
                const emoji = EVENT_EMOJIS[evt.name] || '💍'
                return (
                  <button
                    key={evt.id}
                    onClick={() => setSelectedEventId(evt.id)}
                    className="flex items-center gap-2.5 p-3 rounded-xl border-2 text-left transition-all"
                    style={{
                      borderColor: isActive ? 'var(--rose)' : 'var(--champagne-border)',
                      background:  isActive ? 'var(--rose-pale)' : 'white',
                    }}
                  >
                    <span className="text-xl flex-shrink-0">{emoji}</span>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold truncate" style={{color: isActive ? 'var(--rose)' : 'var(--text-dark)'}}>{evt.name}</p>
                      {evt.date && (
                        <p className="text-xs truncate" style={{color:'var(--text-muted)'}}>
                          {(() => { try { return format(parseISO(evt.date), 'dd MMM') } catch { return evt.date } })()}
                        </p>
                      )}
                    </div>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Step 2: Choose invitation type */}
          <div className="card">
            <h3 className="font-display font-semibold mb-3" style={{color:'var(--text-dark)'}}>
              Step 2 · Choose Invitation Style
            </h3>
            <div className="grid grid-cols-2 gap-3">
              {/* Digital Card */}
              <button
                onClick={() => setInviteType('card')}
                className="flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all"
                style={{
                  borderColor: inviteType === 'card' ? 'var(--rose)' : 'var(--champagne-border)',
                  background:  inviteType === 'card' ? 'var(--rose-pale)' : 'var(--cream)',
                }}
              >
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center"
                  style={{background: inviteType === 'card' ? 'var(--rose)' : 'var(--champagne)'}}>
                  <Mail size={22} style={{color: inviteType === 'card' ? 'white' : 'var(--gold)'}}/>
                </div>
                <p className="font-semibold text-sm" style={{color: inviteType === 'card' ? 'var(--rose)' : 'var(--text-dark)'}}>
                  Digital Card
                </p>
                <p className="text-xs text-center" style={{color:'var(--text-muted)'}}>
                  Beautiful image-style invitation card
                </p>
                {inviteType === 'card' && (
                  <span className="badge status-confirmed text-xs">Selected ✓</span>
                )}
              </button>

              {/* Mini Website */}
              <button
                onClick={() => setInviteType('website')}
                className="flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all"
                style={{
                  borderColor: inviteType === 'website' ? 'var(--rose)' : 'var(--champagne-border)',
                  background:  inviteType === 'website' ? 'var(--rose-pale)' : 'var(--cream)',
                }}
              >
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center"
                  style={{background: inviteType === 'website' ? 'var(--rose)' : 'var(--champagne)'}}>
                  <Globe size={22} style={{color: inviteType === 'website' ? 'white' : 'var(--gold)'}}/>
                </div>
                <p className="font-semibold text-sm" style={{color: inviteType === 'website' ? 'var(--rose)' : 'var(--text-dark)'}}>
                  Mini Website
                </p>
                <p className="text-xs text-center" style={{color:'var(--text-muted)'}}>
                  Interactive link with RSVP & countdown
                </p>
                {inviteType === 'website' && (
                  <span className="badge status-confirmed text-xs">Selected ✓</span>
                )}
              </button>
            </div>

            {/* Type explanation */}
            <div className="mt-3 p-3 rounded-xl text-sm" style={{background:'var(--champagne)'}}>
              {inviteType === 'card'
                ? <p style={{color:'var(--text-mid)'}}>
                    <strong>Digital Card</strong> — A beautiful visual invitation guests can screenshot and share. Perfect for sending as an image in WhatsApp or saving to phone. Each guest gets a personalised card with their name.
                  </p>
                : <p style={{color:'var(--text-mid)'}}>
                    <strong>Mini Website</strong> — An interactive webpage with wedding countdown, event details, and RSVP buttons. Guests click the link, confirm their name, choose which events they'll attend, and submit. You see their RSVP instantly.
                  </p>
              }
            </div>
          </div>

          {/* Step 3: Preview name */}
          <div className="card">
            <h3 className="font-display font-semibold mb-3" style={{color:'var(--text-dark)'}}>
              Step 3 · Preview
            </h3>
            <div className="mb-3">
              <label className="label">Preview with guest name</label>
              <input
                className="input-field"
                placeholder="Type a guest name to preview..."
                value={previewGuest}
                onChange={e => setPreviewGuest(e.target.value)}
              />
            </div>
            <p className="text-xs" style={{color:'var(--text-muted)'}}>
              👉 See the live preview on the right →
            </p>
          </div>

          {/* Step 4: Send invitations */}
          <div className="card">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-display font-semibold" style={{color:'var(--text-dark)'}}>
                Step 4 · Send Invitations
              </h3>
              <span className="badge status-pending text-xs">
                {eventGuests.length} guests for {selectedEvent.name}
              </span>
            </div>

            {eventGuests.length === 0 ? (
              <div className="text-center py-6">
                <p className="text-sm" style={{color:'var(--text-muted)'}}>No guests assigned to {selectedEvent.name} yet.</p>
                <Link to="/guests" className="btn-secondary mt-3 inline-flex text-sm">
                  Go to Guest List →
                </Link>
              </div>
            ) : (
              <div className="space-y-2">
                {displayGuests.map(g => (
                  <InviteLinkCard
                    key={g.id}
                    guest={g}
                    eventId={selectedEventId}
                    weddingTitle={weddingTitle}
                    type={inviteType}
                  />
                ))}
                {eventGuests.length > 6 && (
                  <button
                    onClick={() => setShowAllGuests(p => !p)}
                    className="w-full py-2 text-sm rounded-xl transition-colors"
                    style={{color:'var(--rose)', background:'var(--rose-pale)'}}>
                    {showAllGuests
                      ? 'Show less'
                      : `Show all ${eventGuests.length} guests`}
                  </button>
                )}
              </div>
            )}

            {eventGuests.length > 0 && (
              <div className="mt-3 pt-3 flex gap-2" style={{borderTop:'1px solid var(--champagne-border)'}}>
                <button onClick={copyAllLinks} className="btn-secondary flex-1 text-sm justify-center">
                  <Copy size={14}/> Copy All Links
                </button>
                <Link to="/guests" className="btn-gold flex-1 text-sm justify-center">
                  <Users size={14}/> Manage Guests
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* ── Right panel: Live Preview ── */}
        <div className="xl:sticky xl:top-6 xl:self-start">
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display font-semibold" style={{color:'var(--text-dark)'}}>
                Live Preview
              </h3>
              <div className="flex items-center gap-2">
                <span className="badge text-xs" style={{background:'var(--champagne)', color:'var(--gold)'}}>
                  {inviteType === 'card' ? '🃏 Digital Card' : '🌐 Mini Website'}
                </span>
                {inviteType === 'website' && (
                  <Link
                    to={`/invite/${guests[0]?.invite_token || 'preview'}`}
                    target="_blank"
                    className="btn-secondary py-1 px-2 text-xs"
                  >
                    <Eye size={12}/> Open Live
                  </Link>
                )}
              </div>
            </div>

            <div className="overflow-y-auto max-h-[600px] pb-2">
              {inviteType === 'card'
                ? <DigitalCardPreview
                    event={selectedEvent}
                    weddingTitle={weddingTitle}
                    guestName={previewGuest || 'Guest Name'}
                  />
                : <MiniWebsitePreview
                    event={selectedEvent}
                    weddingTitle={weddingTitle}
                    weddingDate={weddingDate}
                  />
              }
            </div>

            {/* Info note */}
            <div className="mt-4 p-3 rounded-xl text-xs" style={{background:'var(--champagne)', color:'var(--text-mid)'}}>
              {inviteType === 'card'
                ? <>
                    💡 <strong>Digital Card tip:</strong> Right-click the preview and save as image, or take a screenshot to share in WhatsApp groups. Each guest's name will appear personalised on their card.
                  </>
                : <>
                    💡 <strong>Mini Website tip:</strong> Click "Send" next to any guest to WhatsApp them their unique link. When they open it, they verify their name then choose which events they'll attend.
                  </>
              }
            </div>
          </div>

          {/* Quick stats */}
          <div className="mt-4 grid grid-cols-3 gap-3">
            {[
              { label:'Total Guests',  value: guests.length },
              { label:'Invites Sent',  value: guests.filter(g => g.rsvp_status !== 'pending').length },
              { label:'RSVPs Confirmed', value: guests.filter(g => g.rsvp_status === 'confirmed').length },
            ].map(s => (
              <div key={s.label} className="card py-3 px-3 text-center">
                <p className="font-display text-xl font-bold" style={{color:'var(--text-dark)'}}>{s.value}</p>
                <p className="text-xs mt-0.5" style={{color:'var(--text-muted)'}}>{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
