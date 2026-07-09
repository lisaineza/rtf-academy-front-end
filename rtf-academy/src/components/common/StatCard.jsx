export default function StatCard({ value, label, dark = true }) {
  return (
    <div className={`rounded-lg px-5 py-4 flex-1 min-w-[100px] text-center ${dark ? 'bg-navy text-white' : 'bg-white border border-gray-200'}`}>
      <p className="text-2xl font-bold">{value}</p>
      <p className={`text-xs mt-1 ${dark ? 'text-gray-300' : 'text-gray-500'}`}>{label}</p>
    </div>
  )
}
