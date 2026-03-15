import { useState } from 'react'
import { useApp } from '../context/AppContext'
import { Plus, Edit2, Trash2, UsersRound, Phone, Mail, Crown, Briefcase, Heart, DollarSign, Users } from 'lucide-react'
import Modal from '../components/ui/Modal'
import ConfirmDialog from '../components/ui/ConfirmDialog'
import EmptyState from '../components/ui/EmptyState'

const ROLES = [
  { value: 'bride', label: 'Bride', icon: Heart, color: 'bg-rose-100 text-rose-800', emoji: '👰' },
  { value: 'groom', label: 'Groom', icon: Crown, color: 'bg-amber-100 text-amber-800', emoji: '🤵' },
  { value: 'planner', label: 'Planner', icon: Briefcase, color: 'bg-blue-100 text-blue-800', emoji: '📋' },
  { value: 'family_coordinator', label: 'Family Coordinator', icon: Users, color: 'bg-green-100 text-green-800', emoji: '🤝' },
  { value: 'finance_manager', label: 'Finance Manager', icon: DollarSign, color: 'bg-purple-100 text-purple-800', emoji: '💰' },
  { value: 'family', label: 'Family Member', icon: UsersRound, color: 'bg-gray-100 text-gray-800', emoji: '👨‍👩‍👧' },
]

const EMPTY_FORM = {
  name: '', role: 'family', email: '', phone: '', notes: '',
}

function MemberForm({ form, onChange, onSubmit, onClose, isEdit }) {
  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <label className="label">Full Name *</label>
        <input type="text" className="input-field" placeholder="e.g. Zara Ahmed" value={form.name} onChange={e => onChange('name', e.target.value)} required />
      </div>

      <div>
        <label className="label">Role *</label>
        <div className="grid grid-cols-2 gap-2">
          {ROLES.map(r => (
            <label
              key={r.value}
              className={`flex items-center gap-2 p-2.5 rounded-xl border cursor-pointer transition-colors ${form.role === r.value ? 'bg-rose-50 border-rose-300' : 'border-gray-200 hover:bg-rose-50/50'}`}
            >
              <input
                type="radio"
                name="role"
                value={r.value}
                checked={form.role === r.value}
                onChange={e => onChange('role', e.target.value)}
                className="accent-rose-600"
              />
              <span className="text-sm">{r.emoji}</span>
              <span className="text-sm text-gray-700">{r.label}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="label">Phone</label>
          <input type="tel" className="input-field" placeholder="+92 300 1234567" value={form.phone} onChange={e => onChange('phone', e.target.value)} />
        </div>
        <div>
          <label className="label">Email</label>
          <input type="email" className="input-field" placeholder="member@email.com" value={form.email} onChange={e => onChange('email', e.target.value)} />
        </div>
      </div>

      <div>
        <label className="label">Notes</label>
        <textarea className="input-field resize-none" rows={2} placeholder="e.g. Flying from London, handles Mehndi coordination..." value={form.notes} onChange={e => onChange('notes', e.target.value)} />
      </div>

      <div className="flex gap-3 pt-2">
        <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancel</button>
        <button type="submit" className="btn-primary flex-1 justify-center">
          {isEdit ? 'Update Member' : 'Add Member'}
        </button>
      </div>
    </form>
  )
}

function MemberCard({ member, tasks, onEdit, onDelete }) {
  const role = ROLES.find(r => r.value === member.role) || ROLES[ROLES.length - 1]
  const assignedTasks = tasks.filter(t => t.assigned_to && t.assigned_to.toLowerCase().includes(member.name.toLowerCase()))
  const doneTasks = assignedTasks.filter(t => t.status === 'done').length

  return (
    <div className="card border border-rose-100 hover:shadow-md transition-all duration-200">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-rose-100 flex items-center justify-center text-xl flex-shrink-0">
            {role.emoji}
          </div>
          <div>
            <h3 className="font-display font-semibold text-gray-900">{member.name}</h3>
            <span className={`badge ${role.color} mt-0.5`}>{role.label}</span>
          </div>
        </div>
        <div className="flex gap-1">
          <button onClick={() => onEdit(member)} className="btn-ghost py-1.5 px-2"><Edit2 size={14} /></button>
          <button onClick={() => onDelete(member.id)} className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors"><Trash2 size={14} /></button>
        </div>
      </div>

      <div className="space-y-1.5 text-sm">
        {member.phone && (
          <a href={`tel:${member.phone}`} className="flex items-center gap-2 text-gray-600 hover:text-rose-600 transition-colors">
            <Phone size={13} className="text-rose-400" />{member.phone}
          </a>
        )}
        {member.email && (
          <a href={`mailto:${member.email}`} className="flex items-center gap-2 text-gray-600 hover:text-rose-600 transition-colors">
            <Mail size={13} className="text-rose-400" />{member.email}
          </a>
        )}
        {member.notes && (
          <p className="text-gray-500 text-xs mt-2 italic">{member.notes}</p>
        )}
      </div>

      {assignedTasks.length > 0 && (
        <div className="mt-3 pt-3 border-t border-gray-100">
          <div className="flex items-center justify-between mb-1.5">
            <p className="text-xs font-medium text-gray-600">Assigned Tasks</p>
            <p className="text-xs text-gray-500">{doneTasks}/{assignedTasks.length} done</p>
          </div>
          <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-rose-500 rounded-full"
              style={{ width: assignedTasks.length > 0 ? `${(doneTasks / assignedTasks.length) * 100}%` : '0%' }}
            />
          </div>
          <div className="mt-2 space-y-1">
            {assignedTasks.slice(0, 3).map(t => (
              <div key={t.id} className="flex items-center gap-2">
                <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${t.status === 'done' ? 'bg-emerald-500' : t.status === 'in_progress' ? 'bg-blue-500' : 'bg-gray-300'}`} />
                <span className={`text-xs ${t.status === 'done' ? 'line-through text-gray-400' : 'text-gray-700'}`}>{t.title}</span>
              </div>
            ))}
            {assignedTasks.length > 3 && (
              <p className="text-xs text-gray-400">+{assignedTasks.length - 3} more tasks</p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default function Family() {
  const { familyMembers, addFamilyMember, updateFamilyMember, deleteFamilyMember, tasks } = useApp()
  const [modalOpen, setModalOpen] = useState(false)
  const [deleteId, setDeleteId] = useState(null)
  const [editingMember, setEditingMember] = useState(null)
  const [form, setForm] = useState(EMPTY_FORM)

  const setField = (k, v) => setForm(p => ({ ...p, [k]: v }))
  const openAdd = () => { setEditingMember(null); setForm(EMPTY_FORM); setModalOpen(true) }
  const openEdit = (m) => { setEditingMember(m); setForm({ ...EMPTY_FORM, ...m }); setModalOpen(true) }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (editingMember) updateFamilyMember(editingMember.id, form)
    else addFamilyMember(form)
    setModalOpen(false)
  }

  // Group by role
  const grouped = ROLES.map(role => ({
    ...role,
    members: familyMembers.filter(m => m.role === role.value),
  })).filter(g => g.members.length > 0)

  const totalTasks = tasks.length
  const assignedTasks = tasks.filter(t => t.assigned_to).length

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="section-title">Family Team 👨‍👩‍👧</h1>
          <p className="text-gray-500 text-sm mt-1">Collaborate with family members on wedding planning</p>
        </div>
        <button onClick={openAdd} className="btn-primary">
          <Plus size={16} /> Add Member
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Team Members', value: familyMembers.length, emoji: '👥' },
          { label: 'Roles Filled', value: new Set(familyMembers.map(m => m.role)).size, emoji: '🎭' },
          { label: 'Tasks Assigned', value: assignedTasks, emoji: '📋' },
          { label: 'Tasks Done', value: tasks.filter(t => t.status === 'done').length, emoji: '✅' },
        ].map(s => (
          <div key={s.label} className="card border border-rose-100 py-3 px-4">
            <p className="text-xl mb-1">{s.emoji}</p>
            <p className="font-display text-xl font-bold text-gray-900">{s.value}</p>
            <p className="text-xs text-gray-500">{s.label}</p>
          </div>
        ))}
      </div>

      {familyMembers.length === 0 ? (
        <EmptyState
          icon={UsersRound}
          title="No family members yet"
          description="Add family members to collaborate on wedding planning and assign tasks"
          action={<button onClick={openAdd} className="btn-primary">Add First Member</button>}
        />
      ) : (
        <div className="space-y-6">
          {grouped.map(group => (
            <div key={group.value}>
              <h3 className="flex items-center gap-2 text-sm font-semibold text-gray-600 mb-3">
                <span>{group.emoji}</span>
                <span>{group.label}</span>
                <span className="text-gray-400">({group.members.length})</span>
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {group.members.map(member => (
                  <MemberCard
                    key={member.id}
                    member={member}
                    tasks={tasks}
                    onEdit={openEdit}
                    onDelete={setDeleteId}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editingMember ? 'Edit Member' : 'Add Family Member'} size="lg">
        <MemberForm form={form} onChange={setField} onSubmit={handleSubmit} onClose={() => setModalOpen(false)} isEdit={!!editingMember} />
      </Modal>

      <ConfirmDialog open={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={() => deleteFamilyMember(deleteId)} title="Remove Member?" message="This will remove this person from the planning team." />
    </div>
  )
}
