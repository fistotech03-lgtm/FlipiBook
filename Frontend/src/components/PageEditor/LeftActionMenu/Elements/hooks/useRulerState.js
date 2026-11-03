import { useState, useEffect } from 'react';

/**
 * useRulerState
 * Manages ruler state synchronization with parent prop and global window toggle event
 *
 * @param {boolean} isRulerEnabled - Initial or external ruler state
 * @returns {[boolean, React.Dispatch<React.SetStateAction<boolean>>]}
 */
export function useRulerState(isRulerEnabled = true) {
  const [rulerActive, setRulerActive] = useState(Boolean(isRulerEnabled));

  // Sync with prop
  useEffect(() => {
    setRulerActive(Boolean(isRulerEnabled));
  }, [isRulerEnabled]);

  // Listen to global ruler toggle event
  useEffect(() => {
    const handleToggleRuler = (e) => {
      if (e.detail !== undefined) {
        const val =
          typeof e.detail === 'object' && e.detail !== null
            ? (e.detail.isRulerEnabled !== undefined ? e.detail.isRulerEnabled : e.detail)
            : e.detail;
        setRulerActive(Boolean(val));
      } else {
        setRulerActive((prev) => !prev);
      }
    };

    window.addEventListener('editor_toggleRuler', handleToggleRuler);
    return () => window.removeEventListener('editor_toggleRuler', handleToggleRuler);
  }, []);

  return [rulerActive, setRulerActive];
}

export default useRulerState;
