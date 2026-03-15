import { NavLink, useLocation } from 'react-router-dom'
import {
  LayoutDashboard, CalendarDays, Users, ShoppingBag,
  Wallet, CheckSquare, Heart, X, UsersRound,
  Shirt, Gift, ChevronDown, ChevronRight, Mail, Settings
} from 'lucide-react'
import { useState } from 'react'
import { useApp } from '../../context/AppContext'

const EVENT_EMOJIS = { 'Mayoon':'💛','Mehndi':'🌿','Barat':'🌹','Walima':'✨','Bachelor Trip':'🎉','Honeymoon':'🌴' }

const NAV_MAIN = [
  { to:'/vendors',     icon:ShoppingBag, label:'Vendors'     },
  { to:'/guests',      icon:Users,       label:'Guests'      },
  { to:'/invitations', icon:Mail,        label:'Invitations' },
  { to:'/budget',      icon:Wallet,      label:'Budget'      },
  { to:'/tasks',       icon:CheckSquare, label:'Tasks'       },
  { to:'/outfits',     icon:Shirt,       label:'Outfits'     },
  { to:'/gifts',       icon:Gift,        label:'Gifts'       },
  { to:'/family',      icon:UsersRound,  label:'Family'      },
  { to:'/settings',    icon:Settings,    label:'Settings'    },
]

export default function Sidebar({ open, onClose }) {
  const { weddingTitle, events } = useApp()
  const location = useLocation()
  const [eventsOpen, setEventsOpen] = useState(true)

  return (
    <>
      {open && <div className="fixed inset-0 bg-black/40 z-40 lg:hidden" onClick={onClose}/>}
      <aside className={`fixed top-0 left-0 h-full w-64 z-50 flex flex-col border-r transform transition-transform duration-300 lg:translate-x-0 lg:static lg:z-auto ${open?'translate-x-0':'-translate-x-full'}`}
        style={{background:'white', borderColor:'var(--champagne-border)'}}>

        {/* Logo */}
        <div className="flex items-center justify-between p-5" style={{borderBottom:'1px solid var(--champagne-border)'}}>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{background:'var(--rose)'}}>
              <Heart size={17} className="text-white fill-white"/>
            </div>
            <div>
              <p className="font-display font-semibold text-base leading-tight" style={{color:'var(--rose)'}}>Shaadi</p>
              <p className="font-display font-semibold text-base leading-tight" style={{color:'var(--rose)'}}>Planner</p>
            </div>
          </div>
          <button onClick={onClose} className="lg:hidden btn-ghost p-1.5"><X size={16}/></button>
        </div>

        {/* Wedding name — now links to settings */}
        <NavLink to="/settings" onClick={onClose} className="mx-3 my-2.5 px-3 py-2 rounded-xl block"
          style={{background:'var(--champagne)', border:'1px solid var(--champagne-border)'}}>
          <p className="text-xs font-medium uppercase tracking-wide" style={{color:'var(--gold)'}}>Planning for</p>
          <p className="font-display font-semibold text-sm mt-0.5" style={{color:'var(--text-dark)'}}>{weddingTitle}</p>
          <p className="text-xs mt-0.5" style={{color:'var(--text-muted)'}}>Tap to edit ✏️</p>
        </NavLink>

        {/* Nav */}
        <nav className="flex-1 px-3 py-2 space-y-0.5 overflow-y-auto">
          <NavLink to="/" onClick={onClose}
            className={location.pathname==='/' ? 'nav-item nav-item-active' : 'nav-item nav-item-inactive'}>
            <LayoutDashboard size={17}/><span>Dashboard</span>
          </NavLink>

          {/* Events */}
          <div>
            <button onClick={()=>setEventsOpen(o=>!o)}
              className="nav-item nav-item-inactive w-full justify-between text-left">
              <span className="flex items-center gap-3"><CalendarDays size={17}/>Events</span>
              {eventsOpen ? <ChevronDown size={13}/> : <ChevronRight size={13}/>}
            </button>
            {eventsOpen && (
              <div className="ml-3 mt-0.5 space-y-0.5 pl-2 border-l" style={{borderColor:'var(--champagne-border)'}}>
                <NavLink to="/events" end onClick={onClose}
                  className={location.pathname==='/events' ? 'nav-item text-xs py-1.5 nav-item-active' : 'nav-item text-xs py-1.5 nav-item-inactive'}>
                  <span className="text-base">⚙️</span><span>Manage Events</span>
                </NavLink>
                {events.map(evt => (
                  <NavLink key={evt.id} to={`/events/${evt.id}`} onClick={onClose}
                    className={location.pathname===`/events/${evt.id}` ? 'nav-item text-xs py-1.5 nav-item-active' : 'nav-item text-xs py-1.5 nav-item-inactive'}>
                    <span>{EVENT_EMOJIS[evt.name]||'💍'}</span>
                    <span className="truncate">{evt.name}</span>
                  </NavLink>
                ))}
              </div>
            )}
          </div>

          {NAV_MAIN.map(({ to, icon:Icon, label }) => (
            <NavLink key={to} to={to} onClick={onClose}
              className={location.pathname.startsWith(to) ? 'nav-item nav-item-active' : 'nav-item nav-item-inactive'}>
              <Icon size={17}/><span>{label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="p-4" style={{borderTop:'1px solid var(--champagne-border)'}}>
          <p className="text-xs text-center" style={{color:'var(--text-muted)'}}>Made with ❤️ for Pakistani weddings</p>
        </div>
      </aside>
    </>
  )
}
