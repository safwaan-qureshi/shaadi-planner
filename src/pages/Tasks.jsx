import { useState } from 'react'
import { useApp } from '../context/AppContext'
import { Plus, Edit2, Trash2, CheckSquare, Circle, Clock, Search } from 'lucide-react'
import Modal from '../components/ui/Modal'
import ConfirmDialog from '../components/ui/ConfirmDialog'
import EmptyState from '../components/ui/EmptyState'
import Badge from '../components/ui/Badge'
import { format, parseISO, isPast } from 'date-fns'

const STATUSES = [
  { value: 'todo', label: 'To Do', icon: Circle, color: 'text-gray-400' },
  { value: 'in_progress', label: 'In Progress', icon: Clock, color: 'text-blue-500' },
  { value: 'done', label: 'Done', icon: CheckSquare, color: 'text-emerald-500' },
]

const PRIORITIES = [
  { value: 'high', label: 'High' },
  { value: 'medium', label: 'Medium' },
  { value: 'low', label: 'Low' },
]

const EMPTY_FORM = {
  title: '', assigned_to: '', deadline: '',
  status: 'todo', priority: 'medium', event_id: '', notes: '',
}

function TaskForm({ form, onChange, onSubmit, onClose, isEdit, familyMembers, events }) {
  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <label className="label">Task Title *</label>
        <input type="text" className="input-field" placeholder="e.g. Book photographer" value={form.title} onChange={e => onChange('title', e.target.value)} required />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="label">Assigned To</label>
          <input
            type="text"
            className="input-field"
            placeholder="Person's name"
            value={form.assigned_to}
            onChange={e => onChange('assigned_to', e.target.value)}
            list="family-list"
          />
          <datalist id="family-list">
            {familyMembers.map(m => (
              <option key={m.id} value={`${m.name}`} />
            ))}
          </datalist>
        </div>
        <div>
          <label className="label">Deadline</label>
          <input type="date" className="input-field" value={form.deadline} onChange={e => onChange('deadline', e.target.value)} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="label">Status</label>
          <select className="input-field" value={form.status} onChange={e => onChange('status', e.target.value)}>
            {STATUSES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
          </select>
        </div>
        <div>
          <label className="label">Priority</label>
          <select className="input-field" value={form.priority} onChange={e => onChange('priority', e.target.value)}>
            {PRIORITIES.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
          </select>
        </div>
      </div>

      <div>
        <label className="label">Related Event</label>
        <select className="input-field" value={form.event_id} onChange={e => onChange('event_id', e.target.value)}>
          <option value="">General / All Events</option>
          {events.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
        </select>
      </div>

      <div className="flex gap-3 pt-2">
        <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancel</button>
        <button type="submit" className="btn-primary flex-1 justify-center">
          {isEdit ? 'Update Task' : 'Add Task'}
        </button>
      </div>
    </form>
  )
}

function TaskRow({ task, onEdit, onDelete, onToggle, events }) {
  const StatusIcon = STATUSES.find(s => s.value === task.status)?.icon || Circle
  const statusColor = STATUSES.find(s => s.value === task.status)?.color || 'text-gray-400'
  const eventName = events.find(e => e.id === task.event_id)?.name

  let deadlineStr = ''
  let isOverdue = false
  try {
    if (task.deadline) {
      deadlineStr = format(parseISO(task.deadline), 'dd MMM')
      isOverdue = task.status !== 'done' && isPast(parseISO(task.deadline))
    }
  } catch {}

  return (
    <div className={`flex items-center gap-3 p-3.5 rounded-xl border transition-all duration-200 hover:shadow-sm ${task.status === 'done' ? 'bg-gray-50/50 border-gray-100 opacity-75' : 'bg-white border-rose-100 hover:border-rose-200'}`}>
      <button
        onClick={() => onToggle(task.id, task.status === 'done' ? 'todo' : 'done')}
        className={`flex-shrink-0 ${statusColor} hover:scale-110 transition-transform`}
      >
        <StatusIcon size={20} className={task.status === 'done' ? 'fill-emerald-500 text-emerald-500' : ''} />
      </button>

      <div className="flex-1 min-w-0">
        <p className={`font-medium text-sm ${task.status === 'done' ? 'line-through text-gray-400' : 'text-gray-900'}`}>
          {task.title}
        </p>
        <div className="flex items-center gap-2 mt-0.5 flex-wrap">
          {task.assigned_to && (
            <span className="text-xs text-gray-500">{task.assigned_to}</span>
          )}
          {eventName && (
            <span className="text-xs text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded">{eventName}</span>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2 flex-shrink-0">
        {deadlineStr && (
          <span className={`text-xs px-2 py-0.5 rounded-full ${isOverdue ? 'bg-red-100 text-red-700 font-medium' : 'bg-gray-100 text-gray-600'}`}>
            {isOverdue ? '⚠️ ' : ''}{deadlineStr}
          </span>
        )}
        <Badge status={task.priority} />
        <button onClick={() => onEdit(task)} className="btn-ghost py-1 px-1.5"><Edit2 size={13} /></button>
        <button onClick={() => onDelete(task.id)} className="p-1.5 rounded hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors"><Trash2 size={13} /></button>
      </div>
    </div>
  )
}

export default function Tasks() {
  const { tasks, addTask, updateTask, deleteTask, events, familyMembers } = useApp()
  const [modalOpen, setModalOpen] = useState(false)
  const [deleteId, setDeleteId] = useState(null)
  const [editingTask, setEditingTask] = useState(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [filterPriority, setFilterPriority] = useState('')

  const setField = (k, v) => setForm(p => ({ ...p, [k]: v }))
  const openAdd = () => { setEditingTask(null); setForm(EMPTY_FORM); setModalOpen(true) }
  const openEdit = (t) => { setEditingTask(t); setForm({ ...EMPTY_FORM, ...t }); setModalOpen(true) }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const data = {
      title:       form.title,
      assigned_to: form.assigned_to || null,
      deadline:    form.deadline    || null,
      status:      form.status      || 'todo',
      priority:    form.priority    || 'medium',
      event_id:    form.event_id    || null,
      notes:       form.notes       || null,
    }
    if (editingTask) await updateTask(editingTask.id, data)
    else             await addTask(data)
    setModalOpen(false)
  }

  const handleToggle = (id, newStatus) => updateTask(id, { status: newStatus })

  const filtered = tasks.filter(t => {
    const matchSearch = !search || t.title.toLowerCase().includes(search.toLowerCase()) || (t.assigned_to || '').toLowerCase().includes(search.toLowerCase())
    const matchStatus = !filterStatus || t.status === filterStatus
    const matchPriority = !filterPriority || t.priority === filterPriority
    return matchSearch && matchStatus && matchPriority
  })

  const byStatus = {
    todo: filtered.filter(t => t.status === 'todo'),
    in_progress: filtered.filter(t => t.status === 'in_progress'),
    done: filtered.filter(t => t.status === 'done'),
  }

  const completionPct = tasks.length > 0 ? Math.round((tasks.filter(t => t.status === 'done').length / tasks.length) * 100) : 0

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="section-title">Tasks ✅</h1>
          <p className="text-gray-500 text-sm mt-1">Track all wedding planning to-dos</p>
        </div>
        <button onClick={openAdd} className="btn-primary">
          <Plus size={16} /> Add Task
        </button>
      </div>

      {/* Progress */}
      <div className="card border border-rose-100 py-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">Overall Progress</span>
          <span className="font-display text-lg font-bold text-gray-900">{completionPct}%</span>
        </div>
        <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-rose-500 to-rose-700 rounded-full transition-all duration-700"
            style={{ width: `${completionPct}%` }}
          />
        </div>
        <div className="flex gap-4 mt-3 text-xs text-gray-500">
          <span>📋 {tasks.filter(t => t.status === 'todo').length} to do</span>
          <span>⏳ {tasks.filter(t => t.status === 'in_progress').length} in progress</span>
          <span>✅ {tasks.filter(t => t.status === 'done').length} done</span>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input type="text" className="input-field pl-9" placeholder="Search tasks..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <select className="input-field sm:w-40" value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
          <option value="">All Statuses</option>
          {STATUSES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
        </select>
        <select className="input-field sm:w-36" value={filterPriority} onChange={e => setFilterPriority(e.target.value)}>
          <option value="">All Priorities</option>
          {PRIORITIES.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
        </select>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={CheckSquare}
          title={tasks.length === 0 ? "No tasks yet" : "No tasks match your search"}
          description={tasks.length === 0 ? "Add tasks like 'Book venue', 'Order lehenga', 'Send invitations'" : "Try adjusting your filters"}
          action={tasks.length === 0 ? <button onClick={openAdd} className="btn-primary">Add First Task</button> : null}
        />
      ) : (
        <div className="space-y-6">
          {[
            { key: 'in_progress', label: '⏳ In Progress', items: byStatus.in_progress },
            { key: 'todo', label: '📋 To Do', items: byStatus.todo },
            { key: 'done', label: '✅ Done', items: byStatus.done },
          ].filter(g => g.items.length > 0).map(group => (
            <div key={group.key}>
              <h3 className="text-sm font-semibold text-gray-600 mb-2">{group.label} ({group.items.length})</h3>
              <div className="space-y-2">
                {group.items.map(task => (
                  <TaskRow
                    key={task.id}
                    task={task}
                    onEdit={openEdit}
                    onDelete={setDeleteId}
                    onToggle={handleToggle}
                    events={events}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editingTask ? 'Edit Task' : 'Add New Task'}>
        <TaskForm form={form} onChange={setField} onSubmit={handleSubmit} onClose={() => setModalOpen(false)} isEdit={!!editingTask} familyMembers={familyMembers} events={events} />
      </Modal>

      <ConfirmDialog open={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={() => deleteTask(deleteId)} title="Delete Task?" message="This will permanently remove this task." />
    </div>
  )
}
