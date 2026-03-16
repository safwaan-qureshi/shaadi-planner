import { Link } from 'react-router-dom'
import { useState, useRef, useEffect } from 'react'
import { Menu, Bell, Settings, X } from 'lucide-react'
import { useApp } from '../../context/AppContext'
import { differenceInDays, parseISO, formatDistanceToNow } from 'date-fns'

const ROLES = [
  { value:'admin',           label:'👑 Admin',              desc:'Full access' },
  { value:'bride_family',    label:'👰 Bride Family',        desc:'Bride-side management' },
  { value:'groom_family',    label:'🤵 Groom Family',        desc:'Groom-side management' },
  { value:'overseas_family', label:'✈️ Overseas Family',     desc:'Travel & schedule view' },
  { value:'guest_viewer',    label:'👁️ Guest Viewer',        desc:'View only' },
]

function NotificationPanel({ notifications, onClose }) {
  function timeAgo(d) { try { return formatDistanceToNow(parseISO(d), {addSuffix:true}) } catch { return 'recently' } }
  return (
    <div className="absolute right-0 top-12 w-80 rounded-2xl shadow-2xl z-50 overflow-hidden animate-slide-up"
      style={{background:'white', border:'1px solid var(--champagne-border)'}}>
      <div className="px-4 py-3 flex items-center justify-between" style={{borderBottom:'1px solid var(--champagne-border)', background:'var(--champagne)'}}>
        <p className="font-display font-semibold text-sm" style={{color:'var(--text-dark)'}}>Notifications</p>
        <button onClick={onClose} className="btn-ghost p-1"><X size={14}/></button>
      </div>
      <div className="max-h-72 overflow-y-auto">
        {notifications.length === 0
          ? <p className="text-sm text-center py-8" style={{color:'var(--text-muted)'}}>No notifications yet</p>
          : notifications.map(n => (
              <div key={n.id} className="flex items-start gap-3 px-4 py-3 hover:bg-orange-50/30 transition-colors"
                style={{borderBottom:'1px solid var(--champagne-border)'}}>
                <span className="text-lg flex-shrink-0">{n.emoji||'📌'}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium" style={{color:'var(--text-dark)'}}>{n.message}</p>
                  <p className="text-xs mt-0.5" style={{color:'var(--text-muted)'}}>{timeAgo(n.created_at)}</p>
                </div>
              </div>
            ))
        }
      </div>
      <div className="p-3" style={{borderTop:'1px solid var(--champagne-border)'}}>
        <Link to="/updates" onClick={onClose} className="w-full text-center block text-xs font-medium py-1.5 rounded-xl"
          style={{color:'var(--rose)', background:'var(--rose-pale)'}}>
          View all updates →
        </Link>
      </div>
    </div>
  )
}

export default function Header({ onMenuClick }) {
  const { weddingDate, weddingTitle, userRole, setUserRole, notifications } = useApp()
  const [showNotifs, setShowNotifs] = useState(false)
  const [showRoles,  setShowRoles]  = useState(false)
  const notifsRef = useRef(null)

  let days = null
  try { days = differenceInDays(parseISO(weddingDate), new Date()) } catch {}

  const currentRole = ROLES.find(r => r.value === userRole) || ROLES[0]

  useEffect(() => {
    const handleClick = (e) => {
      if (notifsRef.current && !notifsRef.current.contains(e.target)) {
        setShowNotifs(false)
        setShowRoles(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  return (
    <header className="sticky top-0 z-30 px-4 lg:px-6 h-14 flex items-center justify-between"
      style={{background:'rgba(253,248,240,0.95)', backdropFilter:'blur(8px)', borderBottom:'1px solid var(--champagne-border)'}}>

      <div className="flex items-center gap-3">
        <button onClick={onMenuClick} className="lg:hidden btn-ghost p-2"><Menu size={20}/></button>
        <div className="text-sm hidden sm:block" style={{color:'var(--text-soft)'}}>
          {days === null || !weddingDate
            ? <span style={{color:'var(--text-muted)'}}>Set wedding date in Settings</span>
            : days > 0
              ? <>Barat in <span className="font-semibold" style={{color:'var(--rose)'}}>{days} days</span></>
              : days === 0
                ? <span style={{color:'var(--gold)'}}>🎉 Wedding day!</span>
                : <span style={{color:'var(--text-muted)'}}>Wedding was {Math.abs(days)} days ago</span>
          }
        </div>
      </div>

      <div className="flex items-center gap-2" ref={notifsRef}>

        {/* Role switcher */}
        <div className="relative">
          <button
            onClick={() => { setShowRoles(p=>!p); setShowNotifs(false) }}
            className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-colors text-sm font-medium"
            style={{background:'var(--champagne)', border:'1px solid var(--champagne-border)', color:'var(--text-mid)'}}>
            {currentRole.label}
            <span className="text-xs" style={{color:'var(--text-muted)'}}>▾</span>
          </button>
          {showRoles && (
            <div className="absolute right-0 top-11 w-64 rounded-2xl shadow-2xl z-50 overflow-hidden animate-slide-up"
              style={{background:'white', border:'1px solid var(--champagne-border)'}}>
              <div className="p-2">
                <p className="text-xs font-semibold uppercase tracking-wide px-2 py-1.5" style={{color:'var(--text-muted)'}}>Switch View</p>
                {ROLES.map(r => (
                  <button key={r.value} onClick={() => { setUserRole(r.value); setShowRoles(false) }}
                    className="w-full flex items-start gap-3 px-3 py-2.5 rounded-xl text-left transition-colors hover:bg-orange-50"
                    style={{background: userRole===r.value ? 'var(--rose-pale)' : 'transparent'}}>
                    <div>
                      <p className="text-sm font-medium" style={{color: userRole===r.value ? 'var(--rose)' : 'var(--text-dark)'}}>{r.label}</p>
                      <p className="text-xs" style={{color:'var(--text-muted)'}}>{r.desc}</p>
                    </div>
                    {userRole===r.value && <span className="ml-auto text-xs" style={{color:'var(--rose)'}}>✓</span>}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Wedding title */}
        <Link to="/settings"
          className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-colors hover:opacity-80"
          style={{background:'var(--champagne)', border:'1px solid var(--champagne-border)'}}>
          <span className="text-sm">🌹</span>
          <span className="font-display text-sm font-medium" style={{color:'var(--text-dark)'}}>{weddingTitle}</span>
        </Link>

        {/* Settings */}
        <Link to="/settings" className="btn-ghost p-2" title="Settings"><Settings size={17}/></Link>

        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => { setShowNotifs(p=>!p); setShowRoles(false) }}
            className="relative btn-ghost p-2">
            <Bell size={17}/>
            {notifications.length > 0 && (
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full" style={{background:'var(--rose)'}}/>
            )}
          </button>
          {showNotifs && (
            <NotificationPanel notifications={notifications} onClose={() => setShowNotifs(false)}/>
          )}
        </div>
      </div>
    </header>
  )
}
