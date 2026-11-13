/**
 * Category selection UI component - Archival photography aesthetic with unlock system
 */

import { CATEGORY_IMAGES, ARCHIVAL_PALETTE } from '../data/categoryImages'
import { stackUnlockManager } from '../utils/stackUnlocks'

export default function CategorySelection({
  categoriesConfig,
  onCategorySelect,
  stackRecords = {}
}) {
  return (
    <>
      <header className="text-center mb-12">
        <h2 className="text-3xl sm:text-4xl font-bold mb-3 text-white drop-shadow-2xl tracking-wide">
          Pick a topic
        </h2>
        <p className="text-lg text-gray-300 max-w-2xl mx-auto leading-relaxed">
          Every stack is one story told in five steps
        </p>
      </header>
      
      <div 
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto" 
        role="grid" 
        aria-label="Knowledge categories - historical archives"
      >
        {Object.entries(categoriesConfig.categories).map(([key, category]) => {
          const imageData = CATEGORY_IMAGES[key];
          // Safety check for missing image data
          if (!imageData) {
            console.warn(`Missing image data for category: ${key}`);
            return null;
          }
          
          const isAvailable = stackUnlockManager.isStackAvailable(key);
          const unlockRequirements = !isAvailable ? stackUnlockManager.getUnlockRequirements(key) : null;
          const stackCount = category.stacks.length;
          const playedCount = category.stacks.filter((s) => stackRecords[s]).length;
          const perfectCount = category.stacks.filter((s) => stackRecords[s]?.perfect).length;
          
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
              {perfectCount > 0 && (
                <div className="absolute top-4 right-4 z-10 px-3 py-1 bg-green-900/80 border border-green-500/50 text-green-300 text-xs uppercase tracking-wider font-medium rounded">
                  ✓ {perfectCount} perfect
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
                        {playedCount > 0 ? `${playedCount} of ${stackCount} played` : `${stackCount} ${stackCount === 1 ? 'story' : 'stories'}`}
                      </span>
                    </div>
                    <span className={`font-medium transition-colors duration-300 ${
                      isAvailable 
                        ? 'text-yellow-400 group-hover:text-yellow-300' 
                        : 'text-gray-600'
                    }`}>
                      {isAvailable ? 'Explore →' : 'Locked'}
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
                      ? `${category.title}: ${stackCount} ${stackCount === 1 ? 'story' : 'stories'}. ${category.description}`
                      : `Locked archive: ${category.title}. ${unlockRequirements?.requires}`
                  }
                  title={isAvailable ? imageData.description : `Locked: ${unlockRequirements?.requires}`}
                />
                
              </div>
            </article>
          )
        })}
      </div>
      
    </>
  )
}
