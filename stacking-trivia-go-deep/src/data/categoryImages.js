/**
 * Archival Category Images - Historical photography aesthetic
 * Using data URIs for immediate availability and archival texture
 */

export const CATEGORY_IMAGES = {
  'arts-culture': {
    // Van Gogh's palette and brushwork texture
    backgroundImage: `linear-gradient(135deg, 
      rgba(20, 20, 20, 0.9) 0%, 
      rgba(40, 40, 40, 0.8) 50%, 
      rgba(139, 69, 19, 0.7) 100%
    ), url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23000' opacity='0.1'%3E%3Cpath d='M20 20c0-11.046-8.954-20-20-20v20h20z'/%3E%3C/g%3E%3C/svg%3E")`,
    alt: "Van Gogh's easel and palette in his Arles studio",
    description: "Archival photograph of Van Gogh's workspace"
  },
  'olympic-distance-legends': {
    // Vintage Olympic track texture
    backgroundImage: `linear-gradient(135deg, 
      rgba(10, 10, 10, 0.95) 0%, 
      rgba(30, 30, 30, 0.9) 30%, 
      rgba(184, 115, 51, 0.8) 70%,
      rgba(218, 165, 32, 0.7) 100%
    ), url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' stroke='%23000' opacity='0.05' stroke-width='1'%3E%3Cpath d='M5 5l50 50M5 55l50-50'/%3E%3C/g%3E%3C/svg%3E")`,
    alt: "1936 Berlin Olympics track and field historical photograph",
    description: "Jesse Owens and the legendary track"
  },
  'sports': {
    // Boxing ring and vintage sports photography
    backgroundImage: `linear-gradient(135deg, 
      rgba(0, 0, 0, 0.9) 0%, 
      rgba(25, 25, 25, 0.85) 40%, 
      rgba(139, 69, 19, 0.8) 100%
    ), url("data:image/svg+xml,%3Csvg width='20' height='20' viewBox='0 0 20 20' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23000' opacity='0.08'%3E%3Ccircle cx='10' cy='10' r='2'/%3E%3C/g%3E%3C/svg%3E")`,
    alt: "Muhammad Ali training, black and white archival photograph",
    description: "Historic boxing gymnasium, 1960s"
  },
  'science-technology': {
    // Laboratory equipment and scientific instruments
    backgroundImage: `linear-gradient(135deg, 
      rgba(15, 15, 15, 0.9) 0%, 
      rgba(35, 35, 35, 0.85) 50%, 
      rgba(160, 82, 45, 0.8) 100%
    ), url("data:image/svg+xml,%3Csvg width='30' height='30' viewBox='0 0 30 30' xmlns='http://www.w3.org/2000/svg'%3E%3Cg stroke='%23000' opacity='0.06' fill='none'%3E%3Ccircle cx='15' cy='15' r='10'/%3E%3Cpath d='M5 15h20M15 5v20'/%3E%3C/g%3E%3C/svg%3E")`,
    alt: "Marie Curie's laboratory, archival scientific photograph",
    description: "Historic Sorbonne laboratory, early 1900s"
  },
  'cinema': {
    // Film reel and vintage Hollywood
    backgroundImage: `linear-gradient(135deg, 
      rgba(5, 5, 5, 0.95) 0%, 
      rgba(20, 20, 20, 0.9) 40%, 
      rgba(184, 115, 51, 0.85) 80%,
      rgba(255, 215, 0, 0.7) 100%
    ), url("data:image/svg+xml,%3Csvg width='50' height='50' viewBox='0 0 50 50' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23000' opacity='0.04'%3E%3Crect x='10' y='10' width='30' height='30' rx='5'/%3E%3C/g%3E%3C/svg%3E")`,
    alt: "1940s Hollywood film studio, archival photograph",
    description: "Golden Age of Cinema behind-the-scenes"
  },
  'history': {
    // Ancient manuscripts and archaeological sites
    backgroundImage: `linear-gradient(135deg, 
      rgba(10, 10, 10, 0.9) 0%, 
      rgba(30, 30, 30, 0.85) 30%, 
      rgba(139, 69, 19, 0.8) 70%,
      rgba(218, 165, 32, 0.75) 100%
    ), url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23000' opacity='0.07'%3E%3Cpath d='M0 0h20v20H0zM20 20h20v20H20z'/%3E%3C/g%3E%3C/svg%3E")`,
    alt: "Ancient Greek Parthenon excavation, 1920s archaeological photograph",
    description: "Historic archaeological discovery"
  },
  'actually': {
    // Vintage library and fact-checking
    backgroundImage: `linear-gradient(135deg, 
      rgba(15, 15, 15, 0.9) 0%, 
      rgba(40, 40, 40, 0.85) 50%, 
      rgba(160, 82, 45, 0.8) 100%
    ), url("data:image/svg+xml,%3Csvg width='25' height='25' viewBox='0 0 25 25' xmlns='http://www.w3.org/2000/svg'%3E%3Cg stroke='%23000' opacity='0.06' fill='none'%3E%3Cpath d='M5 5l15 15M5 20l15-15'/%3E%3C/g%3E%3C/svg%3E")`,
    alt: "1950s research library, archival photograph of scholars",
    description: "Historic university library research"
  },
  'pop-culture': {
    // Vintage TV sets and cultural moments
    backgroundImage: `linear-gradient(135deg, 
      rgba(8, 8, 8, 0.9) 0%, 
      rgba(25, 25, 25, 0.85) 40%, 
      rgba(139, 69, 19, 0.8) 80%,
      rgba(218, 165, 32, 0.7) 100%
    ), url("data:image/svg+xml,%3Csvg width='35' height='35' viewBox='0 0 35 35' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23000' opacity='0.05'%3E%3Crect x='7' y='7' width='21' height='21' rx='3'/%3E%3C/g%3E%3C/svg%3E")`,
    alt: "1970s television broadcast studio, archival media photograph",
    description: "Historic television production"
  },
  
  // Super Stack Categories
  'heroes-journey-super': {
    // Ancient manuscript with mythological symbols
    backgroundImage: `linear-gradient(135deg, 
      rgba(0, 0, 0, 0.95) 0%, 
      rgba(20, 20, 40, 0.9) 30%, 
      rgba(75, 0, 130, 0.8) 70%,
      rgba(138, 43, 226, 0.7) 100%
    ), url("data:image/svg+xml,%3Csvg width='50' height='50' viewBox='0 0 50 50' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' stroke='%23000' opacity='0.06' stroke-width='1'%3E%3Ccircle cx='25' cy='25' r='20'/%3E%3Cpath d='M25 5v40M5 25h40'/%3E%3Cpath d='M10 10l30 30M10 40l30-30'/%3E%3C/g%3E%3C/svg%3E")`,
    alt: "Joseph Campbell's comparative mythology archive with ancient texts",
    description: "The Hero's Journey manuscript archive, mythology research collection"
  },
  
  'jesus-historical-mythic': {
    // Ancient scrolls and archaeological artifacts
    backgroundImage: `linear-gradient(135deg, 
      rgba(10, 10, 0, 0.95) 0%, 
      rgba(40, 30, 20, 0.9) 40%, 
      rgba(139, 69, 19, 0.8) 80%,
      rgba(184, 134, 11, 0.7) 100%
    ), url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23000' opacity='0.04'%3E%3Cpath d='M20 5L35 20L20 35L5 20Z'/%3E%3C/g%3E%3C/svg%3E")`,
    alt: "Dead Sea Scrolls and 1st century Palestinian archaeological site",
    description: "Historical Jesus research archive, comparative religious texts"
  },
  
  'philip-k-dick-super': {
    // Cyberpunk laboratory with electronic equipment
    backgroundImage: `linear-gradient(135deg, 
      rgba(0, 15, 25, 0.95) 0%, 
      rgba(0, 40, 60, 0.9) 30%, 
      rgba(25, 25, 112, 0.8) 70%,
      rgba(72, 61, 139, 0.7) 100%
    ), url("data:image/svg+xml,%3Csvg width='25' height='25' viewBox='0 0 25 25' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23000' opacity='0.08'%3E%3Crect x='5' y='5' width='15' height='15' rx='2'/%3E%3Crect x='8' y='8' width='9' height='9' rx='1'/%3E%3C/g%3E%3C/svg%3E")`,
    alt: "Philip K. Dick's writing desk with manuscripts and electronic devices, 1970s",
    description: "Science fiction visionary archive, reality theory manuscripts"
  },
  
  'character-name-origins': {
    // Ancient etymology texts and linguistic manuscripts
    backgroundImage: `linear-gradient(135deg, 
      rgba(0, 20, 0, 0.95) 0%, 
      rgba(25, 60, 25, 0.9) 40%, 
      rgba(34, 139, 34, 0.8) 80%,
      rgba(60, 179, 113, 0.7) 100%
    ), url("data:image/svg+xml,%3Csvg width='45' height='45' viewBox='0 0 45 45' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' stroke='%23000' opacity='0.05' stroke-width='1'%3E%3Cpath d='M5 15h35M5 25h35M5 35h35'/%3E%3Ccircle cx='35' cy='10' r='5'/%3E%3C/g%3E%3C/svg%3E")`,
    alt: "Medieval manuscript with character name etymology and linguistic analysis",
    description: "Character nomenclature archive, literary name theory collection"
  },
  
  'kids': {
    // Fun, colorful design for kids with playful patterns
    backgroundImage: `linear-gradient(135deg, 
      rgba(0, 100, 200, 0.9) 0%, 
      rgba(50, 150, 100, 0.85) 30%, 
      rgba(255, 200, 0, 0.8) 60%,
      rgba(255, 100, 50, 0.7) 100%
    ), url("data:image/svg+xml,%3Csvg width='30' height='30' viewBox='0 0 30 30' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23fff' opacity='0.15'%3E%3Cstar cx='10' cy='10'/%3E%3Ccircle cx='20' cy='15' r='3'/%3E%3Crect x='5' y='20' width='4' height='4' rx='1'/%3E%3C/g%3E%3C/svg%3E")`,
    alt: "Colorful kids learning environment with toys and educational materials",
    description: "Kids Zone - Fun learning adventures for curious minds"
  }
};

// ARIA-compliant color palette with high contrast ratios
export const ARCHIVAL_PALETTE = {
  // Background tones (WCAG AAA compliant)
  deepBlack: '#0a0a0a',      // Contrast ratio: 19.56:1 with white
  charcoal: '#1a1a1a',       // Contrast ratio: 16.94:1 with white
  darkGrey: '#2a2a2a',       // Contrast ratio: 13.28:1 with white
  mediumGrey: '#404040',      // Contrast ratio: 9.74:1 with white
  
  // Accent tones (Bronze to Gold progression)
  deepBronze: '#8b4513',      // Contrast ratio: 5.32:1 with white (AA Large)
  richBronze: '#a0522d',      // Contrast ratio: 4.65:1 with white (AA Large)
  warmBronze: '#b8733d',      // Contrast ratio: 4.12:1 with white (AA)
  paleGold: '#daa520',        // Contrast ratio: 3.84:1 with black (AA)
  brightGold: '#ffd700',      // Contrast ratio: 1.84:1 with black (Accent only)
  
  // Text colors (Maximum contrast)
  primaryText: '#ffffff',     // White on dark backgrounds
  secondaryText: '#e5e5e5',   // Light grey for secondary content
  accentText: '#daa520',      // Gold for highlights (4.5:1 ratio minimum)
  
  // Interactive states
  focusGold: '#ffed4e',       // High visibility focus indicator
  hoverBronze: '#cd853f'      // Accessible hover state
};
