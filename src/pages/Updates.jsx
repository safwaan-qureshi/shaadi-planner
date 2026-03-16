import { useApp } from '../context/AppContext'
import { formatDistanceToNow, parseISO } from 'date-fns'
import { Activity, RefreshCw } from 'lucide-react'

const TYPE_STYLES = {
  guests:        { bg:'#dbeafe', color:'#1e40af' },
  vendors:       { bg:'#d1fae5', color:'#065f46' },
  tasks:         { bg:'#fef3c7', color:'#92400e' },
  expenses:      { bg:'#ede9fe', color:'#5b21b6' },
  travel_plans:  { bg:'#ffedd5', color:'#9a3412' },
  responsibilities: { bg:'#fce7f3', color:'#9d174d' },
  default:       { bg:'var(--champagne)', color:'var(--text-mid)' },
}

function timeAgo(dateStr) {
  try { return formatDistanceToNow(parseISO(dateStr), { addSuffix: true }) }
  catch { return 'recently' }
}

export default function Updates() {
  const { updates, reload } = useApp()

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="section-title flex items-center gap-2">Wedding Updates 📣</h1>
          <p className="text-sm mt-1" style={{color:'var(--text-soft)'}}>
            A live feed of everything happening with your wedding planning
          </p>
        </div>
        <button onClick={reload} className="btn-secondary">
          <RefreshCw size={15}/>Refresh
        </button>
      </div>

      {updates.length === 0 ? (
        <div className="card text-center py-16">
          <p className="text-5xl mb-4">📋</p>
          <p className="font-display text-lg font-semibold" style={{color:'var(--text-dark)'}}>No updates yet</p>
          <p className="text-sm mt-1" style={{color:'var(--text-soft)'}}>
            Updates will appear here as you add guests, vendors, tasks and more
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {updates.map(u => {
            const style = TYPE_STYLES[u.type] || TYPE_STYLES.default
            return (
              <div key={u.id} className="card py-3 px-4 flex items-start gap-3 hover:shadow-md transition-all">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 text-lg"
                  style={{background: style.bg}}>
                  {u.emoji || '📌'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium" style={{color:'var(--text-dark)'}}>{u.message}</p>
                  <p className="text-xs mt-0.5" style={{color:'var(--text-muted)'}}>
                    {u.created_at ? timeAgo(u.created_at) : 'Just now'}
                  </p>
                </div>
                <span className="badge text-xs flex-shrink-0" style={{background: style.bg, color: style.color}}>
                  {u.type?.replace('_', ' ') || 'update'}
                </span>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
