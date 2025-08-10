// Stack metadata for UX enhancements - difficulty, time estimates, recommendations
export const stackMetadata = {
  // Sports - Ultimate Stacks
  'nebraska-sports-ultimate': {
    difficulty: 'Expert',
    estimatedTime: '12-15 min',
    difficultyScore: 9,
    description: 'Deep dive into Nebraska athletics across all sports',
    tags: ['Sports', 'Regional', 'College'],
    recommendedFor: 'Sports enthusiasts, Nebraska fans',
    prerequisites: 'Basic college sports knowledge',
    nextRecommendations: ['prefontaine-ultimate', 'el-guerrouj-ultimate']
  },
  'prefontaine-ultimate': {
    difficulty: 'Expert', 
    estimatedTime: '12-15 min',
    difficultyScore: 9,
    description: 'Comprehensive exploration of the legendary runner',
    tags: ['Sports', 'Running', 'Biography'],
    recommendedFor: 'Running fans, sports history buffs',
    prerequisites: 'Interest in track and field',
    nextRecommendations: ['el-guerrouj-ultimate', 'muhammad-ali']
  },
  'el-guerrouj-ultimate': {
    difficulty: 'Expert',
    estimatedTime: '12-15 min', 
    difficultyScore: 9,
    description: 'Master the story of the greatest miler ever',
    tags: ['Sports', 'Running', 'International'],
    recommendedFor: 'Track enthusiasts, Olympic fans',
    prerequisites: 'Distance running knowledge',
    nextRecommendations: ['prefontaine-ultimate', 'olympic_distance_current']
  },
  'the_beatles': {
    difficulty: 'Expert',
    estimatedTime: '12-15 min',
    difficultyScore: 9,
    description: 'Deep dive into the Fab Four\'s history and music',
    tags: ['Music', 'Culture', '1960s'],
    recommendedFor: 'Music lovers, Beatles fans',
    prerequisites: 'Basic Beatles knowledge',
    nextRecommendations: ['miles-davis', 'mozart']
  },
  
  // Intermediate Stacks
  'olympic_distance_current': {
    difficulty: 'Advanced',
    estimatedTime: '8-10 min',
    difficultyScore: 7,
    description: 'Modern Olympic distance running records and athletes',
    tags: ['Sports', 'Olympics', 'Current'],
    recommendedFor: 'Olympic fans, casual runners',
    prerequisites: 'Basic Olympic knowledge',
    nextRecommendations: ['prefontaine-ultimate', 'el-guerrouj-ultimate']
  },
  'van-gogh': {
    difficulty: 'Advanced',
    estimatedTime: '8-10 min',
    difficultyScore: 7,
    description: 'Explore the life and art of Vincent van Gogh',
    tags: ['Art', 'Biography', 'Post-Impressionism'],
    recommendedFor: 'Art enthusiasts, history buffs',
    prerequisites: 'Basic art appreciation',
    nextRecommendations: ['leonardo-da-vinci', 'frida-kahlo']
  },
  'tesla': {
    difficulty: 'Advanced',
    estimatedTime: '8-10 min',
    difficultyScore: 7,
    description: 'The genius inventor and his revolutionary ideas',
    tags: ['Science', 'Innovation', 'Biography'],
    recommendedFor: 'Science fans, tech enthusiasts',
    prerequisites: 'Basic science knowledge',
    nextRecommendations: ['darwin', 'marie-curie']
  },
  'blade_runner': {
    difficulty: 'Advanced',
    estimatedTime: '8-10 min',
    difficultyScore: 7,
    description: 'Dive deep into the sci-fi masterpiece',
    tags: ['Film', 'Sci-Fi', 'Philosophy'],
    recommendedFor: 'Film buffs, sci-fi fans',
    prerequisites: 'Seen the movie',
    nextRecommendations: ['star-wars', 'the-godfather']
  },

  // Beginner-Friendly Stacks  
  'ancient_greece': {
    difficulty: 'Intermediate',
    estimatedTime: '6-8 min',
    difficultyScore: 5,
    description: 'Ancient Greek civilization, mythology, and culture',
    tags: ['History', 'Ancient', 'Culture'],
    recommendedFor: 'History newcomers, mythology fans',
    prerequisites: 'General knowledge',
    nextRecommendations: ['shakespeare', 'leonardo-da-vinci']
  },
  'muhammad-ali': {
    difficulty: 'Intermediate',
    estimatedTime: '6-8 min', 
    difficultyScore: 5,
    description: 'The Greatest boxer and cultural icon',
    tags: ['Sports', 'Boxing', 'Biography'],
    recommendedFor: 'Sports fans, biography enthusiasts',
    prerequisites: 'Basic boxing knowledge',
    nextRecommendations: ['michael-jordan', 'serena-williams']
  }
};

// Smart recommendation engine
export const getRecommendations = (userProfile, completedStacks) => {
  const { level, accuracy, totalScore, preferences } = userProfile;
  
  // Filter out completed stacks
  const availableStacks = Object.keys(stackMetadata).filter(
    stackKey => !completedStacks.includes(stackKey)
  );
  
  // Recommend based on user level and performance
  if (level <= 2 || accuracy < 70) {
    // Newer players - recommend intermediate stacks
    return availableStacks
      .filter(key => stackMetadata[key].difficultyScore <= 6)
      .slice(0, 3);
  } else if (level >= 5 && accuracy >= 85) {
    // Expert players - recommend hardest stacks
    return availableStacks
      .filter(key => stackMetadata[key].difficultyScore >= 8)
      .slice(0, 3);
  } else {
    // Mid-level players - mixed recommendations
    return availableStacks
      .filter(key => stackMetadata[key].difficultyScore >= 6 && stackMetadata[key].difficultyScore <= 8)
      .slice(0, 3);
  }
};

// First-time user onboarding recommendations
export const getOnboardingStacks = () => {
  return [
    'ancient_greece',    // Familiar topic, good introduction
    'muhammad-ali',      // Engaging biography, intermediate level  
    'van-gogh'          // Visual/artistic, builds confidence
  ];
};

// Difficulty color coding for UI
export const getDifficultyColor = (difficulty) => {
  switch(difficulty) {
    case 'Beginner': return 'text-green-500 bg-green-100 dark:bg-green-900/30';
    case 'Intermediate': return 'text-yellow-500 bg-yellow-100 dark:bg-yellow-900/30'; 
    case 'Advanced': return 'text-orange-500 bg-orange-100 dark:bg-orange-900/30';
    case 'Expert': return 'text-red-500 bg-red-100 dark:bg-red-900/30';
    default: return 'text-gray-500 bg-gray-100 dark:bg-gray-900/30';
  }
};
