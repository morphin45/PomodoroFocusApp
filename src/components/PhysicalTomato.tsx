import { useEffect, useRef } from 'react';
import type { TimerMode, TimerState } from '../hooks/usePomodoro';

interface Props {
  mode: TimerMode;
  timerState: TimerState;
  progress: number;
  servoAngle: number;
  isVibrating?: boolean;
  onClick?: () => void;
}

export default function PhysicalTomato({ mode, timerState, progress, servoAngle, isVibrating, onClick }: Props) {
  const pointerRef = useRef<HTMLDivElement>(null);
  const tomatoRef = useRef<HTMLDivElement>(null);

  // Smooth servo movement
  useEffect(() => {
    if (pointerRef.current) {
      const rotation = -90 + progress * 180;
      pointerRef.current.style.transform = `translateX(-50%) rotate(${rotation}deg)`;
    }
  }, [progress]);

  // Vibration animation
  useEffect(() => {
    if (isVibrating && tomatoRef.current) {
      tomatoRef.current.classList.add('vibrating');
      const t = setTimeout(() => {
        tomatoRef.current?.classList.remove('vibrating');
      }, 600);
      return () => clearTimeout(t);
    }
  }, [isVibrating]);

  const statusColor = mode === 'focus'
    ? '#ef4444'
    : mode === 'shortBreak'
    ? '#22c55e'
    : '#3b82f6';

  const tomatoGradient = mode === 'focus'
    ? 'linear-gradient(145deg, #ff5a5f, #c51f2d)'
    : mode === 'shortBreak'
    ? 'linear-gradient(145deg, #4ade80, #16a34a)'
    : 'linear-gradient(145deg, #60a5fa, #2563eb)';

  return (
    <div className="physical-device-container">
      <div
        ref={tomatoRef}
        className="tomato"
        style={{ background: tomatoGradient }}
        onClick={onClick}
        role="button"
        tabIndex={0}
        aria-label="Press to start or pause timer"
      >
        {/* Status light */}
        <div
          className="status-light"
          style={{
            background: statusColor,
            boxShadow: `0 0 18px ${statusColor}`,
            opacity: timerState === 'paused' ? 0.5 : 1,
            animation: timerState === 'paused' ? 'pulse 2s ease-in-out infinite' : 'none',
          }}
        />

        {/* Dial */}
        <div className="dial">
          <div className="dial-ticks">
            {Array.from({ length: 11 }).map((_, i) => (
              <span key={i} className="dial-tick">
                {String(i * (timerState === 'running' ? Math.round(progress * 25) : 25) / 10).padStart(2, '0')}
              </span>
            ))}
          </div>
          <div ref={pointerRef} className="dial-pointer" />
        </div>

        {/* Servo angle indicator */}
        <div className="servo-label">
          {Math.round(servoAngle)}°
        </div>
      </div>

      {/* Label */}
      <div className="device-label">
        Physical progress indicator
      </div>

      {/* Instruction */}
      {timerState === 'idle' && (
        <div className="instruction">
          Click the tomato to start
        </div>
      )}
    </div>
  );
}
