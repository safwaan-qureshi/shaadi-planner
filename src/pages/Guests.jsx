import { useState } from 'react'
import { useApp } from '../context/AppContext'
import { Plus, Edit2, Trash2, Search, Copy, Check, MessageCircle, Users } from 'lucide-react'
import Modal from '../components/ui/Modal'
import ConfirmDialog from '../components/ui/ConfirmDialog'
import EmptyState from '../components/ui/EmptyState'
import Badge from '../components/ui/Badge'

const RSVP_STATUSES = ['confirmed','pending','declined']

const EVENT_EMOJIS = { 'Mayoon':'💛','Mehndi':'🌿','Barat':'🌹','Walima':'✨','Bachelor Trip':'🎉','Honeymoon':'🌴' }

function CopyBtn({ text }) {
  const [copied, setCopied] = useState(false)
  const copy = () => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true); setTimeout(() => setCopied(false), 2000)
    })
  }
  return (
    <button onClick={copy} className="btn-ghost py-1 px-1.5" title="Copy invite link">
      {copied ? <Check size={13} className="text-green-600"/> : <Copy size={13}/>}
    </button>
  )
}

function WhatsAppBtn({ guest, weddingTitle, events }) {
  const inviteUrl = `${window.location.origin}/invite/${guest.invite_token}`
  const eventNames = (guest.events_invited || [])
    .map(id => events?.find(e => e.id === id)?.name || '?')
    .join(', ')
  const plusLine = guest.plus_guests > 0
    ? `\n\nYour invitation is for *${(guest.plus_guests || 0) + 1} people* (yourself + ${guest.plus_guests} guest${guest.plus_guests > 1 ? 's' : ''}).`
    : ''
  const msg = encodeURIComponent(
    `Assalamu Alaikum ${guest.name.split(' ')[0]}! 🌹\n\nYou are cordially invited to the *${weddingTitle}* wedding celebrations.\n\nEvents: ${eventNames || 'Wedding celebrations'}${plusLine}\n\nPlease click your personal invitation link to RSVP:\n\n${inviteUrl}\n\nWe look forward to celebrating with you! 💌`
  )
  const phone = guest.phone?.replace(/[^0-9]/g, '')
  const url = phone ? `https://wa.me/${phone}?text=${msg}` : `https://wa.me/?text=${msg}`
  return (
    <a href={url} target="_blank" rel="noopener noreferrer" className="btn-whatsapp py-1 px-2 text-xs">
      <MessageCircle size={13}/>WhatsApp
    </a>
  )
}

function GuestForm({ form, onChange, onSubmit, onClose, isEdit, events }) {
  const toggle = (field, id) => {
    const arr = form[field] || []
    onChange(field, arr.includes(id) ? arr.filter(x => x !== id) : [...arr, id])
  }
  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <label className="label">Full Name *</label>
        <input className="input-field" required placeholder="e.g. Mr & Mrs Ahmed" value={form.name}
          onChange={e => onChange('name', e.target.value)}/>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="label">Phone</label>
          <input type="tel" className="input-field" placeholder="+92 300 1234567" value={form.phone}
            onChange={e => onChange('phone', e.target.value)}/>
        </div>
        <div>
          <label className="label">Email</label>
          <input type="email" className="input-field" placeholder="guest@email.com" value={form.email}
            onChange={e => onChange('email', e.target.value)}/>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="label">Side</label>
          <select className="input-field" value={form.side} onChange={e => onChange('side', e.target.value)}>
            <option value="bride">Bride Side</option>
            <option value="groom">Groom Side</option>
          </select>
        </div>
        <div>
          <label className="label">RSVP Status</label>
          <select className="input-field" value={form.rsvp_status} onChange={e => onChange('rsvp_status', e.target.value)}>
            {RSVP_STATUSES.map(s => (
              <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Plus guests — key new field */}
      <div className="rounded-xl p-4 space-y-2" style={{background:'var(--champagne)'}}>
        <label className="label" style={{marginBottom:0}}>
          Additional Guests Allowed
        </label>
        <p className="text-xs mb-2" style={{color:'var(--text-muted)'}}>
          How many extra people can this guest bring? (0 = just themselves)
        </p>
        <div className="flex items-center gap-3">
          <input type="number" min="0" max="20" className="input-field w-28 text-center text-lg font-bold"
            value={form.plus_guests || 0}
            onChange={e => onChange('plus_guests', parseInt(e.target.value) || 0)}/>
          <div>
            <p className="text-sm font-semibold" style={{color:'var(--text-dark)'}}>
              Total party size: {(form.plus_guests || 0) + 1} {(form.plus_guests || 0) + 1 === 1 ? 'person' : 'people'}
            </p>
            <p className="text-xs" style={{color:'var(--text-soft)'}}>
              {form.plus_guests > 0
                ? `${form.name || 'Guest'} + ${form.plus_guests} guest${form.plus_guests > 1 ? 's' : ''}`
                : 'Just the named guest'
              }
            </p>
          </div>
        </div>
        <p className="text-xs pt-1" style={{color:'var(--text-muted)'}}>
          💡 Examples: "Mr & Mrs Ali" = 1 extra. "Ahmed Uncle & family" = 3 extras.
        </p>
      </div>

      <div>
        <label className="label">Events Invited To</label>
        <div className="grid grid-cols-2 gap-2 mt-1">
          {events.length === 0
            ? <p className="text-sm col-span-2" style={{color:'var(--text-muted)'}}>Add events first to assign guests</p>
            : events.map(e => {
                const sel = (form.events_invited || []).includes(e.id)
                const emoji = EVENT_EMOJIS[e.name] || '💍'
                return (
                  <label key={e.id} className="flex items-center gap-2 p-2.5 rounded-xl border cursor-pointer transition-all"
                    style={{
                      borderColor: sel ? 'var(--rose)' : 'var(--champagne-border)',
                      background: sel ? 'var(--rose-pale)' : 'white',
                    }}>
                    <input type="checkbox" className="accent-rose-600" checked={sel}
                      onChange={() => toggle('events_invited', e.id)}/>
                    <span>{emoji}</span>
                    <span className="text-sm" style={{color: sel ? 'var(--rose)' : 'var(--text-mid)'}}>{e.name}</span>
                  </label>
                )
              })
          }
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <label className="flex items-center gap-2 cursor-pointer p-2.5 rounded-xl border transition-all"
          style={{borderColor: form.transport_needed ? 'var(--rose)' : 'var(--champagne-border)', background: form.transport_needed ? 'var(--rose-pale)' : 'white'}}>
          <input type="checkbox" className="accent-rose-600 w-4 h-4" checked={form.transport_needed}
            onChange={e => onChange('transport_needed', e.target.checked)}/>
          <span className="text-sm font-medium" style={{color:'var(--text-mid)'}}>🚗 Needs Transport</span>
        </label>
        <label className="flex items-center gap-2 cursor-pointer p-2.5 rounded-xl border transition-all"
          style={{borderColor: form.accommodation_needed ? 'var(--rose)' : 'var(--champagne-border)', background: form.accommodation_needed ? 'var(--rose-pale)' : 'white'}}>
          <input type="checkbox" className="accent-rose-600 w-4 h-4" checked={form.accommodation_needed}
            onChange={e => onChange('accommodation_needed', e.target.checked)}/>
          <span className="text-sm font-medium" style={{color:'var(--text-mid)'}}>🏨 Needs Accommodation</span>
        </label>
      </div>

      <div>
        <label className="label">Notes</label>
        <textarea className="input-field resize-none" rows={2}
          placeholder="Dietary requirements, VIP guest, flying from abroad..."
          value={form.notes} onChange={e => onChange('notes', e.target.value)}/>
      </div>

      <div className="flex gap-3 pt-2">
        <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancel</button>
        <button type="submit" className="btn-primary flex-1 justify-center">
          {isEdit ? 'Update Guest' : 'Add Guest'}
        </button>
      </div>
    </form>
  )
}

const EMPTY = {
  name:'', phone:'', email:'', side:'bride', rsvp_status:'pending',
  events_invited:[], events_confirmed:[], transport_needed:false,
  accommodation_needed:false, notes:'', plus_guests:0, confirmed_count:0
}

export default function Guests() {
  const { guests, addGuest, updateGuest, deleteGuest, events, weddingTitle } = useApp()
  const [modal,       setModal]      = useState(false)
  const [del,         setDel]        = useState(null)
  const [edit,        setEdit]       = useState(null)
  const [form,        setForm]       = useState(EMPTY)
  const [search,      setSearch]     = useState('')
  const [filterRsvp,  setFilterRsvp] = useState('')
  const [filterSide,  setFilterSide] = useState('')

  const set = (k, v) => setForm(p => ({...p, [k]: v}))

  const open = (g = null) => {
    setEdit(g)
    setForm(g ? {
      ...EMPTY, ...g,
      events_invited:   g.events_invited   || [],
      events_confirmed: g.events_confirmed || [],
      plus_guests:      g.plus_guests      || 0,
      confirmed_count:  g.confirmed_count  || 0,
    } : EMPTY)
    setModal(true)
  }

  const submit = async (e) => {
    e.preventDefault()
    const data = {
      name:                 form.name,
      phone:                form.phone                || null,
      email:                form.email                || null,
      side:                 form.side                 || 'bride',
      rsvp_status:          form.rsvp_status          || 'pending',
      events_invited:       form.events_invited       || [],
      events_confirmed:     form.events_confirmed     || [],
      transport_needed:     form.transport_needed     || false,
      accommodation_needed: form.accommodation_needed || false,
      notes:                form.notes                || null,
      plus_guests:          parseInt(form.plus_guests) || 0,
      confirmed_count:      parseInt(form.confirmed_count) || 0,
    }
    if (edit) await updateGuest(edit.id, data)
    else      await addGuest(data)
    setModal(false)
  }

  const filtered = guests.filter(g => {
    const ms  = !search      || g.name.toLowerCase().includes(search.toLowerCase()) || (g.phone||'').includes(search)
    const mr  = !filterRsvp  || g.rsvp_status === filterRsvp
    const msi = !filterSide  || g.side === filterSide
    return ms && mr && msi
  })

  // Headcount calculations — the real numbers for catering
  const totalPeople     = guests.reduce((s, g) => s + 1 + (g.plus_guests || 0), 0)
  const confirmedPeople = guests
    .filter(g => g.rsvp_status === 'confirmed')
    .reduce((s, g) => s + (g.confirmed_count > 0 ? g.confirmed_count : 1 + (g.plus_guests || 0)), 0)
  const pendingGuests   = guests.filter(g => g.rsvp_status === 'pending').length
  const transport       = guests.filter(g => g.transport_needed).length
  const accom           = guests.filter(g => g.accommodation_needed).length

  const inviteUrl = (token) => `${window.location.origin}/invite/${token}`

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="section-title flex items-center gap-2">Guest List 👥</h1>
          <p className="text-sm mt-1" style={{color:'var(--text-soft)'}}>
            Manage RSVPs and send WhatsApp invitations
          </p>
        </div>
        <button onClick={() => open()} className="btn-primary">
          <Plus size={16}/>Add Guest
        </button>
      </div>

      {/* Stats — now shows real headcount */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="card py-3 px-4">
          <p className="font-display text-2xl font-bold" style={{color:'var(--text-dark)'}}>{guests.length}</p>
          <p className="text-xs mt-0.5" style={{color:'var(--text-muted)'}}>Invitations sent</p>
          <p className="text-xs mt-0.5 font-medium" style={{color:'var(--gold)'}}>~{totalPeople} total people</p>
        </div>
        <div className="card py-3 px-4">
          <p className="font-display text-2xl font-bold" style={{color:'#065f46'}}>{guests.filter(g=>g.rsvp_status==='confirmed').length}</p>
          <p className="text-xs mt-0.5" style={{color:'var(--text-muted)'}}>Confirmed families</p>
          <p className="text-xs mt-0.5 font-medium" style={{color:'#065f46'}}>~{confirmedPeople} people coming</p>
        </div>
        <div className="card py-3 px-4">
          <p className="font-display text-2xl font-bold" style={{color:'#92400e'}}>{pendingGuests}</p>
          <p className="text-xs mt-0.5" style={{color:'var(--text-muted)'}}>Awaiting response</p>
          <p className="text-xs mt-0.5" style={{color:'var(--text-muted)'}}>Send reminder via WhatsApp</p>
        </div>
        <div className="card py-3 px-4">
          <p className="font-display text-2xl font-bold" style={{color:'var(--rose)'}}>{transport}/{accom}</p>
          <p className="text-xs mt-0.5" style={{color:'var(--text-muted)'}}>Transport / Accommodation</p>
        </div>
      </div>

      {/* Catering tip banner */}
      {confirmedPeople > 0 && (
        <div className="rounded-xl px-4 py-3 flex items-center gap-3"
          style={{background:'var(--champagne)', border:'1px solid var(--champagne-border)'}}>
          <span className="text-2xl">🍽️</span>
          <p className="text-sm" style={{color:'var(--text-mid)'}}>
            <strong>Catering estimate:</strong> {confirmedPeople} people confirmed so far
            {pendingGuests > 0 && ` · ${pendingGuests} families still pending`}
          </p>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2" style={{color:'var(--text-muted)'}}/>
          <input className="input-field pl-9" placeholder="Search guests..." value={search}
            onChange={e => setSearch(e.target.value)}/>
        </div>
        <select className="input-field sm:w-40" value={filterRsvp} onChange={e => setFilterRsvp(e.target.value)}>
          <option value="">All RSVPs</option>
          {RSVP_STATUSES.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase()+s.slice(1)}</option>)}
        </select>
        <select className="input-field sm:w-40" value={filterSide} onChange={e => setFilterSide(e.target.value)}>
          <option value="">Both Sides</option>
          <option value="bride">Bride Side</option>
          <option value="groom">Groom Side</option>
        </select>
      </div>

      {/* Guest table */}
      {filtered.length === 0
        ? <EmptyState icon={Users} title={guests.length===0?"No guests yet":"No guests match"}
            description="Add guests to start sending WhatsApp invitations"
            action={guests.length===0 ? <button onClick={()=>open()} className="btn-primary">Add First Guest</button> : null}/>
        : <div className="card p-0 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr style={{background:'var(--champagne)', borderBottom:'1px solid var(--champagne-border)'}}>
                    {['Guest','Side','Events Invited','Party Size','RSVP','Logistics','Invite',''].map(h => (
                      <th key={h} className="table-cell text-left text-xs font-semibold uppercase tracking-wide whitespace-nowrap"
                        style={{color:'var(--text-muted)'}}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y" style={{borderColor:'var(--champagne-border)'}}>
                  {filtered.map(g => {
                    const partySize = 1 + (g.plus_guests || 0)
                    return (
                      <tr key={g.id} className="hover:bg-orange-50/20 transition-colors">
                        {/* Name */}
                        <td className="table-cell">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-white flex-shrink-0"
                              style={{background:'var(--rose)'}}>
                              {g.name.charAt(0)}
                            </div>
                            <div className="min-w-0">
                              <p className="font-medium text-sm truncate" style={{color:'var(--text-dark)'}}>{g.name}</p>
                              {g.phone && <p className="text-xs" style={{color:'var(--text-muted)'}}>{g.phone}</p>}
                            </div>
                          </div>
                        </td>

                        {/* Side */}
                        <td className="table-cell">
                          <span className={`badge text-xs ${g.side==='bride'?'resp-bride':'resp-groom'}`}>
                            {g.side==='bride'?'Bride':'Groom'}
                          </span>
                        </td>

                        {/* Events */}
                        <td className="table-cell">
                          <div className="flex flex-wrap gap-1">
                            {(g.events_invited||[]).length === 0
                              ? <span className="text-xs" style={{color:'var(--text-muted)'}}>None</span>
                              : (g.events_invited||[]).map(id => {
                                  const evtName = events.find(e => e.id === id)?.name || '?'
                                  const emoji = EVENT_EMOJIS[evtName] || '💍'
                                  return (
                                    <span key={id} className="text-xs px-1.5 py-0.5 rounded flex items-center gap-0.5"
                                      style={{background:'var(--champagne)', color:'var(--text-mid)'}}>
                                      {emoji} {evtName}
                                    </span>
                                  )
                                })
                            }
                          </div>
                        </td>

                        {/* Party size — new column */}
                        <td className="table-cell">
                          <div className="flex items-center gap-1">
                            <span className="font-display font-bold text-base" style={{color:'var(--rose)'}}>{partySize}</span>
                            <span className="text-xs" style={{color:'var(--text-muted)'}}>
                              {partySize === 1 ? 'person' : 'people'}
                            </span>
                          </div>
                          {g.plus_guests > 0 && (
                            <p className="text-xs" style={{color:'var(--text-muted)'}}>+{g.plus_guests} guests</p>
                          )}
                        </td>

                        {/* RSVP */}
                        <td className="table-cell">
                          <Badge status={g.rsvp_status}/>
                          {g.confirmed_count > 0 && g.rsvp_status === 'confirmed' && (
                            <p className="text-xs mt-0.5" style={{color:'#065f46'}}>{g.confirmed_count} attending</p>
                          )}
                        </td>

                        {/* Logistics */}
                        <td className="table-cell text-sm">
                          {g.transport_needed && <span className="mr-1">🚗</span>}
                          {g.accommodation_needed && <span>🏨</span>}
                          {!g.transport_needed && !g.accommodation_needed && <span style={{color:'var(--text-muted)'}}>—</span>}
                        </td>

                        {/* Invite */}
                        <td className="table-cell">
                          <div className="flex items-center gap-1">
                            <WhatsAppBtn guest={g} weddingTitle={weddingTitle} events={events}/>
                            <CopyBtn text={inviteUrl(g.invite_token)}/>
                          </div>
                        </td>

                        {/* Actions */}
                        <td className="table-cell">
                          <div className="flex gap-1">
                            <button onClick={() => open(g)} className="btn-ghost py-1 px-1.5"><Edit2 size={13}/></button>
                            <button onClick={() => setDel(g.id)} className="btn-ghost py-1 px-1.5 hover:text-red-500"><Trash2 size={13}/></button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>

                {/* Totals row */}
                {filtered.length > 0 && (
                  <tfoot>
                    <tr style={{background:'var(--champagne)', borderTop:'2px solid var(--champagne-border)'}}>
                      <td className="table-cell font-semibold text-sm" style={{color:'var(--text-dark)'}}>
                        {filtered.length} invitation{filtered.length !== 1 ? 's' : ''}
                      </td>
                      <td className="table-cell"/>
                      <td className="table-cell"/>
                      <td className="table-cell">
                        <span className="font-bold" style={{color:'var(--rose)'}}>
                          {filtered.reduce((s,g) => s + 1 + (g.plus_guests||0), 0)} people
                        </span>
                      </td>
                      <td className="table-cell">
                        <span className="text-xs font-medium" style={{color:'#065f46'}}>
                          {filtered.filter(g=>g.rsvp_status==='confirmed').length} confirmed
                        </span>
                      </td>
                      <td className="table-cell"/>
                      <td className="table-cell"/>
                      <td className="table-cell"/>
                    </tr>
                  </tfoot>
                )}
              </table>
            </div>
          </div>
      }

      <Modal open={modal} onClose={() => setModal(false)} title={edit ? 'Edit Guest' : 'Add Guest'} size="lg">
        <GuestForm form={form} onChange={set} onSubmit={submit}
          onClose={() => setModal(false)} isEdit={!!edit} events={events}/>
      </Modal>
      <ConfirmDialog open={!!del} onClose={() => setDel(null)}
        onConfirm={() => deleteGuest(del)} title="Remove Guest?"
        message="This will permanently remove this guest and their invitation."/>
    </div>
  )
}
