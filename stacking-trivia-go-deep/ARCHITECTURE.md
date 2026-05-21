# Code Architecture & Modularity Guide

## Overview

Modular React app for **DeepStack** trivia: five-question narrative stacks, typed answers with fuzzy matching, optional MCQ hints, and group/host modes. Content rules are documented in [`docs/GOLD_STANDARD_STACK.md`](docs/GOLD_STANDARD_STACK.md).

## Runtime flow

```
User → AuthContext (sign-in OR guest session)
     → CategorySelection / StackSelection
     → gameStacks = loadPlayableStacks() from playableStacks.manifest.js
     → GameStack (depth 0–4, scoreUtils, textUtils, optional deeperMode)
     → PostGameFlow / progress (API when VITE_API_BASE_URL set)
```

- **Content source of truth:** JSON under `src/data/stacks/` and `src/data/categories/`, registered in `src/data/playableStacks.manifest.js`, loaded by `loadPlayableStacks.js` (validated via `tools/playableStacksManifest.js`).
- **Quality gate:** `npm run validate:stacks` → `tools/stackValidator.js` (schema, leakage in questions/descriptions, 5 levels).
- **Not yet the main path:** `ContentManager` glob loader and Postgres-published stacks (see `docs/archive/app/CONTENT_STRATEGY.md`).

## Directory Structure

```
src/
├── components/           # React components
│   ├── GameStack.jsx    # Main gameplay component (refactored)
│   ├── GameModeRouter.jsx # Route different game modes
│   ├── CategorySelection.jsx # Category selection UI
│   ├── StackSelection.jsx # Stack selection UI
│   └── ...
├── hooks/               # Custom React hooks
│   ├── gameHooks.js     # Game-specific hooks
│   └── index.js         # Hook exports
├── utils/               # Utility functions
│   ├── arrayUtils.js    # Array manipulation utilities
│   ├── textUtils.js     # Answer matching (fuzzy / typo tolerance)
│   ├── normalizeStack.js # Legacy q/a → gold-standard schema
│   ├── scoreUtils.js    # Scoring calculations (10–160 per level)
│   ├── storageUtils.js  # LocalStorage helpers
│   ├── dataUtils.js     # Data management utilities
│   └── index.js         # Utility exports
├── constants/           # Application constants
│   ├── gameConstants.js # Game mode and state constants
│   └── index.js         # Constant exports
└── data/               # JSON data files
    ├── categories/     # Categorized trivia stacks
    └── stacks/         # Legacy stack files
```

## Key Improvements

### 1. Modular Utilities
- **arrayUtils.js**: Centralized array operations (shuffle, random selection, chunking)
- **textUtils.js**: Answer matching with fuzzy logic and Levenshtein distance
- **scoreUtils.js**: All scoring calculations with multipliers and formatting
- **storageUtils.js**: Safe localStorage operations with error handling
- **dataUtils.js**: Data validation and import management

### 2. Custom Hooks
- **useDarkMode**: Manages dark mode with system preference detection
- **usePersistedState**: localStorage-backed state management
- **useGameHistory**: Game action tracking with size limits
- **useTeamManagement**: Team scoring and management

### 3. Component Architecture
- **GameModeRouter**: Centralized routing for different game modes
- **CategorySelection**: Reusable category selection UI
- **StackSelection**: Reusable stack selection UI
- **GameStack**: Refactored with clean utility imports

### 4. Constants Management
- **gameConstants.js**: Centralized game mode and state constants
- Prevents magic strings and typos
- Easy to maintain and extend

## Code Quality Improvements

### Before (Monolithic)
- 592-line App.jsx with mixed concerns
- Duplicated shuffle logic across components
- Inline answer matching with inconsistent logic
- Manual localStorage handling with potential errors
- Magic strings for game modes and states

### After (Modular)
- Separated concerns into focused modules
- Reusable utilities across components
- Consistent answer matching with fuzzy logic
- Safe storage operations with error handling
- Type-safe constants with clear naming

## Usage Examples

### Using Utilities
```javascript
import { shuffleArray, checkAnswerMatch, calculateQuestionScore } from '../utils'

// Shuffle questions
const shuffled = shuffleArray(questions)

// Check answer with fuzzy matching
const isCorrect = checkAnswerMatch(userInput, acceptedAnswers)

// Calculate score with depth
const score = calculateQuestionScore(depth, isDeepMode)
```

### Using Hooks
```javascript
import { useDarkMode, useGameHistory } from '../hooks'

function MyComponent() {
  const [darkMode, toggleDarkMode] = useDarkMode()
  const [history, addToHistory] = useGameHistory()
  
  // Auto-syncs with localStorage and system preferences
}
```

### Using Constants
```javascript
import { GAME_MODES, GAME_PHASES } from '../constants'

// Type-safe mode switching
setGameMode(GAME_MODES.SINGLE_PLAYER)
setPhase(GAME_PHASES.ROUND_COMPLETE)
```

## Performance Benefits

1. **Tree Shaking**: Only import what you use
2. **Code Splitting**: Utilities can be loaded on demand
3. **Reduced Bundle Size**: Eliminated code duplication
4. **Better Caching**: Unchanged utilities don't need re-download

## Maintainability Benefits

1. **Single Responsibility**: Each module has one clear purpose
2. **Easy Testing**: Utilities can be unit tested in isolation
3. **Clear Dependencies**: Import structure shows component relationships
4. **Consistent APIs**: Standardized function signatures and error handling
5. **Documentation**: Each utility has JSDoc comments

## Future Extensibility

The modular structure makes it easy to:
- Add new scoring algorithms
- Implement different answer matching strategies
- Add new storage backends
- Create new game modes
- Integrate with external APIs
- Add automated testing

## Migration Guide

When adding new features:
1. Check if existing utilities can be reused
2. Add new utilities to appropriate module
3. Update index.js exports
4. Use constants instead of magic strings
5. Leverage hooks for stateful logic
6. Document new functions with JSDoc

This architecture supports the project's growth while maintaining code quality and developer experience.
