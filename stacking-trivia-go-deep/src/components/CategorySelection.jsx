/**
 * Category selection UI component
 */
import { shuffleArray } from '../utils/arrayUtils'

export default function CategorySelection({ 
  categoriesConfig, 
  gameStacks, 
  darkMode,
  onCategorySelect,
  onStackSelect 
}) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8 max-w-4xl mx-auto px-2 sm:px-4">
      {Object.entries(categoriesConfig.categories).map(([key, category]) => (
        <button
          key={key}
          onClick={() => onCategorySelect(key)}
          className={`group p-4 sm:p-6 lg:p-8 rounded-sm sm:rounded-md transition-all duration-300 transform hover:scale-105 hover:shadow-2xl border-2 ${
            darkMode
              ? 'bg-amber-900/70 hover:bg-amber-800/80 backdrop-blur-sm border-amber-700/60 shadow-xl'
              : 'bg-amber-100/90 hover:bg-amber-200/95 backdrop-blur-sm border-amber-300/60 shadow-xl'
          }`}
          style={{
            filter: darkMode ? 'sepia(0.3) contrast(1.2)' : 'sepia(0.2) contrast(1.1)',
            backgroundImage: darkMode 
              ? 'linear-gradient(135deg, rgba(146, 64, 14, 0.2) 0%, rgba(92, 38, 7, 0.3) 100%)'
              : 'linear-gradient(135deg, rgba(251, 245, 233, 0.8) 0%, rgba(254, 252, 232, 0.9) 100%)'
          }}
        >
          <div className="text-4xl sm:text-5xl lg:text-6xl mb-3 sm:mb-4 group-hover:scale-110 transition-transform duration-300">
            {category.icon}
          </div>
          <div className={`w-full h-2 sm:h-3 rounded-sm mb-4 sm:mb-6 bg-gradient-to-r ${category.color}`} style={{ filter: 'sepia(0.2)' }}></div>
          <h2 className="text-lg sm:text-xl lg:text-2xl font-bold mb-2 sm:mb-3 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
            {category.title}
          </h2>
          <p className={`${darkMode ? 'text-amber-300' : 'text-amber-700'} mb-3 sm:mb-4 text-sm sm:text-base`}>
            {category.description}
          </p>
          <div className="flex justify-between items-center text-xs sm:text-sm">
            <span className={`${darkMode ? 'text-amber-400' : 'text-amber-600'}`}>
              {category.stacks.length} Stacks Available
            </span>
            <span className="text-amber-600 dark:text-amber-400 font-semibold">
              Explore →
            </span>
          </div>
        </button>
      ))}
    </div>
  )
}
