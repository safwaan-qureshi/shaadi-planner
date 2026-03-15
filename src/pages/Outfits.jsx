import { useState } from 'react'
import { useApp } from '../context/AppContext'
import { Plus, Edit2, Trash2, Shirt } from 'lucide-react'
import Modal from '../components/ui/Modal'
import Badge from '../components/ui/Badge'
import ConfirmDialog from '../components/ui/ConfirmDialog'
import EmptyState from '../components/ui/EmptyState'

const ROLES = ['bride','groom','family']
const STATUSES = ['shortlisted','ordered','tailoring_in_progress','ready_for_fitting','completed']
const PAY_RESP = ['bride','groom','individual','shared']
const STATUS_LABELS = { shortlisted:'Shortlisted', ordered:'Ordered', tailoring_in_progress:'In Tailoring', ready_for_fitting:'Ready for Fitting', completed:'Completed' }
const EMPTY = { person_name:'', person_role:'bride', event_id:'', outfit_type:'', designer:'', cost:'', payment_responsibility:'bride', status:'shortlisted', notes:'' }

export default function Outfits() {
  const { outfits, addOutfit, updateOutfit, deleteOutfit, events } = useApp()
  const [modal, setModal] = useState(false)
  const [del, setDel] = useState(null)
  const [edit, setEdit] = useState(null)
  const [form, setForm] = useState(EMPTY)
  const [filterRole, setFilterRole] = useState('')
  const [filterEvent, setFilterEvent] = useState('')

  const set = (k,v) => setForm(p=>({...p,[k]:v}))
  const open = (o=null) => { setEdit(o); setForm(o ? {...EMPTY,...o} : EMPTY); setModal(true) }
  const submit = (e) => {
    e.preventDefault()
    const d = {...form, cost:Number(form.cost)||0}
    if (edit) updateOutfit(edit.id, d); else addOutfit(d)
    setModal(false)
  }

  const filtered = outfits.filter(o => {
    if (filterRole && o.person_role !== filterRole) return false
    if (filterEvent && o.event_id !== filterEvent) return false
    return true
  })

  const totalCost = outfits.reduce((s,o)=>s+(o.cost||0),0)
  const byStatus = (s) => outfits.filter(o=>o.status===s).length

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="section-title flex items-center gap-2">Outfits <span>👗</span></h1>
          <p className="text-sm mt-1" style={{color:'var(--text-soft)'}}>Track all wedding outfits and who is paying</p>
        </div>
        <button onClick={()=>open()} className="btn-primary"><Plus size={16}/>Add Outfit</button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label:'Total Outfits',  value:outfits.length, emoji:'👗' },
          { label:'Total Cost',     value:`PKR ${(totalCost/1000).toFixed(0)}k`, emoji:'💰' },
          { label:'Ready/Done',     value:byStatus('completed')+byStatus('ready_for_fitting'), emoji:'✅' },
          { label:'In Progress',    value:byStatus('tailoring_in_progress')+byStatus('ordered'), emoji:'✂️' },
        ].map(s=>(
          <div key={s.label} className="card py-3 px-4">
            <p className="text-xl mb-1">{s.emoji}</p>
            <p className="font-display text-xl font-bold" style={{color:'var(--text-dark)'}}>{s.value}</p>
            <p className="text-xs" style={{color:'var(--text-muted)'}}>{s.label}</p>
          </div>
        ))}
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <select className="input-field sm:w-44" value={filterRole} onChange={e=>setFilterRole(e.target.value)}>
          <option value="">All Roles</option>
          {ROLES.map(r=><option key={r} value={r} className="capitalize">{r.charAt(0).toUpperCase()+r.slice(1)}</option>)}
        </select>
        <select className="input-field sm:w-44" value={filterEvent} onChange={e=>setFilterEvent(e.target.value)}>
          <option value="">All Events</option>
          {events.map(e=><option key={e.id} value={e.id}>{e.name}</option>)}
        </select>
      </div>

      {filtered.length === 0
        ? <EmptyState icon={Shirt} title="No outfits yet" description="Track bridal lehengas, sherwanis, and family outfits"
            action={<button onClick={()=>open()} className="btn-primary">Add First Outfit</button>} />
        : <div className="card p-0 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead><tr style={{background:'var(--champagne)', borderBottom:'1px solid var(--champagne-border)'}}>
                  {['Person','Role','Event','Outfit','Designer','Cost','Paying','Status',''].map(h=>(
                    <th key={h} className="table-cell text-left text-xs font-semibold uppercase tracking-wide whitespace-nowrap" style={{color:'var(--text-muted)'}}>{h}</th>
                  ))}
                </tr></thead>
                <tbody className="divide-y" style={{borderColor:'var(--champagne-border)'}}>
                  {filtered.map(o=>{
                    const evtName = events.find(e=>e.id===o.event_id)?.name||'—'
                    return (
                      <tr key={o.id} className="hover:bg-orange-50/20 transition-colors">
                        <td className="table-cell font-medium" style={{color:'var(--text-dark)'}}>{o.person_name}</td>
                        <td className="table-cell capitalize text-sm" style={{color:'var(--text-soft)'}}>{o.person_role}</td>
                        <td className="table-cell text-sm whitespace-nowrap" style={{color:'var(--text-soft)'}}>{evtName}</td>
                        <td className="table-cell text-sm" style={{color:'var(--text-dark)'}}>{o.outfit_type}</td>
                        <td className="table-cell text-sm" style={{color:'var(--text-soft)'}}>{o.designer||'—'}</td>
                        <td className="table-cell font-semibold whitespace-nowrap" style={{color:'var(--gold)'}}>PKR {(o.cost||0).toLocaleString()}</td>
                        <td className="table-cell"><Badge status={o.payment_responsibility}/></td>
                        <td className="table-cell"><Badge status={o.status}/></td>
                        <td className="table-cell">
                          <div className="flex gap-1">
                            <button onClick={()=>open(o)} className="btn-ghost py-1 px-1.5"><Edit2 size={13}/></button>
                            <button onClick={()=>setDel(o.id)} className="btn-ghost py-1 px-1.5 hover:text-red-500"><Trash2 size={13}/></button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
      }

      <Modal open={modal} onClose={()=>setModal(false)} title={edit?'Edit Outfit':'Add Outfit'} size="lg">
        <form onSubmit={submit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div><label className="label">Person Name *</label>
              <input className="input-field" required placeholder="e.g. Aisha" value={form.person_name} onChange={e=>set('person_name',e.target.value)}/></div>
            <div><label className="label">Role</label>
              <select className="input-field" value={form.person_role} onChange={e=>set('person_role',e.target.value)}>
                {ROLES.map(r=><option key={r} value={r} className="capitalize">{r.charAt(0).toUpperCase()+r.slice(1)}</option>)}
              </select></div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="label">Event</label>
              <select className="input-field" value={form.event_id} onChange={e=>set('event_id',e.target.value)}>
                <option value="">Select event</option>
                {events.map(e=><option key={e.id} value={e.id}>{e.name}</option>)}
              </select></div>
            <div><label className="label">Outfit Type *</label>
              <input className="input-field" required placeholder="e.g. Bridal Lehenga" value={form.outfit_type} onChange={e=>set('outfit_type',e.target.value)}/></div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="label">Designer / Brand</label>
              <input className="input-field" placeholder="e.g. Elan" value={form.designer} onChange={e=>set('designer',e.target.value)}/></div>
            <div><label className="label">Cost (PKR)</label>
              <input type="number" className="input-field" placeholder="e.g. 280000" value={form.cost} onChange={e=>set('cost',e.target.value)}/></div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="label">Payment Responsibility</label>
              <select className="input-field" value={form.payment_responsibility} onChange={e=>set('payment_responsibility',e.target.value)}>
                <option value="bride">Bride Side</option>
                <option value="groom">Groom Side</option>
                <option value="individual">Individual</option>
                <option value="shared">Shared</option>
              </select></div>
            <div><label className="label">Status</label>
              <select className="input-field" value={form.status} onChange={e=>set('status',e.target.value)}>
                {STATUSES.map(s=><option key={s} value={s}>{STATUS_LABELS[s]||s}</option>)}
              </select></div>
          </div>
          <div><label className="label">Notes</label>
            <textarea className="input-field resize-none" rows={2} placeholder="Colour, embroidery details, etc." value={form.notes} onChange={e=>set('notes',e.target.value)}/></div>
          <div className="flex gap-3 pt-1">
            <button type="button" onClick={()=>setModal(false)} className="btn-secondary flex-1">Cancel</button>
            <button type="submit" className="btn-primary flex-1 justify-center">{edit?'Update':'Add Outfit'}</button>
          </div>
        </form>
      </Modal>
      <ConfirmDialog open={!!del} onClose={()=>setDel(null)} onConfirm={()=>deleteOutfit(del)} title="Delete outfit?" message="This will permanently remove this outfit record."/>
    </div>
  )
}
