/**
 * Category selection UI component
 */

export default function CategorySelection({ 
  categoriesConfig, 
  darkMode,
  onCategorySelect
}) {
  return (
    <>
      <h1 className={`text-3xl sm:text-4xl font-bold mb-8 text-center ${
        darkMode ? 'text-gray-100' : 'text-gray-900'
      }`}>
        Select Your Knowledge Realm
      </h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6" role="grid" aria-label="Knowledge categories">
        {Object.entries(categoriesConfig.categories).map(([key, category]) => (
          <button
            key={key}
            onClick={() => onCategorySelect(key)}
            className={`group p-6 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 focus:outline-none focus:ring-3 focus:ring-blue-500 border-2 ${
              darkMode
                ? 'bg-gray-800 border-gray-700 hover:bg-gray-750 hover:border-gray-600'
                : 'bg-white border-gray-200 hover:bg-gray-50 hover:border-gray-300'
            }`}
            role="gridcell"
            aria-label={`Explore ${category.title} category with ${category.stacks.length} available stacks`}
          >
            <div className="text-4xl mb-4 text-center">{category.icon}</div>
            <h2 className="text-xl font-bold mb-3 text-gray-800 dark:text-gray-200 text-center">
              {category.title}
            </h2>
          <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'} mb-3 sm:mb-4 text-sm sm:text-base text-center`}>
            {category.description}
          </p>
          <div className="flex justify-between items-center text-xs sm:text-sm">
            <span className={`${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>
              {category.stacks.length} Stacks Available
            </span>
            <span className="text-blue-600 dark:text-blue-400 font-semibold">
              Explore →
            </span>
          </div>
        </button>
      ))}
    </div>
    </>
  )
}
