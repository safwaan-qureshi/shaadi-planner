import { Link } from 'react-router-dom'
import { Menu, Bell, Settings } from 'lucide-react'
import { useApp } from '../../context/AppContext'
import { differenceInDays, parseISO } from 'date-fns'

export default function Header({ onMenuClick }) {
  const { weddingDate, weddingTitle } = useApp()

  let days = null
  try { days = differenceInDays(parseISO(weddingDate), new Date()) } catch {}

  return (
    <header className="sticky top-0 z-30 px-4 lg:px-6 h-14 flex items-center justify-between"
      style={{background:'rgba(253,248,240,0.95)', backdropFilter:'blur(8px)', borderBottom:'1px solid var(--champagne-border)'}}>

      <div className="flex items-center gap-3">
        <button onClick={onMenuClick} className="lg:hidden btn-ghost p-2"><Menu size={20}/></button>
        <div className="text-sm hidden sm:block" style={{color:'var(--text-soft)'}}>
          {days === null || !weddingDate
            ? <span style={{color:'var(--text-muted)'}}>Set your wedding date in Settings</span>
            : days > 0
              ? <>Barat in <span className="font-semibold" style={{color:'var(--rose)'}}>{days} days</span></>
              : days === 0
                ? <span style={{color:'var(--gold)'}}>🎉 Wedding day!</span>
                : <span style={{color:'var(--text-muted)'}}>Wedding was {Math.abs(days)} days ago</span>
          }
        </div>
      </div>

      <div className="flex items-center gap-2">
        {/* Couple name — click to go to settings */}
        <Link to="/settings"
          className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-colors hover:opacity-80"
          style={{background:'var(--champagne)', border:'1px solid var(--champagne-border)'}}>
          <span className="text-sm">🌹</span>
          <span className="font-display text-sm font-medium" style={{color:'var(--text-dark)'}}>{weddingTitle}</span>
        </Link>

        {/* Settings shortcut */}
        <Link to="/settings" className="btn-ghost p-2" title="Settings">
          <Settings size={17}/>
        </Link>

        <button className="relative btn-ghost p-2">
          <Bell size={17}/>
        </button>
      </div>
    </header>
  )
}
