export default function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      {Icon && (
        <div className="w-14 h-14 bg-rose-50 rounded-2xl flex items-center justify-center mb-4">
          <Icon size={28} className="text-rose-400" />
        </div>
      )}
      <h3 className="font-display text-lg font-semibold text-gray-700 mb-1">{title}</h3>
      {description && <p className="text-sm text-gray-500 max-w-xs mb-5">{description}</p>}
      {action && action}
    </div>
  )
}
