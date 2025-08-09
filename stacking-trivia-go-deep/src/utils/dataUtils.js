/**
 * Game data management utilities
 */

/**
 * Import all stack data dynamically
 * @returns {Promise<Object>} - Object with all stack data
 */
export const importAllStacks = async () => {
  const stacks = {}
  
  try {
    // Arts & Culture
    stacks['van-gogh'] = await import('../data/categories/arts-culture/van-gogh.json')
    stacks['the_beatles'] = await import('../data/categories/arts-culture/the_beatles.json')
    stacks['frida-kahlo'] = await import('../data/categories/arts-culture/frida-kahlo.json')
    stacks['miles-davis'] = await import('../data/categories/arts-culture/miles-davis.json')
    stacks['shakespeare'] = await import('../data/categories/arts-culture/shakespeare.json')
    stacks['leonardo-da-vinci'] = await import('../data/categories/arts-culture/leonardo-da-vinci.json')
    stacks['mozart'] = await import('../data/categories/arts-culture/mozart.json')
    
    // Sports
    stacks['olympic_distance_current'] = await import('../data/categories/sports/olympic_distance_current.json')
    stacks['muhammad-ali'] = await import('../data/categories/sports/muhammad-ali.json')
    stacks['michael-jordan'] = await import('../data/categories/sports/michael-jordan.json')
    stacks['serena-williams'] = await import('../data/categories/sports/serena-williams.json')
    
    // Science & Technology
    stacks['tesla'] = await import('../data/categories/science-technology/tesla.json')
    stacks['darwin'] = await import('../data/categories/science-technology/darwin.json')
    stacks['nasa'] = await import('../data/categories/science-technology/nasa.json')
    stacks['marie-curie'] = await import('../data/categories/science-technology/marie-curie.json')
    stacks['steve-jobs'] = await import('../data/categories/science-technology/steve-jobs.json')
    
    // Cinema
    stacks['blade_runner'] = await import('../data/categories/cinema/blade_runner.json')
    stacks['the-godfather'] = await import('../data/categories/cinema/the-godfather.json')
    stacks['star-wars'] = await import('../data/categories/cinema/star-wars.json')
    
    // History
    stacks['ancient_greece'] = await import('../data/categories/history/ancient_greece.json')
    stacks['cleopatra'] = await import('../data/categories/history/cleopatra.json')
    stacks['einstein'] = await import('../data/categories/history/einstein.json')
    
    // Actually (Misconceptions)
    stacks['van-gogh-myths'] = await import('../data/categories/actually/van-gogh-myths.json')
    stacks['einstein-myths'] = await import('../data/categories/actually/einstein-myths.json')
    stacks['shakespeare-myths'] = await import('../data/categories/actually/shakespeare-myths.json')
    
    // Pop Culture
    stacks['how-i-met-your-mother'] = await import('../data/stacks/how_i_met_your_mother.json')
    stacks['community'] = await import('../data/stacks/community.json')
    stacks['the-goonies'] = await import('../data/stacks/the_goonies.json')
    stacks['the-office'] = await import('../data/stacks/the_office.json')
    stacks['friends'] = await import('../data/stacks/friends.json')
    stacks['back-to-the-future'] = await import('../data/stacks/back_to_the_future.json')
    stacks['stranger-things'] = await import('../data/stacks/stranger_things.json')
    
    // Convert ES modules to plain objects
    Object.keys(stacks).forEach(key => {
      stacks[key] = stacks[key].default || stacks[key]
    })
    
    return stacks
  } catch (error) {
    console.error('Error importing stacks:', error)
    return {}
  }
}

/**
 * Get stacks for a specific category
 * @param {Object} allStacks - All available stacks
 * @param {Array<string>} categoryStackIds - Stack IDs for the category
 * @returns {Object} - Stacks for the category
 */
export const getCategoryStacks = (allStacks, categoryStackIds) => {
  const categoryStacks = {}
  
  categoryStackIds.forEach(stackId => {
    if (allStacks[stackId]) {
      categoryStacks[stackId] = allStacks[stackId]
    }
  })
  
  return categoryStacks
}

/**
 * Validate stack data structure
 * @param {Object} stackData - Stack data to validate
 * @returns {boolean} - Whether the stack is valid
 */
export const validateStackData = (stackData) => {
  if (!stackData || typeof stackData !== 'object') return false
  
  // Required fields
  if (!stackData.title || !stackData.questions || !Array.isArray(stackData.questions)) {
    return false
  }
  
  // Check each question
  return stackData.questions.every(question => {
    return question.question && 
           question.acceptedAnswers && 
           Array.isArray(question.acceptedAnswers) &&
           question.acceptedAnswers.length > 0
  })
}
