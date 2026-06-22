import { useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { formatDuration, getSessionStatus } from '../context/VestiaireContext'
import { useNow } from '../hooks/useNow'
import { useVestiaire } from '../hooks/useVestiaire'

function ScanPage() {
  const now = useNow()
  const inputRef = useRef(null)
  const [badgeInput, setBadgeInput] = useState('')
  const [lastScan, setLastScan] = useState(null)
  const { sessions, events, workerDirectory, scanBadge, checkoutBadge } = useVestiaire()

  const activeSessions = useMemo(
    () => Object.values(sessions).sort((a, b) => b.entryTime - a.entryTime),
    [sessions],
  )

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  const submitBadge = (badge) => {
    const result = scanBadge(badge)
    if (result.type === 'empty') return

    setBadgeInput('')
    setLastScan({ ...result, at: Date.now() })
    window.setTimeout(() => inputRef.current?.focus(), 0)
  }

  const handleSubmit = (event) => {
    event.preventDefault()
    submitBadge(badgeInput)
  }

  return (
    <div className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
      <section className="rounded-lg border border-neutral-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.28em] text-emerald-700">Selection & Scan</p>
            <h2 className="mt-2 text-3xl font-black text-neutral-950">Scan RFID</h2>
          </div>
          <span className="w-fit rounded border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm font-bold text-emerald-800">
            Lecteur pret
          </span>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <label className="block">
            <span className="mb-2 block text-sm font-black uppercase tracking-wide text-neutral-600">Badge</span>
            <input
              ref={inputRef}
              type="text"
              value={badgeInput}
              onChange={(event) => setBadgeInput(event.target.value)}
              placeholder="RFID-001"
              className="h-20 w-full rounded border-2 border-neutral-300 bg-neutral-50 px-5 text-center font-mono text-3xl font-black tracking-wide text-neutral-950 outline-none transition placeholder:text-neutral-300 focus:border-emerald-500 focus:bg-white"
              autoComplete="off"
              autoCapitalize="characters"
            />
          </label>

          <button
            type="submit"
            className="h-14 w-full rounded bg-neutral-950 px-5 text-sm font-black uppercase tracking-wide text-white transition hover:bg-emerald-700 focus:outline-none focus:ring-4 focus:ring-emerald-200"
          >
            Valider le scan
          </button>
        </form>

        {lastScan && (
          <div
            className={`mt-5 rounded border-2 p-4 ${
              lastScan.type === 'entry'
                ? 'border-emerald-300 bg-emerald-50 text-emerald-900'
                : 'border-sky-300 bg-sky-50 text-sky-900'
            }`}
          >
            <p className="text-xs font-black uppercase tracking-[0.22em]">
              {lastScan.type === 'entry' ? 'Entree enregistree' : 'Sortie enregistree'}
            </p>
            <p className="mt-1 text-xl font-black">{lastScan.session.name}</p>
            <p className="mt-1 text-sm font-semibold">
              {lastScan.session.badge}
              {lastScan.type === 'exit' && ` - duree ${formatDuration(lastScan.durationMs)}`}
            </p>
          </div>
        )}

        <div className="mt-6">
          <div className="mb-3 flex items-center justify-between gap-3">
            <h3 className="text-sm font-black uppercase tracking-wide text-neutral-600">Badges rapides</h3>
            <span className="text-xs font-bold text-neutral-400">Prototype</span>
          </div>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {workerDirectory.slice(0, 6).map((worker) => {
              const isActive = Boolean(sessions[worker.badge])

              return (
                <button
                  key={worker.badge}
                  type="button"
                  onClick={() => submitBadge(worker.badge)}
                  className={`rounded border px-3 py-3 text-left transition ${
                    isActive
                      ? 'border-emerald-300 bg-emerald-50 hover:bg-emerald-100'
                      : 'border-neutral-200 bg-white hover:border-neutral-400 hover:bg-neutral-50'
                  }`}
                >
                  <span className="block text-sm font-black text-neutral-950">{worker.name}</span>
                  <span className="mt-1 block text-xs font-bold uppercase tracking-wide text-neutral-500">
                    {worker.badge} - {isActive ? 'Actif' : worker.team}
                  </span>
                </button>
              )
            })}
          </div>
        </div>
      </section>

      <section className="rounded-lg border border-neutral-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.28em] text-neutral-500">Suivi visuel</p>
            <h2 className="mt-2 text-3xl font-black text-neutral-950">Actifs maintenant</h2>
          </div>
          <Link
            to="/dashboard"
            className="rounded bg-emerald-600 px-4 py-3 text-center text-sm font-black uppercase tracking-wide text-white transition hover:bg-emerald-700"
          >
            Ouvrir dashboard
          </Link>
        </div>

        {activeSessions.length === 0 ? (
          <div className="flex min-h-80 items-center justify-center rounded border-2 border-dashed border-neutral-200 bg-neutral-50 p-8 text-center">
            <div>
              <p className="text-2xl font-black text-neutral-950">Aucun badge actif</p>
              <p className="mt-2 text-sm font-semibold text-neutral-500">Le prochain scan lancera le chronometre.</p>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {activeSessions.map((session) => {
              const status = getSessionStatus(session, now)
              const statusClass = {
                normal: 'border-emerald-300 bg-emerald-50 text-emerald-900',
                warning: 'border-amber-300 bg-amber-50 text-amber-900',
                critical: 'border-red-500 bg-red-600 text-white',
              }[status]

              return (
                <div key={session.badge} className={`rounded border-2 p-4 ${statusClass}`}>
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="min-w-0">
                      <p className="truncate text-lg font-black">{session.name}</p>
                      <p className={`text-sm font-semibold ${status === 'critical' ? 'text-red-50' : 'text-neutral-600'}`}>
                        {session.badge} - {session.team}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-3xl font-black">{formatDuration(now - session.entryTime)}</span>
                      <button
                        type="button"
                        onClick={() => checkoutBadge(session.badge)}
                        className={`rounded px-4 py-2 text-sm font-black uppercase ${
                          status === 'critical'
                            ? 'bg-white text-red-700 hover:bg-yellow-100'
                            : 'bg-neutral-950 text-white hover:bg-neutral-800'
                        }`}
                      >
                        Sortie
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        <div className="mt-6 border-t border-neutral-200 pt-5">
          <h3 className="mb-3 text-sm font-black uppercase tracking-wide text-neutral-600">Derniers mouvements</h3>
          <div className="space-y-2">
            {events.slice(0, 5).map((event) => (
              <div key={event.id} className="grid grid-cols-[5.5rem_1fr_auto] items-center gap-3 rounded bg-neutral-50 px-3 py-2 text-sm">
                <span className="font-mono font-bold text-neutral-500">
                  {new Date(event.timestamp).toLocaleTimeString('fr-FR', {
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit',
                  })}
                </span>
                <span className="truncate font-bold text-neutral-900">{event.name}</span>
                <span className={`rounded px-2 py-1 text-xs font-black uppercase ${event.type === 'entry' ? 'bg-emerald-100 text-emerald-800' : 'bg-sky-100 text-sky-800'}`}>
                  {event.type === 'entry' ? 'Entree' : 'Sortie'}
                </span>
              </div>
            ))}
            {events.length === 0 && <p className="rounded bg-neutral-50 px-3 py-4 text-sm font-semibold text-neutral-500">Aucun mouvement.</p>}
          </div>
        </div>
      </section>
    </div>
  )
}

export default ScanPage
