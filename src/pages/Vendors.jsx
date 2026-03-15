import { useState } from 'react'
import { useApp } from '../context/AppContext'
import { Plus, Edit2, Trash2, Phone, Mail, ShoppingBag, Search, AlertCircle } from 'lucide-react'
import Modal from '../components/ui/Modal'
import ConfirmDialog from '../components/ui/ConfirmDialog'
import EmptyState from '../components/ui/EmptyState'
import Badge from '../components/ui/Badge'

const CATS = [
  {value:'venue',label:'Venue'},{value:'decorator',label:'Decorator'},
  {value:'photographer',label:'Photographer'},{value:'caterer',label:'Caterer'},
  {value:'makeup_artist',label:'Makeup Artist'},{value:'transportation',label:'Transportation'},
  {value:'entertainment',label:'Entertainment'},{value:'other',label:'Other'},
]
const STATUSES = [
  {value:'vendor_selected',label:'Vendor Selected'},
  {value:'deposit_due',label:'Deposit Due'},
  {value:'deposit_paid',label:'Deposit Paid'},
  {value:'final_payment_due',label:'Final Payment Due'},
  {value:'completed',label:'Completed'},
]
const CAT_ICONS = { venue:'🏛️',decorator:'🌸',photographer:'📷',caterer:'🍽️',makeup_artist:'💄',transportation:'🚗',entertainment:'🎵',other:'📦' }
const EMPTY = { name:'', category:'', contact_name:'', contact_phone:'', contact_email:'', cost:'', deposit_amount:'', deposit_due_date:'', final_payment_due_date:'', status:'vendor_selected', notes:'', event_id:'' }

export default function Vendors() {
  const { vendors, addVendor, updateVendor, deleteVendor, events } = useApp()
  const [modal, setModal] = useState(false)
  const [del, setDel] = useState(null)
  const [edit, setEdit] = useState(null)
  const [form, setForm] = useState(EMPTY)
  const [search, setSearch] = useState('')
  const [filterCat, setFilterCat] = useState('')

  const set = (k,v) => setForm(p=>({...p,[k]:v}))
  const open = (v=null) => { setEdit(v); setForm(v?{...EMPTY,...v}:EMPTY); setModal(true) }
  const submit = async (e) => {
    e.preventDefault()
    const data = {
      name:                   form.name,
      category:               form.category,
      contact_name:           form.contact_name           || null,
      contact_phone:          form.contact_phone          || null,
      contact_email:          form.contact_email          || null,
      cost:                   Number(form.cost)           || 0,
      deposit_amount:         Number(form.deposit_amount) || 0,
      deposit_due_date:       form.deposit_due_date       || null,
      final_payment_due_date: form.final_payment_due_date || null,
      status:                 form.status                 || 'vendor_selected',
      notes:                  form.notes                  || null,
      event_id:               form.event_id               || null,
    }
    if (edit) await updateVendor(edit.id, data)
    else      await addVendor(data)
    setModal(false)
  }

  const filtered = vendors.filter(v => {
    const ms = !search || v.name.toLowerCase().includes(search.toLowerCase())
    const mc = !filterCat || v.category === filterCat
    return ms && mc
  })

  const totalCost    = vendors.reduce((s,v)=>s+(v.cost||0),0)
  const totalDeposit = vendors.reduce((s,v)=>s+(v.deposit_amount||0),0)
  const alerts = vendors.filter(v=>v.status==='deposit_due'||v.status==='final_payment_due')

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="section-title flex items-center gap-2">Vendors 🛍️</h1>
          <p className="text-sm mt-1" style={{color:'var(--text-soft)'}}>Manage wedding service providers and payments</p>
        </div>
        <button onClick={()=>open()} className="btn-primary"><Plus size={16}/>Add Vendor</button>
      </div>

      {/* Payment alerts */}
      {alerts.length > 0 && (
        <div className="rounded-xl p-4 flex items-start gap-3" style={{background:'#fff7ed', border:'1px solid #fed7aa'}}>
          <AlertCircle size={18} className="text-orange-500 flex-shrink-0 mt-0.5"/>
          <div>
            <p className="text-sm font-semibold text-orange-800">Payment Alerts ({alerts.length})</p>
            <div className="mt-1 space-y-0.5">
              {alerts.map(v=>(
                <p key={v.id} className="text-xs text-orange-700">
                  {v.name} — <span className="font-medium">{v.status==='deposit_due'?'Deposit Due':'Final Payment Due'}</span>
                  {v.status==='deposit_due' && v.deposit_due_date ? ` by ${v.deposit_due_date}` : ''}
                  {v.status==='final_payment_due' && v.final_payment_due_date ? ` by ${v.final_payment_due_date}` : ''}
                </p>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label:'Total Vendors',  value:vendors.length, emoji:'📋' },
          { label:'Paid Deposits',  value:vendors.filter(v=>v.status==='deposit_paid'||v.status==='completed').length, emoji:'✅' },
          { label:'Total Cost',     value:`PKR ${(totalCost/1000).toFixed(0)}k`, emoji:'💰' },
          { label:'Deposits Paid',  value:`PKR ${(totalDeposit/1000).toFixed(0)}k`, emoji:'💳' },
        ].map(s=>(
          <div key={s.label} className="card py-3 px-4">
            <p className="text-xl mb-1">{s.emoji}</p>
            <p className="font-display text-xl font-bold" style={{color:'var(--text-dark)'}}>{s.value}</p>
            <p className="text-xs" style={{color:'var(--text-muted)'}}>{s.label}</p>
          </div>
        ))}
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2" style={{color:'var(--text-muted)'}}/>
          <input className="input-field pl-9" placeholder="Search vendors..." value={search} onChange={e=>setSearch(e.target.value)}/>
        </div>
        <select className="input-field sm:w-48" value={filterCat} onChange={e=>setFilterCat(e.target.value)}>
          <option value="">All Categories</option>
          {CATS.map(c=><option key={c.value} value={c.value}>{c.label}</option>)}
        </select>
      </div>

      {filtered.length === 0
        ? <EmptyState title={vendors.length===0?"No vendors yet":"No vendors match"} description="Add photographers, caterers, decorators and more"
            action={vendors.length===0?<button onClick={()=>open()} className="btn-primary">Add First Vendor</button>:null}/>
        : <div className="card p-0 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead><tr style={{background:'var(--champagne)', borderBottom:'1px solid var(--champagne-border)'}}>
                  {['Vendor','Category','Contact','Cost','Deposit','Deposit Due','Final Due','Status',''].map(h=>(
                    <th key={h} className="table-cell text-left text-xs font-semibold uppercase tracking-wide whitespace-nowrap" style={{color:'var(--text-muted)'}}>{h}</th>
                  ))}
                </tr></thead>
                <tbody className="divide-y" style={{borderColor:'var(--champagne-border)'}}>
                  {filtered.map(v=>(
                    <tr key={v.id} className="hover:bg-orange-50/20 transition-colors">
                      <td className="table-cell">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{CAT_ICONS[v.category]||'📦'}</span>
                          <div>
                            <p className="font-medium text-sm whitespace-nowrap" style={{color:'var(--text-dark)'}}>{v.name}</p>
                            {v.notes && <p className="text-xs truncate max-w-[120px]" style={{color:'var(--text-muted)'}}>{v.notes}</p>}
                          </div>
                        </div>
                      </td>
                      <td className="table-cell text-sm capitalize" style={{color:'var(--text-soft)'}}>{v.category?.replace('_',' ')}</td>
                      <td className="table-cell">
                        <div className="space-y-0.5">
                          {v.contact_name && <p className="text-sm whitespace-nowrap" style={{color:'var(--text-mid)'}}>{v.contact_name}</p>}
                          {v.contact_phone && <a href={`tel:${v.contact_phone}`} className="flex items-center gap-1 text-xs" style={{color:'var(--rose)'}}><Phone size={10}/>{v.contact_phone}</a>}
                        </div>
                      </td>
                      <td className="table-cell font-semibold whitespace-nowrap" style={{color:'var(--gold)'}}>
                        {v.cost ? `PKR ${v.cost.toLocaleString()}` : '—'}
                      </td>
                      <td className="table-cell text-sm whitespace-nowrap" style={{color:'var(--text-mid)'}}>
                        {v.deposit_amount ? `PKR ${v.deposit_amount.toLocaleString()}` : '—'}
                      </td>
                      <td className="table-cell text-sm whitespace-nowrap" style={{color:'var(--text-soft)'}}>{v.deposit_due_date||'—'}</td>
                      <td className="table-cell text-sm whitespace-nowrap" style={{color:'var(--text-soft)'}}>{v.final_payment_due_date||'—'}</td>
                      <td className="table-cell"><Badge status={v.status}/></td>
                      <td className="table-cell">
                        <div className="flex gap-1">
                          <button onClick={()=>open(v)} className="btn-ghost py-1 px-1.5"><Edit2 size={13}/></button>
                          <button onClick={()=>setDel(v.id)} className="btn-ghost py-1 px-1.5 hover:text-red-500"><Trash2 size={13}/></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
      }

      <Modal open={modal} onClose={()=>setModal(false)} title={edit?'Edit Vendor':'Add Vendor'} size="lg">
        <form onSubmit={submit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2"><label className="label">Vendor Name *</label>
              <input className="input-field" required placeholder="e.g. Rana Photography" value={form.name} onChange={e=>set('name',e.target.value)}/></div>
            <div><label className="label">Category *</label>
              <select className="input-field" required value={form.category} onChange={e=>set('category',e.target.value)}>
                <option value="">Select category</option>
                {CATS.map(c=><option key={c.value} value={c.value}>{c.label}</option>)}
              </select></div>
            <div><label className="label">Status</label>
              <select className="input-field" value={form.status} onChange={e=>set('status',e.target.value)}>
                {STATUSES.map(s=><option key={s.value} value={s.value}>{s.label}</option>)}
              </select></div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="label">Contact Person</label>
              <input className="input-field" placeholder="Name" value={form.contact_name} onChange={e=>set('contact_name',e.target.value)}/></div>
            <div><label className="label">Phone</label>
              <input type="tel" className="input-field" placeholder="+92 300 1234567" value={form.contact_phone} onChange={e=>set('contact_phone',e.target.value)}/></div>
          </div>
          <div><label className="label">Email</label>
            <input type="email" className="input-field" placeholder="vendor@email.com" value={form.contact_email} onChange={e=>set('contact_email',e.target.value)}/></div>
          <div className="border-t pt-3" style={{borderColor:'var(--champagne-border)'}}>
            <p className="text-xs font-semibold uppercase tracking-wide mb-3" style={{color:'var(--text-muted)'}}>Pricing & Payment Dates</p>
            <div className="grid grid-cols-2 gap-3">
              <div><label className="label">Total Cost (PKR)</label>
                <input type="number" className="input-field" placeholder="e.g. 200000" value={form.cost} onChange={e=>set('cost',e.target.value)}/></div>
              <div><label className="label">Deposit Amount (PKR)</label>
                <input type="number" className="input-field" placeholder="e.g. 75000" value={form.deposit_amount} onChange={e=>set('deposit_amount',e.target.value)}/></div>
              <div><label className="label">Deposit Due Date</label>
                <input type="date" className="input-field" value={form.deposit_due_date} onChange={e=>set('deposit_due_date',e.target.value)}/></div>
              <div><label className="label">Final Payment Due Date</label>
                <input type="date" className="input-field" value={form.final_payment_due_date} onChange={e=>set('final_payment_due_date',e.target.value)}/></div>
            </div>
          </div>
          <div><label className="label">Related Event</label>
            <select className="input-field" value={form.event_id} onChange={e=>set('event_id',e.target.value)}>
              <option value="">General / Multiple Events</option>
              {events.map(e=><option key={e.id} value={e.id}>{e.name}</option>)}
            </select></div>
          <div><label className="label">Notes</label>
            <textarea className="input-field resize-none" rows={2} value={form.notes} onChange={e=>set('notes',e.target.value)}/></div>
          <div className="flex gap-3 pt-1">
            <button type="button" onClick={()=>setModal(false)} className="btn-secondary flex-1">Cancel</button>
            <button type="submit" className="btn-primary flex-1 justify-center">{edit?'Update':'Add Vendor'}</button>
          </div>
        </form>
      </Modal>
      <ConfirmDialog open={!!del} onClose={()=>setDel(null)} onConfirm={()=>deleteVendor(del)} title="Delete Vendor?" message="This will permanently remove this vendor."/>
    </div>
  )
}
