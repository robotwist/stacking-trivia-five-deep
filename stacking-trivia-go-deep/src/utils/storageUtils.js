/**
 * Storage utilities for localStorage operations
 */

/**
 * Set an item in localStorage with error handling
 * @param {string} key - The key to store under
 * @param {*} value - The value to store
 * @returns {boolean} - Success status
 */
export const setStorageItem = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value))
    return true
  } catch (error) {
    console.warn(`Failed to set localStorage item ${key}:`, error)
    return false
  }
}

/**
 * Get an item from localStorage with error handling
 * @param {string} key - The key to retrieve
 * @param {*} defaultValue - Default value if key doesn't exist
 * @returns {*} - The stored value or default
 */
export const getStorageItem = (key, defaultValue = null) => {
  try {
    const item = localStorage.getItem(key)
    return item ? JSON.parse(item) : defaultValue
  } catch (error) {
    console.warn(`Failed to get localStorage item ${key}:`, error)
    return defaultValue
  }
}

/**
 * Remove an item from localStorage
 * @param {string} key - The key to remove
 * @returns {boolean} - Success status
 */
export const removeStorageItem = (key) => {
  try {
    localStorage.removeItem(key)
    return true
  } catch (error) {
    console.warn(`Failed to remove localStorage item ${key}:`, error)
    return false
  }
}

/**
 * Clear all localStorage
 * @returns {boolean} - Success status
 */
export const clearStorage = () => {
  try {
    localStorage.clear()
    return true
  } catch (error) {
    console.warn('Failed to clear localStorage:', error)
    return false
  }
}
