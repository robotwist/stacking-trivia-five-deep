/**
 * Category selection UI component - Archival photography aesthetic
 */

import { CATEGORY_IMAGES, ARCHIVAL_PALETTE } from '../data/categoryImages'

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
          
          return (
            <article
              key={key}
              className="group relative overflow-hidden rounded-lg border border-gray-700 hover:border-yellow-600 transition-all duration-500 hover:scale-[1.02] focus-within:ring-2 focus-within:ring-yellow-400 focus-within:ring-offset-2 focus-within:ring-offset-black"
              role="gridcell"
            >
              {/* Archival Background Image */}
              <div 
                className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
                style={{ 
                  backgroundImage: imageData.backgroundImage,
                  backgroundBlendMode: 'multiply'
                }}
                aria-hidden="true"
              />
              
              {/* Content Overlay */}
              <div className="relative p-8 h-80 flex flex-col justify-between bg-gradient-to-t from-black/90 via-black/70 to-black/40 hover:from-black/95 hover:via-black/75 hover:to-black/50 transition-all duration-500">
                
                {/* Archive Label */}
                <div className="flex justify-between items-start mb-4">
                  <span className="px-3 py-1 bg-black/60 border border-yellow-600/50 text-yellow-400 text-xs uppercase tracking-widest font-medium rounded">
                    Archive
                  </span>
                  <span className="text-gray-400 text-xs font-mono">
                    EST. {Math.floor(Math.random() * 50) + 1920}
                  </span>
                </div>
                
                {/* Category Content */}
                <div className="text-center flex-grow flex flex-col justify-center">
                  <h2 className="text-2xl sm:text-3xl font-bold mb-3 text-white group-hover:text-yellow-100 transition-colors duration-300 leading-tight">
                    {category.title}
                  </h2>
                  <p className="text-gray-300 group-hover:text-gray-200 text-sm sm:text-base leading-relaxed mb-4 transition-colors duration-300">
                    {category.description}
                  </p>
                </div>
                
                {/* Archive Details Footer */}
                <div className="pt-4 border-t border-gray-600/50">
                  <div className="flex justify-between items-center text-sm">
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></div>
                      <span className="text-gray-400 font-mono">
                        {category.stacks.length} Documents
                      </span>
                    </div>
                    <span className="text-yellow-400 font-medium group-hover:text-yellow-300 transition-colors duration-300">
                      Explore Archive →
                    </span>
                  </div>
                </div>
                
                {/* Interactive Button Overlay */}
                <button
                  onClick={() => onCategorySelect(key)}
                  className="absolute inset-0 w-full h-full bg-transparent focus:outline-none focus:bg-yellow-500/10 hover:bg-yellow-500/5 transition-colors duration-300"
                  aria-label={`${imageData.alt}. Explore ${category.title} category with ${category.stacks.length} available document stacks. ${imageData.description}`}
                  title={imageData.description}
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
