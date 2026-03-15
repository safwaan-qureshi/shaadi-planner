import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { format, parseISO } from 'date-fns'
import {
  Plus, Edit2, Trash2, MapPin, Users, CalendarDays,
  FileText, ChevronRight, Mail, Globe
} from 'lucide-react'
import Modal from '../components/ui/Modal'
import ConfirmDialog from '../components/ui/ConfirmDialog'
import EmptyState from '../components/ui/EmptyState'

const EVENT_PRESETS = [
  'Mayoon', 'Mehndi', 'Barat', 'Walima', 'Bachelor Trip', 'Honeymoon'
]
const EVENT_EMOJIS = {
  'Mayoon':'💛','Mehndi':'🌿','Barat':'🌹',
  'Walima':'✨','Bachelor Trip':'🎉','Honeymoon':'🌴',
}
const EVENT_GRADIENTS = {
  'Mayoon':        'linear-gradient(135deg,#f59e0b,#d97706)',
  'Mehndi':        'linear-gradient(135deg,#10b981,#059669)',
  'Barat':         'linear-gradient(135deg,#e11d48,#9f1239)',
  'Walima':        'linear-gradient(135deg,#8b5cf6,#6d28d9)',
  'Bachelor Trip': 'linear-gradient(135deg,#3b82f6,#1d4ed8)',
  'Honeymoon':     'linear-gradient(135deg,#14b8a6,#0f766e)',
}

const EMPTY_FORM = {
  name: '', custom_name: '', date: '', location: '',
  notes: '', guest_count: '', schedule: '', status: 'upcoming',
}

function EventCard({ event, onEdit, onDelete }) {
  const emoji    = EVENT_EMOJIS[event.name] || '💍'
  const gradient = EVENT_GRADIENTS[event.name] || 'linear-gradient(135deg,#6b7280,#374151)'

  let dateStr = event.date
  try { if (event.date) dateStr = format(parseISO(event.date), 'EEE, MMM d, yyyy') } catch {}

  return (
    <div className="rounded-2xl overflow-hidden"
      style={{boxShadow:'0 4px 20px rgba(100,60,20,0.1)', border:'1px solid var(--champagne-border)'}}>

      {/* Coloured header */}
      <div className="p-4 text-white relative overflow-hidden" style={{background: gradient}}>
        <div className="absolute -top-4 -right-4 w-20 h-20 rounded-full bg-white/10"/>
        <div className="flex items-start justify-between relative z-10">
          <div>
            <span className="text-3xl">{emoji}</span>
            <h3 className="font-display text-xl font-bold text-white mt-1">{event.name}</h3>
            {dateStr && (
              <p className="text-sm mt-0.5 flex items-center gap-1.5" style={{color:'rgba(255,255,255,0.8)'}}>
                <CalendarDays size={12}/>{dateStr}
              </p>
            )}
          </div>
          <div className="flex gap-1">
            <button onClick={() => onEdit(event)}
              className="p-1.5 rounded-lg bg-white/20 hover:bg-white/30 transition-colors text-white">
              <Edit2 size={14}/>
            </button>
            <button onClick={() => onDelete(event.id)}
              className="p-1.5 rounded-lg bg-white/20 hover:bg-red-500/60 transition-colors text-white">
              <Trash2 size={14}/>
            </button>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="bg-white p-4 space-y-2">
        {event.location && (
          <div className="flex items-center gap-2 text-sm" style={{color:'var(--text-mid)'}}>
            <MapPin size={13} style={{color:'var(--rose)', flexShrink:0}}/>
            <span className="truncate">{event.location}</span>
          </div>
        )}
        {event.guest_count && (
          <div className="flex items-center gap-2 text-sm" style={{color:'var(--text-mid)'}}>
            <Users size={13} style={{color:'var(--rose)', flexShrink:0}}/>
            <span>{event.guest_count} guests expected</span>
          </div>
        )}
        {event.notes && (
          <div className="flex items-start gap-2 text-sm" style={{color:'var(--text-soft)'}}>
            <FileText size={13} style={{color:'var(--rose)', flexShrink:0, marginTop:2}}/>
            <span className="line-clamp-2">{event.notes}</span>
          </div>
        )}

        {/* Action row */}
        <div className="pt-2 mt-2 flex gap-2" style={{borderTop:'1px solid var(--champagne-border)'}}>
          <Link to={`/events/${event.id}`}
            className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-xl text-xs font-medium transition-colors"
            style={{background:'var(--champagne)', color:'var(--text-mid)'}}>
            Manage Event <ChevronRight size={12}/>
          </Link>
          <Link to={`/invitations?event=${event.id}`}
            className="flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-colors"
            style={{background:'var(--rose-pale)', color:'var(--rose)'}}>
            <Mail size={12}/> Invites
          </Link>
        </div>
      </div>
    </div>
  )
}

function EventForm({ form, onChange, onSubmit, onClose, isEdit }) {
  const isCustom = !EVENT_PRESETS.includes(form.name) && form.name !== ''
  const [useCustom, setUseCustom] = useState(isCustom)

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      {/* Event name — preset or custom */}
      <div>
        <label className="label">Event Type *</label>
        <div className="grid grid-cols-3 gap-2 mb-2">
          {EVENT_PRESETS.map(preset => (
            <button
              key={preset}
              type="button"
              onClick={() => { onChange('name', preset); setUseCustom(false) }}
              className="flex flex-col items-center gap-1 p-2 rounded-xl border-2 text-xs font-medium transition-all"
              style={{
                borderColor: form.name === preset ? 'var(--rose)' : 'var(--champagne-border)',
                background:  form.name === preset ? 'var(--rose-pale)' : 'white',
                color:       form.name === preset ? 'var(--rose)' : 'var(--text-mid)',
              }}
            >
              <span className="text-xl">{EVENT_EMOJIS[preset]}</span>
              <span>{preset}</span>
            </button>
          ))}
        </div>

        {/* Custom event option */}
        <button
          type="button"
          onClick={() => { setUseCustom(true); onChange('name', '') }}
          className="w-full py-2 rounded-xl border-2 border-dashed text-sm transition-all"
          style={{
            borderColor: useCustom ? 'var(--gold)' : 'var(--champagne-border)',
            color: useCustom ? 'var(--gold)' : 'var(--text-muted)',
          }}
        >
          + Add a custom event (e.g. Dholki, Engagement, Nikkah)
        </button>
        {useCustom && (
          <input
            className="input-field mt-2"
            placeholder="e.g. Dholki, Engagement Party, Bridal Shower..."
            value={form.name}
            onChange={e => onChange('name', e.target.value)}
            required
            autoFocus
          />
        )}
        {!useCustom && !form.name && (
          <input type="text" className="opacity-0 h-0 p-0 border-0" required value={form.name} readOnly tabIndex={-1}/>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="label">Date</label>
          <input type="date" className="input-field" value={form.date}
            onChange={e => onChange('date', e.target.value)}/>
        </div>
        <div>
          <label className="label">Expected Guests</label>
          <input type="number" className="input-field" placeholder="e.g. 250"
            value={form.guest_count} onChange={e => onChange('guest_count', e.target.value)}/>
        </div>
      </div>

      <div>
        <label className="label">Location / Venue</label>
        <input type="text" className="input-field" placeholder="e.g. Pearl Continental, Lahore"
          value={form.location} onChange={e => onChange('location', e.target.value)}/>
      </div>

      <div>
        <label className="label">Notes</label>
        <textarea className="input-field resize-none" rows={2}
          placeholder="Any special notes..."
          value={form.notes} onChange={e => onChange('notes', e.target.value)}/>
      </div>

      <div>
        <label className="label">Schedule / Timetable</label>
        <textarea className="input-field resize-none" rows={3}
          placeholder={"5:00 PM - Guests arrive\n7:00 PM - Dinner served\n9:00 PM - Rukhsati"}
          value={form.schedule} onChange={e => onChange('schedule', e.target.value)}/>
      </div>

      <div className="flex gap-3 pt-2">
        <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancel</button>
        <button type="submit" className="btn-primary flex-1 justify-center">
          {isEdit ? 'Update Event' : 'Add Event'}
        </button>
      </div>
    </form>
  )
}

export default function Events() {
  const { events, addEvent, updateEvent, deleteEvent } = useApp()
  const [modalOpen, setModalOpen]   = useState(false)
  const [deleteId,  setDeleteId]    = useState(null)
  const [editing,   setEditing]     = useState(null)
  const [form,      setForm]        = useState(EMPTY_FORM)

  const setField = (k, v) => setForm(p => ({...p, [k]: v}))

  const openAdd = () => {
    setEditing(null)
    setForm(EMPTY_FORM)
    setModalOpen(true)
  }

  const openEdit = (evt) => {
    setEditing(evt)
    setForm({...EMPTY_FORM, ...evt})
    setModalOpen(true)
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (editing) updateEvent(editing.id, form)
    else         addEvent(form)
    setModalOpen(false)
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="section-title flex items-center gap-2">Events 💍</h1>
          <p className="text-sm mt-1" style={{color:'var(--text-soft)'}}>
            Add, edit or remove wedding events and ceremonies
          </p>
        </div>
        <button onClick={openAdd} className="btn-primary">
          <Plus size={16}/> Add Event
        </button>
      </div>

      {events.length === 0 ? (
        <EmptyState
          icon={CalendarDays}
          title="No events yet"
          description="Start by adding your first wedding event — Mehndi, Barat, Walima or anything custom"
          action={<button onClick={openAdd} className="btn-primary">Add First Event</button>}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {events.map(evt => (
            <EventCard
              key={evt.id}
              event={evt}
              onEdit={openEdit}
              onDelete={setDeleteId}
            />
          ))}

          {/* Add new event tile */}
          <button onClick={openAdd}
            className="rounded-2xl border-2 border-dashed flex flex-col items-center justify-center gap-3 p-8 transition-all hover:-translate-y-0.5"
            style={{borderColor:'var(--champagne-border)', color:'var(--text-muted)', minHeight:180}}>
            <div className="w-12 h-12 rounded-full flex items-center justify-center"
              style={{background:'var(--champagne)'}}>
              <Plus size={22} style={{color:'var(--gold)'}}/>
            </div>
            <p className="text-sm font-medium">Add Another Event</p>
          </button>
        </div>
      )}

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? `Edit ${editing.name}` : 'Add New Event'}
        size="lg"
      >
        <EventForm
          form={form}
          onChange={setField}
          onSubmit={handleSubmit}
          onClose={() => setModalOpen(false)}
          isEdit={!!editing}
        />
      </Modal>

      <ConfirmDialog
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={() => deleteEvent(deleteId)}
        title="Delete Event?"
        message="This will permanently remove this event. Guest assignments and vendors linked to it will be unlinked."
      />
    </div>
  )
}
