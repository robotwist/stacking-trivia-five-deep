/**
 * Game mode router component for cleaner App.jsx
 */
import HostMode from './HostMode'
import OpeningImageRound from './OpeningImageRound'
import PerformanceFinale from './PerformanceFinale'
import ProjectorScoreboard from './ProjectorScoreboard'
import ProjectorMode from './ProjectorMode'
import GilliamTransition from './GilliamTransition'
import SinglePlayerMode from './SinglePlayerMode'
import BarTriviaNight from './BarTriviaNight'
import { GAME_MODES } from '../constants/gameConstants'

export default function GameModeRouter({ 
  gameMode,
  teams,
  gameHistory,
  performanceScores,
  currentRound,
  gamePhase,
  transitionState,
  projectorState,
  selectedStack,
  gameStacks,
  categoriesConfig,
  selectedCategory,
  darkMode,
  // Handlers
  onStartGame,
  onExitHost,
  onEnterGilliamProjector,
  onTriggerTransition,
  onOpeningRoundComplete,
  onPerformanceComplete,
  onTransitionComplete,
  onExitMode
}) {
  
  switch (gameMode) {
    case GAME_MODES.HOST:
      return (
        <HostMode 
          onStartGame={onStartGame} 
          onExitHost={onExitHost} 
          onEnterGilliamProjector={onEnterGilliamProjector}
          onTriggerTransition={onTriggerTransition}
        />
      )

    case GAME_MODES.OPENING_ROUND:
      return (
        <OpeningImageRound 
          teams={teams} 
          onRoundComplete={onOpeningRoundComplete} 
        />
      )

    case GAME_MODES.PERFORMANCE_FINALE:
      return (
        <PerformanceFinale 
          teams={teams}
          gameHistory={gameHistory}
          onComplete={onPerformanceComplete}
          darkMode={darkMode}
        />
      )

    case GAME_MODES.PROJECTOR_SCOREBOARD:
      return (
        <ProjectorScoreboard 
          teams={teams}
          currentRound={currentRound}
          gamePhase={gamePhase}
          performanceScores={performanceScores}
          darkMode={darkMode}
          onExit={() => onExitMode(GAME_MODES.HOST)}
        />
      )

    case GAME_MODES.GILLIAM_PROJECTOR:
      return (
        <ProjectorMode
          gameState={projectorState.gameState}
          currentStack={selectedStack}
          question={projectorState.currentQuestion}
          teams={teams}
          questionNumber={projectorState.questionNumber}
          onClose={() => onExitMode(GAME_MODES.HOST)}
        />
      )

    case GAME_MODES.CATEGORY_TRANSITION:
      return (
        <GilliamTransition
          fromCategory={transitionState.fromCategory}
          toCategory={transitionState.toCategory}
          onComplete={onTransitionComplete}
          duration={6000}
        />
      )

    case GAME_MODES.SINGLE_PLAYER:
      return (
        <SinglePlayerMode
          gameStacks={gameStacks}
          categoriesConfig={categoriesConfig}
          onExit={() => onExitMode(GAME_MODES.SOLO)}
          selectedCategory={selectedCategory}
        />
      )

    case GAME_MODES.BAR_TRIVIA:
      return (
        <BarTriviaNight
          gameStacks={gameStacks}
          categoriesConfig={categoriesConfig}
          onExit={() => onExitMode(GAME_MODES.SOLO)}
        />
      )

    default:
      return null
  }
}
