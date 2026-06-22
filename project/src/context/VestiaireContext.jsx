import { createContext, useCallback, useEffect, useMemo, useReducer } from 'react'

export const VestiaireContext = createContext(null)

export const TIME_LIMIT_MINUTES = 10
export const TIME_LIMIT_MS = TIME_LIMIT_MINUTES * 60 * 1000
export const WARNING_LIMIT_MS = 8 * 60 * 1000

const STORAGE_KEY = 'concorde-vestiaire-state'
const MAX_EVENTS = 18

export const workerDirectory = [
  { badge: 'RFID-001', name: 'Sami Ben Ali', team: 'Ligne A', role: 'Assemblage' },
  { badge: 'RFID-002', name: 'Nour Trabelsi', team: 'Ligne B', role: 'Controle' },
  { badge: 'RFID-003', name: 'Yassine Mansouri', team: 'Ligne C', role: 'Maintenance' },
  { badge: 'RFID-004', name: 'Amira Gharbi', team: 'Ligne A', role: 'Qualite' },
  { badge: 'RFID-005', name: 'Karim Saidi', team: 'Ligne B', role: 'Logistique' },
  { badge: 'RFID-006', name: 'Meriem Kallel', team: 'Ligne C', role: 'Assemblage' },
]

const initialState = {
  sessions: {},
  events: [],
  alertedBadges: {},
  soundEnabled: true,
}

function normalizeBadge(value) {
  return value.trim().replace(/\s+/g, '').toUpperCase()
}

function getProfile(badge) {
  return (
    workerDirectory.find((worker) => worker.badge === badge) || {
      badge,
      name: `Badge ${badge}`,
      team: 'Non affecte',
      role: 'Ouvrier',
    }
  )
}

function loadInitialState() {
  if (typeof window === 'undefined') return initialState

  try {
    const savedState = window.localStorage.getItem(STORAGE_KEY)
    if (!savedState) return initialState

    const parsedState = JSON.parse(savedState)
    return {
      sessions: parsedState.sessions || {},
      events: parsedState.events || [],
      alertedBadges: parsedState.alertedBadges || {},
      soundEnabled: parsedState.soundEnabled ?? true,
    }
  } catch {
    return initialState
  }
}

function addEvent(events, event) {
  return [event, ...events].slice(0, MAX_EVENTS)
}

function vestiaireReducer(state, action) {
  switch (action.type) {
    case 'CHECK_IN': {
      const profile = action.payload.profile
      const session = {
        ...profile,
        entryTime: action.payload.now,
      }

      return {
        ...state,
        sessions: {
          ...state.sessions,
          [profile.badge]: session,
        },
        alertedBadges: {
          ...state.alertedBadges,
          [profile.badge]: false,
        },
        events: addEvent(state.events, {
          id: `${profile.badge}-${action.payload.now}-in`,
          type: 'entry',
          badge: profile.badge,
          name: profile.name,
          team: profile.team,
          timestamp: action.payload.now,
        }),
      }
    }

    case 'CHECK_OUT': {
      const badge = action.payload.badge
      const session = state.sessions[badge]
      const { [badge]: removedSession, ...remainingSessions } = state.sessions
      const { [badge]: removedAlert, ...remainingAlerts } = state.alertedBadges

      if (!session) return state

      return {
        ...state,
        sessions: remainingSessions,
        alertedBadges: remainingAlerts,
        events: addEvent(state.events, {
          id: `${badge}-${action.payload.now}-out`,
          type: 'exit',
          badge,
          name: session.name,
          team: session.team,
          timestamp: action.payload.now,
          durationMs: action.payload.now - session.entryTime,
        }),
      }
    }

    case 'MARK_ALERTED':
      return {
        ...state,
        alertedBadges: {
          ...state.alertedBadges,
          [action.payload.badge]: true,
        },
      }

    case 'SET_SOUND':
      return {
        ...state,
        soundEnabled: action.payload.enabled,
      }

    case 'RESET_DEMO':
      return initialState

    default:
      return state
  }
}

export function VestiaireProvider({ children }) {
  const [state, dispatch] = useReducer(vestiaireReducer, undefined, loadInitialState)

  useEffect(() => {
    if (typeof window === 'undefined') return

    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        sessions: state.sessions,
        events: state.events,
        alertedBadges: state.alertedBadges,
        soundEnabled: state.soundEnabled,
      }),
    )
  }, [state.sessions, state.events, state.alertedBadges, state.soundEnabled])

  useEffect(() => {
    const interval = window.setInterval(() => {
      const now = Date.now()

      Object.values(state.sessions).forEach((session) => {
        const isCritical = now - session.entryTime >= TIME_LIMIT_MS
        const alreadyAlerted = state.alertedBadges[session.badge]

        if (isCritical && !alreadyAlerted) {
          dispatch({ type: 'MARK_ALERTED', payload: { badge: session.badge } })
          if (state.soundEnabled) playAlertSound()
        }
      })
    }, 1000)

    return () => window.clearInterval(interval)
  }, [state.sessions, state.alertedBadges, state.soundEnabled])

  const scanBadge = useCallback(
    (rawBadge) => {
      const badge = normalizeBadge(rawBadge)
      if (!badge) return { type: 'empty' }

      const now = Date.now()
      const activeSession = state.sessions[badge]

      if (activeSession) {
        dispatch({ type: 'CHECK_OUT', payload: { badge, now } })
        return {
          type: 'exit',
          session: activeSession,
          durationMs: now - activeSession.entryTime,
        }
      }

      const profile = getProfile(badge)
      dispatch({ type: 'CHECK_IN', payload: { profile, now } })
      return { type: 'entry', session: { ...profile, entryTime: now } }
    },
    [state.sessions],
  )

  const checkoutBadge = useCallback((badge) => {
    const normalizedBadge = normalizeBadge(badge)
    const now = Date.now()
    dispatch({ type: 'CHECK_OUT', payload: { badge: normalizedBadge, now } })
  }, [])

  const setSoundEnabled = useCallback((enabled) => {
    dispatch({ type: 'SET_SOUND', payload: { enabled } })
  }, [])

  const resetDemo = useCallback(() => {
    dispatch({ type: 'RESET_DEMO' })
  }, [])

  const value = useMemo(
    () => ({
      sessions: state.sessions,
      events: state.events,
      alertedBadges: state.alertedBadges,
      soundEnabled: state.soundEnabled,
      workerDirectory,
      scanBadge,
      checkoutBadge,
      setSoundEnabled,
      resetDemo,
    }),
    [
      state.sessions,
      state.events,
      state.alertedBadges,
      state.soundEnabled,
      scanBadge,
      checkoutBadge,
      setSoundEnabled,
      resetDemo,
    ],
  )

  return <VestiaireContext.Provider value={value}>{children}</VestiaireContext.Provider>
}

export function getSessionStatus(session, now = Date.now()) {
  const elapsedMs = now - session.entryTime

  if (elapsedMs >= TIME_LIMIT_MS) return 'critical'
  if (elapsedMs >= WARNING_LIMIT_MS) return 'warning'
  return 'normal'
}

export function formatDuration(durationMs) {
  const safeDuration = Math.max(0, durationMs)
  const totalSeconds = Math.floor(safeDuration / 1000)
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60

  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
}

function playAlertSound() {
  if (typeof window === 'undefined') return

  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext
    if (!AudioContext) return

    const audioContext = new AudioContext()
    const oscillator = audioContext.createOscillator()
    const gain = audioContext.createGain()

    oscillator.type = 'square'
    oscillator.frequency.setValueAtTime(880, audioContext.currentTime)
    gain.gain.setValueAtTime(0.18, audioContext.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.35)

    oscillator.connect(gain)
    gain.connect(audioContext.destination)
    oscillator.start()
    oscillator.stop(audioContext.currentTime + 0.35)
  } catch {
    // Browsers can block audio until the supervisor interacts with the page.
  }
}
