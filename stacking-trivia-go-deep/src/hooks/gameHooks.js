/**
 * Custom React hooks for game functionality
 */

import { useState, useEffect } from 'react'
import { getStorageItem, setStorageItem } from '../utils/storageUtils'

/**
 * Hook for managing dark mode with localStorage persistence
 * @returns {[boolean, function]} - [isDarkMode, toggleDarkMode]
 */
export const useDarkMode = () => {
  const [darkMode, setDarkMode] = useState(() => {
    const stored = getStorageItem('darkMode')
    if (stored !== null) return stored
    return window.matchMedia('(prefers-color-scheme: dark)').matches
  })

  useEffect(() => {
    setStorageItem('darkMode', darkMode)
    
    if (darkMode) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [darkMode])

  const toggleDarkMode = () => setDarkMode(!darkMode)

  return [darkMode, toggleDarkMode]
}

/**
 * Hook for managing game state with localStorage persistence
 * @param {string} key - Storage key
 * @param {*} defaultValue - Default value
 * @returns {[*, function]} - [value, setValue]
 */
export const usePersistedState = (key, defaultValue) => {
  const [state, setState] = useState(() => {
    return getStorageItem(key, defaultValue)
  })

  const setValue = (value) => {
    setState(value)
    setStorageItem(key, value)
  }

  return [state, setValue]
}

/**
 * Hook for tracking game history
 * @returns {[Array, function]} - [history, addToHistory]
 */
export const useGameHistory = () => {
  const [history, setHistory] = usePersistedState('gameHistory', [])

  const addToHistory = (action, stackTitle = null, metadata = {}) => {
    const entry = {
      action,
      stackTitle,
      timestamp: Date.now(),
      ...metadata
    }
    
    setHistory(prev => [...prev.slice(-99), entry]) // Keep last 100 entries
  }

  const clearHistory = () => setHistory([])

  return [history, addToHistory, clearHistory]
}

/**
 * Hook for managing team scores
 * @returns {Object} - Team management functions
 */
export const useTeamManagement = () => {
  const [teams, setTeams] = useState([])

  const addTeam = (teamData) => {
    setTeams(prev => [...prev, { id: Date.now(), ...teamData }])
  }

  const updateTeamScore = (teamId, scoreChange) => {
    setTeams(prev => 
      prev.map(team => 
        team.id === teamId 
          ? { ...team, score: (team.score || 0) + scoreChange }
          : team
      )
    )
  }

  const resetScores = () => {
    setTeams(prev => prev.map(team => ({ ...team, score: 0 })))
  }

  const removeTeam = (teamId) => {
    setTeams(prev => prev.filter(team => team.id !== teamId))
  }

  return {
    teams,
    setTeams,
    addTeam,
    updateTeamScore,
    resetScores,
    removeTeam
  }
}
