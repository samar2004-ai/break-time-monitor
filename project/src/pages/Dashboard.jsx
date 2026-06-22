import { Link } from 'react-router-dom'
import WorkerCard from '../components/WorkerCard'
import { formatDuration, getSessionStatus, TIME_LIMIT_MS } from '../context/VestiaireContext'
import { useNow } from '../hooks/useNow'
import { useVestiaire } from '../hooks/useVestiaire'

function Dashboard() {
  const now = useNow()
  const { sessions, events, checkoutBadge } = useVestiaire()
  const activeSessions = Object.values(sessions).sort((a, b) => a.entryTime - b.entryTime)

  const criticalSessions = activeSessions.filter((session) => getSessionStatus(session, now) === 'critical')
  const warningSessions = activeSessions.filter((session) => getSessionStatus(session, now) === 'warning')
  const averageDurationMs =
    activeSessions.length === 0
      ? 0
      : activeSessions.reduce((total, session) => total + (now - session.entryTime), 0) / activeSessions.length
  const nextLimitSession = activeSessions
    .filter((session) => now - session.entryTime < TIME_LIMIT_MS)
    .sort((a, b) => TIME_LIMIT_MS - (now - a.entryTime) - (TIME_LIMIT_MS - (now - b.entryTime)))[0]

  return (
    <div className="mx-auto max-w-7xl">
      {criticalSessions.length > 0 && (
        <div className="mb-6 rounded-lg border-2 border-red-500 bg-red-600 p-5 text-white shadow-lg">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.28em] text-yellow-200">Alerte critique</p>
              <h2 className="mt-1 text-2xl font-black">
                {criticalSessions.length} ouvrier{criticalSessions.length > 1 ? 's' : ''} au-dela de 10 minutes
              </h2>
            </div>
            <span className="rounded bg-yellow-300 px-4 py-3 text-sm font-black uppercase tracking-wide text-red-700">
              Intervention
            </span>
          </div>
        </div>
      )}

      <section className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Metric title="Actifs" value={activeSessions.length} tone="neutral" />
        <Metric title="Attention" value={warningSessions.length} tone="amber" />
        <Metric title="Critiques" value={criticalSessions.length} tone="red" />
        <Metric title="Temps moyen" value={formatDuration(averageDurationMs)} tone="emerald" />
      </section>

      <section className="mb-6 rounded-lg border border-neutral-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.28em] text-neutral-500">Controle temps reel</p>
            <h2 className="mt-2 text-3xl font-black text-neutral-950">Tableau de bord vestiaire</h2>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            {nextLimitSession && (
              <div className="rounded border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm">
                <span className="font-bold text-neutral-500">Prochain seuil </span>
                <span className="font-black text-neutral-950">
                  {nextLimitSession.name} dans {formatDuration(TIME_LIMIT_MS - (now - nextLimitSession.entryTime))}
                </span>
              </div>
            )}
            <Link
              to="/"
              className="rounded bg-neutral-950 px-4 py-3 text-center text-sm font-black uppercase tracking-wide text-white transition hover:bg-neutral-800"
            >
              Nouveau scan
            </Link>
          </div>
        </div>
      </section>

      {activeSessions.length === 0 ? (
        <section className="rounded-lg border-2 border-dashed border-neutral-200 bg-white p-12 text-center">
          <p className="text-3xl font-black text-neutral-950">Vestiaire vide</p>
          <p className="mt-2 text-sm font-semibold text-neutral-500">Aucune presence active pour le moment.</p>
          <Link
            to="/"
            className="mt-6 inline-flex rounded bg-emerald-600 px-5 py-3 text-sm font-black uppercase tracking-wide text-white transition hover:bg-emerald-700"
          >
            Scanner un badge
          </Link>
        </section>
      ) : (
        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {activeSessions.map((session) => (
            <WorkerCard key={session.badge} session={session} now={now} onCheckout={checkoutBadge} />
          ))}
        </section>
      )}

      <section className="mt-6 rounded-lg border border-neutral-200 bg-white p-5 shadow-sm">
        <div className="mb-4 flex items-center justify-between gap-3">
          <h2 className="text-lg font-black text-neutral-950">Historique recent</h2>
          <span className="rounded bg-neutral-100 px-3 py-1 text-xs font-black uppercase tracking-wide text-neutral-500">
            {events.length} mouvements
          </span>
        </div>
        <div className="overflow-hidden rounded border border-neutral-200">
          <table className="w-full min-w-[680px] border-collapse text-left text-sm">
            <thead className="bg-neutral-950 text-white">
              <tr>
                <th className="px-4 py-3 font-black uppercase tracking-wide">Heure</th>
                <th className="px-4 py-3 font-black uppercase tracking-wide">Badge</th>
                <th className="px-4 py-3 font-black uppercase tracking-wide">Ouvrier</th>
                <th className="px-4 py-3 font-black uppercase tracking-wide">Equipe</th>
                <th className="px-4 py-3 font-black uppercase tracking-wide">Etat</th>
                <th className="px-4 py-3 font-black uppercase tracking-wide">Duree</th>
              </tr>
            </thead>
            <tbody>
              {events.map((event) => (
                <tr key={event.id} className="border-t border-neutral-200 odd:bg-white even:bg-neutral-50">
                  <td className="px-4 py-3 font-mono font-bold text-neutral-600">
                    {new Date(event.timestamp).toLocaleTimeString('fr-FR', {
                      hour: '2-digit',
                      minute: '2-digit',
                      second: '2-digit',
                    })}
                  </td>
                  <td className="px-4 py-3 font-black text-neutral-950">{event.badge}</td>
                  <td className="px-4 py-3 font-bold text-neutral-800">{event.name}</td>
                  <td className="px-4 py-3 font-semibold text-neutral-600">{event.team}</td>
                  <td className="px-4 py-3">
                    <span className={`rounded px-2 py-1 text-xs font-black uppercase ${event.type === 'entry' ? 'bg-emerald-100 text-emerald-800' : 'bg-sky-100 text-sky-800'}`}>
                      {event.type === 'entry' ? 'Entree' : 'Sortie'}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-mono font-black text-neutral-700">
                    {event.durationMs ? formatDuration(event.durationMs) : '--:--'}
                  </td>
                </tr>
              ))}
              {events.length === 0 && (
                <tr>
                  <td colSpan="6" className="px-4 py-8 text-center font-semibold text-neutral-500">
                    Aucun historique.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}

function Metric({ title, value, tone }) {
  const toneClass = {
    neutral: 'border-neutral-200 bg-white text-neutral-950',
    amber: 'border-amber-200 bg-amber-50 text-amber-900',
    red: 'border-red-200 bg-red-50 text-red-700',
    emerald: 'border-emerald-200 bg-emerald-50 text-emerald-800',
  }[tone]

  return (
    <div className={`rounded-lg border p-5 shadow-sm ${toneClass}`}>
      <p className="text-xs font-black uppercase tracking-[0.22em] opacity-70">{title}</p>
      <p className="mt-3 text-4xl font-black">{value}</p>
    </div>
  )
}

export default Dashboard
