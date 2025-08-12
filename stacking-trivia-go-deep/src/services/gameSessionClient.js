// Client-side game session service for making API calls
const API_BASE = '/api/game'

// Get auth token from localStorage or wherever it's stored
const getAuthToken = () => {
  // Align with AuthContext storage key
  return localStorage.getItem('trivia_token') || localStorage.getItem('authToken')
}

// Make authenticated API request
const makeAuthenticatedRequest = async (url, options = {}) => {
  const token = getAuthToken()
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers
  }
  
  if (token) {
    headers.Authorization = `Bearer ${token}`
  }
  
  const response = await fetch(url, {
    ...options,
    headers
  })
  
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`)
  }
  
  return response.json()
}

export const createGameSession = async (userId, sessionType = 'single-player') => {
  try {
    const result = await makeAuthenticatedRequest(`${API_BASE}/session`, {
      method: 'POST',
      body: JSON.stringify({ sessionType })
    })
    return result.sessionId
  } catch (error) {
    console.warn('Could not create authenticated game session:', error)
    console.error('gameSessionClient.createGameSession error', error)
    // Return a temporary local session ID for unauthenticated users
    return `local_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }
}

export const updateGameSession = async (sessionId, totalScore, stacksCompleted, durationMinutes) => {
  try {
    if (sessionId.startsWith('local_')) {
      // Handle local session - could store in localStorage for persistence
      const sessionData = {
        sessionId,
        totalScore,
        stacksCompleted,
        durationMinutes,
        completedAt: new Date().toISOString()
      }
      
      // Store in localStorage for local persistence
      const existingSessions = JSON.parse(localStorage.getItem('localGameSessions') || '[]')
      existingSessions.push(sessionData)
      localStorage.setItem('localGameSessions', JSON.stringify(existingSessions))
      
      return { success: true }
    }
    
    await makeAuthenticatedRequest(`${API_BASE}/session/${sessionId}`, {
      method: 'PUT',
      body: JSON.stringify({ totalScore, stacksCompleted, durationMinutes })
    })
    return { success: true }
  } catch (error) {
    console.warn('Could not update game session:', error)
    console.error('gameSessionClient.updateGameSession error', error)
    return { success: false }
  }
}

export const recordStackResult = async (sessionId, stackName, questionsAnswered, questionsCorrect, finalScore, deeperModeAttempted = false, deeperModeCompleted = false, category) => {
  try {
    if (sessionId.startsWith('local_')) {
      // Handle local session
      const stackData = {
        sessionId,
        stackName,
        questionsAnswered,
        questionsCorrect,
        finalScore,
        deeperModeAttempted,
        deeperModeCompleted,
        category,
        completedAt: new Date().toISOString()
      }
      
      const existingResults = JSON.parse(localStorage.getItem('localStackResults') || '[]')
      existingResults.push(stackData)
      localStorage.setItem('localStackResults', JSON.stringify(existingResults))
      
      return { success: true }
    }
    
    await makeAuthenticatedRequest(`${API_BASE}/session/${sessionId}/stack`, {
      method: 'POST',
      body: JSON.stringify({ 
        stackName, 
        questionsAnswered, 
        questionsCorrect, 
        finalScore, 
        deeperModeAttempted, 
        deeperModeCompleted,
        category 
      })
    })
    return { success: true }
  } catch (error) {
    console.warn('Could not record stack result:', error)
    console.error('gameSessionClient.recordStackResult error', error)
    return { success: false }
  }
}

// Record that a specific stack (by slug) was served in a host session
export const recordStackServed = async (sessionId, stackSlug) => {
  try {
    if (sessionId && !sessionId.startsWith('local_')) {
      await makeAuthenticatedRequest(`${API_BASE}/session/${sessionId}/served`, {
        method: 'POST',
        body: JSON.stringify({ stackSlug })
      })
    }
    return { success: true }
  } catch (error) {
    console.error('gameSessionClient.recordStackServed error', error)
    return { success: false }
  }
}

export const getUserGameHistory = async (limit = 10) => {
  try {
    const result = await makeAuthenticatedRequest(`${API_BASE}/history?limit=${limit}`)
    return result.history
  } catch (error) {
    console.warn('Could not get game history:', error)
    console.error('gameSessionClient.getUserGameHistory error', error)
    // Return local history for unauthenticated users
    const localSessions = JSON.parse(localStorage.getItem('localGameSessions') || '[]')
    return localSessions.slice(-limit)
  }
}

export const getLeaderboard = async (category, limit = 10) => {
  try {
    const params = new URLSearchParams()
    if (category) params.append('category', category)
    params.append('limit', limit)
    
    const response = await fetch(`${API_BASE}/leaderboard?${params}`)
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`)
    
    const result = await response.json()
    return result.leaderboard
  } catch (error) {
    console.warn('Could not get leaderboard:', error)
    console.error('gameSessionClient.getLeaderboard error', error)
    return []
  }
}

export const getUserStats = async () => {
  try {
    const result = await makeAuthenticatedRequest(`${API_BASE}/stats`)
    return result.stats
  } catch (error) {
    console.warn('Could not get user stats:', error)
    console.error('gameSessionClient.getUserStats error', error)
    
    // Calculate local stats
    const localSessions = JSON.parse(localStorage.getItem('localGameSessions') || '[]')
    const localResults = JSON.parse(localStorage.getItem('localStackResults') || '[]')
    
    return {
      totalGames: localSessions.length,
      totalScore: localSessions.reduce((sum, game) => sum + (game.totalScore || 0), 0),
      averageScore: localSessions.length > 0 ? 
        Math.round(localSessions.reduce((sum, game) => sum + (game.totalScore || 0), 0) / localSessions.length) : 0,
      bestGame: localSessions.length > 0 ? Math.max(...localSessions.map(game => game.totalScore || 0)) : 0,
      totalStacksCompleted: localResults.length
    }
  }
}
