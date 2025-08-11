import React from 'react'

const MoreModesDrawer = ({ isOpen, onClose, onSelectMode, onEnterGilliamProjector, onSetTestPhoto }) => {
  if (!isOpen) return null
  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="absolute right-0 top-0 h-full w-80 bg-gray-900 text-white border-l border-gray-700 shadow-2xl p-4 overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold">More Modes</h3>
          <button onClick={onClose} className="px-2 py-1 bg-gray-800 rounded hover:bg-gray-700">Close</button>
        </div>

        <div className="space-y-3">
          <button className="w-full text-left p-3 bg-gray-800 rounded hover:bg-gray-700" onClick={() => { onSelectMode('multi-stack'); onClose(); }}>Multi-Stack Challenge</button>
          <button className="w-full text-left p-3 bg-gray-800 rounded hover:bg-gray-700" onClick={() => { onSelectMode('bar-trivia'); onClose(); }}>Bar Trivia Night</button>
          <button className="w-full text-left p-3 bg-gray-800 rounded hover:bg-gray-700" onClick={() => { onSelectMode('projector-scoreboard'); onClose(); }}>Classic Projector</button>
          <button className="w-full text-left p-3 bg-gray-800 rounded hover:bg-gray-700" onClick={() => { onEnterGilliamProjector('setup'); onClose(); }}>Gilliam Projector</button>
          <button className="w-full text-left p-3 bg-gray-800 rounded hover:bg-gray-700" onClick={() => { onSelectMode('multi-device-host'); onClose(); }}>Multi-Device Trivia</button>
          <button className="w-full text-left p-3 bg-gray-800 rounded hover:bg-gray-700" onClick={() => { onSetTestPhoto(true); onClose(); }}>Test Photo-First</button>
          <hr className="my-3 border-gray-700" />
          <button className="w-full text-left p-3 bg-yellow-700 rounded hover:bg-yellow-600 text-white" onClick={() => { onSelectMode('host-upsell'); onClose(); }}>Become a Host (Pro)</button>
        </div>

        <div className="mt-6 text-xs text-gray-400">
          Advanced tools for hosts and playtesting.
        </div>
      </div>
    </div>
  )
}

export default MoreModesDrawer


