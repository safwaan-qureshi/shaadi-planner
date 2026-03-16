import { useState } from 'react'
import { useApp } from '../context/AppContext'
import { Plus, Trash2, Image, Heart } from 'lucide-react'
import Modal from '../components/ui/Modal'

const EVENT_EMOJIS = { 'Mayoon':'💛','Mehndi':'🌿','Barat':'🌹','Walima':'✨','Bachelor Trip':'🎉','Honeymoon':'🌴' }

export default function PhotoAlbum() {
  const { moodboard, addMoodboardImage, deleteMoodboardImage, events } = useApp()
  const [modal,    setModal]   = useState(false)
  const [url,      setUrl]     = useState('')
  const [caption,  setCaption] = useState('')
  const [eventId,  setEventId] = useState('')
  const [filter,   setFilter]  = useState('all') // 'all' | event id

  // Group by event
  const filtered = filter === 'all'
    ? moodboard
    : moodboard.filter(m => m.event_id === filter)

  const grouped = events.reduce((acc, e) => {
    const imgs = moodboard.filter(m => m.event_id === e.id)
    if (imgs.length > 0) acc[e.id] = { event:e, images:imgs }
    return acc
  }, {})
  const unlinked = moodboard.filter(m => !m.event_id)

  const add = (ev) => {
    ev.preventDefault()
    if (!url.trim()) return
    addMoodboardImage({ url: url.trim(), caption, event_id: eventId || null })
    setUrl(''); setCaption(''); setEventId(''); setModal(false)
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="section-title flex items-center gap-2">Photo Album & Moodboards 🖼️</h1>
          <p className="text-sm mt-1" style={{color:'var(--text-soft)'}}>
            Inspiration images, moodboards, and wedding memories per event
          </p>
        </div>
        <button onClick={()=>setModal(true)} className="btn-primary">
          <Plus size={16}/>Add Image
        </button>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        <button onClick={()=>setFilter('all')}
          className={`tab-pill ${filter==='all'?'tab-pill-active':'tab-pill-inactive'}`}>
          All ({moodboard.length})
        </button>
        {events.filter(e=>moodboard.some(m=>m.event_id===e.id)).map(e=>(
          <button key={e.id} onClick={()=>setFilter(e.id)}
            className={`tab-pill ${filter===e.id?'tab-pill-active':'tab-pill-inactive'}`}>
            {EVENT_EMOJIS[e.name]||'💍'} {e.name}
          </button>
        ))}
      </div>

      {moodboard.length === 0 ? (
        <div className="card text-center py-16">
          <p className="text-5xl mb-4">🖼️</p>
          <p className="font-display text-lg font-semibold" style={{color:'var(--text-dark)'}}>No images yet</p>
          <p className="text-sm mt-1 mb-5" style={{color:'var(--text-soft)'}}>
            Add inspiration images for decor, outfits, stages, and more.<br/>
            Paste any image URL from Pinterest, Google, or anywhere online.
          </p>
          <button onClick={()=>setModal(true)} className="btn-primary">Add First Image</button>
        </div>
      ) : filter === 'all' ? (
        /* Grouped by event view */
        <div className="space-y-8">
          {Object.values(grouped).map(({ event, images }) => (
            <div key={event.id}>
              <div className="flex items-center gap-2 mb-3">
                <span className="text-2xl">{EVENT_EMOJIS[event.name]||'💍'}</span>
                <h3 className="font-display text-lg font-semibold" style={{color:'var(--text-dark)'}}>{event.name}</h3>
                <span className="badge text-xs" style={{background:'var(--champagne)',color:'var(--text-mid)'}}>{images.length} images</span>
              </div>
              <div className="moodboard-grid">
                {images.map(img => (
                  <div key={img.id} className="relative group">
                    <img src={img.url} alt={img.caption||'Inspiration'}
                      className="moodboard-img"
                      onError={e=>{ e.target.src='https://placehold.co/200x200/f7e9d0/c9a84c?text=🌹' }}/>
                    {img.caption && (
                      <p className="text-xs mt-1 text-center truncate" style={{color:'var(--text-soft)'}}>{img.caption}</p>
                    )}
                    <button onClick={()=>deleteMoodboardImage(img.id)}
                      className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-white text-xs font-bold"
                      style={{background:'rgba(181,72,74,0.85)'}}>
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ))}
          {unlinked.length > 0 && (
            <div>
              <h3 className="font-display text-lg font-semibold mb-3" style={{color:'var(--text-dark)'}}>General Inspiration</h3>
              <div className="moodboard-grid">
                {unlinked.map(img=>(
                  <div key={img.id} className="relative group">
                    <img src={img.url} alt={img.caption||'Inspiration'} className="moodboard-img"
                      onError={e=>{ e.target.src='https://placehold.co/200x200/f7e9d0/c9a84c?text=🌹' }}/>
                    {img.caption && <p className="text-xs mt-1 text-center truncate" style={{color:'var(--text-soft)'}}>{img.caption}</p>}
                    <button onClick={()=>deleteMoodboardImage(img.id)}
                      className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-white text-xs font-bold"
                      style={{background:'rgba(181,72,74,0.85)'}}>
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        /* Single event filtered view */
        <div>
          {filtered.length === 0
            ? <p className="text-center py-12" style={{color:'var(--text-muted)'}}>No images for this event yet</p>
            : <div className="moodboard-grid">
                {filtered.map(img=>(
                  <div key={img.id} className="relative group">
                    <img src={img.url} alt={img.caption||'Inspiration'} className="moodboard-img"
                      onError={e=>{ e.target.src='https://placehold.co/200x200/f7e9d0/c9a84c?text=🌹' }}/>
                    {img.caption && <p className="text-xs mt-1 text-center truncate" style={{color:'var(--text-soft)'}}>{img.caption}</p>}
                    <button onClick={()=>deleteMoodboardImage(img.id)}
                      className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-white text-xs font-bold"
                      style={{background:'rgba(181,72,74,0.85)'}}>
                      ×
                    </button>
                  </div>
                ))}
              </div>
          }
        </div>
      )}

      <Modal open={modal} onClose={()=>setModal(false)} title="Add Inspiration Image" size="sm">
        <form onSubmit={add} className="space-y-4">
          <div>
            <label className="label">Image URL *</label>
            <input className="input-field" required placeholder="https://example.com/image.jpg"
              value={url} onChange={e=>setUrl(e.target.value)}/>
            <p className="text-xs mt-1" style={{color:'var(--text-muted)'}}>
              Paste any image URL from Pinterest, Google Images, or wedding websites
            </p>
          </div>
          <div>
            <label className="label">Caption</label>
            <input className="input-field" placeholder="e.g. Bridal stage inspiration"
              value={caption} onChange={e=>setCaption(e.target.value)}/>
          </div>
          <div>
            <label className="label">Link to Event (optional)</label>
            <select className="input-field" value={eventId} onChange={e=>setEventId(e.target.value)}>
              <option value="">General inspiration</option>
              {events.map(e=><option key={e.id} value={e.id}>{EVENT_EMOJIS[e.name]||'💍'} {e.name}</option>)}
            </select>
          </div>
          <div className="flex gap-3 pt-1">
            <button type="button" onClick={()=>setModal(false)} className="btn-secondary flex-1">Cancel</button>
            <button type="submit" className="btn-primary flex-1 justify-center">Add Image</button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
