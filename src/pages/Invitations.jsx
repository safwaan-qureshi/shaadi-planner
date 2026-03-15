import { useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { format, parseISO } from 'date-fns'
import { MessageCircle, Copy, Check, Eye, Users, ChevronRight, Globe } from 'lucide-react'

const EVENT_EMOJIS = { 'Mayoon':'💛','Mehndi':'🌿','Barat':'🌹','Walima':'✨','Bachelor Trip':'🎉','Honeymoon':'🌴' }

function CopyBtn({ text }) {
  const [copied, setCopied] = useState(false)
  const copy = () => { navigator.clipboard.writeText(text); setCopied(true); setTimeout(()=>setCopied(false),2000) }
  return (
    <button onClick={copy} className="btn-ghost py-1 px-1.5" title="Copy link">
      {copied ? <Check size={13} className="text-green-600"/> : <Copy size={13}/>}
    </button>
  )
}

function InviteLinkCard({ guest, weddingTitle, events }) {
  const [copied, setCopied] = useState(false)
  const inviteUrl = `${window.location.origin}/invite/${guest.invite_token}`

  const copyLink = () => { navigator.clipboard.writeText(inviteUrl); setCopied(true); setTimeout(()=>setCopied(false),2000) }

  const eventNames = (guest.events_invited || [])
    .map(id => events?.find(e => e.id === id)?.name || '?')
    .join(', ')

  const partySize = 1 + (guest.plus_guests || 0)

  const plusLine = guest.plus_guests > 0
    ? `\n\nYour invitation is for *${partySize} people* (yourself + ${guest.plus_guests} guest${guest.plus_guests > 1 ? 's' : ''}).`
    : ''

  const msg = encodeURIComponent(
    `Assalamu Alaikum ${guest.name.split(' ')[0]}! 🌹\n\nYou are cordially invited to the *${weddingTitle}* wedding celebrations.\n\nEvents: ${eventNames || 'Wedding celebrations'}${plusLine}\n\nPlease click your personal invitation link to RSVP:\n\n${inviteUrl}\n\nWe look forward to celebrating with you! 💌`
  )
  const phone = guest.phone?.replace(/[^0-9]/g, '')
  const waUrl = phone ? `https://wa.me/${phone}?text=${msg}` : `https://wa.me/?text=${msg}`

  return (
    <div className="card py-3 px-4 flex items-center gap-3">
      <div className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 text-white font-bold text-sm"
        style={{background:'var(--rose)'}}>
        {guest.name.charAt(0)}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-medium text-sm truncate" style={{color:'var(--text-dark)'}}>{guest.name}</p>
        <div className="flex items-center gap-2 mt-0.5">
          <p className="text-xs truncate" style={{color:'var(--text-muted)'}}>
            {eventNames || 'No events assigned'}
          </p>
          {partySize > 1 && (
            <span className="text-xs px-1.5 py-0.5 rounded-full flex-shrink-0"
              style={{background:'var(--champagne)', color:'var(--gold)'}}>
              👨‍👩‍👧 {partySize} people
            </span>
          )}
        </div>
      </div>
      <div className="flex items-center gap-1.5 flex-shrink-0">
        <span className={`badge text-xs ${
          guest.rsvp_status==='confirmed' ? 'status-confirmed' :
          guest.rsvp_status==='declined'  ? 'status-declined'  : 'status-pending'
        }`}>
          {guest.rsvp_status==='confirmed' ? '✓ Confirmed' :
           guest.rsvp_status==='declined'  ? 'Declined' : 'Pending'}
        </span>
        <button onClick={copyLink} className="btn-ghost py-1 px-1.5" title="Copy link">
          {copied ? <Check size={13} className="text-green-600"/> : <Copy size={13}/>}
        </button>
        <a href={waUrl} target="_blank" rel="noopener noreferrer" className="btn-whatsapp py-1 px-2 text-xs">
          <MessageCircle size={12}/>Send
        </a>
      </div>
    </div>
  )
}

// ── Mini Website Preview ──────────────────────────────────────────────────────
function MiniWebsitePreview({ event, weddingTitle }) {
  let dateStr = ''
  try { if (event?.date) dateStr = format(parseISO(event.date), 'EEEE, MMMM d, yyyy') } catch {}
  const emoji = EVENT_EMOJIS[event?.name] || '💍'

  return (
    <div className="w-full max-w-xs mx-auto rounded-3xl overflow-hidden shadow-xl border"
      style={{borderColor:'var(--champagne-border)', background:'linear-gradient(180deg,#fdf8f0 0%,#f7e9d0 100%)'}}>
      <div className="px-6 pt-8 pb-5 text-center">
        <p className="text-4xl mb-2">{emoji}</p>
        <p className="text-xs font-medium uppercase tracking-widest" style={{color:'var(--gold)'}}>Wedding Invitation</p>
        <h2 className="font-display text-xl font-bold mt-1" style={{color:'var(--text-dark)'}}>{weddingTitle}</h2>
        <p className="font-display text-base mt-0.5" style={{color:'var(--rose)'}}>{event?.name} Celebrations</p>
      </div>

      <div className="mx-4 mb-3 py-2 rounded-xl text-center" style={{background:'var(--rose)'}}>
        <p className="font-display text-2xl font-bold text-white">319</p>
        <p className="text-xs text-white/80">days to go</p>
      </div>

      {/* Guest allocation preview */}
      <div className="mx-4 mb-3 p-3 rounded-xl bg-white">
        <p className="text-xs font-medium mb-1" style={{color:'var(--text-muted)'}}>YOUR INVITATION</p>
        <p className="text-sm font-semibold" style={{color:'var(--text-dark)'}}>Dear [Guest Name]</p>
        <p className="text-xs mt-1" style={{color:'var(--text-soft)'}}>
          Your invitation is for <strong>3 people</strong> (you + 2 guests)
        </p>
      </div>

      <div className="mx-4 mb-5 space-y-2">
        <div className="py-2.5 rounded-xl text-center text-sm font-medium text-white" style={{background:'var(--rose)'}}>
          ✅ Confirm Attendance
        </div>
        <div className="py-2.5 rounded-xl text-center text-sm border" style={{color:'var(--text-mid)', borderColor:'var(--champagne-border)', background:'white'}}>
          Unable to attend
        </div>
      </div>

      <div className="pb-3 text-center">
        <p className="text-xs" style={{color:'var(--text-muted)'}}>🔗 Guests RSVP directly from this link</p>
      </div>
    </div>
  )
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function Invitations() {
  const { events, guests, weddingTitle } = useApp()
  const [searchParams] = useSearchParams()

  const preselectedEventId = searchParams.get('event')
  const [selectedEventId, setSelectedEventId] = useState(preselectedEventId || events[0]?.id || '')
  const [showAllGuests,   setShowAllGuests]   = useState(false)

  const selectedEvent = events.find(e => e.id === selectedEventId) || events[0]
  const eventGuests   = guests.filter(g => (g.events_invited || []).includes(selectedEventId))
  const displayGuests = showAllGuests ? eventGuests : eventGuests.slice(0, 8)

  const totalPeople    = eventGuests.reduce((s,g) => s + 1 + (g.plus_guests||0), 0)
  const confirmedCount = eventGuests.filter(g => g.rsvp_status==='confirmed').length
  const pendingCount   = eventGuests.filter(g => g.rsvp_status==='pending').length

  if (!selectedEvent) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div>
          <h1 className="section-title">Invitations 💌</h1>
          <p className="text-sm mt-1" style={{color:'var(--text-soft)'}}>Send personalised WhatsApp invitations to your guests</p>
        </div>
        <div className="card text-center py-16">
          <p className="text-4xl mb-3">📅</p>
          <p className="font-display text-lg font-semibold" style={{color:'var(--text-dark)'}}>No events yet</p>
          <p className="text-sm mt-1 mb-4" style={{color:'var(--text-soft)'}}>Add wedding events first, then send invitations</p>
          <Link to="/events" className="btn-primary inline-flex">Go to Events →</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="section-title flex items-center gap-2">Invitations 💌</h1>
        <p className="text-sm mt-1" style={{color:'var(--text-soft)'}}>
          Send personalised WhatsApp invitations — each guest gets their own unique RSVP link
        </p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">

        {/* ── Left: Controls ── */}
        <div className="space-y-4">

          {/* Step 1: Select event */}
          <div className="card">
            <h3 className="font-display font-semibold mb-3" style={{color:'var(--text-dark)'}}>
              Step 1 · Select Event
            </h3>
            <div className="grid grid-cols-2 gap-2">
              {events.map(evt => {
                const isActive = selectedEventId === evt.id
                return (
                  <button key={evt.id} onClick={() => setSelectedEventId(evt.id)}
                    className="flex items-center gap-2.5 p-3 rounded-xl border-2 text-left transition-all"
                    style={{
                      borderColor: isActive ? 'var(--rose)' : 'var(--champagne-border)',
                      background:  isActive ? 'var(--rose-pale)' : 'white',
                    }}>
                    <span className="text-xl flex-shrink-0">{EVENT_EMOJIS[evt.name]||'💍'}</span>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold truncate" style={{color:isActive?'var(--rose)':'var(--text-dark)'}}>{evt.name}</p>
                      {evt.date && (
                        <p className="text-xs" style={{color:'var(--text-muted)'}}>
                          {(() => { try { return format(parseISO(evt.date),'dd MMM') } catch { return evt.date } })()}
                        </p>
                      )}
                    </div>
                  </button>
                )
              })}
            </div>
          </div>

          {/* How it works */}
          <div className="card" style={{background:'var(--champagne)'}}>
            <div className="flex items-center gap-2 mb-3">
              <Globe size={18} style={{color:'var(--rose)'}}/>
              <h3 className="font-display font-semibold" style={{color:'var(--text-dark)'}}>How Mini Website Invitations Work</h3>
            </div>
            <div className="space-y-2.5 text-sm" style={{color:'var(--text-mid)'}}>
              <div className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full text-white text-xs flex items-center justify-center flex-shrink-0 font-bold mt-0.5" style={{background:'var(--rose)'}}>1</span>
                <p>Each guest gets a <strong>unique secret link</strong> — no login needed</p>
              </div>
              <div className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full text-white text-xs flex items-center justify-center flex-shrink-0 font-bold mt-0.5" style={{background:'var(--rose)'}}>2</span>
                <p>They open the link, <strong>type their name</strong> to verify it's them</p>
              </div>
              <div className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full text-white text-xs flex items-center justify-center flex-shrink-0 font-bold mt-0.5" style={{background:'var(--rose)'}}>3</span>
                <p>They see their <strong>party size</strong> and choose which events they'll attend</p>
              </div>
              <div className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full text-white text-xs flex items-center justify-center flex-shrink-0 font-bold mt-0.5" style={{background:'var(--rose)'}}>4</span>
                <p>Their RSVP <strong>saves instantly</strong> — you see it in your guest list</p>
              </div>
            </div>
          </div>

          {/* Step 2: Send */}
          <div className="card">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-display font-semibold" style={{color:'var(--text-dark)'}}>
                Step 2 · Send to Guests
              </h3>
              <div className="flex items-center gap-2">
                <span className="badge text-xs" style={{background:'var(--champagne)',color:'var(--text-mid)'}}>
                  {eventGuests.length} guests · ~{totalPeople} people
                </span>
              </div>
            </div>

            {/* Event summary */}
            {eventGuests.length > 0 && (
              <div className="grid grid-cols-3 gap-2 mb-4">
                {[
                  { label:'Invited',   value:eventGuests.length, color:'var(--text-dark)' },
                  { label:'Confirmed', value:confirmedCount,      color:'#065f46' },
                  { label:'Pending',   value:pendingCount,        color:'#92400e' },
                ].map(s => (
                  <div key={s.label} className="text-center py-2 rounded-xl" style={{background:'var(--cream-dark)'}}>
                    <p className="font-display font-bold text-lg" style={{color:s.color}}>{s.value}</p>
                    <p className="text-xs" style={{color:'var(--text-muted)'}}>{s.label}</p>
                  </div>
                ))}
              </div>
            )}

            {eventGuests.length === 0 ? (
              <div className="text-center py-6">
                <p className="text-sm" style={{color:'var(--text-muted)'}}>
                  No guests assigned to {selectedEvent?.name} yet.
                </p>
                <Link to="/guests" className="btn-secondary mt-3 inline-flex text-sm">
                  Go to Guest List →
                </Link>
              </div>
            ) : (
              <div className="space-y-2">
                {displayGuests.map(g => (
                  <InviteLinkCard key={g.id} guest={g} weddingTitle={weddingTitle} events={events}/>
                ))}
                {eventGuests.length > 8 && (
                  <button onClick={() => setShowAllGuests(p=>!p)}
                    className="w-full py-2 text-sm rounded-xl transition-colors"
                    style={{color:'var(--rose)', background:'var(--rose-pale)'}}>
                    {showAllGuests ? 'Show less' : `Show all ${eventGuests.length} guests`}
                  </button>
                )}
              </div>
            )}

            {eventGuests.length > 0 && (
              <div className="mt-3 pt-3 flex gap-2" style={{borderTop:'1px solid var(--champagne-border)'}}>
                <Link to="/guests" className="btn-secondary flex-1 text-sm justify-center">
                  <Users size={14}/> Manage Guests
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* ── Right: Preview ── */}
        <div className="xl:sticky xl:top-6 xl:self-start space-y-4">
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display font-semibold" style={{color:'var(--text-dark)'}}>Preview</h3>
              {guests[0]?.invite_token && (
                <Link to={`/invite/${guests[0].invite_token}`} target="_blank" className="btn-secondary py-1 px-2 text-xs">
                  <Eye size={12}/> Open Live Example
                </Link>
              )}
            </div>
            <MiniWebsitePreview event={selectedEvent} weddingTitle={weddingTitle}/>
            <div className="mt-4 p-3 rounded-xl text-xs" style={{background:'var(--champagne)', color:'var(--text-mid)'}}>
              💡 <strong>Tip:</strong> Click "Send" next to any guest to WhatsApp them their unique link. If you forward the same link to someone else, they'll need to enter the original guest's name to access it — this prevents uninvited guests from RSVPing.
            </div>
          </div>

          {/* Overall stats */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { label:'Total Guests',    value:guests.length },
              { label:'Total People',    value:guests.reduce((s,g)=>s+1+(g.plus_guests||0),0) },
              { label:'Confirmed RSVPs', value:guests.filter(g=>g.rsvp_status==='confirmed').length },
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
