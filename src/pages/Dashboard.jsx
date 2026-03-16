import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { differenceInDays, parseISO, format, formatDistanceToNow } from 'date-fns'
import { ChevronRight, AlertCircle, Heart, Plane, Activity } from 'lucide-react'
import Badge from '../components/ui/Badge'

const EVENT_EMOJIS    = { 'Mayoon':'💛','Mehndi':'🌿','Barat':'🌹','Walima':'✨','Bachelor Trip':'🎉','Honeymoon':'🌴' }
const EVENT_GRADIENTS = {
  'Mayoon':'linear-gradient(135deg,#f59e0b,#d97706)',
  'Mehndi':'linear-gradient(135deg,#10b981,#059669)',
  'Barat':'linear-gradient(135deg,#e11d48,#9f1239)',
  'Walima':'linear-gradient(135deg,#8b5cf6,#6d28d9)',
  'Bachelor Trip':'linear-gradient(135deg,#3b82f6,#1d4ed8)',
  'Honeymoon':'linear-gradient(135deg,#14b8a6,#0f766e)',
}

function timeAgo(d) { try { return formatDistanceToNow(parseISO(d), {addSuffix:true}) } catch { return '' } }
function fmtDate(d) { try { return d ? format(parseISO(d),'dd MMM yyyy') : '—' } catch { return d||'—' } }

// ── Shared sub-components ────────────────────────────────────────────────────
function StatCard({ emoji, label, value, sub, to }) {
  const inner = (
    <div className="card hover:shadow-lg transition-all" style={{cursor:to?'pointer':'default'}}>
      <div className="flex items-start justify-between mb-3">
        <span className="text-2xl">{emoji}</span>
        {to && <ChevronRight size={15} style={{color:'var(--text-muted)'}}/>}
      </div>
      <p className="font-display text-2xl font-bold" style={{color:'var(--text-dark)'}}>{value}</p>
      <p className="text-sm mt-0.5" style={{color:'var(--text-soft)'}}>{label}</p>
      {sub && <p className="text-xs mt-0.5" style={{color:'var(--text-muted)'}}>{sub}</p>}
    </div>
  )
  return to ? <Link to={to}>{inner}</Link> : inner
}

function CountdownCard({ weddingDate, weddingTitle }) {
  const days = useMemo(() => { try { return differenceInDays(parseISO(weddingDate), new Date()) } catch { return null } }, [weddingDate])
  let dateStr = ''
  try { if (weddingDate) dateStr = format(parseISO(weddingDate), 'EEEE, MMMM d, yyyy') } catch {}
  return (
    <div className="rounded-2xl p-6 text-white relative overflow-hidden"
      style={{background:'linear-gradient(135deg,#7c2d12,#b5484a)'}}>
      <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full bg-white/5"/>
      <div className="absolute -bottom-4 -left-4 w-20 h-20 rounded-full bg-white/5"/>
      <div className="relative z-10">
        <div className="flex items-center gap-2 mb-4">
          <Heart size={14} className="fill-pink-300 text-pink-300"/>
          <span className="text-sm" style={{color:'rgba(255,255,255,0.8)'}}>{weddingTitle}</span>
        </div>
        {days !== null ? (
          <>
            <p className="font-display font-bold leading-none" style={{fontSize:'4rem'}}>{Math.abs(days)}</p>
            <p className="mt-1" style={{color:'rgba(255,255,255,0.8)',fontSize:'1.1rem'}}>
              {days>0 ? 'days until Barat' : days===0 ? '🎉 Today!' : 'days since Barat'}
            </p>
          </>
        ) : <p style={{color:'rgba(255,255,255,0.7)'}}>Set your wedding date in Settings</p>}
        <div className="mt-5 pt-4" style={{borderTop:'1px solid rgba(255,255,255,0.2)'}}>
          <p style={{color:'rgba(255,255,255,0.65)',fontSize:'0.875rem'}}>{dateStr}</p>
        </div>
      </div>
    </div>
  )
}

function EventCard({ event }) {
  const { guests, vendors } = useApp()
  const emoji    = EVENT_EMOJIS[event.name]||'💍'
  const gradient = EVENT_GRADIENTS[event.name]||'linear-gradient(135deg,#6b7280,#374151)'
  const invited   = guests.filter(g=>(g.events_invited||[]).includes(event.id)).length
  const confirmed = guests.filter(g=>(g.events_confirmed||[]).includes(event.id)).length
  const vCount    = vendors.filter(v=>v.event_id===event.id).length
  let dateStr = ''
  try { if (event.date) dateStr = format(parseISO(event.date),'dd MMM yyyy') } catch {}

  return (
    <Link to={`/events/${event.id}`}
      className="rounded-2xl overflow-hidden block hover:-translate-y-1 transition-all duration-200"
      style={{boxShadow:'0 4px 20px rgba(0,0,0,0.1)'}}>
      <div className="p-4 text-white" style={{background:gradient}}>
        <div className="flex items-start justify-between">
          <div>
            <span className="text-3xl">{emoji}</span>
            <h3 className="font-display text-lg font-bold mt-1 text-white">{event.name}</h3>
            {dateStr && <p className="text-sm" style={{color:'rgba(255,255,255,0.8)'}}>{dateStr}</p>}
          </div>
          <ChevronRight size={18} style={{color:'rgba(255,255,255,0.7)'}}/>
        </div>
      </div>
      <div className="bg-white p-3 grid grid-cols-3 gap-1" style={{borderTop:'1px solid var(--champagne-border)'}}>
        {[{l:'Invited',v:invited},{l:'Confirmed',v:confirmed},{l:'Vendors',v:vCount}].map(s=>(
          <div key={s.l} className="text-center">
            <p className="font-display font-bold text-base" style={{color:'var(--text-dark)'}}>{s.v}</p>
            <p className="text-xs" style={{color:'var(--text-muted)'}}>{s.l}</p>
          </div>
        ))}
      </div>
    </Link>
  )
}

// ── ADMIN DASHBOARD ──────────────────────────────────────────────────────────
function AdminDashboard() {
  const { events, vendors, guests, tasks, expenses, budget, totalSpent, remaining, weddingDate, weddingTitle, travelPlans, updates } = useApp()
  const confirmedGuests = guests.filter(g=>g.rsvp_status==='confirmed').length
  const pendingTasks    = tasks.filter(t=>t.status!=='done')
  const budgetPct       = budget>0 ? Math.min(Math.round((totalSpent/budget)*100),100) : 0
  const paymentAlerts   = vendors.filter(v=>v.status==='deposit_due'||v.status==='final_payment_due')
  const pickupAlerts    = travelPlans.filter(t=>t.needs_airport_pickup)
  const fmt = n => `PKR ${(n/1000).toFixed(0)}k`

  return (
    <div className="space-y-8">
      <div>
        <h1 className="section-title flex items-center gap-2">Wedding Dashboard 🌹</h1>
        <p className="text-sm mt-1" style={{color:'var(--text-soft)'}}>Full admin overview of your wedding planning</p>
      </div>

      {/* Alerts */}
      {(paymentAlerts.length > 0 || pickupAlerts.length > 0) && (
        <div className="space-y-3">
          {paymentAlerts.length > 0 && (
            <div className="rounded-2xl p-4 flex items-start gap-3" style={{background:'#fff7ed',border:'1px solid #fed7aa'}}>
              <AlertCircle size={18} className="text-orange-500 flex-shrink-0 mt-0.5"/>
              <div className="flex-1">
                <p className="text-sm font-semibold text-orange-800">💳 Vendor Payment Alerts</p>
                <div className="flex flex-wrap gap-2 mt-1">
                  {paymentAlerts.map(v=>(
                    <span key={v.id} className="text-xs bg-orange-100 text-orange-800 px-2 py-1 rounded-lg">
                      {v.name} · {v.status==='deposit_due'?'Deposit Due':'Final Due'}
                    </span>
                  ))}
                </div>
              </div>
              <Link to="/vendors" className="btn-secondary text-xs py-1 px-3 whitespace-nowrap">View</Link>
            </div>
          )}
          {pickupAlerts.length > 0 && (
            <div className="rounded-2xl p-4 flex items-start gap-3" style={{background:'#eff6ff',border:'1px solid #bfdbfe'}}>
              <Plane size={18} className="text-blue-500 flex-shrink-0 mt-0.5"/>
              <div className="flex-1">
                <p className="text-sm font-semibold text-blue-800">✈️ Airport Pickups Needed</p>
                <div className="flex flex-wrap gap-2 mt-1">
                  {pickupAlerts.map(t=>(
                    <span key={t.id} className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-lg">
                      {t.guest_name || 'Guest'} · {fmtDate(t.arrival_date)}
                    </span>
                  ))}
                </div>
              </div>
              <Link to="/travel" className="btn-secondary text-xs py-1 px-3 whitespace-nowrap">View</Link>
            </div>
          )}
        </div>
      )}

      {/* Top stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <CountdownCard weddingDate={weddingDate} weddingTitle={weddingTitle}/>
        <StatCard emoji="👥" label="Guests confirmed"  value={`${confirmedGuests}/${guests.length}`} sub="RSVPs received" to="/guests"/>
        <StatCard emoji="✈️" label="Travel plans"      value={travelPlans.length} sub={`${pickupAlerts.length} need pickup`} to="/travel"/>
        <StatCard emoji="✅" label="Tasks remaining"   value={pendingTasks.length} sub={`of ${tasks.length} total`} to="/tasks"/>
      </div>

      {/* Budget + Tasks + Updates */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="card" style={{background:'linear-gradient(135deg,#fdf8f0,#f7e9d0)'}}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display font-semibold text-lg">Budget 💰</h3>
            <Link to="/budget" className="text-xs flex items-center gap-1" style={{color:'var(--rose)'}}>View <ChevronRight size={12}/></Link>
          </div>
          <div>
            <div className="flex justify-between text-sm mb-1.5" style={{color:'var(--text-mid)'}}>
              <span>Spent</span>
              <span className="font-semibold" style={{color:'var(--text-dark)'}}>{fmt(totalSpent)}</span>
            </div>
            <div className="h-2.5 rounded-full overflow-hidden" style={{background:'var(--champagne-border)'}}>
              <div className="h-full rounded-full transition-all duration-700"
                style={{width:`${budgetPct}%`,background:budgetPct>90?'#ef4444':budgetPct>70?'#f59e0b':'#10b981'}}/>
            </div>
            <div className="grid grid-cols-2 gap-3 mt-3 pt-3" style={{borderTop:'1px solid var(--champagne-border)'}}>
              <div>
                <p className="text-xs" style={{color:'var(--text-muted)'}}>Total Budget</p>
                <p className="font-display font-bold" style={{color:'var(--text-dark)'}}>{fmt(budget)}</p>
              </div>
              <div>
                <p className="text-xs" style={{color:'var(--text-muted)'}}>Remaining</p>
                <p className="font-display font-bold" style={{color:remaining<0?'#dc2626':'#059669'}}>{fmt(remaining)}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display font-semibold text-lg">Tasks ✅</h3>
            <Link to="/tasks" className="text-xs flex items-center gap-1" style={{color:'var(--rose)'}}>View <ChevronRight size={12}/></Link>
          </div>
          {pendingTasks.length===0
            ? <p className="text-sm text-center py-6" style={{color:'var(--text-muted)'}}>All tasks complete! 🎉</p>
            : <div className="space-y-2">
                {pendingTasks.slice(0,5).map(t=>(
                  <div key={t.id} className="flex items-start gap-2.5 p-2 rounded-xl hover:bg-orange-50/50">
                    <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${t.status==='in_progress'?'bg-blue-400':'bg-gray-300'}`}/>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate" style={{color:'var(--text-dark)'}}>{t.title}</p>
                      <p className="text-xs" style={{color:'var(--text-muted)'}}>{t.assigned_to}</p>
                    </div>
                    <Badge status={t.priority}/>
                  </div>
                ))}
              </div>
          }
        </div>

        {/* Updates feed preview */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display font-semibold text-lg">Live Updates 📣</h3>
            <Link to="/updates" className="text-xs flex items-center gap-1" style={{color:'var(--rose)'}}>View all <ChevronRight size={12}/></Link>
          </div>
          {updates.length===0
            ? <p className="text-sm text-center py-6" style={{color:'var(--text-muted)'}}>No updates yet</p>
            : <div className="space-y-2.5">
                {updates.slice(0,5).map(u=>(
                  <div key={u.id} className="flex items-start gap-2.5">
                    <span className="text-base flex-shrink-0">{u.emoji||'📌'}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium truncate" style={{color:'var(--text-dark)'}}>{u.message}</p>
                      <p className="text-xs" style={{color:'var(--text-muted)'}}>{timeAgo(u.created_at)}</p>
                    </div>
                  </div>
                ))}
              </div>
          }
        </div>
      </div>

      {/* Event cards */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-xl font-semibold" style={{color:'var(--text-dark)'}}>Wedding Events</h2>
          <Link to="/events" className="text-sm flex items-center gap-1" style={{color:'var(--rose)'}}>Manage events <ChevronRight size={14}/></Link>
        </div>
        {events.length===0
          ? <div className="card text-center py-10">
              <p className="text-3xl mb-2">📅</p>
              <p className="text-sm" style={{color:'var(--text-soft)'}}>No events yet — <Link to="/events" className="underline" style={{color:'var(--rose)'}}>add your first event</Link></p>
            </div>
          : <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
              {events.map(evt=><EventCard key={evt.id} event={evt}/>)}
            </div>
        }
      </div>
    </div>
  )
}

// ── BRIDE FAMILY DASHBOARD ────────────────────────────────────────────────────
function BrideFamilyDashboard() {
  const { events, vendors, guests, tasks, responsibilities, outfits, weddingDate, weddingTitle } = useApp()
  const days = useMemo(() => { try { return differenceInDays(parseISO(weddingDate), new Date()) } catch { return null } }, [weddingDate])
  const brideVendors = vendors.filter(v => ['makeup_artist','photographer','decorator'].includes(v.category))
  const brideTasks   = tasks.filter(t => t.status !== 'done')
  const brideGuests  = guests.filter(g => g.side === 'bride')
  const brideOutfits = outfits.filter(o => o.person_role === 'bride' || o.person_role === 'family')
  const brideResp    = responsibilities.filter(r => r.payment_responsibility === 'bride')
  const accomNeeded  = guests.filter(g => g.accommodation_needed)

  return (
    <div className="space-y-6">
      <div className="rounded-2xl p-6 text-white relative overflow-hidden"
        style={{background:'linear-gradient(135deg,#9d174d,#be185d)'}}>
        <div className="absolute -top-6 -right-6 w-28 h-28 rounded-full bg-white/10"/>
        <h1 className="font-display text-2xl font-bold text-white mb-1">Bride Family Dashboard 👰</h1>
        <p style={{color:'rgba(255,255,255,0.8)'}}>
          {days !== null && days > 0 ? `${days} days until the wedding 🌹` : 'Wedding day! 🎉'}
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { emoji:'👥', label:'Bride-side guests', value:brideGuests.length, to:'/guests' },
          { emoji:'✅', label:'Responsibilities',  value:brideResp.length,   to:'/events' },
          { emoji:'👗', label:'Outfits tracked',   value:brideOutfits.length,to:'/outfits' },
          { emoji:'🏨', label:'Need accommodation',value:accomNeeded.length, to:'/guests' },
        ].map(s => <StatCard key={s.label} {...s}/>)}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Bride responsibilities */}
        <div className="card">
          <h3 className="font-display font-semibold mb-3" style={{color:'var(--text-dark)'}}>Bride-Side Responsibilities</h3>
          {brideResp.length===0
            ? <p className="text-sm" style={{color:'var(--text-muted)'}}>No responsibilities assigned yet</p>
            : <div className="space-y-2">
                {brideResp.slice(0,6).map(r=>(
                  <div key={r.id} className="flex items-center justify-between p-2.5 rounded-xl" style={{background:'var(--champagne)'}}>
                    <div>
                      <p className="text-sm font-medium" style={{color:'var(--text-dark)'}}>{r.name}</p>
                      {r.assigned_to && <p className="text-xs" style={{color:'var(--text-muted)'}}>→ {r.assigned_to}</p>}
                    </div>
                    <span className="badge resp-bride text-xs">Bride Side</span>
                  </div>
                ))}
              </div>
          }
        </div>

        {/* Outfits */}
        <div className="card">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-display font-semibold" style={{color:'var(--text-dark)'}}>Outfit Status 👗</h3>
            <Link to="/outfits" className="text-xs" style={{color:'var(--rose)'}}>Manage →</Link>
          </div>
          {brideOutfits.length===0
            ? <p className="text-sm" style={{color:'var(--text-muted)'}}>No outfits added yet</p>
            : <div className="space-y-2">
                {brideOutfits.slice(0,5).map(o=>(
                  <div key={o.id} className="flex items-center justify-between p-2.5 rounded-xl" style={{background:'var(--cream-dark)'}}>
                    <div>
                      <p className="text-sm font-medium" style={{color:'var(--text-dark)'}}>{o.person_name} — {o.outfit_type}</p>
                      {o.designer && <p className="text-xs" style={{color:'var(--text-muted)'}}>{o.designer}</p>}
                    </div>
                    <Badge status={o.status}/>
                  </div>
                ))}
              </div>
          }
        </div>
      </div>

      {/* Accommodation needed */}
      {accomNeeded.length > 0 && (
        <div className="card">
          <h3 className="font-display font-semibold mb-3" style={{color:'var(--text-dark)'}}>🏨 Accommodation Needed</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {accomNeeded.map(g=>(
              <div key={g.id} className="flex items-center gap-2 p-2.5 rounded-xl" style={{background:'var(--champagne)'}}>
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold" style={{background:'var(--rose)'}}>
                  {g.name.charAt(0)}
                </div>
                <div>
                  <p className="text-sm font-medium" style={{color:'var(--text-dark)'}}>{g.name}</p>
                  <p className="text-xs" style={{color:'var(--text-muted)'}}>{g.phone||'No phone'}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// ── GROOM FAMILY DASHBOARD ────────────────────────────────────────────────────
function GroomFamilyDashboard() {
  const { events, vendors, guests, tasks, responsibilities, travelPlans, weddingDate, weddingTitle } = useApp()
  const days = useMemo(() => { try { return differenceInDays(parseISO(weddingDate), new Date()) } catch { return null } }, [weddingDate])
  const groomVendors = vendors.filter(v => ['venue','caterer','transportation','entertainment'].includes(v.category))
  const groomTasks   = tasks.filter(t => t.status !== 'done')
  const groomGuests  = guests.filter(g => g.side === 'groom')
  const groomResp    = responsibilities.filter(r => r.payment_responsibility === 'groom')
  const bachelors    = events.find(e => e.name === 'Bachelor Trip')
  const barat        = events.find(e => e.name === 'Barat')
  const transportVendors = vendors.filter(v => v.category === 'transportation')

  return (
    <div className="space-y-6">
      <div className="rounded-2xl p-6 text-white relative overflow-hidden"
        style={{background:'linear-gradient(135deg,#1e3a5f,#1d4ed8)'}}>
        <div className="absolute -top-6 -right-6 w-28 h-28 rounded-full bg-white/10"/>
        <h1 className="font-display text-2xl font-bold text-white mb-1">Groom Family Dashboard 🤵</h1>
        <p style={{color:'rgba(255,255,255,0.8)'}}>
          {days !== null && days > 0 ? `${days} days to go 🌹` : 'Wedding day! 🎉'}
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { emoji:'👥', label:'Groom-side guests', value:groomGuests.length,     to:'/guests' },
          { emoji:'✅', label:'Groom responsibilities', value:groomResp.length,  to:'/events' },
          { emoji:'🚗', label:'Transport vendors',  value:transportVendors.length,to:'/vendors' },
          { emoji:'✈️', label:'Travel plans',       value:travelPlans.length,    to:'/travel' },
        ].map(s => <StatCard key={s.label} {...s}/>)}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="card">
          <h3 className="font-display font-semibold mb-3" style={{color:'var(--text-dark)'}}>Groom-Side Responsibilities</h3>
          {groomResp.length===0
            ? <p className="text-sm" style={{color:'var(--text-muted)'}}>No responsibilities yet</p>
            : <div className="space-y-2">
                {groomResp.slice(0,6).map(r=>(
                  <div key={r.id} className="flex items-center justify-between p-2.5 rounded-xl" style={{background:'#dbeafe'}}>
                    <div>
                      <p className="text-sm font-medium" style={{color:'var(--text-dark)'}}>{r.name}</p>
                      {r.assigned_to && <p className="text-xs" style={{color:'#1e40af'}}>→ {r.assigned_to}</p>}
                    </div>
                    <span className="badge resp-groom text-xs">Groom Side</span>
                  </div>
                ))}
              </div>
          }
        </div>

        <div className="card">
          <h3 className="font-display font-semibold mb-3" style={{color:'var(--text-dark)'}}>Upcoming Tasks</h3>
          {groomTasks.length===0
            ? <p className="text-sm text-center py-4" style={{color:'var(--text-muted)'}}>All done! 🎉</p>
            : <div className="space-y-2">
                {groomTasks.slice(0,5).map(t=>(
                  <div key={t.id} className="flex items-start gap-2 p-2.5 rounded-xl" style={{background:'var(--cream-dark)'}}>
                    <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${t.status==='in_progress'?'bg-blue-400':'bg-gray-300'}`}/>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate" style={{color:'var(--text-dark)'}}>{t.title}</p>
                      <p className="text-xs" style={{color:'var(--text-muted)'}}>{t.assigned_to||'Unassigned'}</p>
                    </div>
                    <Badge status={t.priority}/>
                  </div>
                ))}
              </div>
          }
        </div>
      </div>

      {/* Barat & Bachelor quick links */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {barat && (
          <Link to={`/events/${barat.id}`} className="card hover:shadow-lg transition-all" style={{background:'linear-gradient(135deg,#fdf2f4,#fff)'}}>
            <div className="flex items-center gap-3">
              <span className="text-3xl">🌹</span>
              <div>
                <p className="font-display font-semibold" style={{color:'var(--text-dark)'}}>Barat Details</p>
                <p className="text-sm" style={{color:'var(--text-soft)'}}>{fmtDate(barat.date)}</p>
              </div>
              <ChevronRight size={18} className="ml-auto" style={{color:'var(--text-muted)'}}/>
            </div>
          </Link>
        )}
        {bachelors && (
          <Link to={`/events/${bachelors.id}`} className="card hover:shadow-lg transition-all" style={{background:'linear-gradient(135deg,#eff6ff,#fff)'}}>
            <div className="flex items-center gap-3">
              <span className="text-3xl">🎉</span>
              <div>
                <p className="font-display font-semibold" style={{color:'var(--text-dark)'}}>Bachelor Trip</p>
                <p className="text-sm" style={{color:'var(--text-soft)'}}>{fmtDate(bachelors.date)}</p>
              </div>
              <ChevronRight size={18} className="ml-auto" style={{color:'var(--text-muted)'}}/>
            </div>
          </Link>
        )}
      </div>
    </div>
  )
}

// ── OVERSEAS DASHBOARD ────────────────────────────────────────────────────────
function OverseasDashboard() {
  const { events, guests, travelPlans, weddingDate, weddingTitle, updates } = useApp()
  const days = useMemo(() => { try { return differenceInDays(parseISO(weddingDate), new Date()) } catch { return null } }, [weddingDate])

  return (
    <div className="space-y-6">
      <div className="rounded-2xl p-6 text-white relative overflow-hidden"
        style={{background:'linear-gradient(135deg,#065f46,#059669)'}}>
        <div className="absolute -top-6 -right-6 w-28 h-28 rounded-full bg-white/10"/>
        <h1 className="font-display text-2xl font-bold text-white mb-1">Overseas Family Hub ✈️</h1>
        <p style={{color:'rgba(255,255,255,0.8)'}}>
          {days !== null && days > 0 ? `The wedding is in ${days} days — we can't wait to see you! 🌹` : 'Wedding day! 🎉'}
        </p>
      </div>

      {/* Events schedule */}
      <div className="card">
        <h3 className="font-display font-semibold mb-4" style={{color:'var(--text-dark)'}}>📅 Wedding Schedule</h3>
        {events.length===0
          ? <p className="text-sm" style={{color:'var(--text-muted)'}}>Events will appear here once added</p>
          : <div className="space-y-3">
              {events.map(evt => {
                let dateStr = ''; let dayStr = ''
                try { if (evt.date) { dateStr = format(parseISO(evt.date),'MMMM d, yyyy'); dayStr = format(parseISO(evt.date),'EEEE') } } catch {}
                return (
                  <div key={evt.id} className="flex items-center gap-4 p-3.5 rounded-2xl"
                    style={{background:'var(--champagne)', border:'1px solid var(--champagne-border)'}}>
                    <span className="text-2xl flex-shrink-0">{EVENT_EMOJIS[evt.name]||'💍'}</span>
                    <div className="flex-1">
                      <p className="font-display font-semibold" style={{color:'var(--text-dark)'}}>{evt.name}</p>
                      {dateStr && <p className="text-sm" style={{color:'var(--text-soft)'}}>{dayStr}, {dateStr}</p>}
                      {evt.location && <p className="text-xs" style={{color:'var(--text-muted)'}}>📍 {evt.location}</p>}
                    </div>
                  </div>
                )
              })}
            </div>
        }
      </div>

      {/* Travel plans */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-display font-semibold" style={{color:'var(--text-dark)'}}>✈️ Your Travel Plans</h3>
          <Link to="/travel" className="btn-primary text-sm py-1.5 px-3">Add Travel Details</Link>
        </div>
        {travelPlans.length===0
          ? <div className="text-center py-6">
              <p className="text-3xl mb-2">✈️</p>
              <p className="text-sm" style={{color:'var(--text-soft)'}}>Submit your flight details so the family can arrange your pickup</p>
              <Link to="/travel" className="btn-primary mt-3 inline-flex">Add My Travel Plan</Link>
            </div>
          : <div className="space-y-2">
              {travelPlans.slice(0,3).map(t=>(
                <div key={t.id} className="p-3 rounded-xl" style={{background:'var(--champagne)'}}>
                  <div className="flex items-center justify-between">
                    <p className="font-medium text-sm" style={{color:'var(--text-dark)'}}>{t.guest_name||'Guest'}</p>
                    {t.needs_airport_pickup && <span className="badge bg-orange-100 text-orange-800 text-xs">🚗 Pickup arranged</span>}
                  </div>
                  <p className="text-xs mt-1" style={{color:'var(--text-soft)'}}>
                    {t.airline} {t.flight_number} · Arriving {fmtDate(t.arrival_date)}
                  </p>
                  {t.hotel_name && <p className="text-xs" style={{color:'var(--text-muted)'}}>🏨 {t.hotel_name}</p>}
                </div>
              ))}
            </div>
        }
      </div>

      {/* Latest updates */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-display font-semibold" style={{color:'var(--text-dark)'}}>📣 Latest Updates</h3>
          <Link to="/updates" className="text-xs" style={{color:'var(--rose)'}}>See all →</Link>
        </div>
        {updates.length===0
          ? <p className="text-sm text-center py-4" style={{color:'var(--text-muted)'}}>No updates yet</p>
          : <div className="space-y-2">
              {updates.slice(0,4).map(u=>(
                <div key={u.id} className="flex items-start gap-2.5 p-2.5 rounded-xl" style={{background:'var(--cream-dark)'}}>
                  <span className="text-base">{u.emoji||'📌'}</span>
                  <div>
                    <p className="text-sm" style={{color:'var(--text-dark)'}}>{u.message}</p>
                    <p className="text-xs" style={{color:'var(--text-muted)'}}>{timeAgo(u.created_at)}</p>
                  </div>
                </div>
              ))}
            </div>
        }
      </div>
    </div>
  )
}

// ── GUEST VIEWER DASHBOARD ────────────────────────────────────────────────────
function GuestViewerDashboard() {
  const { events, weddingDate, weddingTitle } = useApp()
  const days = useMemo(() => { try { return differenceInDays(parseISO(weddingDate), new Date()) } catch { return null } }, [weddingDate])

  return (
    <div className="space-y-6">
      <div className="rounded-2xl p-6 text-white text-center relative overflow-hidden"
        style={{background:'linear-gradient(135deg,#7c2d12,#b5484a)'}}>
        <p className="text-5xl mb-3">🌹</p>
        <h1 className="font-display text-2xl font-bold text-white mb-1">{weddingTitle}</h1>
        <p style={{color:'rgba(255,255,255,0.8)'}}>Wedding Celebrations</p>
        {days !== null && days > 0 && (
          <div className="mt-4 inline-block px-6 py-2 rounded-full" style={{background:'rgba(255,255,255,0.15)'}}>
            <span className="font-display text-2xl font-bold">{days}</span>
            <span className="text-sm ml-2" style={{color:'rgba(255,255,255,0.8)'}}>days to go</span>
          </div>
        )}
      </div>

      <div className="card">
        <h3 className="font-display font-semibold mb-4" style={{color:'var(--text-dark)'}}>📅 Wedding Events</h3>
        <div className="space-y-3">
          {events.map(evt => {
            let dateStr = ''
            try { if (evt.date) dateStr = format(parseISO(evt.date),'EEEE, MMMM d, yyyy') } catch {}
            return (
              <div key={evt.id} className="p-4 rounded-2xl" style={{background:'var(--champagne)'}}>
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{EVENT_EMOJIS[evt.name]||'💍'}</span>
                  <div>
                    <p className="font-display font-semibold" style={{color:'var(--text-dark)'}}>{evt.name}</p>
                    {dateStr && <p className="text-sm" style={{color:'var(--text-soft)'}}>{dateStr}</p>}
                    {evt.location && <p className="text-xs" style={{color:'var(--text-muted)'}}>📍 {evt.location}</p>}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

// ── Main Dashboard — role router ──────────────────────────────────────────────
export default function Dashboard() {
  const { userRole } = useApp()

  if (userRole === 'bride_family')    return <BrideFamilyDashboard/>
  if (userRole === 'groom_family')    return <GroomFamilyDashboard/>
  if (userRole === 'overseas_family') return <OverseasDashboard/>
  if (userRole === 'guest_viewer')    return <GuestViewerDashboard/>
  return <AdminDashboard/>
}
