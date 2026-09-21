import React, { useRef, useState, useEffect, useCallback } from 'react';

interface VirtualJoystickProps {
  onMove: (angle: number) => void;
  isFloating?: boolean;
  scale?: number;
  opacity?: number;
  fixedPosition?: { x: number; y: number }; // Percentage 0-100
}

export const VirtualJoystick: React.FC<VirtualJoystickProps> = ({
  onMove,
  isFloating = true,
  scale = 1.0,
  opacity = 0.9,
  fixedPosition,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const pointerIdRef = useRef<number | null>(null);
  const [active, setActive] = useState(false);
  const [knobPos, setKnobPos] = useState({ x: 0, y: 0 });
  const [basePos, setBasePos] = useState<{ x: number; y: number } | null>(null);

  const baseRadius = 52 * scale;
  const maxDistance = 38 * scale;

  const updateKnob = useCallback(
    (clientX: number, clientY: number, anchorX: number, anchorY: number) => {
      const dx = clientX - anchorX;
      const dy = clientY - anchorY;
      const dist = Math.hypot(dx, dy);
      const angle = Math.atan2(dy, dx);

      // In floating mode: if finger drags beyond maxDistance, slightly pull the base along!
      if (isFloating && dist > maxDistance * 1.5) {
        const pullFactor = 0.25;
        const pullDx = (dist - maxDistance * 1.5) * Math.cos(angle) * pullFactor;
        const pullDy = (dist - maxDistance * 1.5) * Math.sin(angle) * pullFactor;
        setBasePos((prev) => (prev ? { x: prev.x + pullDx, y: prev.y + pullDy } : null));
      }

      const clampedDist = Math.min(dist, maxDistance);
      const knobX = Math.cos(angle) * clampedDist;
      const knobY = Math.sin(angle) * clampedDist;

      setKnobPos({ x: knobX, y: knobY });

      if (dist > 4) {
        onMove(angle);
      }
    },
    [isFloating, maxDistance, onMove]
  );

  const handlePointerDown = (e: React.PointerEvent) => {
    if (pointerIdRef.current !== null && pointerIdRef.current !== e.pointerId) {
      return;
    }
    pointerIdRef.current = e.pointerId;
    setActive(true);

    try {
      (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    } catch {
      // ignore
    }

    if (isFloating) {
      setBasePos({ x: e.clientX, y: e.clientY });
      setKnobPos({ x: 0, y: 0 });
    } else {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        updateKnob(e.clientX, e.clientY, rect.left + rect.width / 2, rect.top + rect.height / 2);
      }
    }
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!active || pointerIdRef.current !== e.pointerId) return;

    if (isFloating && basePos) {
      updateKnob(e.clientX, e.clientY, basePos.x, basePos.y);
    } else if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      updateKnob(e.clientX, e.clientY, rect.left + rect.width / 2, rect.top + rect.height / 2);
    }
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (pointerIdRef.current === e.pointerId) {
      pointerIdRef.current = null;
      setActive(false);
      setKnobPos({ x: 0, y: 0 });
      if (isFloating) {
        setBasePos(null);
      }
      try {
        (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
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
        if (isFloating) setBasePos(null);
      }
    };
    window.addEventListener('pointerup', handleGlobalUp);
    window.addEventListener('pointercancel', handleGlobalUp);
    return () => {
      window.removeEventListener('pointerup', handleGlobalUp);
      window.removeEventListener('pointercancel', handleGlobalUp);
    };
  }, [isFloating]);

  // If floating joystick mode: render an invisible touch catcher on the left half of the screen
  if (isFloating) {
    return (
      <>
        {/* Touch zone catcher */}
        <div
          id="floating-joystick-touch-zone"
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          className="fixed left-0 bottom-0 w-[50vw] h-[75vh] touch-none select-none z-30 pointer-events-auto"
          style={{
            touchAction: 'none',
          }}
        />

        {/* Floating Joystick rendered dynamically under user's finger */}
        {active && basePos && (
          <div
            id="floating-joystick-body"
            className="fixed pointer-events-none select-none z-40 transition-transform duration-75"
            style={{
              left: `${basePos.x - baseRadius}px`,
              top: `${basePos.y - baseRadius}px`,
              width: `${baseRadius * 2}px`,
              height: `${baseRadius * 2}px`,
              opacity,
            }}
          >
            {/* Outer base ring */}
            <div className="w-full h-full rounded-full border-2 bg-cyan-950/50 border-cyan-400 shadow-[0_0_25px_rgba(6,182,212,0.6)] backdrop-blur-md flex items-center justify-center relative">
              {/* Guidelines */}
              <div className="absolute w-full h-[1px] bg-cyan-400/30" />
              <div className="absolute h-full w-[1px] bg-cyan-400/30" />
              <div className="w-9 h-9 rounded-full border border-cyan-400/40" />
            </div>

            {/* Knob */}
            <div
              className="absolute left-1/2 top-1/2 -ml-6 -mt-6 w-12 h-12 rounded-full bg-gradient-to-tr from-cyan-600 to-cyan-300 shadow-[0_0_20px_#22d3ee] border-2 border-white flex items-center justify-center"
              style={{
                transform: `translate3d(${knobPos.x}px, ${knobPos.y}px, 0)`,
              }}
            >
              <div className="w-3 h-3 rounded-full bg-white animate-pulse" />
            </div>
          </div>
        )}

        {/* Subtle resting guide hint when inactive */}
        {!active && (
          <div
            className="pointer-events-none select-none flex items-center gap-1 text-[10px] font-cyber text-cyan-400/50 uppercase tracking-widest pl-3 pb-2"
            style={{ opacity: 0.7 }}
          >
            <span className="w-2 h-2 rounded-full border border-cyan-400/60 animate-ping inline-block mr-1" />
            FLOATING JOYSTICK ACTIVE (TOUCH ANYWHERE ON LEFT)
          </div>
        )}
      </>
    );
  }

  // Fixed position joystick mode
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
        opacity,
      }}
    >
      {/* Outer base ring */}
      <div
        id="joystick-base"
        className={`w-full h-full rounded-full border-2 flex items-center justify-center transition-colors duration-200 ${
          active
            ? 'bg-cyan-950/50 border-cyan-400 shadow-[0_0_20px_rgba(6,182,212,0.5)]'
            : 'bg-slate-900/60 border-slate-700/80 shadow-xl'
        } backdrop-blur-md`}
      >
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
        <div className={`w-3 h-3 rounded-full ${active ? 'bg-white' : 'bg-cyan-400'}`} />
      </div>
    </div>
  );
};
