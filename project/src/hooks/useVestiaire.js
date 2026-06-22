import { useContext } from 'react'
import { VestiaireContext } from '../context/VestiaireContext'

export function useVestiaire() {
  const context = useContext(VestiaireContext)

  if (!context) {
    throw new Error('useVestiaire must be used inside VestiaireProvider')
  }

  return context
}
