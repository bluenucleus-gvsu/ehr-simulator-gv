import { useEffect, useRef, useCallback } from 'react';

const EDITABLE_TAGS = new Set(['INPUT', 'TEXTAREA']);
const MIN_LENGTH = 36;
const IDLE_TIMEOUT_MS = 60;

function isEditableElement(element: Element | null): boolean {
  if (!element) return false;
  if (EDITABLE_TAGS.has(element.tagName)) return true;
  return false;
}

export const useSimulationScanner = (
  onScan: (code: string) => void,
) => {
  const bufferRef = useRef('');
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const onScanRef = useRef(onScan);

  useEffect(() => { onScanRef.current = onScan; });

  const resetBuffer = useCallback(() => {
    bufferRef.current = '';
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = null;
  }, []);

  const evaluate = useCallback(() => {
    const code = bufferRef.current;
    resetBuffer();
    if (code.length >= MIN_LENGTH) onScanRef.current(code);
  }, [resetBuffer]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore modifiers
      if (e.ctrlKey || e.altKey || e.metaKey) return;

      // Ignore special keys
      if (e.key.length > 1 && e.key !== 'Enter') return;

      // Allow Input and Textarea interaction
      if (isEditableElement(document.activeElement)) {
        resetBuffer();
        return;
      }

      if (e.key === 'Enter') {
        e.preventDefault();
        evaluate();
        return;
      }

      e.preventDefault();
      bufferRef.current += e.key;

      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(evaluate, IDLE_TIMEOUT_MS);
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      resetBuffer();
    };
  }, [evaluate, resetBuffer]);
};