import Modal from './Modal'
import { AlertTriangle } from 'lucide-react'

export default function ConfirmDialog({ open, onClose, onConfirm, title = 'Are you sure?', message }) {
  return (
    <Modal open={open} onClose={onClose} title="" size="sm">
      <div className="text-center py-2">
        <div className="w-12 h-12 bg-rose-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <AlertTriangle size={24} className="text-rose-600" />
        </div>
        <h3 className="font-display text-lg font-semibold text-gray-900 mb-2">{title}</h3>
        {message && <p className="text-sm text-gray-600 mb-6">{message}</p>}
        <div className="flex gap-3 justify-center">
          <button onClick={onClose} className="btn-secondary">Cancel</button>
          <button
            onClick={() => { onConfirm(); onClose() }}
            className="bg-rose-600 hover:bg-rose-700 text-white px-4 py-2.5 rounded-xl text-sm font-medium transition-colors"
          >
            Delete
          </button>
        </div>
      </div>
    </Modal>
  )
}
