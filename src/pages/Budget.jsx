import { useState } from 'react'
import { useApp } from '../context/AppContext'
import { Plus, Edit2, Trash2, Wallet, TrendingUp, Settings } from 'lucide-react'
import Modal from '../components/ui/Modal'
import ConfirmDialog from '../components/ui/ConfirmDialog'
import EmptyState from '../components/ui/EmptyState'

const CATEGORIES = [
  { value: 'venue', label: 'Venue', color: 'bg-purple-100 text-purple-800' },
  { value: 'catering', label: 'Catering', color: 'bg-orange-100 text-orange-800' },
  { value: 'photography', label: 'Photography', color: 'bg-blue-100 text-blue-800' },
  { value: 'clothing', label: 'Clothing', color: 'bg-pink-100 text-pink-800' },
  { value: 'beauty', label: 'Beauty', color: 'bg-rose-100 text-rose-800' },
  { value: 'decor', label: 'Decor', color: 'bg-green-100 text-green-800' },
  { value: 'stationery', label: 'Stationery', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'travel', label: 'Travel', color: 'bg-teal-100 text-teal-800' },
  { value: 'entertainment', label: 'Entertainment', color: 'bg-indigo-100 text-indigo-800' },
  { value: 'other', label: 'Other', color: 'bg-gray-100 text-gray-800' },
]

const EMPTY_FORM = { title: '', amount: '', category: '', paid: false, notes: '', event_id: '' }

function BudgetSetModal({ open, onClose, budget, setBudget }) {
  const [val, setVal] = useState(budget)
  return (
    <Modal open={open} onClose={onClose} title="Set Total Budget" size="sm">
      <div className="space-y-4">
        <div>
          <label className="label">Total Wedding Budget (PKR)</label>
          <input
            type="number"
            className="input-field text-lg font-semibold"
            placeholder="e.g. 5000000"
            value={val}
            onChange={e => setVal(Number(e.target.value))}
          />
          <p className="text-xs text-gray-400 mt-1">= PKR {Number(val).toLocaleString()}</p>
        </div>
        <div className="flex gap-3">
          <button onClick={onClose} className="btn-secondary flex-1">Cancel</button>
          <button onClick={() => { setBudget(Number(val)); onClose() }} className="btn-primary flex-1 justify-center">
            Save Budget
          </button>
        </div>
      </div>
    </Modal>
  )
}

function ExpenseForm({ form, onChange, onSubmit, onClose, isEdit, events }) {
  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <label className="label">Expense Title *</label>
        <input type="text" className="input-field" placeholder="e.g. Venue deposit" value={form.title} onChange={e => onChange('title', e.target.value)} required />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="label">Amount (PKR) *</label>
          <input type="number" className="input-field" placeholder="e.g. 150000" value={form.amount} onChange={e => onChange('amount', e.target.value)} required />
        </div>
        <div>
          <label className="label">Category</label>
          <select className="input-field" value={form.category} onChange={e => onChange('category', e.target.value)}>
            <option value="">Select category</option>
            {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
          </select>
        </div>
      </div>

      <div>
        <label className="label">Related Event</label>
        <select className="input-field" value={form.event_id} onChange={e => onChange('event_id', e.target.value)}>
          <option value="">All Events / General</option>
          {events.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
        </select>
      </div>

      <div>
        <label className="label">Notes</label>
        <input type="text" className="input-field" placeholder="Optional notes..." value={form.notes} onChange={e => onChange('notes', e.target.value)} />
      </div>

      <label className="flex items-center gap-3 cursor-pointer">
        <input type="checkbox" className="w-4 h-4 accent-rose-600 rounded" checked={form.paid} onChange={e => onChange('paid', e.target.checked)} />
        <span className="text-sm font-medium text-gray-700">Mark as Paid</span>
      </label>

      <div className="flex gap-3 pt-2">
        <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancel</button>
        <button type="submit" className="btn-primary flex-1 justify-center">
          {isEdit ? 'Update Expense' : 'Add Expense'}
        </button>
      </div>
    </form>
  )
}

export default function Budget() {
  const { expenses, addExpense, updateExpense, deleteExpense, budget, setBudget, events } = useApp()
  const [modalOpen, setModalOpen] = useState(false)
  const [budgetModalOpen, setBudgetModalOpen] = useState(false)
  const [deleteId, setDeleteId] = useState(null)
  const [editingExpense, setEditingExpense] = useState(null)
  const [form, setForm] = useState(EMPTY_FORM)

  const setField = (k, v) => setForm(p => ({ ...p, [k]: v }))

  const openAdd = () => { setEditingExpense(null); setForm(EMPTY_FORM); setModalOpen(true) }
  const openEdit = (e) => { setEditingExpense(e); setForm({ ...EMPTY_FORM, ...e }); setModalOpen(true) }

  const handleSubmit = (ev) => {
    ev.preventDefault()
    const data = { ...form, amount: Number(form.amount) || 0 }
    if (editingExpense) updateExpense(editingExpense.id, data)
    else addExpense(data)
    setModalOpen(false)
  }

  const totalSpent = expenses.reduce((s, e) => s + (e.amount || 0), 0)
  const totalPaid = expenses.filter(e => e.paid).reduce((s, e) => s + (e.amount || 0), 0)
  const remaining = budget - totalSpent
  const pct = budget > 0 ? Math.min(Math.round((totalSpent / budget) * 100), 100) : 0

  // By category
  const byCategory = CATEGORIES.map(cat => {
    const total = expenses.filter(e => e.category === cat.value).reduce((s, e) => s + (e.amount || 0), 0)
    return { ...cat, total }
  }).filter(c => c.total > 0).sort((a, b) => b.total - a.total)

  const getCatColor = (cat) => CATEGORIES.find(c => c.value === cat)?.color || 'bg-gray-100 text-gray-700'

  const getEventName = (id) => events.find(e => e.id === id)?.name || ''

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="section-title">Budget Tracker 💰</h1>
          <p className="text-gray-500 text-sm mt-1">Track all wedding expenses and deposits</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setBudgetModalOpen(true)} className="btn-secondary">
            <Settings size={15} /> Set Budget
          </button>
          <button onClick={openAdd} className="btn-primary">
            <Plus size={16} /> Add Expense
          </button>
        </div>
      </div>

      {/* Budget overview */}
      <div className="card border border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          {[
            { label: 'Total Budget', value: budget, color: 'text-gray-900' },
            { label: 'Total Spent', value: totalSpent, color: 'text-rose-700' },
            { label: 'Paid', value: totalPaid, color: 'text-emerald-700' },
            { label: 'Remaining', value: remaining, color: remaining < 0 ? 'text-red-700 font-bold' : 'text-emerald-700' },
          ].map(s => (
            <div key={s.label}>
              <p className="text-xs text-gray-500 mb-1">{s.label}</p>
              <p className={`font-display text-xl font-bold ${s.color}`}>
                PKR {Math.abs(s.value).toLocaleString()}
                {s.value < 0 && <span className="text-sm font-normal"> over budget!</span>}
              </p>
            </div>
          ))}
        </div>

        {/* Progress bar */}
        <div>
          <div className="flex justify-between text-xs text-gray-500 mb-1.5">
            <span>{pct}% of budget used</span>
            <span>PKR {totalSpent.toLocaleString()} / {budget.toLocaleString()}</span>
          </div>
          <div className="h-3 bg-white/60 rounded-full overflow-hidden border border-amber-200">
            <div
              className={`h-full rounded-full transition-all duration-700 ${pct > 90 ? 'bg-red-500' : pct > 70 ? 'bg-amber-500' : 'bg-emerald-500'}`}
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Expenses table */}
        <div className="lg:col-span-2">
          {expenses.length === 0 ? (
            <EmptyState
              icon={Wallet}
              title="No expenses yet"
              description="Start tracking wedding expenses to monitor your budget"
              action={<button onClick={openAdd} className="btn-primary">Add First Expense</button>}
            />
          ) : (
            <div className="card border border-rose-100 p-0 overflow-hidden">
              <div className="px-4 py-3 border-b border-rose-100 flex items-center justify-between">
                <h3 className="font-display font-semibold text-gray-900">All Expenses ({expenses.length})</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-rose-50/50 border-b border-rose-100">
                      {['Expense', 'Category', 'Event', 'Amount', 'Paid', ''].map(h => (
                        <th key={h} className="table-cell text-left text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {expenses.map(e => (
                      <tr key={e.id} className="hover:bg-rose-50/20 transition-colors">
                        <td className="table-cell font-medium text-gray-900">{e.title}</td>
                        <td className="table-cell">
                          {e.category
                            ? <span className={`badge ${getCatColor(e.category)}`}>{CATEGORIES.find(c => c.value === e.category)?.label || e.category}</span>
                            : <span className="text-gray-400 text-xs">—</span>
                          }
                        </td>
                        <td className="table-cell text-gray-600 text-sm whitespace-nowrap">{getEventName(e.event_id) || '—'}</td>
                        <td className="table-cell font-semibold text-gray-900 whitespace-nowrap">PKR {(e.amount || 0).toLocaleString()}</td>
                        <td className="table-cell">
                          <span className={`badge ${e.paid ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100 text-gray-600'}`}>
                            {e.paid ? 'Paid' : 'Unpaid'}
                          </span>
                        </td>
                        <td className="table-cell">
                          <div className="flex gap-1">
                            <button onClick={() => openEdit(e)} className="btn-ghost py-1.5 px-2"><Edit2 size={14} /></button>
                            <button onClick={() => setDeleteId(e.id)} className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors"><Trash2 size={14} /></button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Category breakdown */}
        <div className="card border border-rose-100">
          <h3 className="font-display font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <TrendingUp size={18} className="text-rose-600" />
            By Category
          </h3>
          {byCategory.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-6">No expenses to show</p>
          ) : (
            <div className="space-y-3">
              {byCategory.map(cat => {
                const pct = totalSpent > 0 ? Math.round((cat.total / totalSpent) * 100) : 0
                return (
                  <div key={cat.value}>
                    <div className="flex items-center justify-between mb-1">
                      <span className={`badge ${cat.color} text-xs`}>{cat.label}</span>
                      <span className="text-sm font-semibold text-gray-900">PKR {(cat.total / 1000).toFixed(0)}k</span>
                    </div>
                    <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-rose-400 rounded-full" style={{ width: `${pct}%` }} />
                    </div>
                    <p className="text-xs text-gray-400 mt-0.5">{pct}% of total</p>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editingExpense ? 'Edit Expense' : 'Add Expense'}>
        <ExpenseForm form={form} onChange={setField} onSubmit={handleSubmit} onClose={() => setModalOpen(false)} isEdit={!!editingExpense} events={events} />
      </Modal>

      <BudgetSetModal open={budgetModalOpen} onClose={() => setBudgetModalOpen(false)} budget={budget} setBudget={setBudget} />

      <ConfirmDialog open={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={() => deleteExpense(deleteId)} title="Delete Expense?" message="This will permanently remove this expense." />
    </div>
  )
}
