export default function ProgressBar({ percent, color = 'bg-green-600', height = 'h-2', showLabel = false }) {
  const pct = Math.max(0, Math.min(100, percent))
  return (
    <div className="w-full">
      <div className={`w-full ${height} rounded-full bg-gray-200 overflow-hidden`}>
        <div
          className={`${height} ${color} rounded-full transition-all duration-500`}
          style={{ width: `${pct}%` }}
        />
      </div>
      {showLabel && <p className="text-xs text-gray-500 mt-1">{pct}%</p>}
    </div>
  )
}
