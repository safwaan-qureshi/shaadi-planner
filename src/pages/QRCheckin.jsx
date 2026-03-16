import { useState, useEffect, useRef } from 'react'
import { useApp } from '../context/AppContext'
import { QrCode, Check, X, Search, Users, Camera } from 'lucide-react'
import { format, parseISO } from 'date-fns'

const EVENT_EMOJIS = { 'Mayoon':'💛','Mehndi':'🌿','Barat':'🌹','Walima':'✨','Bachelor Trip':'🎉','Honeymoon':'🌴' }

// Generate a simple QR-like data URL using a canvas (no external library needed)
function generateQRDataURL(text, size = 200) {
  // We'll encode as a URL that shows the token — in production use a real QR lib
  return `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(text)}&color=b5484a&bgcolor=fdf8f0&qzone=2`
}

function GuestQRCard({ guest, events }) {
  const inviteUrl = `${window.location.origin}/invite/${guest.invite_token}`
  const qrUrl = generateQRDataURL(inviteUrl)
  const eventNames = (guest.events_invited||[]).map(id=>events.find(e=>e.id===id)?.name||'?').join(', ')
  const partySize = 1 + (guest.plus_guests||0)

  return (
    <div className="card text-center py-6">
      <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm mx-auto mb-3"
        style={{background:'var(--rose)'}}>
        {guest.name.charAt(0)}
      </div>
      <p className="font-display font-semibold" style={{color:'var(--text-dark)'}}>{guest.name}</p>
      <p className="text-xs mb-3" style={{color:'var(--text-muted)'}}>{eventNames}</p>
      <div className="flex justify-center mb-3">
        <img src={qrUrl} alt="QR Code" width={140} height={140}
          className="rounded-xl" style={{border:'3px solid var(--champagne-border)'}}
          onError={e=>{e.target.style.display='none'}}/>
      </div>
      <p className="text-xs font-mono px-2 py-1 rounded-lg inline-block" style={{background:'var(--champagne)',color:'var(--text-mid)'}}>
        {guest.invite_token}
      </p>
      <div className="flex items-center justify-center gap-2 mt-2">
        <span className={`badge text-xs ${guest.rsvp_status==='confirmed'?'status-confirmed':'status-pending'}`}>
          {guest.rsvp_status}
        </span>
        <span className="text-xs" style={{color:'var(--text-muted)'}}>{partySize} {partySize===1?'person':'people'}</span>
      </div>
    </div>
  )
}

export default function QRCheckin() {
  const { guests, events, updateGuest } = useApp()
  const [selectedEvent, setSelectedEvent] = useState(events[0]?.id || '')
  const [search,        setSearch]        = useState('')
  const [tokenInput,    setTokenInput]    = useState('')
  const [checkedIn,     setCheckedIn]     = useState({}) // guestId -> true
  const [scanResult,    setScanResult]    = useState(null) // {guest, status}
  const [view,          setView]          = useState('scan') // 'scan' | 'qrcodes' | 'list'

  const eventGuests = guests.filter(g =>
    !selectedEvent || (g.events_invited||[]).includes(selectedEvent)
  )

  const checkedInCount = eventGuests.filter(g => checkedIn[g.id]).length
  const totalPeople = eventGuests.reduce((s,g)=>s+1+(g.plus_guests||0),0)

  const handleScan = (token) => {
    const guest = guests.find(g => g.invite_token === token.trim())
    if (!guest) {
      setScanResult({ status:'not_found', message: 'Guest not found. Invalid QR code.' })
      return
    }
    const isInvited = !selectedEvent || (guest.events_invited||[]).includes(selectedEvent)
    if (!isInvited) {
      setScanResult({ guest, status:'not_invited', message: `${guest.name} is not invited to this event.` })
      return
    }
    if (checkedIn[guest.id]) {
      setScanResult({ guest, status:'already_checked', message: `${guest.name} already checked in!` })
      return
    }
    setCheckedIn(p => ({...p, [guest.id]: true}))
    setScanResult({ guest, status:'success', message: `Welcome, ${guest.name}! Party of ${1+(guest.plus_guests||0)}.` })
    setTokenInput('')
    setTimeout(() => setScanResult(null), 4000)
  }

  const filteredGuests = eventGuests.filter(g =>
    !search || g.name.toLowerCase().includes(search.toLowerCase())
  )

  const currentEvent = events.find(e => e.id === selectedEvent)

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="section-title flex items-center gap-2">QR Check-In 📲</h1>
        <p className="text-sm mt-1" style={{color:'var(--text-soft)'}}>
          Scan guest QR codes at the door to check them in
        </p>
      </div>

      {/* Event selector */}
      <div className="card">
        <label className="label">Select Event to Check In</label>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {events.map(e => (
            <button key={e.id} onClick={() => setSelectedEvent(e.id)}
              className="flex items-center gap-2 p-2.5 rounded-xl border-2 text-left transition-all"
              style={{
                borderColor: selectedEvent===e.id ? 'var(--rose)' : 'var(--champagne-border)',
                background:  selectedEvent===e.id ? 'var(--rose-pale)' : 'white',
              }}>
              <span className="text-lg">{EVENT_EMOJIS[e.name]||'💍'}</span>
              <div className="min-w-0">
                <p className="text-sm font-semibold truncate" style={{color:selectedEvent===e.id?'var(--rose)':'var(--text-dark)'}}>{e.name}</p>
                {e.date && <p className="text-xs" style={{color:'var(--text-muted)'}}>
                  {(() => { try { return format(parseISO(e.date),'dd MMM') } catch { return e.date } })()}
                </p>}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Stats */}
      {selectedEvent && (
        <div className="grid grid-cols-3 gap-3">
          {[
            { label:'Total Invited', value:eventGuests.length,  color:'var(--text-dark)' },
            { label:'Checked In',    value:checkedInCount,       color:'#059669' },
            { label:'Est. People',   value:totalPeople,          color:'var(--gold)' },
          ].map(s=>(
            <div key={s.label} className="card text-center py-3">
              <p className="font-display text-2xl font-bold" style={{color:s.color}}>{s.value}</p>
              <p className="text-xs mt-0.5" style={{color:'var(--text-muted)'}}>{s.label}</p>
            </div>
          ))}
        </div>
      )}

      {/* View tabs */}
      <div className="flex gap-2">
        {[
          { key:'scan',    label:'📷 Scan / Enter Token' },
          { key:'qrcodes', label:'🔳 Guest QR Codes'     },
          { key:'list',    label:'📋 Check-In List'      },
        ].map(t=>(
          <button key={t.key} onClick={()=>setView(t.key)}
            className={`tab-pill ${view===t.key?'tab-pill-active':'tab-pill-inactive'}`}>
            {t.label}
          </button>
        ))}
      </div>

      {/* SCAN TAB */}
      {view === 'scan' && (
        <div className="space-y-4">
          {/* Scan result */}
          {scanResult && (
            <div className="rounded-2xl p-5 flex items-center gap-4 animate-slide-up"
              style={{
                background: scanResult.status==='success' ? '#d1fae5' : scanResult.status==='already_checked' ? '#fef3c7' : '#fee2e2',
                border: `2px solid ${scanResult.status==='success' ? '#6ee7b7' : scanResult.status==='already_checked' ? '#fcd34d' : '#fca5a5'}`,
              }}>
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0"
                style={{background:scanResult.status==='success'?'#059669':scanResult.status==='already_checked'?'#d97706':'#dc2626'}}>
                {scanResult.status==='success' ? <Check size={24} className="text-white"/> : <X size={24} className="text-white"/>}
              </div>
              <div>
                <p className="font-semibold" style={{color:scanResult.status==='success'?'#065f46':scanResult.status==='already_checked'?'#92400e':'#991b1b'}}>
                  {scanResult.status==='success' ? '✅ Checked In!' : scanResult.status==='already_checked' ? '⚠️ Already Checked In' : '❌ Not Found'}
                </p>
                <p className="text-sm" style={{color:'inherit', opacity:0.8}}>{scanResult.message}</p>
                {scanResult.guest && (
                  <p className="text-xs mt-1" style={{color:'inherit', opacity:0.6}}>
                    Party of {1+(scanResult.guest.plus_guests||0)} · {(scanResult.guest.events_invited||[]).length} events
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Token input */}
          <div className="card">
            <h3 className="font-display font-semibold mb-3" style={{color:'var(--text-dark)'}}>
              📷 Scan QR or Enter Token
            </h3>
            <p className="text-sm mb-4" style={{color:'var(--text-soft)'}}>
              Point your phone scanner at a guest QR code, or manually paste their invite token below:
            </p>
            <div className="flex gap-3">
              <input
                className="input-field flex-1 font-mono text-sm"
                placeholder="Paste token (e.g. tkn-abc123xyz)"
                value={tokenInput}
                onChange={e => setTokenInput(e.target.value)}
                onKeyDown={e => e.key==='Enter' && handleScan(tokenInput)}
                autoFocus
              />
              <button onClick={() => handleScan(tokenInput)} className="btn-primary px-6 whitespace-nowrap">
                Check In
              </button>
            </div>
            <p className="text-xs mt-3" style={{color:'var(--text-muted)'}}>
              💡 In a real deployment, connect a USB barcode scanner or use a phone QR scanner app pointed at the guest's invitation QR code. Press Enter after scanning.
            </p>
          </div>

          {/* Quick manual check-in */}
          <div className="card">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-display font-semibold" style={{color:'var(--text-dark)'}}>Quick Manual Check-In</h3>
            </div>
            <div className="relative mb-3">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2" style={{color:'var(--text-muted)'}}/>
              <input className="input-field pl-9" placeholder="Search guest name..." value={search} onChange={e=>setSearch(e.target.value)}/>
            </div>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {filteredGuests.slice(0,20).map(g => {
                const isIn = checkedIn[g.id]
                return (
                  <div key={g.id} className="flex items-center gap-3 p-2.5 rounded-xl"
                    style={{background: isIn ? '#d1fae5' : 'var(--cream-dark)'}}>
                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0"
                      style={{background: isIn ? '#059669' : 'var(--rose)'}}>
                      {isIn ? '✓' : g.name.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate" style={{color:'var(--text-dark)'}}>{g.name}</p>
                      <p className="text-xs" style={{color:'var(--text-muted)'}}>Party of {1+(g.plus_guests||0)}</p>
                    </div>
                    <button
                      onClick={() => {
                        if (!isIn) {
                          setCheckedIn(p=>({...p,[g.id]:true}))
                          setScanResult({guest:g, status:'success', message:`Welcome, ${g.name.split(' ')[0]}! Party of ${1+(g.plus_guests||0)}.`})
                          setTimeout(()=>setScanResult(null),3000)
                        } else {
                          setCheckedIn(p=>{const n={...p}; delete n[g.id]; return n})
                        }
                      }}
                      className={`text-xs px-3 py-1.5 rounded-xl font-medium transition-colors whitespace-nowrap ${isIn ? 'bg-white text-gray-600 border' : 'text-white'}`}
                      style={{background: isIn ? 'white' : 'var(--rose)', borderColor:isIn?'var(--champagne-border)':'transparent'}}>
                      {isIn ? 'Undo' : 'Check In'}
                    </button>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}

      {/* QR CODES TAB */}
      {view === 'qrcodes' && (
        <div>
          <div className="rounded-xl p-3 mb-4 text-sm" style={{background:'var(--champagne)',color:'var(--text-mid)'}}>
            💡 <strong>Tip:</strong> Print these QR codes and mail them with physical invitations, or show them in the invitation WhatsApp message. Each guest has a unique QR code that links to their personal invitation.
          </div>
          {eventGuests.length === 0
            ? <p className="text-center py-12" style={{color:'var(--text-muted)'}}>No guests assigned to this event</p>
            : <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {eventGuests.map(g => (
                  <GuestQRCard key={g.id} guest={g} events={events}/>
                ))}
              </div>
          }
        </div>
      )}

      {/* CHECK-IN LIST TAB */}
      {view === 'list' && (
        <div className="card p-0 overflow-hidden">
          <div className="px-4 py-3 flex items-center justify-between" style={{background:'var(--champagne)',borderBottom:'1px solid var(--champagne-border)'}}>
            <p className="font-display font-semibold" style={{color:'var(--text-dark)'}}>
              Attendance: {checkedInCount} / {eventGuests.length} checked in
            </p>
            <button onClick={()=>setCheckedIn({})} className="btn-ghost py-1 px-2 text-xs">Reset All</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr style={{background:'var(--champagne)',borderBottom:'1px solid var(--champagne-border)'}}>
                  {['Guest','Party Size','RSVP','Status',''].map(h=>(
                    <th key={h} className="table-cell text-left text-xs font-semibold uppercase" style={{color:'var(--text-muted)'}}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y" style={{borderColor:'var(--champagne-border)'}}>
                {eventGuests.map(g=>{
                  const isIn = checkedIn[g.id]
                  return (
                    <tr key={g.id} className="transition-colors" style={{background:isIn?'#f0fdf4':'white'}}>
                      <td className="table-cell">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                            style={{background:isIn?'#059669':'var(--rose)'}}>
                            {isIn?'✓':g.name.charAt(0)}
                          </div>
                          <span className="text-sm font-medium" style={{color:'var(--text-dark)'}}>{g.name}</span>
                        </div>
                      </td>
                      <td className="table-cell text-sm" style={{color:'var(--text-mid)'}}>{1+(g.plus_guests||0)}</td>
                      <td className="table-cell">
                        <span className={`badge text-xs ${g.rsvp_status==='confirmed'?'status-confirmed':'status-pending'}`}>{g.rsvp_status}</span>
                      </td>
                      <td className="table-cell">
                        <span className={`badge text-xs ${isIn?'status-confirmed':'status-todo'}`}>{isIn?'✓ Checked In':'Not Yet'}</span>
                      </td>
                      <td className="table-cell">
                        <button onClick={()=>setCheckedIn(p=>isIn?(({[g.id]:_,...r})=>r)(p):{...p,[g.id]:true})}
                          className="btn-ghost py-1 px-2 text-xs whitespace-nowrap">
                          {isIn?'Undo':'Check In'}
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
