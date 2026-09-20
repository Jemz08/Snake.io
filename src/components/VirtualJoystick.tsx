import React, { useRef, useState, useEffect, useCallback } from 'react';

interface VirtualJoystickProps {
  onMove: (angle: number) => void;
}

export const VirtualJoystick: React.FC<VirtualJoystickProps> = ({ onMove }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const pointerIdRef = useRef<number | null>(null);
  const [active, setActive] = useState(false);
  const [knobPos, setKnobPos] = useState({ x: 0, y: 0 });
  const baseRadius = 52;
  const maxDistance = 38;

  const updateKnob = useCallback((clientX: number, clientY: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const dx = clientX - centerX;
    const dy = clientY - centerY;
    const dist = Math.hypot(dx, dy);
    const angle = Math.atan2(dy, dx);

    const clampedDist = Math.min(dist, maxDistance);
    const knobX = Math.cos(angle) * clampedDist;
    const knobY = Math.sin(angle) * clampedDist;

    setKnobPos({ x: knobX, y: knobY });

    if (dist > 4) {
      onMove(angle);
    }
  }, [maxDistance, onMove]);

  const handlePointerDown = (e: React.PointerEvent) => {
    // Only capture if no other pointer currently controls the joystick
    if (pointerIdRef.current !== null && pointerIdRef.current !== e.pointerId) {
      return;
    }
    pointerIdRef.current = e.pointerId;
    setActive(true);
    try {
      (e.target as HTMLElement).setPointerCapture(e.pointerId);
    } catch {
      // ignore
    }
    updateKnob(e.clientX, e.clientY);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!active || pointerIdRef.current !== e.pointerId) return;
    updateKnob(e.clientX, e.clientY);
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (pointerIdRef.current === e.pointerId) {
      pointerIdRef.current = null;
      setActive(false);
      setKnobPos({ x: 0, y: 0 });
      try {
        (e.target as HTMLElement).releasePointerCapture(e.pointerId);
      } catch {
        // ignore
      }
    }
  };

  useEffect(() => {
    const handleGlobalUp = (e: PointerEvent) => {
      if (pointerIdRef.current === e.pointerId) {
        pointerIdRef.current = null;
        setActive(false);
        setKnobPos({ x: 0, y: 0 });
      }
    };
    window.addEventListener('pointerup', handleGlobalUp);
    window.addEventListener('pointercancel', handleGlobalUp);
    return () => {
      window.removeEventListener('pointerup', handleGlobalUp);
      window.removeEventListener('pointercancel', handleGlobalUp);
    };
  }, []);

  return (
    <div
      id="virtual-joystick-container"
      ref={containerRef}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      className="relative flex items-center justify-center select-none touch-none cursor-pointer"
      style={{
        width: baseRadius * 2,
        height: baseRadius * 2,
      }}
    >
      {/* Outer base ring */}
      <div
        id="joystick-base"
        className={`w-full h-full rounded-full border-2 flex items-center justify-center transition-colors duration-200 ${
          active
            ? 'bg-cyan-950/40 border-cyan-400 shadow-[0_0_20px_rgba(6,182,212,0.5)]'
            : 'bg-slate-900/40 border-slate-700/60 shadow-lg'
        } backdrop-blur-sm`}
      >
        {/* Crosshair guidelines */}
        <div className="absolute w-full h-[1px] bg-cyan-500/20" />
        <div className="absolute h-full w-[1px] bg-cyan-500/20" />
        <div className="w-9 h-9 rounded-full border border-cyan-500/30" />
      </div>

      {/* Interactive analog knob */}
      <div
        id="joystick-knob"
        className={`absolute rounded-full pointer-events-none transition-transform duration-75 flex items-center justify-center ${
          active
            ? 'w-12 h-12 bg-gradient-to-tr from-cyan-600 to-cyan-300 shadow-[0_0_15px_#22d3ee] border-2 border-white'
            : 'w-10 h-10 bg-slate-700/80 border-2 border-cyan-500/40'
        }`}
        style={{
          transform: `translate3d(${knobPos.x}px, ${knobPos.y}px, 0)`,
        }}
      >
        {/* Glowing center indicator */}
        <div className={`w-3 h-3 rounded-full ${active ? 'bg-white' : 'bg-cyan-400'}`} />
      </div>
    </div>
  );
};
