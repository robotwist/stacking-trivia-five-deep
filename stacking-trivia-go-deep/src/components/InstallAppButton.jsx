import { useEffect, useState } from 'react'
import {
  APP_INSTALLED_EVENT,
  INSTALL_AVAILABLE_EVENT,
  getDeferredInstallPrompt,
  isRunningStandalone,
  promptInstall,
} from '../utils/pwa'

const isIosSafari = () => {
  const ua = window.navigator.userAgent
  const isIos = /iphone|ipad|ipod/i.test(ua) || (ua.includes('Macintosh') && navigator.maxTouchPoints > 1)
  return isIos && !/crios|fxios|edgios/i.test(ua)
}

/**
 * "Install app" for Chromium (native prompt) and Add-to-Home-Screen steps for iOS Safari.
 * Renders nothing once the game is already running as an installed app.
 */
export default function InstallAppButton({ className = '' }) {
  const [canPrompt, setCanPrompt] = useState(() => !!getDeferredInstallPrompt())
  const [installed, setInstalled] = useState(() => isRunningStandalone())
  const [showIosSteps, setShowIosSteps] = useState(false)
  const ios = isIosSafari()

  useEffect(() => {
    const onAvailable = () => setCanPrompt(true)
    const onInstalled = () => {
      setInstalled(true)
      setCanPrompt(false)
    }
    window.addEventListener(INSTALL_AVAILABLE_EVENT, onAvailable)
    window.addEventListener(APP_INSTALLED_EVENT, onInstalled)
    return () => {
      window.removeEventListener(INSTALL_AVAILABLE_EVENT, onAvailable)
      window.removeEventListener(APP_INSTALLED_EVENT, onInstalled)
    }
  }, [])

  if (installed || (!canPrompt && !ios)) return null

  const handleClick = async () => {
    if (canPrompt) {
      const outcome = await promptInstall()
      if (outcome !== 'accepted') setCanPrompt(!!getDeferredInstallPrompt())
      return
    }
    setShowIosSteps(true)
  }

  return (
    <>
      <button
        type="button"
        onClick={handleClick}
        className={className || 'px-4 py-2 rounded-md font-semibold text-sm bg-yellow-500 hover:bg-yellow-400 text-gray-900'}
      >
        Install app
      </button>

      {showIosSteps && (
        <div
          className="fixed inset-0 z-50 bg-black/70 flex items-end sm:items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="ios-install-title"
          onClick={() => setShowIosSteps(false)}
        >
          <div
            className="w-full max-w-sm rounded-xl bg-white text-gray-900 p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 id="ios-install-title" className="text-xl font-bold mb-3">Put Deeply Trivial on your Home Screen</h2>
            <ol className="list-decimal list-inside space-y-2 text-base">
              <li>Tap the <strong>Share</strong> button <span aria-hidden="true">(square with an up arrow)</span> in Safari.</li>
              <li>Scroll and tap <strong>Add to Home Screen</strong>.</li>
              <li>Tap <strong>Add</strong>. It opens full-screen and works offline.</li>
            </ol>
            <button
              type="button"
              onClick={() => setShowIosSteps(false)}
              className="mt-5 w-full py-3 rounded-lg bg-amber-600 text-white font-semibold"
            >
              Got it
            </button>
          </div>
        </div>
      )}
    </>
  )
}
