import { useState } from 'react'
import { useApp } from '../context/AppContext'
import { Save, Heart } from 'lucide-react'

export default function Settings() {
  const { weddingTitle, setWeddingTitle, weddingDate, setWeddingDate, budget, setBudget } = useApp()
  const [title,  setTitle]  = useState(weddingTitle)
  const [date,   setDate]   = useState(weddingDate)
  const [bud,    setBud]    = useState(budget)
  const [saved,  setSaved]  = useState(false)

  const save = async (e) => {
    e.preventDefault()
    await setWeddingTitle(title)
    await setWeddingDate(date)
    await setBudget(Number(bud))
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  return (
    <div className="space-y-6 animate-fade-in max-w-lg">
      <div>
        <h1 className="section-title flex items-center gap-2">Settings ⚙️</h1>
        <p className="text-sm mt-1" style={{color:'var(--text-soft)'}}>Update your wedding details and preferences</p>
      </div>

      <form onSubmit={save} className="card space-y-5">
        <div>
          <label className="label">Couple Names</label>
          <input className="input-field" placeholder="e.g. Aisha & Hamza"
            value={title} onChange={e=>setTitle(e.target.value)}/>
          <p className="text-xs mt-1" style={{color:'var(--text-muted)'}}>Appears in the header and on invitations</p>
        </div>

        <div>
          <label className="label">Barat / Wedding Date</label>
          <input type="date" className="input-field" value={date} onChange={e=>setDate(e.target.value)}/>
          <p className="text-xs mt-1" style={{color:'var(--text-muted)'}}>Used for the countdown on the dashboard</p>
        </div>

        <div>
          <label className="label">Total Wedding Budget (PKR)</label>
          <input type="number" className="input-field" placeholder="e.g. 5000000"
            value={bud} onChange={e=>setBud(e.target.value)}/>
          <p className="text-xs mt-1" style={{color:'var(--text-muted)'}}>
            = PKR {Number(bud).toLocaleString()}
          </p>
        </div>

        <button type="submit" className="btn-primary w-full justify-center py-2.5">
          {saved ? '✅ Saved!' : <><Save size={16}/>Save Changes</>}
        </button>
      </form>

      <div className="card" style={{background:'var(--champagne)'}}>
        <div className="flex items-center gap-2 mb-2">
          <Heart size={16} style={{color:'var(--rose)'}}/>
          <p className="font-display font-semibold" style={{color:'var(--text-dark)'}}>Preview</p>
        </div>
        <p className="text-sm" style={{color:'var(--text-mid)'}}>
          Planning for: <strong>{title || '—'}</strong>
        </p>
        <p className="text-sm mt-1" style={{color:'var(--text-mid)'}}>
          Wedding date: <strong>{date || '—'}</strong>
        </p>
        <p className="text-sm mt-1" style={{color:'var(--text-mid)'}}>
          Budget: <strong>PKR {Number(bud).toLocaleString()}</strong>
        </p>
      </div>
    </div>
  )
}
