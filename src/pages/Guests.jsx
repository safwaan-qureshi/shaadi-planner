import { useState } from 'react'
import { useApp } from '../context/AppContext'
import { Plus, Edit2, Trash2, Search, Send, Copy, Check, MessageCircle } from 'lucide-react'
import Modal from '../components/ui/Modal'
import ConfirmDialog from '../components/ui/ConfirmDialog'
import EmptyState from '../components/ui/EmptyState'
import Badge from '../components/ui/Badge'

const RSVP_STATUSES = ['confirmed','pending','declined']
const EMPTY = { name:'', phone:'', email:'', side:'bride', rsvp_status:'pending', events_invited:[], events_confirmed:[], transport_needed:false, accommodation_needed:false, notes:'' }

function CopyBtn({ text }) {
  const [copied, setCopied] = useState(false)
  const copy = () => {
    navigator.clipboard.writeText(text).then(()=>{ setCopied(true); setTimeout(()=>setCopied(false),2000) })
  }
  return (
    <button onClick={copy} className="btn-ghost py-1 px-1.5" title="Copy link">
      {copied ? <Check size={13} className="text-green-600"/> : <Copy size={13}/>}
    </button>
  )
}

function WhatsAppBtn({ guest, weddingTitle, events }) {
  const inviteUrl = `${window.location.origin}/invite/${guest.invite_token}`
  const eventsText = (guest.events_invited||[]).map(id => {
    const evt = events?.find(e => e.id === id)
    return evt ? evt.name : id
  }).join(', ')
  const msg = encodeURIComponent(
    `Assalamu Alaikum ${guest.name.split(' ')[0]}! 🌹\n\nYou are cordially invited to the wedding celebrations of *${weddingTitle}*.\n\nYou have been invited to: ${eventsText}\n\nPlease click the link below to view your invitation and confirm your RSVP:\n\n${inviteUrl}\n\nWe look forward to celebrating with you! 💌`
  )
  const phone = guest.phone?.replace(/[^0-9]/g,'')
  const url = phone ? `https://wa.me/${phone}?text=${msg}` : `https://wa.me/?text=${msg}`
  return (
    <a href={url} target="_blank" rel="noopener noreferrer" className="btn-whatsapp py-1 px-2 text-xs">
      <MessageCircle size={13}/>WhatsApp
    </a>
  )
}

function GuestForm({ form, onChange, onSubmit, onClose, isEdit, events }) {
  const toggle = (field, id) => {
    const arr = form[field]||[]
    onChange(field, arr.includes(id) ? arr.filter(x=>x!==id) : [...arr,id])
  }
  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div><label className="label">Full Name *</label>
        <input className="input-field" required placeholder="e.g. Zara Ahmed" value={form.name} onChange={e=>onChange('name',e.target.value)}/></div>
      <div className="grid grid-cols-2 gap-3">
        <div><label className="label">Phone</label>
          <input type="tel" className="input-field" placeholder="+92 300 1234567" value={form.phone} onChange={e=>onChange('phone',e.target.value)}/></div>
        <div><label className="label">Email</label>
          <input type="email" className="input-field" placeholder="guest@email.com" value={form.email} onChange={e=>onChange('email',e.target.value)}/></div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div><label className="label">Side</label>
          <select className="input-field" value={form.side} onChange={e=>onChange('side',e.target.value)}>
            <option value="bride">Bride Side</option>
            <option value="groom">Groom Side</option>
          </select></div>
        <div><label className="label">RSVP Status</label>
          <select className="input-field" value={form.rsvp_status} onChange={e=>onChange('rsvp_status',e.target.value)}>
            {RSVP_STATUSES.map(s=><option key={s} value={s} className="capitalize">{s.charAt(0).toUpperCase()+s.slice(1)}</option>)}
          </select></div>
      </div>
      <div><label className="label">Events Invited To</label>
        <div className="grid grid-cols-2 gap-2 mt-1">
          {events.map(e=>{
            const sel = (form.events_invited||[]).includes(e.id)
            return (
              <label key={e.id} className={`flex items-center gap-2 p-2 rounded-xl border cursor-pointer transition-colors ${sel ? 'border-rose-400' : 'border-gray-200 hover:border-amber-300'}`}
                style={{background:sel?'var(--rose-pale)':'white'}}>
                <input type="checkbox" className="accent-rose-600" checked={sel} onChange={()=>toggle('events_invited',e.id)}/>
                <span className="text-sm">{e.name}</span>
              </label>
            )
          })}
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" className="accent-rose-600 w-4 h-4" checked={form.transport_needed} onChange={e=>onChange('transport_needed',e.target.checked)}/>
          <span className="text-sm font-medium" style={{color:'var(--text-mid)'}}>🚗 Needs Transport</span>
        </label>
        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" className="accent-rose-600 w-4 h-4" checked={form.accommodation_needed} onChange={e=>onChange('accommodation_needed',e.target.checked)}/>
          <span className="text-sm font-medium" style={{color:'var(--text-mid)'}}>🏨 Needs Accommodation</span>
        </label>
      </div>
      <div><label className="label">Notes</label>
        <textarea className="input-field resize-none" rows={2} placeholder="Dietary requirements, travel info..." value={form.notes} onChange={e=>onChange('notes',e.target.value)}/></div>
      <div className="flex gap-3 pt-2">
        <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancel</button>
        <button type="submit" className="btn-primary flex-1 justify-center">{isEdit?'Update Guest':'Add Guest'}</button>
      </div>
    </form>
  )
}

export default function Guests() {
  const { guests, addGuest, updateGuest, deleteGuest, events, weddingTitle } = useApp()
  const [modal, setModal] = useState(false)
  const [del, setDel] = useState(null)
  const [edit, setEdit] = useState(null)
  const [form, setForm] = useState(EMPTY)
  const [search, setSearch] = useState('')
  const [filterRsvp, setFilterRsvp] = useState('')
  const [filterSide, setFilterSide] = useState('')
  const [inviteModal, setInviteModal] = useState(null)

  const set = (k,v) => setForm(p=>({...p,[k]:v}))
  const open = (g=null) => {
    setEdit(g)
    setForm(g ? {...EMPTY,...g, events_invited:g.events_invited||[], events_confirmed:g.events_confirmed||[]} : EMPTY)
    setModal(true)
  }
  const submit = async (e) => {
    e.preventDefault()
    // Only send fields that exist in the database schema
    const data = {
      name:                 form.name,
      phone:                form.phone                || null,
      email:                form.email                || null,
      side:                 form.side                 || 'bride',
      rsvp_status:          form.rsvp_status          || 'pending',
      events_invited:       form.events_invited       || [],
      events_confirmed:     form.events_confirmed      || [],
      transport_needed:     form.transport_needed      || false,
      accommodation_needed: form.accommodation_needed  || false,
      notes:                form.notes                || null,
    }
    if (edit) await updateGuest(edit.id, data)
    else      await addGuest(data)
    setModal(false)
  }

  const filtered = guests.filter(g => {
    const ms = !search || g.name.toLowerCase().includes(search.toLowerCase()) || (g.phone||'').includes(search)
    const mr = !filterRsvp || g.rsvp_status === filterRsvp
    const msi = !filterSide || g.side === filterSide
    return ms && mr && msi
  })

  const confirmed = guests.filter(g=>g.rsvp_status==='confirmed').length
  const pending   = guests.filter(g=>g.rsvp_status==='pending').length
  const declined  = guests.filter(g=>g.rsvp_status==='declined').length
  const transport = guests.filter(g=>g.transport_needed).length
  const accom     = guests.filter(g=>g.accommodation_needed).length

  const inviteUrl = (token) => `${window.location.origin}/invite/${token}`

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="section-title flex items-center gap-2">Guest List 👥</h1>
          <p className="text-sm mt-1" style={{color:'var(--text-soft)'}}>Manage RSVPs and send WhatsApp invitations</p>
        </div>
        <button onClick={()=>open()} className="btn-primary"><Plus size={16}/>Add Guest</button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {[
          { label:'Total',       value:guests.length,  color:'var(--text-dark)' },
          { label:'Confirmed',   value:confirmed,       color:'#065f46' },
          { label:'Pending',     value:pending,         color:'#92400e' },
          { label:'Declined',    value:declined,        color:'#991b1b' },
          { label:'Need Transport/Accom', value:`${transport}/${accom}`, color:'var(--gold)' },
        ].map(s=>(
          <div key={s.label} className="card py-3 px-4">
            <p className="font-display text-2xl font-bold" style={{color:s.color}}>{s.value}</p>
            <p className="text-xs mt-0.5" style={{color:'var(--text-muted)'}}>{s.label}</p>
          </div>
        ))}
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2" style={{color:'var(--text-muted)'}}/>
          <input className="input-field pl-9" placeholder="Search guests..." value={search} onChange={e=>setSearch(e.target.value)}/>
        </div>
        <select className="input-field sm:w-40" value={filterRsvp} onChange={e=>setFilterRsvp(e.target.value)}>
          <option value="">All RSVPs</option>
          {RSVP_STATUSES.map(s=><option key={s} value={s} className="capitalize">{s.charAt(0).toUpperCase()+s.slice(1)}</option>)}
        </select>
        <select className="input-field sm:w-40" value={filterSide} onChange={e=>setFilterSide(e.target.value)}>
          <option value="">Both Sides</option>
          <option value="bride">Bride Side</option>
          <option value="groom">Groom Side</option>
        </select>
      </div>

      {filtered.length === 0
        ? <EmptyState title={guests.length===0?"No guests yet":"No guests match"} description="Add guests and send WhatsApp invitations"
            action={guests.length===0 ? <button onClick={()=>open()} className="btn-primary">Add First Guest</button>:null}/>
        : <div className="card p-0 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead><tr style={{background:'var(--champagne)', borderBottom:'1px solid var(--champagne-border)'}}>
                  {['Guest','Side','Events Invited','RSVP','Logistics','Invite',''].map(h=>(
                    <th key={h} className="table-cell text-left text-xs font-semibold uppercase tracking-wide whitespace-nowrap" style={{color:'var(--text-muted)'}}>{h}</th>
                  ))}
                </tr></thead>
                <tbody className="divide-y" style={{borderColor:'var(--champagne-border)'}}>
                  {filtered.map(g=>(
                    <tr key={g.id} className="hover:bg-orange-50/20 transition-colors">
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
                      <td className="table-cell">
                        <span className={`badge text-xs ${g.side==='bride'?'resp-bride':'resp-groom'}`}>
                          {g.side==='bride'?'Bride':'Groom'}
                        </span>
                      </td>
                      <td className="table-cell">
                        <div className="flex flex-wrap gap-1">
                          {(g.events_invited||[]).map(id => {
                            const evtName = events.find(e => e.id === id)?.name || '?'
                            const evtEmoji = {'Mayoon':'💛','Mehndi':'🌿','Barat':'🌹','Walima':'✨','Bachelor Trip':'🎉','Honeymoon':'🌴'}[evtName] || '💍'
                            return (
                              <span key={id} className="text-xs px-1.5 py-0.5 rounded flex items-center gap-0.5" style={{background:'var(--champagne)',color:'var(--text-mid)'}}>
                                {evtEmoji} {evtName}
                              </span>
                            )
                          })}
                          {(!g.events_invited || g.events_invited.length === 0) && (
                            <span className="text-xs" style={{color:'var(--text-muted)'}}>None assigned</span>
                          )}
                        </div>
                      </td>
                      <td className="table-cell"><Badge status={g.rsvp_status}/></td>
                      <td className="table-cell text-sm">
                        {g.transport_needed && <span className="mr-1">🚗</span>}
                        {g.accommodation_needed && <span>🏨</span>}
                        {!g.transport_needed && !g.accommodation_needed && <span style={{color:'var(--text-muted)'}}>—</span>}
                      </td>
                      <td className="table-cell">
                        <div className="flex items-center gap-1">
                          <WhatsAppBtn guest={g} weddingTitle={weddingTitle} events={events}/>
                          <CopyBtn text={inviteUrl(g.invite_token)}/>
                        </div>
                      </td>
                      <td className="table-cell">
                        <div className="flex gap-1">
                          <button onClick={()=>open(g)} className="btn-ghost py-1 px-1.5"><Edit2 size={13}/></button>
                          <button onClick={()=>setDel(g.id)} className="btn-ghost py-1 px-1.5 hover:text-red-500"><Trash2 size={13}/></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
      }

      <Modal open={modal} onClose={()=>setModal(false)} title={edit?'Edit Guest':'Add Guest'} size="lg">
        <GuestForm form={form} onChange={set} onSubmit={submit} onClose={()=>setModal(false)} isEdit={!!edit} events={events}/>
      </Modal>
      <ConfirmDialog open={!!del} onClose={()=>setDel(null)} onConfirm={()=>deleteGuest(del)} title="Remove Guest?" message="This will permanently remove this guest."/>
    </div>
  )
}
