/**
 * The host laptop and the TV window talk over a BroadcastChannel: same browser, no server,
 * works offline. The TV only ever receives the public state (no undo history).
 */
export const HOST_CHANNEL = 'deepstack-host-night'

export const toPublicNight = (night) => {
  const { undo: _undo, ...rest } = night
  return rest
}
