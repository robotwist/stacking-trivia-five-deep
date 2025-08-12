/**
 * Content Manager - Dynamic trivia stack loading and management
 * Handles both local JSON files and database-stored content
 */

const STACK_CATEGORIES = {
  'arts-culture': 'Arts & Culture',
  'sports': 'Sports',
  'science-technology': 'Science & Technology', 
  'cinema': 'Cinema',
  'history': 'History',
  'actually': 'Actually (Misconceptions)',
  'pop-culture': 'Pop Culture',
  'kids-zone': 'Kids Zone',
  'super-stacks': 'Super Stacks'
}

class ContentManager {
  constructor() {
    this.cachedStacks = new Map()
    this.localStacks = new Map()
    this.dbStacks = new Map()
  }

  /**
   * Initialize and discover all available stacks
   */
  async initializeStacks() {
    try {
      // Load local stacks from organized directories
      await this.loadLocalStacks()
      
      // Load database stacks (future feature)
      await this.loadDatabaseStacks()
      
      return this.getAllStacks()
    } catch (error) {
      console.error('Failed to initialize stacks:', error)
      return {}
    }
  }

  /**
   * Load all local JSON stacks dynamically
   */
  async loadLocalStacks() {
    const stackImports = import.meta.glob('../data/**/*.json')
    
    for (const path in stackImports) {
      try {
        const stackData = await stackImports[path]()
        const stackKey = this.extractStackKey(path)
        const category = this.extractCategory(path)
        
        this.localStacks.set(stackKey, {
          ...stackData.default,
          id: stackKey,
          category,
          source: 'local',
          path
        })
      } catch (error) {
        console.warn(`Failed to load stack from ${path}:`, error)
      }
    }
  }

  /**
   * Load stacks from database (future implementation)
   */
  async loadDatabaseStacks() {
    try {
      // TODO: Implement database stack loading
      // const response = await fetch('/api/stacks')
      // const dbStacks = await response.json()
      // 
      // dbStacks.forEach(stack => {
      //   this.dbStacks.set(stack.id, { ...stack, source: 'database' })
      // })
    } catch (error) {
      console.warn('Database stacks unavailable:', error)
    }
  }

  /**
   * Get all available stacks
   */
  getAllStacks() {
    const allStacks = {}
    
    // Merge local and database stacks
    for (const [key, stack] of this.localStacks) {
      allStacks[key] = stack
    }
    
    for (const [key, stack] of this.dbStacks) {
      allStacks[key] = stack
    }
    
    return allStacks
  }

  /**
   * Get stacks organized by category
   */
  getStacksByCategory() {
    const categorized = {}
    const allStacks = this.getAllStacks()
    
    Object.values(allStacks).forEach(stack => {
      const category = stack.category || 'uncategorized'
      if (!categorized[category]) {
        categorized[category] = []
      }
      categorized[category].push(stack)
    })
    
    return categorized
  }

  /**
   * Create new stack in database
   */
  async createStack(stackData) {
    try {
      const response = await fetch('/api/stacks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(stackData)
      })
      
      if (!response.ok) throw new Error('Failed to create stack')
      
      const newStack = await response.json()
      this.dbStacks.set(newStack.id, { ...newStack, source: 'database' })
      
      return newStack
    } catch (error) {
      console.error('Failed to create stack:', error)
      throw error
    }
  }

  /**
   * Soft-delete (trash) a stack by slug
   */
  async trashStack(slug) {
    try {
      const token = localStorage.getItem('trivia_token') || localStorage.getItem('authToken')
      const response = await fetch(`/api/stacks/${encodeURIComponent(slug)}/trash`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        }
      })

      if (!response.ok) {
        const text = await response.text()
        throw new Error(text || 'Failed to trash stack')
      }

      const result = await response.json()
      // Remove from in-memory caches if present
      if (this.dbStacks.has(slug)) this.dbStacks.delete(slug)
      if (this.localStacks.has(slug)) this.localStacks.delete(slug)
      return result
    } catch (error) {
      console.error('Failed to trash stack:', error)
      throw error
    }
  }

  /**
   * Extract stack key from file path
   */
  extractStackKey(path) {
    return path
      .split('/')
      .pop()
      .replace('.json', '')
      .replace(/[_\s]+/g, '-')
      .toLowerCase()
  }

  /**
   * Extract category from file path
   */
  extractCategory(path) {
    const pathParts = path.split('/')
    const categoryIndex = pathParts.findIndex(part => part === 'categories')
    
    if (categoryIndex !== -1 && pathParts[categoryIndex + 1]) {
      return pathParts[categoryIndex + 1]
    }
    
    return 'general'
  }

  /**
   * Search stacks by title, description, or tags
   */
  searchStacks(query) {
    const allStacks = this.getAllStacks()
    const searchTerm = query.toLowerCase()
    
    return Object.values(allStacks).filter(stack => 
      stack.title?.toLowerCase().includes(searchTerm) ||
      stack.description?.toLowerCase().includes(searchTerm) ||
      stack.tags?.some(tag => tag.toLowerCase().includes(searchTerm))
    )
  }

  /**
   * Get stack statistics
   */
  getContentStats() {
    const allStacks = this.getAllStacks()
    const categories = this.getStacksByCategory()
    
    return {
      totalStacks: Object.keys(allStacks).length,
      localStacks: this.localStacks.size,
      dbStacks: this.dbStacks.size,
      categories: Object.keys(categories).length,
      categoriesBreakdown: Object.entries(categories).map(([name, stacks]) => ({
        category: name,
        count: stacks.length
      }))
    }
  }
}

// Create singleton instance
export const contentManager = new ContentManager()
export default ContentManager
