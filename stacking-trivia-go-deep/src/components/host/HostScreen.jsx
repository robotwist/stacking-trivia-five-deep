import { useEffect, useState } from 'react'
import HostStage from './HostStage'
import { HOST_CHANNEL } from './hostChannel'

/**
 * The audience view at /screen. Drag this window to the TV and press F11; it mirrors
 * whatever the host's laptop is doing, minus the answer key.
 */
export default function HostScreen({ gameStacks }) {
  const [night, setNight] = useState(null)
  const supported = typeof BroadcastChannel !== 'undefined'

  useEffect(() => {
    if (!supported) return undefined
    const channel = new BroadcastChannel(HOST_CHANNEL)
    channel.onmessage = (event) => {
      if (event.data?.type === 'state') setNight(event.data.night)
      if (event.data?.type === 'host-ready') channel.postMessage({ type: 'hello' })
    }
    channel.postMessage({ type: 'hello' })
    const sayBye = () => channel.postMessage({ type: 'bye' })
    window.addEventListener('beforeunload', sayBye)
    return () => {
      sayBye()
      window.removeEventListener('beforeunload', sayBye)
      channel.close()
    }
  }, [supported])

  const goFullscreen = () => document.documentElement.requestFullscreen?.().catch(() => {})

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-black text-white cursor-default" onDoubleClick={goFullscreen}>
      {night ? (
        <HostStage night={night} gameStacks={gameStacks} />
      ) : (
        <div className="min-h-screen flex flex-col items-center justify-center text-center gap-4 p-8">
          <h1 className="text-5xl font-bold text-amber-300" style={{ fontFamily: 'Baskervville, serif' }}>Deeply Trivial</h1>
          <p className="text-2xl text-gray-300">
            {supported ? 'Waiting for the host…' : 'This browser can’t connect a TV window. Mirror the host screen instead.'}
          </p>
          <p className="text-gray-500">Open Host Night in another window of this browser. Double-click here for full screen.</p>
        </div>
      )}
    </div>
  )
}
