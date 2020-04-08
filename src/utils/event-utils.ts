export function onEvent(
  target: EventTarget,
  eventName: string,
  callback: EventListener,
  options?: boolean | AddEventListenerOptions,
): () => void {
  target.addEventListener(eventName, callback, options);

  return () => {
    target.removeEventListener(eventName, callback, options);
  };
}
