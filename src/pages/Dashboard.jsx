import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { differenceInDays, parseISO, format } from 'date-fns'
import { ChevronRight, AlertCircle, Heart } from 'lucide-react'
import Badge from '../components/ui/Badge'

const EVENT_EMOJIS   = { 'Mayoon':'💛','Mehndi':'🌿','Barat':'🌹','Walima':'✨','Bachelor Trip':'🎉','Honeymoon':'🌴' }
const EVENT_GRADIENTS = {
  'Mayoon':        'linear-gradient(135deg,#f59e0b,#d97706)',
  'Mehndi':        'linear-gradient(135deg,#10b981,#059669)',
  'Barat':         'linear-gradient(135deg,#e11d48,#9f1239)',
  'Walima':        'linear-gradient(135deg,#8b5cf6,#6d28d9)',
  'Bachelor Trip': 'linear-gradient(135deg,#3b82f6,#1d4ed8)',
  'Honeymoon':     'linear-gradient(135deg,#14b8a6,#0f766e)',
}

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
  const days = useMemo(()=>{ try { return differenceInDays(parseISO(weddingDate), new Date()) } catch { return null } }, [weddingDate])
  let dateStr = ''
  try { if (weddingDate) dateStr = format(parseISO(weddingDate),'EEEE, MMMM d, yyyy') } catch {}

  return (
    <div className="rounded-2xl p-6 text-white relative overflow-hidden col-span-full md:col-span-1"
      style={{background:'linear-gradient(135deg,#7c2d12,#b5484a)'}}>
      <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full" style={{background:'rgba(255,255,255,0.05)'}}/>
      <div className="absolute -bottom-4 -left-4 w-20 h-20 rounded-full" style={{background:'rgba(255,255,255,0.05)'}}/>
      <div className="relative z-10">
        <div className="flex items-center gap-2 mb-4">
          <Heart size={14} className="fill-pink-300 text-pink-300"/>
          <span className="text-sm" style={{color:'rgba(255,255,255,0.8)'}}>{weddingTitle}</span>
        </div>
        {days !== null
          ? <>
              <p className="font-display font-bold leading-none" style={{fontSize:'4rem'}}>{Math.abs(days)}</p>
              <p className="mt-1" style={{color:'rgba(255,255,255,0.8)', fontSize:'1.1rem'}}>
                {days > 0 ? 'days until Barat' : days===0 ? '🎉 Today is the day!' : 'days since Barat'}
              </p>
            </>
          : <p style={{color:'rgba(255,255,255,0.7)'}}>Set your wedding date</p>
        }
        <div className="mt-5 pt-4" style={{borderTop:'1px solid rgba(255,255,255,0.2)'}}>
          <p style={{color:'rgba(255,255,255,0.65)', fontSize:'0.875rem'}}>{dateStr}</p>
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
  const pending   = guests.filter(g=>(g.events_invited||[]).includes(event.id) && !(g.events_confirmed||[]).includes(event.id)).length
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
      <div className="bg-white p-3 grid grid-cols-3 divide-x" style={{divideColor:'var(--champagne-border)'}}>
        {[
          { label:'Invited', value:invited },
          { label:'Confirmed', value:confirmed },
          { label:'Vendors', value:vCount },
        ].map(s=>(
          <div key={s.label} className="text-center px-2">
            <p className="font-display font-bold text-base" style={{color:'var(--text-dark)'}}>{s.value}</p>
            <p className="text-xs" style={{color:'var(--text-muted)'}}>{s.label}</p>
          </div>
        ))}
      </div>
    </Link>
  )
}

export default function Dashboard() {
  const { events, vendors, guests, tasks, expenses, budget, totalSpent, remaining, weddingDate, weddingTitle } = useApp()

  const confirmedGuests = guests.filter(g=>g.rsvp_status==='confirmed').length
  const pendingTasks    = tasks.filter(t=>t.status!=='done')
  const budgetPct       = budget>0 ? Math.min(Math.round((totalSpent/budget)*100),100) : 0
  const paymentAlerts   = vendors.filter(v=>v.status==='deposit_due'||v.status==='final_payment_due')
  const fmt = n => `PKR ${(n/1000).toFixed(0)}k`

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="section-title flex items-center gap-2">Wedding Dashboard <span>🌹</span></h1>
        <p className="text-sm mt-1" style={{color:'var(--text-soft)'}}>Your complete wedding command centre</p>
      </div>

      {/* Top stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <CountdownCard weddingDate={weddingDate} weddingTitle={weddingTitle}/>
        <StatCard emoji="👥" label="Guests confirmed"  value={`${confirmedGuests}/${guests.length}`} sub="RSVPs received" to="/guests"/>
        <StatCard emoji="🛍️" label="Vendors managed" value={vendors.length} sub={`${vendors.filter(v=>v.status==='deposit_paid'||v.status==='completed').length} deposits paid`} to="/vendors"/>
        <StatCard emoji="✅" label="Tasks remaining"  value={pendingTasks.length} sub={`of ${tasks.length} total tasks`} to="/tasks"/>
      </div>

      {/* Payment alerts */}
      {paymentAlerts.length > 0 && (
        <div className="rounded-2xl p-4 flex items-start gap-3" style={{background:'#fff7ed',border:'1px solid #fed7aa'}}>
          <AlertCircle size={18} className="text-orange-500 flex-shrink-0 mt-0.5"/>
          <div className="flex-1">
            <p className="text-sm font-semibold text-orange-800 mb-1">Vendor Payment Alerts</p>
            <div className="flex flex-wrap gap-2">
              {paymentAlerts.map(v=>(
                <span key={v.id} className="text-xs bg-orange-100 text-orange-800 px-2 py-1 rounded-lg">
                  {v.name} · {v.status==='deposit_due'?'Deposit Due':'Final Due'}
                </span>
              ))}
            </div>
          </div>
          <Link to="/vendors" className="btn-secondary text-xs py-1 px-3 whitespace-nowrap">View all</Link>
        </div>
      )}

      {/* Budget + Tasks */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Budget */}
        <div className="card" style={{background:'linear-gradient(135deg,#fdf8f0,#f7e9d0)'}}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display font-semibold text-lg">Budget Overview 💰</h3>
            <Link to="/budget" className="text-xs flex items-center gap-1" style={{color:'var(--rose)'}}>View all <ChevronRight size={12}/></Link>
          </div>
          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-sm mb-1.5" style={{color:'var(--text-mid)'}}>
                <span>Spent</span>
                <span className="font-semibold" style={{color:'var(--text-dark)'}}>{fmt(totalSpent)}</span>
              </div>
              <div className="h-2.5 rounded-full overflow-hidden" style={{background:'var(--champagne-border)'}}>
                <div className="h-full rounded-full transition-all duration-700"
                  style={{width:`${budgetPct}%`, background:budgetPct>90?'#ef4444':budgetPct>70?'#f59e0b':'#10b981'}}/>
              </div>
              <p className="text-xs mt-1" style={{color:'var(--text-muted)'}}>{budgetPct}% of budget</p>
            </div>
            <div className="grid grid-cols-2 gap-3 pt-2" style={{borderTop:'1px solid var(--champagne-border)'}}>
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

        {/* Tasks */}
        <div className="card lg:col-span-1">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display font-semibold text-lg">Upcoming Tasks ✅</h3>
            <Link to="/tasks" className="text-xs flex items-center gap-1" style={{color:'var(--rose)'}}>View all <ChevronRight size={12}/></Link>
          </div>
          {pendingTasks.length===0
            ? <p className="text-sm text-center py-6" style={{color:'var(--text-muted)'}}>All tasks complete! 🎉</p>
            : <div className="space-y-2">
                {pendingTasks.slice(0,5).map(t=>(
                  <div key={t.id} className="flex items-start gap-2.5 p-2 rounded-xl hover:bg-orange-50/50 transition-colors">
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

        {/* RSVP summary */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display font-semibold text-lg">RSVP Summary 💌</h3>
            <Link to="/guests" className="text-xs flex items-center gap-1" style={{color:'var(--rose)'}}>View all <ChevronRight size={12}/></Link>
          </div>
          <div className="space-y-3">
            {[
              { label:'Confirmed', value:guests.filter(g=>g.rsvp_status==='confirmed').length, color:'#059669' },
              { label:'Pending',   value:guests.filter(g=>g.rsvp_status==='pending').length,   color:'#d97706' },
              { label:'Declined',  value:guests.filter(g=>g.rsvp_status==='declined').length,  color:'#dc2626' },
              { label:'Needs Transport', value:guests.filter(g=>g.transport_needed).length, color:'var(--gold)' },
              { label:'Needs Accommodation', value:guests.filter(g=>g.accommodation_needed).length, color:'var(--gold)' },
            ].map(s=>(
              <div key={s.label} className="flex items-center justify-between">
                <span className="text-sm" style={{color:'var(--text-mid)'}}>{s.label}</span>
                <span className="font-display font-bold text-base" style={{color:s.color}}>{s.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Event cards */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-xl font-semibold" style={{color:'var(--text-dark)'}}>Wedding Events</h2>
          <p className="text-sm" style={{color:'var(--text-muted)'}}>Click any event to manage it</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {events.map(evt=><EventCard key={evt.id} event={evt}/>)}
        </div>
      </div>
    </div>
  )
}
