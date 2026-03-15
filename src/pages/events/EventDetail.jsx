import { useState } from 'react'
import { useParams, Navigate } from 'react-router-dom'
import { useApp } from '../../context/AppContext'
import { format, parseISO, differenceInDays } from 'date-fns'
import {
  MapPin, Users, CalendarDays, Plus, Edit2, Trash2,
  ShoppingBag, UserCheck, Wallet, Shirt, Image, X, Phone
} from 'lucide-react'
import Modal from '../../components/ui/Modal'
import Badge from '../../components/ui/Badge'
import ConfirmDialog from '../../components/ui/ConfirmDialog'

const EVENT_EMOJIS = { 'Mayoon':'💛','Mehndi':'🌿','Barat':'🌹','Walima':'✨','Bachelor Trip':'🎉','Honeymoon':'🌴' }
const EVENT_COLORS = {
  'Mayoon':  'from-yellow-600 to-amber-700',
  'Mehndi':  'from-green-600 to-emerald-700',
  'Barat':   'from-rose-700 to-red-800',
  'Walima':  'from-purple-600 to-violet-700',
  'Bachelor Trip': 'from-blue-600 to-indigo-700',
  'Honeymoon':     'from-teal-600 to-cyan-700',
}

const TABS = ['Overview','Guests','Vendors','Responsibilities','Budget','Outfits','Moodboard']

// ── Sub-components ────────────────────────────────────────────────────────────
function SectionHeader({ title, onAdd, addLabel, canEdit }) {
  return (
    <div className="flex items-center justify-between mb-4">
      <h3 className="font-display text-lg font-semibold" style={{color:'var(--text-dark)'}}>{title}</h3>
      {canEdit && onAdd && (
        <button onClick={onAdd} className="btn-primary text-sm py-1.5 px-3">
          <Plus size={14}/>{addLabel||'Add'}
        </button>
      )}
    </div>
  )
}

// ── Responsibilities Tab ──────────────────────────────────────────────────────
function ResponsibilitiesTab({ eventId, canEdit }) {
  const { responsibilities, addResponsibility, updateResponsibility, deleteResponsibility, familyMembers } = useApp()
  const items = responsibilities.filter(r => r.event_id === eventId)
  const [modal, setModal] = useState(false)
  const [del, setDel] = useState(null)
  const [edit, setEdit] = useState(null)
  const [form, setForm] = useState({ name:'', assigned_to:'', payment_responsibility:'bride', notes:'' })

  const open = (item=null) => {
    setEdit(item)
    setForm(item ? { name:item.name, assigned_to:item.assigned_to||'', payment_responsibility:item.payment_responsibility||'bride', notes:item.notes||'' }
      : { name:'', assigned_to:'', payment_responsibility:'bride', notes:'' })
    setModal(true)
  }

  const submit = (e) => {
    e.preventDefault()
    if (edit) updateResponsibility(edit.id, {...form, event_id:eventId})
    else addResponsibility({...form, event_id:eventId})
    setModal(false)
  }

  return (
    <div>
      <SectionHeader title="Responsibilities" onAdd={()=>open()} addLabel="Add Responsibility" canEdit={canEdit} />
      {items.length === 0
        ? <p className="text-sm py-8 text-center" style={{color:'var(--text-muted)'}}>No responsibilities assigned yet</p>
        : (
          <div className="space-y-2">
            {items.map(r => (
              <div key={r.id} className="card py-3 px-4 flex items-center justify-between">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <Badge status={r.payment_responsibility} />
                  <div className="min-w-0">
                    <p className="font-medium text-sm truncate" style={{color:'var(--text-dark)'}}>{r.name}</p>
                    {r.assigned_to && <p className="text-xs" style={{color:'var(--text-soft)'}}>Assigned to: {r.assigned_to}</p>}
                    {r.notes && <p className="text-xs italic mt-0.5" style={{color:'var(--text-muted)'}}>{r.notes}</p>}
                  </div>
                </div>
                {canEdit && (
                  <div className="flex gap-1 ml-3">
                    <button onClick={()=>open(r)} className="btn-ghost py-1 px-1.5"><Edit2 size={13}/></button>
                    <button onClick={()=>setDel(r.id)} className="btn-ghost py-1 px-1.5 hover:text-red-500"><Trash2 size={13}/></button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )
      }
      <Modal open={modal} onClose={()=>setModal(false)} title={edit ? 'Edit Responsibility' : 'Add Responsibility'}>
        <form onSubmit={submit} className="space-y-3">
          <div><label className="label">Responsibility Name *</label>
            <input className="input-field" required placeholder="e.g. Mehndi Decor" value={form.name} onChange={e=>setForm(p=>({...p,name:e.target.value}))} /></div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="label">Assigned To</label>
              <input className="input-field" placeholder="Person's name" value={form.assigned_to} onChange={e=>setForm(p=>({...p,assigned_to:e.target.value}))} list="fam-list"/>
              <datalist id="fam-list">{familyMembers.map(m=><option key={m.id} value={m.name}/>)}</datalist>
            </div>
            <div><label className="label">Payment Responsibility</label>
              <select className="input-field" value={form.payment_responsibility} onChange={e=>setForm(p=>({...p,payment_responsibility:e.target.value}))}>
                <option value="bride">Bride Side</option>
                <option value="groom">Groom Side</option>
                <option value="shared">Shared</option>
              </select>
            </div>
          </div>
          <div><label className="label">Notes</label>
            <input className="input-field" placeholder="Optional notes" value={form.notes} onChange={e=>setForm(p=>({...p,notes:e.target.value}))} /></div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={()=>setModal(false)} className="btn-secondary flex-1">Cancel</button>
            <button type="submit" className="btn-primary flex-1 justify-center">{edit?'Update':'Add'}</button>
          </div>
        </form>
      </Modal>
      <ConfirmDialog open={!!del} onClose={()=>setDel(null)} onConfirm={()=>deleteResponsibility(del)} title="Remove responsibility?" />
    </div>
  )
}

// ── Moodboard Tab ─────────────────────────────────────────────────────────────
function MoodboardTab({ eventId, canEdit }) {
  const { moodboard, addMoodboardImage, deleteMoodboardImage } = useApp()
  const images = moodboard.filter(m => m.event_id === eventId)
  const [url, setUrl] = useState('')
  const [caption, setCaption] = useState('')
  const [modal, setModal] = useState(false)

  const add = (e) => {
    e.preventDefault()
    if (!url.trim()) return
    addMoodboardImage({ event_id: eventId, url: url.trim(), caption })
    setUrl(''); setCaption(''); setModal(false)
  }

  return (
    <div>
      <SectionHeader title="Moodboard & Inspiration" onAdd={()=>setModal(true)} addLabel="Add Image" canEdit={canEdit} />
      <p className="text-xs mb-4" style={{color:'var(--text-muted)'}}>Paste image URLs to save decor inspiration, stage designs, outfit ideas, and themes.</p>
      {images.length === 0
        ? <div className="py-12 text-center rounded-2xl border-2 border-dashed" style={{borderColor:'var(--champagne-border)'}}>
            <p className="text-4xl mb-2">🖼️</p>
            <p className="text-sm font-medium" style={{color:'var(--text-soft)'}}>No inspiration images yet</p>
            <p className="text-xs mt-1" style={{color:'var(--text-muted)'}}>Add image URLs to build your moodboard</p>
          </div>
        : <div className="moodboard-grid">
            {images.map(img => (
              <div key={img.id} className="relative group">
                <img src={img.url} alt={img.caption||'Inspiration'} className="moodboard-img"
                  onError={e=>{e.target.style.display='none'}} />
                {img.caption && <p className="text-xs mt-1 text-center truncate" style={{color:'var(--text-soft)'}}>{img.caption}</p>}
                {canEdit && (
                  <button onClick={()=>deleteMoodboardImage(img.id)}
                    className="absolute top-1 right-1 w-6 h-6 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    style={{background:'rgba(181,72,74,0.85)'}}>
                    <X size={12} className="text-white"/>
                  </button>
                )}
              </div>
            ))}
          </div>
      }
      <Modal open={modal} onClose={()=>setModal(false)} title="Add Inspiration Image" size="sm">
        <form onSubmit={add} className="space-y-3">
          <div><label className="label">Image URL *</label>
            <input className="input-field" required placeholder="https://example.com/image.jpg" value={url} onChange={e=>setUrl(e.target.value)} /></div>
          <div><label className="label">Caption</label>
            <input className="input-field" placeholder="e.g. Stage decor inspiration" value={caption} onChange={e=>setCaption(e.target.value)} /></div>
          <div className="flex gap-3 pt-1">
            <button type="button" onClick={()=>setModal(false)} className="btn-secondary flex-1">Cancel</button>
            <button type="submit" className="btn-primary flex-1 justify-center">Add Image</button>
          </div>
        </form>
      </Modal>
    </div>
  )
}

// ── Outfits Tab ───────────────────────────────────────────────────────────────
function OutfitsTab({ eventId, canEdit }) {
  const { outfits } = useApp()
  const items = outfits.filter(o => o.event_id === eventId)
  return (
    <div>
      <SectionHeader title="Event Outfits" canEdit={false} />
      {items.length === 0
        ? <p className="text-sm py-8 text-center" style={{color:'var(--text-muted)'}}>No outfits linked to this event. Add them in the Outfits module.</p>
        : <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {items.map(o => (
              <div key={o.id} className="card py-3 px-4">
                <div className="flex justify-between items-start mb-1">
                  <p className="font-medium text-sm" style={{color:'var(--text-dark)'}}>{o.person_name}</p>
                  <Badge status={o.status} />
                </div>
                <p className="text-xs" style={{color:'var(--text-soft)'}}>{o.outfit_type}{o.designer ? ` · ${o.designer}` : ''}</p>
                <div className="flex items-center justify-between mt-2">
                  <Badge status={o.payment_responsibility} />
                  <span className="text-xs font-semibold" style={{color:'var(--gold)'}}>PKR {(o.cost||0).toLocaleString()}</span>
                </div>
              </div>
            ))}
          </div>
      }
    </div>
  )
}

// ── Main EventDetail ──────────────────────────────────────────────────────────
export default function EventDetail() {
  const { id } = useParams()
  const { events, guests, vendors, expenses, userRole } = useApp()
  const event = events.find(e => e.id === id)
  const [tab, setTab] = useState('Overview')

  if (!event) return <Navigate to="/" replace />

  const canEdit = userRole === 'admin' || userRole === 'family'
  const emoji = EVENT_EMOJIS[event.name] || '💍'
  const gradientClass = EVENT_COLORS[event.name] || 'from-rose-700 to-red-800'

  const eventGuests = guests.filter(g => (g.events_invited||[]).includes(id))
  const confirmedGuests = eventGuests.filter(g => (g.events_confirmed||[]).includes(id))
  const eventVendors = vendors.filter(v => v.event_id === id)
  const eventExpenses = expenses.filter(e => e.event_id === id)
  const eventBudget = eventExpenses.reduce((s,e) => s+(e.amount||0), 0)

  let daysAway = null
  try { daysAway = differenceInDays(parseISO(event.date), new Date()) } catch {}
  let dateStr = event.date
  try { if (event.date) dateStr = format(parseISO(event.date), 'EEEE, MMMM d, yyyy') } catch {}

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Hero banner */}
      <div className={`rounded-2xl bg-gradient-to-br ${gradientClass} p-6 text-white relative overflow-hidden`}>
        <div className="absolute -top-8 -right-8 w-36 h-36 bg-white/5 rounded-full"/>
        <div className="absolute -bottom-4 -left-4 w-24 h-24 bg-white/5 rounded-full"/>
        <div className="relative z-10">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-5xl mb-2">{emoji}</p>
              <h1 className="text-white font-display text-3xl font-bold">{event.name}</h1>
              {event.date && <p className="text-white/80 mt-1">{dateStr}</p>}
              {event.location && (
                <p className="text-white/70 text-sm flex items-center gap-1.5 mt-1">
                  <MapPin size={13}/>{event.location}
                </p>
              )}
            </div>
            {daysAway !== null && (
              <div className="text-right">
                <p className="font-display text-4xl font-bold">{Math.abs(daysAway)}</p>
                <p className="text-white/70 text-sm">{daysAway > 0 ? 'days away' : daysAway===0 ? "today!" : 'days ago'}</p>
              </div>
            )}
          </div>

          {/* Quick stats */}
          <div className="grid grid-cols-4 gap-3 mt-5">
            {[
              { label:'Invited',    value:eventGuests.length },
              { label:'Confirmed',  value:confirmedGuests.length },
              { label:'Vendors',    value:eventVendors.length },
              { label:'Budget',     value:`PKR ${(eventBudget/1000).toFixed(0)}k` },
            ].map(s => (
              <div key={s.label} className="text-center py-2 px-1 rounded-xl bg-white/10">
                <p className="font-display text-xl font-bold text-white">{s.value}</p>
                <p className="text-white/70 text-xs">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {TABS.map(t => (
          <button key={t} onClick={()=>setTab(t)}
            className={`tab-pill ${tab===t ? 'tab-pill-active' : 'tab-pill-inactive'}`}>
            {t}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="card">
        {tab === 'Overview' && (
          <div className="space-y-4">
            <h3 className="font-display text-lg font-semibold" style={{color:'var(--text-dark)'}}>Event Details</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {event.date && (
                <div className="card-cream p-3">
                  <p className="text-xs font-medium mb-1" style={{color:'var(--text-muted)'}}>DATE</p>
                  <p className="font-medium text-sm" style={{color:'var(--text-dark)'}}>{dateStr}</p>
                </div>
              )}
              {event.location && (
                <div className="card-cream p-3">
                  <p className="text-xs font-medium mb-1" style={{color:'var(--text-muted)'}}>LOCATION</p>
                  <p className="font-medium text-sm" style={{color:'var(--text-dark)'}}>{event.location}</p>
                </div>
              )}
              <div className="card-cream p-3">
                <p className="text-xs font-medium mb-1" style={{color:'var(--text-muted)'}}>GUEST COUNT</p>
                <p className="font-medium text-sm" style={{color:'var(--text-dark)'}}>{event.guest_count || 0} expected</p>
              </div>
              <div className="card-cream p-3">
                <p className="text-xs font-medium mb-1" style={{color:'var(--text-muted)'}}>RSVP STATUS</p>
                <p className="font-medium text-sm" style={{color:'var(--text-dark)'}}>{confirmedGuests.length} confirmed of {eventGuests.length} invited</p>
              </div>
            </div>
            {event.notes && (
              <div>
                <p className="text-xs font-medium mb-1" style={{color:'var(--text-muted)'}}>NOTES</p>
                <p className="text-sm" style={{color:'var(--text-mid)'}}>{event.notes}</p>
              </div>
            )}
          </div>
        )}

        {tab === 'Guests' && (
          <div>
            <SectionHeader title={`Guest List (${eventGuests.length})`} canEdit={false} />
            {eventGuests.length === 0
              ? <p className="text-sm py-6 text-center" style={{color:'var(--text-muted)'}}>No guests assigned to this event yet</p>
              : <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead><tr style={{background:'var(--champagne)', borderBottom:'1px solid var(--champagne-border)'}}>
                      {['Name','Side','Phone','RSVP','Transport','Accom'].map(h=>(
                        <th key={h} className="table-cell text-left text-xs font-semibold uppercase tracking-wide" style={{color:'var(--text-muted)'}}>{h}</th>
                      ))}
                    </tr></thead>
                    <tbody className="divide-y" style={{borderColor:'var(--champagne-border)'}}>
                      {eventGuests.map(g => (
                        <tr key={g.id} className="hover:bg-orange-50/30 transition-colors">
                          <td className="table-cell">
                            <div className="flex items-center gap-2">
                              <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                                style={{background:'var(--rose)'}}>
                                {g.name.charAt(0)}
                              </div>
                              <span className="font-medium text-sm" style={{color:'var(--text-dark)'}}>{g.name}</span>
                            </div>
                          </td>
                          <td className="table-cell">
                            <span className={`badge text-xs ${g.side==='bride' ? 'resp-bride' : 'resp-groom'}`}>
                              {g.side==='bride'?'Bride':'Groom'}
                            </span>
                          </td>
                          <td className="table-cell text-sm" style={{color:'var(--text-soft)'}}>{g.phone||'—'}</td>
                          <td className="table-cell"><Badge status={(g.events_confirmed||[]).includes(id) ? 'confirmed' : g.rsvp_status||'pending'} /></td>
                          <td className="table-cell text-sm">{g.transport_needed ? '🚗 Yes':'—'}</td>
                          <td className="table-cell text-sm">{g.accommodation_needed ? '🏨 Yes':'—'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
            }
          </div>
        )}

        {tab === 'Vendors' && (
          <div>
            <SectionHeader title={`Vendors (${eventVendors.length})`} canEdit={false} />
            {eventVendors.length === 0
              ? <p className="text-sm py-6 text-center" style={{color:'var(--text-muted)'}}>No vendors assigned to this event</p>
              : <div className="space-y-2">
                  {eventVendors.map(v => (
                    <div key={v.id} className="card py-3 px-4 flex items-center justify-between">
                      <div>
                        <p className="font-medium text-sm" style={{color:'var(--text-dark)'}}>{v.name}</p>
                        <p className="text-xs capitalize" style={{color:'var(--text-soft)'}}>{v.category?.replace('_',' ')}</p>
                        {v.contact_phone && (
                          <a href={`tel:${v.contact_phone}`} className="flex items-center gap-1 text-xs mt-0.5" style={{color:'var(--rose)'}}>
                            <Phone size={10}/>{v.contact_phone}
                          </a>
                        )}
                      </div>
                      <div className="text-right">
                        <Badge status={v.status} />
                        <p className="text-xs font-semibold mt-1" style={{color:'var(--gold)'}}>PKR {(v.cost||0).toLocaleString()}</p>
                      </div>
                    </div>
                  ))}
                </div>
            }
          </div>
        )}

        {tab === 'Responsibilities' && <ResponsibilitiesTab eventId={id} canEdit={canEdit} />}

        {tab === 'Budget' && (
          <div>
            <SectionHeader title="Event Budget" canEdit={false} />
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-4">
              {[
                { label:'Total Expenses', value:`PKR ${eventBudget.toLocaleString()}`, color:'var(--text-dark)' },
                { label:'Paid',  value:`PKR ${eventExpenses.filter(e=>e.paid).reduce((s,e)=>s+(e.amount||0),0).toLocaleString()}`, color:'#065f46' },
                { label:'Unpaid',value:`PKR ${eventExpenses.filter(e=>!e.paid).reduce((s,e)=>s+(e.amount||0),0).toLocaleString()}`, color:'#991b1b' },
              ].map(s=>(
                <div key={s.label} className="card-cream p-3 rounded-xl">
                  <p className="text-xs" style={{color:'var(--text-muted)'}}>{s.label}</p>
                  <p className="font-display font-bold mt-1" style={{color:s.color, fontSize:'1.1rem'}}>{s.value}</p>
                </div>
              ))}
            </div>
            {eventExpenses.length === 0
              ? <p className="text-sm py-4 text-center" style={{color:'var(--text-muted)'}}>No expenses logged for this event</p>
              : <table className="w-full">
                  <thead><tr style={{background:'var(--champagne)', borderBottom:'1px solid var(--champagne-border)'}}>
                    {['Expense','Amount','Paid'].map(h=>(
                      <th key={h} className="table-cell text-left text-xs font-semibold uppercase" style={{color:'var(--text-muted)'}}>{h}</th>
                    ))}
                  </tr></thead>
                  <tbody className="divide-y" style={{borderColor:'var(--champagne-border)'}}>
                    {eventExpenses.map(e=>(
                      <tr key={e.id}>
                        <td className="table-cell text-sm font-medium" style={{color:'var(--text-dark)'}}>{e.title}</td>
                        <td className="table-cell text-sm" style={{color:'var(--text-mid)'}}>PKR {(e.amount||0).toLocaleString()}</td>
                        <td className="table-cell"><Badge status={e.paid?'done':'pending'} label={e.paid?'Paid':'Unpaid'}/></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
            }
          </div>
        )}

        {tab === 'Outfits' && <OutfitsTab eventId={id} canEdit={canEdit} />}
        {tab === 'Moodboard' && <MoodboardTab eventId={id} canEdit={canEdit} />}
      </div>
    </div>
  )
}
