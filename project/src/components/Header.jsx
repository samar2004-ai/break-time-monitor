import { NavLink } from 'react-router-dom'
import { getSessionStatus } from '../context/VestiaireContext'
import { useNow } from '../hooks/useNow'
import { useVestiaire } from '../hooks/useVestiaire'

function Header() {
  const now = useNow()
  const { sessions, soundEnabled, setSoundEnabled } = useVestiaire()
  const activeSessions = Object.values(sessions)
  const criticalCount = activeSessions.filter((session) => getSessionStatus(session, now) === 'critical').length

  const navClass = ({ isActive }) =>
    `rounded px-3 py-2 text-sm font-semibold transition ${
      isActive ? 'bg-neutral-900 text-white' : 'text-neutral-600 hover:bg-neutral-100 hover:text-neutral-950'
    }`

  return (
    <header className="sticky top-0 z-30 border-b border-neutral-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-3 sm:px-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded bg-neutral-950 text-sm font-black tracking-wide text-white">
            CV
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.28em] text-emerald-700">Concorde</p>
            <h1 className="text-xl font-black text-neutral-950">Vestiaire Live</h1>
          </div>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between lg:gap-6">
          <nav className="flex gap-2">
            <NavLink to="/" end className={navClass}>
              Scan
            </NavLink>
            <NavLink to="/dashboard" className={navClass}>
              Dashboard
            </NavLink>
          </nav>

          <div className="flex flex-wrap items-center gap-2 text-sm">
            <span className="rounded border border-emerald-200 bg-emerald-50 px-3 py-2 font-bold text-emerald-800">
              {activeSessions.length} actifs
            </span>
            <span
              className={`rounded border px-3 py-2 font-bold ${
                criticalCount > 0
                  ? 'border-red-300 bg-red-50 text-red-700'
                  : 'border-neutral-200 bg-neutral-50 text-neutral-600'
              }`}
            >
              {criticalCount} critiques
            </span>
            <label className="flex cursor-pointer items-center gap-2 rounded border border-neutral-200 bg-white px-3 py-2 font-semibold text-neutral-700">
              <input
                type="checkbox"
                className="h-4 w-4 accent-emerald-600"
                checked={soundEnabled}
                onChange={(event) => setSoundEnabled(event.target.checked)}
              />
              Son
            </label>
          </div>
        </div>
      </div>
    </header>
  )
}

export default Header
