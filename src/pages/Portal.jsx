import { useApp } from '../context/AppContext'
import { Link } from 'react-router-dom'
import { differenceInDays, parseISO, format } from 'date-fns'
import { Copy, Check, ExternalLink } from 'lucide-react'
import { useState } from 'react'

const EVENT_EMOJIS    = { 'Mayoon':'💛','Mehndi':'🌿','Barat':'🌹','Walima':'✨','Bachelor Trip':'🎉','Honeymoon':'🌴' }
const EVENT_GRADIENTS = {
  'Mayoon':'linear-gradient(135deg,#f59e0b,#d97706)',
  'Mehndi':'linear-gradient(135deg,#10b981,#059669)',
  'Barat':'linear-gradient(135deg,#e11d48,#9f1239)',
  'Walima':'linear-gradient(135deg,#8b5cf6,#6d28d9)',
  'Bachelor Trip':'linear-gradient(135deg,#3b82f6,#1d4ed8)',
  'Honeymoon':'linear-gradient(135deg,#14b8a6,#0f766e)',
}

function CopyBtn({ text, label }) {
  const [copied, setCopied] = useState(false)
  return (
    <button onClick={()=>{ navigator.clipboard.writeText(text); setCopied(true); setTimeout(()=>setCopied(false),2000) }}
      className="btn-secondary py-1.5 px-3 text-xs">
      {copied ? <><Check size={12} className="text-green-600"/>Copied!</> : <><Copy size={12}/>{label||'Copy'}</>}
    </button>
  )
}

export default function Portal() {
  const { events, guests, weddingTitle, weddingDate, travelPlans } = useApp()
  const baseUrl = window.location.origin

  let days = null
  try { days = differenceInDays(parseISO(weddingDate), new Date()) } catch {}

  const confirmed = guests.filter(g=>g.rsvp_status==='confirmed').length
  const pending   = guests.filter(g=>g.rsvp_status==='pending').length

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="section-title flex items-center gap-2">Wedding Portal 🌐</h1>
        <p className="text-sm mt-1" style={{color:'var(--text-soft)'}}>
          Your private wedding hub — overview of everything guests need
        </p>
      </div>

      {/* Portal preview */}
      <div className="rounded-2xl overflow-hidden shadow-xl" style={{border:'2px solid var(--champagne-border)'}}>

        {/* Hero */}
        <div className="relative py-16 px-8 text-center text-white"
          style={{background:'linear-gradient(135deg,#7c2d12,#b5484a)'}}>
          <div className="absolute inset-0 opacity-10"
            style={{backgroundImage:'repeating-linear-gradient(45deg,white 0,white 1px,transparent 0,transparent 50%)', backgroundSize:'20px 20px'}}/>
          <div className="relative z-10">
            <p className="text-6xl mb-4">🌹</p>
            <p className="text-sm uppercase tracking-widest mb-2" style={{color:'rgba(255,255,255,0.7)'}}>
              The Wedding of
            </p>
            <h1 className="font-display text-4xl font-bold text-white">{weddingTitle}</h1>
            {days !== null && days > 0 && (
              <div className="mt-6 inline-block px-8 py-3 rounded-full" style={{background:'rgba(255,255,255,0.15)'}}>
                <span className="font-display text-3xl font-bold">{days}</span>
                <span className="ml-2" style={{color:'rgba(255,255,255,0.8)'}}>days to go</span>
              </div>
            )}
          </div>
        </div>

        {/* Stats bar */}
        <div className="grid grid-cols-3 divide-x" style={{background:'var(--champagne)', divideColor:'var(--champagne-border)'}}>
          {[
            { label:'Events',    value:events.length },
            { label:'Confirmed', value:confirmed },
            { label:'Pending',   value:pending },
          ].map(s=>(
            <div key={s.label} className="text-center py-4">
              <p className="font-display text-2xl font-bold" style={{color:'var(--text-dark)'}}>{s.value}</p>
              <p className="text-xs" style={{color:'var(--text-muted)'}}>{s.label}</p>
            </div>
          ))}
        </div>

        {/* Events section */}
        <div className="bg-white p-6">
          <h2 className="font-display text-xl font-semibold mb-4" style={{color:'var(--text-dark)'}}>Wedding Events</h2>
          <div className="space-y-3">
            {events.map(e => {
              let dateStr = '', dayStr = ''
              try { if (e.date) { dateStr = format(parseISO(e.date),'MMMM d, yyyy'); dayStr = format(parseISO(e.date),'EEEE') } } catch {}
              const daysAway = (() => { try { return e.date ? differenceInDays(parseISO(e.date),new Date()) : null } catch { return null } })()
              return (
                <div key={e.id} className="flex items-center gap-4 p-4 rounded-2xl"
                  style={{background:'var(--cream-dark)', border:'1px solid var(--champagne-border)'}}>
                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0"
                    style={{background:EVENT_GRADIENTS[e.name]||'var(--rose)'}}>
                    {EVENT_EMOJIS[e.name]||'💍'}
                  </div>
                  <div className="flex-1">
                    <p className="font-display font-semibold" style={{color:'var(--text-dark)'}}>{e.name}</p>
                    {dateStr && <p className="text-sm" style={{color:'var(--text-soft)'}}>{dayStr}, {dateStr}</p>}
                    {e.location && <p className="text-xs" style={{color:'var(--text-muted)'}}>📍 {e.location}</p>}
                  </div>
                  {daysAway !== null && daysAway > 0 && (
                    <div className="text-right flex-shrink-0">
                      <p className="font-display font-bold text-lg" style={{color:'var(--rose)'}}>{daysAway}</p>
                      <p className="text-xs" style={{color:'var(--text-muted)'}}>days away</p>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* RSVP Links section */}
        <div className="p-6" style={{background:'var(--champagne)', borderTop:'1px solid var(--champagne-border)'}}>
          <h2 className="font-display text-xl font-semibold mb-2" style={{color:'var(--text-dark)'}}>Guest Invitations</h2>
          <p className="text-sm mb-4" style={{color:'var(--text-soft)'}}>
            Each guest has a personal link. Share via the Guests or Invitations page.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {guests.slice(0,6).map(g=>(
              <div key={g.id} className="flex items-center gap-2 bg-white px-3 py-2.5 rounded-xl">
                <div className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                  style={{background:'var(--rose)'}}>
                  {g.name.charAt(0)}
                </div>
                <p className="text-sm truncate flex-1" style={{color:'var(--text-dark)'}}>{g.name}</p>
                <span className={`badge text-xs ${g.rsvp_status==='confirmed'?'status-confirmed':'status-pending'}`}>
                  {g.rsvp_status}
                </span>
                <a href={`${baseUrl}/invite/${g.invite_token}`} target="_blank" rel="noopener noreferrer"
                  className="btn-ghost py-1 px-1.5">
                  <ExternalLink size={12}/>
                </a>
              </div>
            ))}
            {guests.length > 6 && (
              <div className="sm:col-span-2 text-center">
                <Link to="/guests" className="text-sm" style={{color:'var(--rose)'}}>View all {guests.length} guests →</Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Share tools */}
      <div className="card">
        <h3 className="font-display font-semibold mb-4" style={{color:'var(--text-dark)'}}>🔗 Share Your Wedding Portal</h3>
        <div className="space-y-3">
          <div className="flex items-center gap-3 p-3 rounded-xl" style={{background:'var(--champagne)'}}>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium mb-0.5" style={{color:'var(--text-muted)'}}>Your Shaadi Planner URL</p>
              <p className="text-sm font-mono truncate" style={{color:'var(--text-dark)'}}>{baseUrl}</p>
            </div>
            <CopyBtn text={baseUrl} label="Copy URL"/>
          </div>

          <div className="flex items-center gap-3 p-3 rounded-xl" style={{background:'var(--champagne)'}}>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium mb-0.5" style={{color:'var(--text-muted)'}}>WhatsApp Welcome Message</p>
              <p className="text-sm italic" style={{color:'var(--text-soft)'}}>
                "Assalamu Alaikum! The {weddingTitle} wedding details are ready. Check your personal invite link below..."
              </p>
            </div>
            <CopyBtn
              text={`Assalamu Alaikum! 🌹\n\nWe are so excited to celebrate the wedding of *${weddingTitle}* with you!\n\nWe have ${events.length} events planned:\n${events.map(e=>`• ${e.name}${e.date?` — ${e.date}`:''}`).join('\n')}\n\nYou will receive your personal invitation link separately with RSVP details.\n\nWith love & excitement! 💌`}
              label="Copy Message"/>
          </div>
        </div>
      </div>

      {/* Quick action links */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { to:'/guests',      emoji:'👥', label:'Guest List'   },
          { to:'/invitations', emoji:'💌', label:'Send Invites' },
          { to:'/travel',      emoji:'✈️', label:'Travel Plans' },
          { to:'/analytics',   emoji:'📊', label:'Analytics'    },
        ].map(s=>(
          <Link key={s.to} to={s.to} className="card text-center py-4 hover:shadow-lg transition-all hover:-translate-y-0.5">
            <p className="text-2xl mb-1">{s.emoji}</p>
            <p className="text-sm font-medium" style={{color:'var(--text-dark)'}}>{s.label}</p>
          </Link>
        ))}
      </div>
    </div>
  )
}
