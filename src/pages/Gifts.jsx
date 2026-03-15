import { useState } from 'react'
import { useApp } from '../context/AppContext'
import { Plus, Edit2, Trash2, Gift } from 'lucide-react'
import Modal from '../components/ui/Modal'
import Badge from '../components/ui/Badge'
import ConfirmDialog from '../components/ui/ConfirmDialog'
import EmptyState from '../components/ui/EmptyState'

const GIFT_TYPES = [
  { value:'cash_envelope', label:'Cash Envelope', emoji:'💵' },
  { value:'jewelry',       label:'Jewelry',       emoji:'💍' },
  { value:'physical_gift', label:'Physical Gift', emoji:'🎁' },
]
const EMPTY = { guest_id:'', gift_type:'cash_envelope', description:'', estimated_value:'', notes:'' }

export default function Gifts() {
  const { gifts, addGift, updateGift, deleteGift, guests } = useApp()
  const [modal, setModal] = useState(false)
  const [del, setDel] = useState(null)
  const [edit, setEdit] = useState(null)
  const [form, setForm] = useState(EMPTY)

  const set = (k,v) => setForm(p=>({...p,[k]:v}))
  const open = (g=null) => { setEdit(g); setForm(g?{...EMPTY,...g}:EMPTY); setModal(true) }
  const submit = (e) => {
    e.preventDefault()
    const d = {...form, estimated_value:Number(form.estimated_value)||0}
    if (edit) updateGift(edit.id,d); else addGift(d)
    setModal(false)
  }

  const totalValue = gifts.reduce((s,g)=>s+(g.estimated_value||0),0)
  const getGuest = (id) => guests.find(g=>g.id===id)
  const getGiftLabel = (type) => GIFT_TYPES.find(t=>t.value===type)?.label||type
  const getGiftEmoji = (type) => GIFT_TYPES.find(t=>t.value===type)?.emoji||'🎁'

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="section-title flex items-center gap-2">Gifts <span>🎁</span></h1>
          <p className="text-sm mt-1" style={{color:'var(--text-soft)'}}>Track all gifts received from guests</p>
        </div>
        <button onClick={()=>open()} className="btn-primary"><Plus size={16}/>Add Gift</button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label:'Total Gifts',  value:gifts.length,  emoji:'🎁' },
          { label:'Total Value',  value:`PKR ${(totalValue/1000).toFixed(0)}k`, emoji:'💰' },
          { label:'Cash Gifts',   value:gifts.filter(g=>g.gift_type==='cash_envelope').length, emoji:'💵' },
          { label:'Other Gifts',  value:gifts.filter(g=>g.gift_type!=='cash_envelope').length, emoji:'📦' },
        ].map(s=>(
          <div key={s.label} className="card py-3 px-4">
            <p className="text-xl mb-1">{s.emoji}</p>
            <p className="font-display text-xl font-bold" style={{color:'var(--text-dark)'}}>{s.value}</p>
            <p className="text-xs" style={{color:'var(--text-muted)'}}>{s.label}</p>
          </div>
        ))}
      </div>

      {gifts.length === 0
        ? <EmptyState icon={Gift} title="No gifts recorded yet" description="Start tracking gifts received from guests at wedding events"
            action={<button onClick={()=>open()} className="btn-primary">Add First Gift</button>} />
        : <div className="card p-0 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead><tr style={{background:'var(--champagne)', borderBottom:'1px solid var(--champagne-border)'}}>
                  {['Gift','From Guest','Type','Est. Value','Notes',''].map(h=>(
                    <th key={h} className="table-cell text-left text-xs font-semibold uppercase" style={{color:'var(--text-muted)'}}>{h}</th>
                  ))}
                </tr></thead>
                <tbody className="divide-y" style={{borderColor:'var(--champagne-border)'}}>
                  {gifts.map(g=>{
                    const guest = getGuest(g.guest_id)
                    return (
                      <tr key={g.id} className="hover:bg-orange-50/20 transition-colors">
                        <td className="table-cell">
                          <div className="flex items-center gap-2">
                            <span className="text-xl">{getGiftEmoji(g.gift_type)}</span>
                            <span className="font-medium text-sm" style={{color:'var(--text-dark)'}}>{g.description||'—'}</span>
                          </div>
                        </td>
                        <td className="table-cell text-sm" style={{color:'var(--text-mid)'}}>
                          {guest ? guest.name : <span className="italic" style={{color:'var(--text-muted)'}}>Unknown guest</span>}
                        </td>
                        <td className="table-cell">
                          <span className="badge bg-amber-100 text-amber-800">{getGiftLabel(g.gift_type)}</span>
                        </td>
                        <td className="table-cell font-semibold whitespace-nowrap" style={{color:'var(--gold)'}}>
                          {g.estimated_value ? `PKR ${g.estimated_value.toLocaleString()}` : '—'}
                        </td>
                        <td className="table-cell text-sm" style={{color:'var(--text-soft)'}}>{g.notes||'—'}</td>
                        <td className="table-cell">
                          <div className="flex gap-1">
                            <button onClick={()=>open(g)} className="btn-ghost py-1 px-1.5"><Edit2 size={13}/></button>
                            <button onClick={()=>setDel(g.id)} className="btn-ghost py-1 px-1.5 hover:text-red-500"><Trash2 size={13}/></button>
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

      <Modal open={modal} onClose={()=>setModal(false)} title={edit?'Edit Gift':'Record Gift'}>
        <form onSubmit={submit} className="space-y-4">
          <div><label className="label">From Guest</label>
            <select className="input-field" value={form.guest_id} onChange={e=>set('guest_id',e.target.value)}>
              <option value="">Select guest (optional)</option>
              {guests.map(g=><option key={g.id} value={g.id}>{g.name}</option>)}
            </select></div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="label">Gift Type</label>
              <select className="input-field" value={form.gift_type} onChange={e=>set('gift_type',e.target.value)}>
                {GIFT_TYPES.map(t=><option key={t.value} value={t.value}>{t.emoji} {t.label}</option>)}
              </select></div>
            <div><label className="label">Estimated Value (PKR)</label>
              <input type="number" className="input-field" placeholder="e.g. 50000" value={form.estimated_value} onChange={e=>set('estimated_value',e.target.value)}/></div>
          </div>
          <div><label className="label">Description</label>
            <input className="input-field" placeholder="e.g. Gold necklace set" value={form.description} onChange={e=>set('description',e.target.value)}/></div>
          <div><label className="label">Notes</label>
            <textarea className="input-field resize-none" rows={2} value={form.notes} onChange={e=>set('notes',e.target.value)}/></div>
          <div className="flex gap-3 pt-1">
            <button type="button" onClick={()=>setModal(false)} className="btn-secondary flex-1">Cancel</button>
            <button type="submit" className="btn-primary flex-1 justify-center">{edit?'Update':'Record Gift'}</button>
          </div>
        </form>
      </Modal>
      <ConfirmDialog open={!!del} onClose={()=>setDel(null)} onConfirm={()=>deleteGift(del)} title="Remove gift record?"/>
    </div>
  )
}
