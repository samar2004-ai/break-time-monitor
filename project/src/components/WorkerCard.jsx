import { formatDuration, getSessionStatus, TIME_LIMIT_MS } from '../context/VestiaireContext'

const statusCopy = {
  normal: 'OK',
  warning: 'Attention',
  critical: 'Depassement',
}

function WorkerCard({ session, now, onCheckout }) {
  const elapsedMs = now - session.entryTime
  const status = getSessionStatus(session, now)
  const progress = Math.min(100, Math.round((elapsedMs / TIME_LIMIT_MS) * 100))
  const remainingMs = TIME_LIMIT_MS - elapsedMs

  const shellClass = {
    normal: 'border-emerald-300 bg-white text-neutral-950 shadow-sm',
    warning: 'border-amber-400 bg-amber-50 text-neutral-950 shadow-md',
    critical: 'animate-critical border-red-500 bg-red-600 text-white shadow-xl',
  }[status]

  const timerClass = {
    normal: 'text-emerald-700',
    warning: 'text-amber-700',
    critical: 'text-white',
  }[status]

  const barClass = {
    normal: 'bg-emerald-500',
    warning: 'bg-amber-500',
    critical: 'bg-yellow-300',
  }[status]

  return (
    <article className={`relative rounded-lg border-2 p-5 transition ${shellClass}`}>
      <div className="mb-5 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className={`text-xs font-black uppercase tracking-[0.22em] ${status === 'critical' ? 'text-yellow-200' : 'text-neutral-500'}`}>
            {session.badge}
          </p>
          <h3 className="mt-1 truncate text-xl font-black">{session.name}</h3>
          <p className={`mt-1 text-sm font-semibold ${status === 'critical' ? 'text-red-50' : 'text-neutral-500'}`}>
            {session.team} - {session.role}
          </p>
        </div>
        <span
          className={`shrink-0 rounded px-2.5 py-1 text-xs font-black uppercase ${
            status === 'critical'
              ? 'bg-yellow-300 text-red-700'
              : status === 'warning'
                ? 'bg-amber-200 text-amber-900'
                : 'bg-emerald-100 text-emerald-800'
          }`}
        >
          {statusCopy[status]}
        </span>
      </div>

      <div className="mb-4">
        <p className={`font-mono text-5xl font-black leading-none ${timerClass}`}>{formatDuration(elapsedMs)}</p>
        <p className={`mt-2 text-sm font-bold ${status === 'critical' ? 'text-yellow-100' : 'text-neutral-500'}`}>
          {remainingMs >= 0 ? `${formatDuration(remainingMs)} restantes` : `${formatDuration(Math.abs(remainingMs))} de retard`}
        </p>
      </div>

      <div className={`mb-5 h-3 overflow-hidden rounded ${status === 'critical' ? 'bg-red-800' : 'bg-neutral-200'}`}>
        <div className={`h-full rounded ${barClass}`} style={{ width: `${progress}%` }} />
      </div>

      <button
        type="button"
        onClick={() => onCheckout(session.badge)}
        className={`w-full rounded px-4 py-3 text-sm font-black uppercase tracking-wide transition ${
          status === 'critical'
            ? 'bg-white text-red-700 hover:bg-yellow-100'
            : 'bg-neutral-950 text-white hover:bg-neutral-800'
        }`}
      >
        Sortie
      </button>
    </article>
  )
}

export default WorkerCard
