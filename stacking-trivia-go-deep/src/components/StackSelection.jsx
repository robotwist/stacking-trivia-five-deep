/**
 * Stack selection UI component
 */
import { shuffleArray } from '../utils/arrayUtils'

export default function StackSelection({ 
  category, 
  gameStacks, 
  darkMode,
  onBackToCategories,
  onStackSelect,
  onToggleDarkMode 
}) {
  return (
    <div className="min-h-screen transition-colors duration-300 bg-gradient-to-br from-amber-50 via-yellow-100 to-amber-100 text-amber-900" style={{ fontFamily: 'Baskerville, serif' }}>
      <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-8">
          <button 
            onClick={onBackToCategories}
            className="px-4 py-2 rounded-sm transition-all duration-200 order-2 sm:order-1 bg-amber-200/60 hover:bg-amber-300/60 text-amber-900"
          >
            ← Back to Categories
          </button>
          <button
            onClick={onToggleDarkMode}
            className="p-2 rounded-sm transition-all duration-200 order-1 sm:order-2 bg-amber-200/60 hover:bg-amber-300/60 text-amber-800"
          >
            Victorian Mode
          </button>
        </div>
        
        <div className="text-center mb-12">
          <h1 className="text-4xl sm:text-5xl font-bold mb-4">{category.title}</h1>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {shuffleArray(category.stacks).map((stackKey) => {
            const stack = gameStacks[stackKey]
            if (!stack) return null
            
            return (
              <button
                key={stackKey}
                onClick={() => onStackSelect(stackKey)}
                className="group p-4 sm:p-6 rounded-sm transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl bg-amber-100/80 hover:bg-amber-200/70 border border-amber-300"
              >
                {/* Visual hint area */}
                {stack.imageHint && (
                  <div className="mb-4 p-4 rounded-sm bg-amber-200/40">
                    <p className="text-xs text-center italic text-amber-700">
                      {stack.imageHint}
                    </p>
                  </div>
                )}
                
                <div className={`w-full h-2 rounded-sm mb-4 bg-gradient-to-r ${category.color}`}></div>
                                  <h2 className="text-xl font-bold mb-2 group-hover:text-amber-800 transition-colors">
                    {stack.title}
                  </h2>
                <p className="text-sm text-amber-700 mb-4">
                  {stack.description || "Dive deep into this fascinating topic"}
                </p>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-amber-600">
                    5 Questions Deep
                  </span>
                  <span className="text-amber-800 font-semibold">
                    160 pts max
                  </span>
                </div>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
