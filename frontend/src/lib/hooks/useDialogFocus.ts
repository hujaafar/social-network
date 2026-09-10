import { useCallback, useRef } from "react";

/** Controlled dialogs can be opened from several buttons or a keyboard shortcut. */
export function useDialogFocus() {
  const origin = useRef<HTMLElement | null>(null);
  const rememberFocus = useCallback(() => {
    origin.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
  }, []);
  const restoreFocus = useCallback((event: Event) => {
    event.preventDefault();
    const target = origin.current?.isConnected
      ? origin.current
      : document.getElementById("main-content");
    target?.focus({ preventScroll: true });
    origin.current = null;
  }, []);
  return { rememberFocus, restoreFocus };
}
