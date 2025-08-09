/**
 * Category selection UI component - Archival photography aesthetic with unlock system
 */

import { CATEGORY_IMAGES, ARCHIVAL_PALETTE } from '../data/categoryImages'
import { stackUnlockManager } from '../utils/stackUnlocks'

export default function CategorySelection({ 
  categoriesConfig, 
  darkMode,
  onCategorySelect
}) {
  return (
    <>
      <header className="text-center mb-12">
        <h1 className="text-4xl sm:text-5xl font-bold mb-4 text-white drop-shadow-2xl tracking-wide">
          Select Your Knowledge Realm
        </h1>
        <p className="text-lg text-gray-300 max-w-2xl mx-auto leading-relaxed">
          Journey through history's greatest moments, captured in time
        </p>
      </header>
      
      <div 
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto" 
        role="grid" 
        aria-label="Knowledge categories - historical archives"
      >
        {Object.entries(categoriesConfig.categories).map(([key, category]) => {
          const imageData = CATEGORY_IMAGES[key];
          const isAvailable = stackUnlockManager.isStackAvailable(key);
          const unlockRequirements = !isAvailable ? stackUnlockManager.getUnlockRequirements(key) : null;
          const completion = stackUnlockManager.getStackCompletion(key);
          
          return (
            <article
              key={key}
              className={`group relative overflow-hidden rounded-lg border transition-all duration-500 focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-offset-black ${
                isAvailable 
                  ? 'border-gray-700 hover:border-yellow-600 hover:scale-[1.02] focus-within:ring-yellow-400' 
                  : 'border-gray-800 opacity-75 cursor-not-allowed'
              }`}
              role="gridcell"
            >
              {/* Lock Overlay for Unavailable Stacks */}
              {!isAvailable && (
                <div className="absolute inset-0 z-20 bg-black/60 backdrop-blur-sm flex items-center justify-center">
                  <div className="text-center p-6">
                    <div className="text-4xl mb-3">🔒</div>
                    <h3 className="text-white font-bold text-lg mb-2">Locked Archive</h3>
                    <p className="text-gray-300 text-sm mb-4">
                      {unlockRequirements?.requires}
                    </p>
                    <div className="px-3 py-1 bg-red-900/50 border border-red-600/50 text-red-300 text-xs uppercase tracking-wider font-medium rounded">
                      Requires Achievement
                    </div>
                  </div>
                </div>
              )}
              
              {/* Completion Badge */}
              {completion && (
                <div className="absolute top-4 right-4 z-10 px-3 py-1 bg-green-900/80 border border-green-500/50 text-green-300 text-xs uppercase tracking-wider font-medium rounded">
                  ✓ {completion.percentage}%
                </div>
              )}
              
              {/* Archival Background Image */}
              <div 
                className={`absolute inset-0 bg-cover bg-center transition-transform duration-700 ${
                  isAvailable ? 'group-hover:scale-105' : 'scale-100'
                }`}
                style={{ 
                  backgroundImage: imageData.backgroundImage,
                  backgroundBlendMode: 'multiply'
                }}
                aria-hidden="true"
              />
              
              {/* Content Overlay */}
              <div className={`relative p-8 h-80 flex flex-col justify-between bg-gradient-to-t from-black/90 via-black/70 to-black/40 transition-all duration-500 ${
                isAvailable ? 'hover:from-black/95 hover:via-black/75 hover:to-black/50' : ''
              }`}>
                
                {/* Archive Label */}
                <div className="flex justify-between items-start mb-4">
                  <span className={`px-3 py-1 bg-black/60 border text-xs uppercase tracking-widest font-medium rounded ${
                    isAvailable 
                      ? 'border-yellow-600/50 text-yellow-400' 
                      : 'border-gray-600/50 text-gray-500'
                  }`}>
                    {key.includes('-super') ? 'Super Archive' : 'Archive'}
                  </span>
                  <span className="text-gray-400 text-xs font-mono">
                    EST. {Math.floor(Math.random() * 50) + 1920}
                  </span>
                </div>
                
                {/* Category Content */}
                <div className="text-center flex-grow flex flex-col justify-center">
                  <h2 className={`text-2xl sm:text-3xl font-bold mb-3 leading-tight transition-colors duration-300 ${
                    isAvailable 
                      ? 'text-white group-hover:text-yellow-100' 
                      : 'text-gray-400'
                  }`}>
                    {category.title}
                  </h2>
                  <p className={`text-sm sm:text-base leading-relaxed mb-4 transition-colors duration-300 ${
                    isAvailable 
                      ? 'text-gray-300 group-hover:text-gray-200' 
                      : 'text-gray-500'
                  }`}>
                    {category.description}
                  </p>
                </div>
                
                {/* Archive Details Footer */}
                <div className="pt-4 border-t border-gray-600/50">
                  <div className="flex justify-between items-center text-sm">
                    <div className="flex items-center space-x-2">
                      <div className={`w-2 h-2 rounded-full ${
                        isAvailable ? 'bg-yellow-500 animate-pulse' : 'bg-gray-600'
                      }`}></div>
                      <span className="text-gray-400 font-mono">
                        {category.stacks.length} Documents
                      </span>
                    </div>
                    <span className={`font-medium transition-colors duration-300 ${
                      isAvailable 
                        ? 'text-yellow-400 group-hover:text-yellow-300' 
                        : 'text-gray-600'
                    }`}>
                      {isAvailable ? 'Explore Archive →' : 'Locked'}
                    </span>
                  </div>
                </div>
                
                {/* Interactive Button Overlay */}
                <button
                  onClick={() => isAvailable && onCategorySelect(key)}
                  disabled={!isAvailable}
                  className={`absolute inset-0 w-full h-full bg-transparent focus:outline-none transition-colors duration-300 ${
                    isAvailable 
                      ? 'focus:bg-yellow-500/10 hover:bg-yellow-500/5 cursor-pointer' 
                      : 'cursor-not-allowed'
                  }`}
                  aria-label={
                    isAvailable 
                      ? `${imageData.alt}. Explore ${category.title} category with ${category.stacks.length} available document stacks. ${imageData.description}`
                      : `Locked archive: ${category.title}. ${unlockRequirements?.requires}`
                  }
                  title={isAvailable ? imageData.description : `Locked: ${unlockRequirements?.requires}`}
                />
                
              </div>
            </article>
          )
        })}
      </div>
      
      {/* Archival Footer */}
      <footer className="mt-16 text-center">
        <p className="text-gray-500 text-sm font-mono">
          Historical Archives • Curated Knowledge Collection • Est. 2025
        </p>
      </footer>
    </>
  )
}
