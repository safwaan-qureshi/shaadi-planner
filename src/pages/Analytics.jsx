import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { format, parseISO } from 'date-fns'
import { BarChart2, Users, Wallet, ShoppingBag, CheckSquare, Download } from 'lucide-react'

const EVENT_EMOJIS = { 'Mayoon':'💛','Mehndi':'🌿','Barat':'🌹','Walima':'✨','Bachelor Trip':'🎉','Honeymoon':'🌴' }

function ProgressBar({ value, max, color = 'var(--rose)', height = 8 }) {
  const pct = max > 0 ? Math.min(Math.round((value / max) * 100), 100) : 0
  return (
    <div>
      <div className="flex justify-between text-xs mb-1" style={{color:'var(--text-muted)'}}>
        <span>{value} / {max}</span><span>{pct}%</span>
      </div>
      <div style={{height, borderRadius:999, background:'var(--champagne-border)', overflow:'hidden'}}>
        <div style={{width:`${pct}%`, height:'100%', borderRadius:999, background:color, transition:'width 0.7s ease'}}/>
      </div>
    </div>
  )
}

function SectionTitle({ icon:Icon, title, color = 'var(--rose)' }) {
  return (
    <div className="flex items-center gap-2 mb-4">
      <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{background:'var(--champagne)'}}>
        <Icon size={16} style={{color}}/>
      </div>
      <h2 className="font-display text-lg font-semibold" style={{color:'var(--text-dark)'}}>{title}</h2>
    </div>
  )
}

function exportCSV(data, filename) {
  if (!data.length) return
  const keys = Object.keys(data[0])
  const csv  = [keys.join(','), ...data.map(row => keys.map(k => `"${row[k] ?? ''}"`).join(','))].join('\n')
  const blob = new Blob([csv], { type: 'text/csv' })
  const url  = URL.createObjectURL(blob)
  const a    = document.createElement('a'); a.href=url; a.download=filename+'.csv'; a.click()
  URL.revokeObjectURL(url)
}

export default function Analytics() {
  const { events, guests, vendors, expenses, tasks, budget } = useApp()

  // ── Guest analytics ──────────────────────────────────────────────────────
  const brideGuests    = guests.filter(g => g.side === 'bride')
  const groomGuests    = guests.filter(g => g.side === 'groom')
  const confirmed      = guests.filter(g => g.rsvp_status === 'confirmed')
  const pending        = guests.filter(g => g.rsvp_status === 'pending')
  const declined       = guests.filter(g => g.rsvp_status === 'declined')
  const totalPeople    = guests.reduce((s,g) => s + 1 + (g.plus_guests||0), 0)
  const confirmedPeople= confirmed.reduce((s,g) => s + (g.confirmed_count || 1 + (g.plus_guests||0)), 0)
  const needTransport  = guests.filter(g => g.transport_needed).length
  const needAccom      = guests.filter(g => g.accommodation_needed).length

  // Per-event RSVP
  const perEventRsvp = events.map(e => ({
    name: e.name,
    emoji: EVENT_EMOJIS[e.name]||'💍',
    invited:   guests.filter(g=>(g.events_invited||[]).includes(e.id)).length,
    confirmed: guests.filter(g=>(g.events_confirmed||[]).includes(e.id)).length,
  }))

  // ── Budget analytics ─────────────────────────────────────────────────────
  const totalSpent = expenses.reduce((s,e) => s+Number(e.amount||0), 0)
  const totalPaid  = expenses.filter(e=>e.paid).reduce((s,e) => s+Number(e.amount||0), 0)
  const remaining  = budget - totalSpent

  const perEventBudget = events.map(e => ({
    name:  e.name,
    emoji: EVENT_EMOJIS[e.name]||'💍',
    spent: expenses.filter(x=>x.event_id===e.id).reduce((s,x)=>s+Number(x.amount||0),0),
  })).filter(e => e.spent > 0).sort((a,b)=>b.spent-a.spent)

  const byCategory = {}
  expenses.forEach(e => {
    if (!e.category) return
    byCategory[e.category] = (byCategory[e.category]||0) + Number(e.amount||0)
  })
  const categoryBreakdown = Object.entries(byCategory)
    .map(([cat, total]) => ({ cat, total }))
    .sort((a,b)=>b.total-a.total)

  // ── Vendor analytics ─────────────────────────────────────────────────────
  const vendorByStatus = {
    vendor_selected: vendors.filter(v=>v.status==='vendor_selected').length,
    deposit_due:     vendors.filter(v=>v.status==='deposit_due').length,
    deposit_paid:    vendors.filter(v=>v.status==='deposit_paid').length,
    final_payment_due:vendors.filter(v=>v.status==='final_payment_due').length,
    completed:       vendors.filter(v=>v.status==='completed').length,
  }
  const totalVendorCost = vendors.reduce((s,v)=>s+Number(v.cost||0),0)

  // ── Task analytics ───────────────────────────────────────────────────────
  const taskDone  = tasks.filter(t=>t.status==='done').length
  const taskTodo  = tasks.filter(t=>t.status==='todo').length
  const taskInProg= tasks.filter(t=>t.status==='in_progress').length
  const byPriority = {
    high:   tasks.filter(t=>t.priority==='high'   && t.status!=='done').length,
    medium: tasks.filter(t=>t.priority==='medium' && t.status!=='done').length,
    low:    tasks.filter(t=>t.priority==='low'    && t.status!=='done').length,
  }

  // ── Planning progress per event ──────────────────────────────────────────
  const eventProgress = events.map(e => {
    const evtTasks    = tasks.filter(t => t.event_id === e.id)
    const evtDone     = evtTasks.filter(t => t.status==='done').length
    const evtVendors  = vendors.filter(v => v.event_id === e.id)
    const evtConfirmed= evtVendors.filter(v => ['deposit_paid','completed'].includes(v.status)).length
    const score = evtTasks.length + evtVendors.length > 0
      ? Math.round(((evtDone + evtConfirmed) / (evtTasks.length + evtVendors.length)) * 100)
      : 0
    return { name:e.name, emoji:EVENT_EMOJIS[e.name]||'💍', score, tasks:evtTasks.length, done:evtDone, vendors:evtVendors.length, confirmed:evtConfirmed }
  })

  const fmt = n => `PKR ${(n/1000).toFixed(0)}k`

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="section-title flex items-center gap-2">Analytics 📊</h1>
          <p className="text-sm mt-1" style={{color:'var(--text-soft)'}}>Overview of your wedding planning progress</p>
        </div>
        <button
          onClick={() => exportCSV(guests.map(g=>({
            Name:g.name, Phone:g.phone||'', Side:g.side, RSVP:g.rsvp_status,
            'Plus Guests':g.plus_guests||0, Transport:g.transport_needed?'Yes':'No', Accommodation:g.accommodation_needed?'Yes':'No'
          })), 'guest-list')}
          className="btn-secondary">
          <Download size={15}/>Export Guest CSV
        </button>
      </div>

      {/* ── Overall progress cards ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { emoji:'✅', label:'Tasks Complete',    value:`${taskDone}/${tasks.length}`,    sub:`${taskInProg} in progress` },
          { emoji:'👥', label:'Guests Confirmed',  value:`${confirmed.length}/${guests.length}`, sub:`~${confirmedPeople} people` },
          { emoji:'🛍️', label:'Vendors Sorted',    value:`${vendorByStatus.deposit_paid+vendorByStatus.completed}/${vendors.length}`, sub:'paid or completed' },
          { emoji:'💰', label:'Budget Used',       value:`${budget>0?Math.round((totalSpent/budget)*100):0}%`, sub:fmt(totalSpent)+' spent' },
        ].map(s=>(
          <div key={s.label} className="card py-3 px-4">
            <p className="text-xl mb-1">{s.emoji}</p>
            <p className="font-display text-2xl font-bold" style={{color:'var(--text-dark)'}}>{s.value}</p>
            <p className="text-xs" style={{color:'var(--text-muted)'}}>{s.label}</p>
            <p className="text-xs mt-0.5" style={{color:'var(--text-soft)'}}>{s.sub}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* ── Guest Distribution ── */}
        <div className="card">
          <SectionTitle icon={Users} title="Guest Distribution"/>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              {[
                { label:'Bride Side',  value:brideGuests.length, color:'#9d174d', bg:'#fce7f3' },
                { label:'Groom Side',  value:groomGuests.length, color:'#1e40af', bg:'#dbeafe' },
                { label:'Confirmed',   value:confirmed.length,   color:'#065f46', bg:'#d1fae5' },
                { label:'Pending',     value:pending.length,     color:'#92400e', bg:'#fef3c7' },
              ].map(s=>(
                <div key={s.label} className="rounded-xl p-3 text-center" style={{background:s.bg}}>
                  <p className="font-display text-2xl font-bold" style={{color:s.color}}>{s.value}</p>
                  <p className="text-xs" style={{color:s.color+'99'}}>{s.label}</p>
                </div>
              ))}
            </div>

            <div className="space-y-1 pt-2" style={{borderTop:'1px solid var(--champagne-border)'}}>
              <div className="flex justify-between text-sm py-1.5" style={{borderBottom:'1px solid var(--champagne-border)'}}>
                <span style={{color:'var(--text-mid)'}}>Total invitations</span>
                <span className="font-semibold" style={{color:'var(--text-dark)'}}>{guests.length}</span>
              </div>
              <div className="flex justify-between text-sm py-1.5" style={{borderBottom:'1px solid var(--champagne-border)'}}>
                <span style={{color:'var(--text-mid)'}}>Estimated total people</span>
                <span className="font-semibold" style={{color:'var(--text-dark)'}}>{totalPeople}</span>
              </div>
              <div className="flex justify-between text-sm py-1.5" style={{borderBottom:'1px solid var(--champagne-border)'}}>
                <span style={{color:'var(--text-mid)'}}>Confirmed people</span>
                <span className="font-semibold" style={{color:'#065f46'}}>{confirmedPeople}</span>
              </div>
              <div className="flex justify-between text-sm py-1.5" style={{borderBottom:'1px solid var(--champagne-border)'}}>
                <span style={{color:'var(--text-mid)'}}>Need transport</span>
                <span className="font-semibold" style={{color:'var(--text-dark)'}}>{needTransport}</span>
              </div>
              <div className="flex justify-between text-sm py-1.5">
                <span style={{color:'var(--text-mid)'}}>Need accommodation</span>
                <span className="font-semibold" style={{color:'var(--text-dark)'}}>{needAccom}</span>
              </div>
            </div>
          </div>
        </div>

        {/* ── Per-Event RSVP ── */}
        <div className="card">
          <SectionTitle icon={CheckSquare} title="RSVP by Event"/>
          {perEventRsvp.length===0
            ? <p className="text-sm text-center py-8" style={{color:'var(--text-muted)'}}>No events yet</p>
            : <div className="space-y-4">
                {perEventRsvp.map(e=>(
                  <div key={e.name}>
                    <div className="flex items-center gap-2 mb-1.5">
                      <span>{e.emoji}</span>
                      <span className="text-sm font-medium" style={{color:'var(--text-dark)'}}>{e.name}</span>
                      <span className="text-xs ml-auto" style={{color:'var(--text-muted)'}}>{e.confirmed} confirmed</span>
                    </div>
                    <ProgressBar value={e.confirmed} max={e.invited} color="var(--rose)"/>
                  </div>
                ))}
              </div>
          }
        </div>

        {/* ── Budget breakdown ── */}
        <div className="card">
          <SectionTitle icon={Wallet} title="Budget Breakdown" color="var(--gold)"/>
          <div className="grid grid-cols-3 gap-3 mb-4">
            {[
              { label:'Total Budget', value:fmt(budget),    color:'var(--text-dark)' },
              { label:'Total Spent',  value:fmt(totalSpent),color:'var(--rose)' },
              { label:'Remaining',    value:fmt(remaining), color:remaining<0?'#dc2626':'#059669' },
            ].map(s=>(
              <div key={s.label} className="text-center py-2 rounded-xl" style={{background:'var(--champagne)'}}>
                <p className="font-display font-bold text-base" style={{color:s.color}}>{s.value}</p>
                <p className="text-xs" style={{color:'var(--text-muted)'}}>{s.label}</p>
              </div>
            ))}
          </div>

          {perEventBudget.length > 0 && (
            <div className="space-y-3">
              <p className="text-xs font-semibold uppercase tracking-wide" style={{color:'var(--text-muted)'}}>Spending by Event</p>
              {perEventBudget.map(e=>(
                <div key={e.name}>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm">{e.emoji}</span>
                    <span className="text-sm" style={{color:'var(--text-mid)'}}>{e.name}</span>
                    <span className="text-xs ml-auto font-semibold" style={{color:'var(--gold)'}}>{fmt(e.spent)}</span>
                  </div>
                  <ProgressBar value={e.spent} max={totalSpent} color="var(--gold)" height={6}/>
                </div>
              ))}
            </div>
          )}

          {categoryBreakdown.length > 0 && (
            <div className="mt-4 pt-4 space-y-2" style={{borderTop:'1px solid var(--champagne-border)'}}>
              <p className="text-xs font-semibold uppercase tracking-wide" style={{color:'var(--text-muted)'}}>By Category</p>
              {categoryBreakdown.slice(0,6).map(c=>(
                <div key={c.cat} className="flex justify-between text-sm py-1">
                  <span className="capitalize" style={{color:'var(--text-mid)'}}>{c.cat}</span>
                  <span className="font-medium" style={{color:'var(--text-dark)'}}>{fmt(c.total)}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── Vendor status ── */}
        <div className="card">
          <SectionTitle icon={ShoppingBag} title="Vendor Status"/>
          <div className="space-y-3 mb-4">
            {[
              { label:'Vendor Selected',    value:vendorByStatus.vendor_selected,   color:'#7c3aed', bg:'#ede9fe' },
              { label:'Deposit Due',        value:vendorByStatus.deposit_due,        color:'#ea580c', bg:'#ffedd5' },
              { label:'Deposit Paid',       value:vendorByStatus.deposit_paid,       color:'#065f46', bg:'#d1fae5' },
              { label:'Final Payment Due',  value:vendorByStatus.final_payment_due,  color:'#dc2626', bg:'#fee2e2' },
              { label:'Completed',          value:vendorByStatus.completed,          color:'#059669', bg:'#d1fae5' },
            ].map(s=>(
              <div key={s.label} className="flex items-center justify-between p-2.5 rounded-xl" style={{background:s.bg}}>
                <span className="text-sm font-medium" style={{color:s.color}}>{s.label}</span>
                <span className="font-display font-bold" style={{color:s.color}}>{s.value}</span>
              </div>
            ))}
          </div>
          <div className="pt-3" style={{borderTop:'1px solid var(--champagne-border)'}}>
            <div className="flex justify-between text-sm">
              <span style={{color:'var(--text-mid)'}}>Total vendor cost</span>
              <span className="font-semibold" style={{color:'var(--gold)'}}>{fmt(totalVendorCost)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Event planning progress ── */}
      <div className="card">
        <SectionTitle icon={BarChart2} title="Planning Progress by Event"/>
        {eventProgress.length===0
          ? <p className="text-sm text-center py-8" style={{color:'var(--text-muted)'}}>Add events to track progress</p>
          : <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {eventProgress.map(e=>(
                <div key={e.name} className="card-cream p-4 rounded-2xl">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-2xl">{e.emoji}</span>
                    <div>
                      <p className="font-display font-semibold text-sm" style={{color:'var(--text-dark)'}}>{e.name}</p>
                      <p className="text-xs" style={{color:'var(--text-muted)'}}>{e.score}% complete</p>
                    </div>
                  </div>
                  <ProgressBar value={e.score} max={100} color={e.score>80?'#059669':e.score>50?'var(--gold)':'var(--rose)'} height={10}/>
                  <div className="grid grid-cols-2 gap-2 mt-3 text-xs" style={{color:'var(--text-muted)'}}>
                    <span>✅ {e.done}/{e.tasks} tasks</span>
                    <span>🛍️ {e.confirmed}/{e.vendors} vendors</span>
                  </div>
                </div>
              ))}
            </div>
        }
      </div>

      {/* ── Task priority ── */}
      <div className="card">
        <SectionTitle icon={CheckSquare} title="Outstanding Tasks by Priority"/>
        <div className="grid grid-cols-3 gap-4">
          {[
            { label:'High Priority',   value:byPriority.high,   color:'#dc2626', bg:'#fee2e2', emoji:'🔴' },
            { label:'Medium Priority', value:byPriority.medium, color:'#d97706', bg:'#fef3c7', emoji:'🟡' },
            { label:'Low Priority',    value:byPriority.low,    color:'#6b7280', bg:'#f3f4f6', emoji:'⚪' },
          ].map(s=>(
            <div key={s.label} className="text-center py-5 rounded-2xl" style={{background:s.bg}}>
              <p className="text-2xl mb-2">{s.emoji}</p>
              <p className="font-display text-3xl font-bold" style={{color:s.color}}>{s.value}</p>
              <p className="text-xs mt-1" style={{color:s.color+'99'}}>{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Export buttons */}
      <div className="card" style={{background:'var(--champagne)'}}>
        <h3 className="font-display font-semibold mb-3" style={{color:'var(--text-dark)'}}>📥 Export Reports</h3>
        <div className="flex flex-wrap gap-3">
          <button onClick={()=>exportCSV(guests.map(g=>({Name:g.name,Phone:g.phone||'',Email:g.email||'',Side:g.side,RSVP:g.rsvp_status,'Plus Guests':g.plus_guests||0,Transport:g.transport_needed?'Yes':'No',Notes:g.notes||''})),'guest-list')} className="btn-secondary">
            <Download size={14}/>Guest List
          </button>
          <button onClick={()=>exportCSV(vendors.map(v=>({Name:v.name,Category:v.category,Status:v.status,Cost:v.cost||0,Deposit:v.deposit_amount||0,Contact:v.contact_phone||'',Notes:v.notes||''})),'vendors')} className="btn-secondary">
            <Download size={14}/>Vendors
          </button>
          <button onClick={()=>exportCSV(expenses.map(e=>({Title:e.title,Amount:e.amount,Category:e.category||'',Paid:e.paid?'Yes':'No',Notes:e.notes||''})),'budget')} className="btn-secondary">
            <Download size={14}/>Budget
          </button>
          <button onClick={()=>exportCSV(tasks.map(t=>({Title:t.title,'Assigned To':t.assigned_to||'',Deadline:t.deadline||'',Status:t.status,Priority:t.priority})),'tasks')} className="btn-secondary">
            <Download size={14}/>Tasks
          </button>
        </div>
      </div>
    </div>
  )
}
