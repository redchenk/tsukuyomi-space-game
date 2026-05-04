import { useMatchStore } from '../store/matchStore';
import { useRef } from 'react';
import type { PointerEvent } from 'react';

type Action = 'attack' | 'Q' | 'W' | 'E' | 'R';
type MobileAction = Action | { action: 'move'; x: number; y: number };

function emit(action: MobileAction) {
  window.dispatchEvent(new CustomEvent('match:mobile-action', { detail: action }));
}

export default function MobileControls() {
  const enabled = useMatchStore((state) => state.settings.mobileControls);
  const stickRef = useRef<HTMLDivElement | null>(null);
  if (!enabled) return null;

  const updateStick = (event: PointerEvent<HTMLDivElement>) => {
    const rect = stickRef.current?.getBoundingClientRect();
    if (!rect) return;
    const dx = event.clientX - (rect.left + rect.width / 2);
    const dy = event.clientY - (rect.top + rect.height / 2);
    const length = Math.max(1, Math.hypot(dx, dy));
    const strength = Math.min(1, length / (rect.width * 0.35));
    emit({ action: 'move', x: (dx / length) * strength, y: (dy / length) * strength });
  };

  return (
    <div className="mobile-controls">
      <div
        ref={stickRef}
        className="mobile-stick"
        onPointerDown={(event) => {
          event.currentTarget.setPointerCapture(event.pointerId);
          updateStick(event);
        }}
        onPointerMove={(event) => {
          if (event.currentTarget.hasPointerCapture(event.pointerId)) updateStick(event);
        }}
        onPointerUp={(event) => {
          event.currentTarget.releasePointerCapture(event.pointerId);
          emit({ action: 'move', x: 0, y: 0 });
        }}
        onPointerCancel={() => emit({ action: 'move', x: 0, y: 0 })}
      >
        <i />
      </div>
      <div className="mobile-skills">
        {(['Q', 'W', 'E', 'R'] as Action[]).map((key) => <button key={key} type="button" onPointerDown={() => emit(key)}>{key}</button>)}
        <button className="attack" type="button" onPointerDown={() => emit('attack')}>A</button>
      </div>
    </div>
  );
}
