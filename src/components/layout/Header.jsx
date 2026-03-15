import { Menu, Bell, Shield } from 'lucide-react'
import { useApp } from '../../context/AppContext'
import { differenceInDays, parseISO } from 'date-fns'

export default function Header({ onMenuClick }) {
  const { weddingDate, weddingTitle, userRole, setUserRole } = useApp()
  let days = null
  try { days = differenceInDays(parseISO(weddingDate), new Date()) } catch {}

  return (
    <header className="sticky top-0 z-30 px-4 lg:px-6 h-14 flex items-center justify-between"
      style={{background:'rgba(253,248,240,0.92)', backdropFilter:'blur(8px)', borderBottom:'1px solid var(--champagne-border)'}}>
      <div className="flex items-center gap-3">
        <button onClick={onMenuClick} className="lg:hidden btn-ghost p-2"><Menu size={20}/></button>
        <div className="hidden sm:block text-sm" style={{color:'var(--text-soft)'}}>
          {days !== null && days > 0
            ? <>Barat in <span className="font-semibold" style={{color:'var(--rose)'}}>{days} days</span></>
            : <span style={{color:'var(--gold)'}}>🎉 Wedding day!</span>
          }
        </div>
      </div>
      <div className="flex items-center gap-2">
        {/* Role switcher for demo */}
        <select value={userRole} onChange={e=>setUserRole(e.target.value)}
          className="text-xs border rounded-lg px-2 py-1 hidden md:block"
          style={{borderColor:'var(--champagne-border)', color:'var(--text-mid)', background:'white'}}>
          <option value="admin">👑 Admin</option>
          <option value="family">👨‍👩‍👧 Family</option>
          <option value="guest">👁️ Guest View</option>
        </select>
        <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl"
          style={{background:'var(--champagne)', border:'1px solid var(--champagne-border)'}}>
          <span className="text-sm">🌹</span>
          <span className="font-display text-sm font-medium" style={{color:'var(--text-dark)'}}>{weddingTitle}</span>
        </div>
        <button className="relative btn-ghost p-2"><Bell size={17}/>
          <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full" style={{background:'var(--rose)'}}></span>
        </button>
      </div>
    </header>
  )
}
