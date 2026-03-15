import { useState } from 'react'
import { useApp } from '../context/AppContext'
import { format, parseISO } from 'date-fns'
import { Plus, Edit2, Trash2, MapPin, Users, CalendarDays, FileText } from 'lucide-react'
import Modal from '../components/ui/Modal'
import ConfirmDialog from '../components/ui/ConfirmDialog'
import EmptyState from '../components/ui/EmptyState'

const EVENT_TYPES = ['Mayoon', 'Mehndi', 'Barat', 'Walima', 'Bachelor Trip', 'Honeymoon Trip']
const EVENT_EMOJIS = {
  'Mayoon': '💛', 'Mehndi': '🌿', 'Barat': '🌹',
  'Walima': '✨', 'Bachelor Trip': '🎉', 'Honeymoon Trip': '🌴',
}
const EVENT_COLORS = {
  'Mayoon': 'bg-yellow-50 border-yellow-200',
  'Mehndi': 'bg-green-50 border-green-200',
  'Barat': 'bg-rose-50 border-rose-200',
  'Walima': 'bg-purple-50 border-purple-200',
  'Bachelor Trip': 'bg-blue-50 border-blue-200',
  'Honeymoon Trip': 'bg-teal-50 border-teal-200',
}

const EMPTY_FORM = {
  name: '', date: '', location: '', notes: '',
  guest_count: '', schedule: '', status: 'upcoming',
}

function EventCard({ event, onEdit, onDelete }) {
  const colorClass = EVENT_COLORS[event.name] || 'bg-gray-50 border-gray-200'
  const emoji = EVENT_EMOJIS[event.name] || '💍'

  let dateStr = event.date
  try { if (event.date) dateStr = format(parseISO(event.date), 'EEE, MMM d, yyyy') } catch {}

  return (
    <div className={`card border ${colorClass} hover:shadow-md transition-all duration-200`}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <span className="text-3xl">{emoji}</span>
          <div>
            <h3 className="font-display text-lg font-semibold text-gray-900">{event.name}</h3>
            {event.date && (
              <p className="text-sm text-gray-500 flex items-center gap-1 mt-0.5">
                <CalendarDays size={12} /> {dateStr}
              </p>
            )}
          </div>
        </div>
        <div className="flex gap-1">
          <button onClick={() => onEdit(event)} className="btn-ghost p-2">
            <Edit2 size={15} />
          </button>
          <button onClick={() => onDelete(event.id)} className="p-2 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors">
            <Trash2 size={15} />
          </button>
        </div>
      </div>

      <div className="space-y-2 text-sm">
        {event.location && (
          <div className="flex items-center gap-2 text-gray-600">
            <MapPin size={14} className="text-rose-500 flex-shrink-0" />
            <span>{event.location}</span>
          </div>
        )}
        {event.guest_count && (
          <div className="flex items-center gap-2 text-gray-600">
            <Users size={14} className="text-rose-500 flex-shrink-0" />
            <span>{event.guest_count} guests expected</span>
          </div>
        )}
        {event.notes && (
          <div className="flex items-start gap-2 text-gray-600">
            <FileText size={14} className="text-rose-500 flex-shrink-0 mt-0.5" />
            <span className="line-clamp-2">{event.notes}</span>
          </div>
        )}
      </div>

      {event.schedule && (
        <div className="mt-3 pt-3 border-t border-gray-200/60">
          <p className="text-xs font-medium text-gray-500 mb-1">Schedule</p>
          <p className="text-xs text-gray-600 whitespace-pre-line">{event.schedule}</p>
        </div>
      )}
    </div>
  )
}

function EventForm({ form, onChange, onSubmit, onClose, isEdit }) {
  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <label className="label">Event Name *</label>
        <select className="input-field" value={form.name} onChange={e => onChange('name', e.target.value)} required>
          <option value="">Select event type</option>
          {EVENT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
        </select>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="label">Date</label>
          <input type="date" className="input-field" value={form.date} onChange={e => onChange('date', e.target.value)} />
        </div>
        <div>
          <label className="label">Guest Count</label>
          <input type="number" className="input-field" placeholder="e.g. 250" value={form.guest_count} onChange={e => onChange('guest_count', e.target.value)} />
        </div>
      </div>

      <div>
        <label className="label">Location / Venue</label>
        <input type="text" className="input-field" placeholder="e.g. Pearl Continental, Lahore" value={form.location} onChange={e => onChange('location', e.target.value)} />
      </div>

      <div>
        <label className="label">Notes</label>
        <textarea className="input-field resize-none" rows={3} placeholder="Any special notes for this event..." value={form.notes} onChange={e => onChange('notes', e.target.value)} />
      </div>

      <div>
        <label className="label">Schedule / Timetable</label>
        <textarea className="input-field resize-none" rows={3} placeholder="e.g.&#10;5:00 PM - Guests arrive&#10;7:00 PM - Dinner served&#10;9:00 PM - Rukhsati" value={form.schedule} onChange={e => onChange('schedule', e.target.value)} />
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
  const [modalOpen, setModalOpen] = useState(false)
  const [deleteId, setDeleteId] = useState(null)
  const [editingEvent, setEditingEvent] = useState(null)
  const [form, setForm] = useState(EMPTY_FORM)

  const setField = (k, v) => setForm(p => ({ ...p, [k]: v }))

  const openAdd = () => {
    setEditingEvent(null)
    setForm(EMPTY_FORM)
    setModalOpen(true)
  }

  const openEdit = (evt) => {
    setEditingEvent(evt)
    setForm({ ...EMPTY_FORM, ...evt })
    setModalOpen(true)
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (editingEvent) {
      updateEvent(editingEvent.id, form)
    } else {
      addEvent(form)
    }
    setModalOpen(false)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="section-title">Events 💍</h1>
          <p className="text-gray-500 text-sm mt-1">Manage all your wedding ceremonies and trips</p>
        </div>
        <button onClick={openAdd} className="btn-primary">
          <Plus size={16} /> Add Event
        </button>
      </div>

      {events.length === 0 ? (
        <EmptyState
          icon={CalendarDays}
          title="No events yet"
          description="Start by adding your first wedding event like Mehndi or Barat"
          action={<button onClick={openAdd} className="btn-primary">Add First Event</button>}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {events.map(evt => (
            <EventCard
              key={evt.id}
              event={evt}
              onEdit={openEdit}
              onDelete={setDeleteId}
            />
          ))}
        </div>
      )}

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingEvent ? `Edit ${editingEvent.name}` : 'Add New Event'}
      >
        <EventForm
          form={form}
          onChange={setField}
          onSubmit={handleSubmit}
          onClose={() => setModalOpen(false)}
          isEdit={!!editingEvent}
        />
      </Modal>

      <ConfirmDialog
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={() => deleteEvent(deleteId)}
        title="Delete Event?"
        message="This will permanently remove this event and cannot be undone."
      />
    </div>
  )
}
