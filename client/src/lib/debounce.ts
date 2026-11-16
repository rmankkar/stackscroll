/**
 * Debounce utility.
 *
 * Returns a wrapped function that delays invocation of `fn` by `delay` ms.
 * The returned wrapper exposes `.cancel()` and `.flush()` methods.
 *
 * @param fn - The function to debounce
 * @param delay - Delay in milliseconds (default 300)
 */
export function debounce<Args extends unknown[]>(
  fn: (...args: Args) => void,
  delay: number = 300
): ((...args: Args) => void) & { cancel: () => void; flush: () => void } {
  let timeoutId: ReturnType<typeof setTimeout> | null = null;
  let lastArgs: Args | null = null;

  const debounced = (...args: Args) => {
    lastArgs = args;
    if (timeoutId) clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      fn(...args);
      timeoutId = null;
    }, delay);
  };

  debounced.cancel = () => {
    if (timeoutId) {
      clearTimeout(timeoutId);
      timeoutId = null;
    }
  };

  debounced.flush = () => {
    if (timeoutId && lastArgs) {
      clearTimeout(timeoutId);
      timeoutId = null;
      fn(...lastArgs);
    }
  };

  return debounced;
}
