const MAP = {
  confirmed:'status-confirmed', pending:'status-pending', declined:'status-declined',
  done:'status-done', in_progress:'status-in_progress', todo:'status-todo',
  high:'status-high', medium:'status-medium', low:'status-low',
  negotiating:'status-negotiating', cancelled:'status-cancelled',
  vendor_selected:'bg-purple-100 text-purple-800',
  deposit_due:'bg-orange-100 text-orange-800',
  deposit_paid:'bg-emerald-100 text-emerald-800',
  final_payment_due:'bg-red-100 text-red-800',
  completed:'status-done',
  shortlisted:'bg-blue-100 text-blue-800',
  ordered:'bg-amber-100 text-amber-800',
  tailoring_in_progress:'bg-purple-100 text-purple-800',
  ready_for_fitting:'bg-teal-100 text-teal-800',
  bride:'resp-bride', groom:'resp-groom', shared:'resp-shared',
  individual:'bg-gray-100 text-gray-700',
  upcoming:'bg-blue-100 text-blue-800',
}
const LABELS = {
  confirmed:'Confirmed', pending:'Pending', declined:'Declined',
  done:'Done', in_progress:'In Progress', todo:'To Do',
  high:'High', medium:'Medium', low:'Low',
  negotiating:'Negotiating', cancelled:'Cancelled',
  vendor_selected:'Selected', deposit_due:'Deposit Due', deposit_paid:'Deposit Paid',
  final_payment_due:'Final Due', completed:'Completed',
  shortlisted:'Shortlisted', ordered:'Ordered',
  tailoring_in_progress:'In Tailoring', ready_for_fitting:'Ready for Fitting',
  bride:'Bride Side', groom:'Groom Side', shared:'Shared', individual:'Individual',
  upcoming:'Upcoming',
}
export default function Badge({ status, label, className='' }) {
  return <span className={`badge ${MAP[status]||'bg-gray-100 text-gray-700'} ${className}`}>{label||LABELS[status]||status}</span>
}
