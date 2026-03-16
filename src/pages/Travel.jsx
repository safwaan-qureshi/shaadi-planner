import { useState } from 'react'
import { useApp } from '../context/AppContext'
import { Plus, Edit2, Trash2, Plane, Hotel, Car, Search } from 'lucide-react'
import Modal from '../components/ui/Modal'
import ConfirmDialog from '../components/ui/ConfirmDialog'
import EmptyState from '../components/ui/EmptyState'
import Badge from '../components/ui/Badge'
import { format, parseISO } from 'date-fns'

const EMPTY = {
  guest_id:'', guest_name:'', arrival_date:'', departure_date:'',
  airline:'', flight_number:'', arrival_city:'', hotel_name:'',
  needs_airport_pickup: false, notes:''
}

function TravelForm({ form, onChange, onSubmit, onClose, isEdit, guests }) {
  return (
    <form onSubmit={onSubmit} className="space-y-4">
      {/* Guest link */}
      <div>
        <label className="label">Guest *</label>
        <select className="input-field" required value={form.guest_id}
          onChange={e => {
            const g = guests.find(g => g.id === e.target.value)
            onChange('guest_id', e.target.value)
            if (g) onChange('guest_name', g.name)
          }}>
          <option value="">Select guest</option>
          {guests.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
        </select>
        <p className="text-xs mt-1" style={{color:'var(--text-muted)'}}>
          Or type a name if the guest isn't in the list yet
        </p>
        {!form.guest_id && (
          <input className="input-field mt-2" placeholder="Or type guest name manually"
            value={form.guest_name} onChange={e => onChange('guest_name', e.target.value)}/>
        )}
      </div>

      {/* Arrival & Departure */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="label">Arrival Date *</label>
          <input type="date" className="input-field" required value={form.arrival_date}
            onChange={e => onChange('arrival_date', e.target.value)}/>
        </div>
        <div>
          <label className="label">Departure Date</label>
          <input type="date" className="input-field" value={form.departure_date}
            onChange={e => onChange('departure_date', e.target.value)}/>
        </div>
      </div>

      {/* Flight details */}
      <div className="rounded-xl p-4 space-y-3" style={{background:'var(--champagne)'}}>
        <p className="text-xs font-semibold uppercase tracking-wide" style={{color:'var(--gold)'}}>
          ✈️ Flight Details
        </p>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label">Airline</label>
            <input className="input-field bg-white" placeholder="e.g. Emirates" value={form.airline}
              onChange={e => onChange('airline', e.target.value)}/>
          </div>
          <div>
            <label className="label">Flight Number</label>
            <input className="input-field bg-white" placeholder="e.g. EK611" value={form.flight_number}
              onChange={e => onChange('flight_number', e.target.value)}/>
          </div>
        </div>
        <div>
          <label className="label">Arriving At</label>
          <input className="input-field bg-white" placeholder="e.g. Lahore Airport (LHE)" value={form.arrival_city}
            onChange={e => onChange('arrival_city', e.target.value)}/>
        </div>
      </div>

      {/* Hotel */}
      <div>
        <label className="label">Hotel / Accommodation</label>
        <input className="input-field" placeholder="e.g. Pearl Continental, Lahore" value={form.hotel_name}
          onChange={e => onChange('hotel_name', e.target.value)}/>
      </div>

      {/* Airport pickup */}
      <label className="flex items-center gap-3 cursor-pointer p-3 rounded-xl border transition-all"
        style={{
          borderColor: form.needs_airport_pickup ? 'var(--rose)' : 'var(--champagne-border)',
          background: form.needs_airport_pickup ? 'var(--rose-pale)' : 'white'
        }}>
        <input type="checkbox" className="accent-rose-600 w-4 h-4"
          checked={form.needs_airport_pickup}
          onChange={e => onChange('needs_airport_pickup', e.target.checked)}/>
        <div>
          <p className="text-sm font-medium" style={{color:'var(--text-mid)'}}>🚗 Needs Airport Pickup</p>
          <p className="text-xs" style={{color:'var(--text-muted)'}}>Family will arrange transport from airport</p>
        </div>
      </label>

      <div>
        <label className="label">Notes</label>
        <textarea className="input-field resize-none" rows={2}
          placeholder="Any special requirements, wheelchair assistance, etc."
          value={form.notes} onChange={e => onChange('notes', e.target.value)}/>
      </div>

      <div className="flex gap-3 pt-2">
        <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancel</button>
        <button type="submit" className="btn-primary flex-1 justify-center">
          {isEdit ? 'Update Travel Plan' : 'Add Travel Plan'}
        </button>
      </div>
    </form>
  )
}

export default function Travel() {
  const { travelPlans, addTravelPlan, updateTravelPlan, deleteTravelPlan, guests } = useApp()
  const [modal,  setModal]  = useState(false)
  const [del,    setDel]    = useState(null)
  const [edit,   setEdit]   = useState(null)
  const [form,   setForm]   = useState(EMPTY)
  const [search, setSearch] = useState('')

  const set = (k, v) => setForm(p => ({...p, [k]: v}))

  const open = (t = null) => {
    setEdit(t)
    setForm(t ? {...EMPTY, ...t} : EMPTY)
    setModal(true)
  }

  const submit = async (e) => {
    e.preventDefault()
    const data = {
      guest_id:             form.guest_id             || null,
      guest_name:           form.guest_name           || null,
      arrival_date:         form.arrival_date         || null,
      departure_date:       form.departure_date       || null,
      airline:              form.airline              || null,
      flight_number:        form.flight_number        || null,
      arrival_city:         form.arrival_city         || null,
      hotel_name:           form.hotel_name           || null,
      needs_airport_pickup: form.needs_airport_pickup || false,
      notes:                form.notes               || null,
    }
    if (edit) await updateTravelPlan(edit.id, data)
    else      await addTravelPlan(data)
    setModal(false)
  }

  const filtered = travelPlans.filter(t => {
    const name = t.guest_name || guests.find(g => g.id === t.guest_id)?.name || ''
    return !search || name.toLowerCase().includes(search.toLowerCase()) ||
      (t.airline || '').toLowerCase().includes(search.toLowerCase())
  })

  const pickups = travelPlans.filter(t => t.needs_airport_pickup).length
  const arriving = travelPlans.filter(t => t.arrival_date).length

  const guestName = (t) => t.guest_name || guests.find(g => g.id === t.guest_id)?.name || 'Unknown'
  const fmtDate = (d) => { try { return d ? format(parseISO(d), 'dd MMM yyyy') : '—' } catch { return d || '—' } }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="section-title flex items-center gap-2">Travel Plans ✈️</h1>
          <p className="text-sm mt-1" style={{color:'var(--text-soft)'}}>
            Coordinate arrivals, flights and airport pickups for overseas family
          </p>
        </div>
        <button onClick={() => open()} className="btn-primary">
          <Plus size={16}/>Add Travel Plan
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label:'Total Travellers', value:travelPlans.length, emoji:'✈️' },
          { label:'Arriving',         value:arriving,           emoji:'🛬' },
          { label:'Need Pickup',      value:pickups,            emoji:'🚗' },
          { label:'Have Hotel',       value:travelPlans.filter(t=>t.hotel_name).length, emoji:'🏨' },
        ].map(s => (
          <div key={s.label} className="card py-3 px-4">
            <p className="text-xl mb-1">{s.emoji}</p>
            <p className="font-display text-2xl font-bold" style={{color:'var(--text-dark)'}}>{s.value}</p>
            <p className="text-xs" style={{color:'var(--text-muted)'}}>{s.label}</p>
          </div>
        ))}
      </div>

      {/* Airport pickup alert */}
      {pickups > 0 && (
        <div className="rounded-xl p-4 flex items-start gap-3"
          style={{background:'#fff7ed', border:'1px solid #fed7aa'}}>
          <span className="text-xl">🚗</span>
          <div>
            <p className="text-sm font-semibold text-orange-800">{pickups} guest{pickups > 1 ? 's' : ''} need airport pickup</p>
            <div className="flex flex-wrap gap-2 mt-1">
              {travelPlans.filter(t => t.needs_airport_pickup).map(t => (
                <span key={t.id} className="text-xs bg-orange-100 text-orange-800 px-2 py-0.5 rounded-full">
                  {guestName(t)} · {fmtDate(t.arrival_date)}
                  {t.flight_number ? ` · ${t.flight_number}` : ''}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Search */}
      <div className="relative">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2" style={{color:'var(--text-muted)'}}/>
        <input className="input-field pl-9" placeholder="Search by name or airline..."
          value={search} onChange={e => setSearch(e.target.value)}/>
      </div>

      {/* Table */}
      {filtered.length === 0 ? (
        <EmptyState icon={Plane} title={travelPlans.length===0 ? "No travel plans yet" : "No results"}
          description="Add flight and hotel details for overseas family and guests"
          action={travelPlans.length===0 ? <button onClick={()=>open()} className="btn-primary">Add First Travel Plan</button> : null}/>
      ) : (
        <div className="card p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr style={{background:'var(--champagne)', borderBottom:'1px solid var(--champagne-border)'}}>
                  {['Guest','Arrival','Departure','Airline','Flight','Arriving At','Hotel','Pickup',''].map(h => (
                    <th key={h} className="table-cell text-left text-xs font-semibold uppercase tracking-wide whitespace-nowrap"
                      style={{color:'var(--text-muted)'}}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y" style={{borderColor:'var(--champagne-border)'}}>
                {filtered.map(t => (
                  <tr key={t.id} className="hover:bg-orange-50/20 transition-colors">
                    <td className="table-cell">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-white flex-shrink-0"
                          style={{background:'var(--rose)'}}>
                          {guestName(t).charAt(0)}
                        </div>
                        <span className="font-medium text-sm whitespace-nowrap" style={{color:'var(--text-dark)'}}>{guestName(t)}</span>
                      </div>
                    </td>
                    <td className="table-cell text-sm whitespace-nowrap" style={{color:'var(--text-mid)'}}>{fmtDate(t.arrival_date)}</td>
                    <td className="table-cell text-sm whitespace-nowrap" style={{color:'var(--text-mid)'}}>{fmtDate(t.departure_date)}</td>
                    <td className="table-cell text-sm" style={{color:'var(--text-mid)'}}>{t.airline || '—'}</td>
                    <td className="table-cell">
                      {t.flight_number
                        ? <span className="badge bg-blue-100 text-blue-800">{t.flight_number}</span>
                        : <span style={{color:'var(--text-muted)'}}>—</span>
                      }
                    </td>
                    <td className="table-cell text-sm" style={{color:'var(--text-mid)'}}>{t.arrival_city || '—'}</td>
                    <td className="table-cell text-sm" style={{color:'var(--text-mid)'}}>
                      {t.hotel_name
                        ? <span className="flex items-center gap-1"><Hotel size={12}/>{t.hotel_name}</span>
                        : '—'
                      }
                    </td>
                    <td className="table-cell">
                      {t.needs_airport_pickup
                        ? <span className="badge bg-orange-100 text-orange-800">🚗 Yes</span>
                        : <span style={{color:'var(--text-muted)'}}>—</span>
                      }
                    </td>
                    <td className="table-cell">
                      <div className="flex gap-1">
                        <button onClick={() => open(t)} className="btn-ghost py-1 px-1.5"><Edit2 size={13}/></button>
                        <button onClick={() => setDel(t.id)} className="btn-ghost py-1 px-1.5 hover:text-red-500"><Trash2 size={13}/></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <Modal open={modal} onClose={() => setModal(false)} title={edit ? 'Edit Travel Plan' : 'Add Travel Plan'} size="lg">
        <TravelForm form={form} onChange={set} onSubmit={submit}
          onClose={() => setModal(false)} isEdit={!!edit} guests={guests}/>
      </Modal>
      <ConfirmDialog open={!!del} onClose={() => setDel(null)}
        onConfirm={() => deleteTravelPlan(del)} title="Remove travel plan?"
        message="This will permanently remove this travel record."/>
    </div>
  )
}
