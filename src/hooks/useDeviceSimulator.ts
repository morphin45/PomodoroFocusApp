import { useState, useEffect, useRef, useCallback } from 'react';
import type { TimerMode, TimerState } from './usePomodoro';

export type ConnectionState = 'disconnected' | 'connecting' | 'connected' | 'error';

export interface DeviceInfo {
  name: string;
  firmware: string;
  battery: number;
  signalStrength: number;
  servoAngle: number;
  ledColor: string;
  ledBrightness: number;
  isPulsing: boolean;
  isBuzzerActive: boolean;
  isVibrating: boolean;
}

export interface DeviceCommand {
  type: string;
  payload?: Record<string, unknown>;
}

const DEVICE_NAMES = ['PomoTomato-001', 'TomatoFocus-A3', 'PomoDevice-X7'];

function getLEDColor(mode: TimerMode, state: TimerState): string {
  if (state === 'paused') return '#fbbf24'; // amber pulsing
  switch (mode) {
    case 'focus': return '#ef4444'; // red
    case 'shortBreak': return '#22c55e'; // green
    case 'longBreak': return '#3b82f6'; // blue
  }
}

export function useDeviceSimulator(
  mode: TimerMode,
  timerState: TimerState,
  servoAngle: number,
  timeLeft: number,
  sessionsCompleted: number,
) {
  const [connectionState, setConnectionState] = useState<ConnectionState>('disconnected');
  const [device, setDevice] = useState<DeviceInfo>({
    name: DEVICE_NAMES[0],
    firmware: '1.2.0',
    battery: 85,
    signalStrength: 92,
    servoAngle: 10,
    ledColor: '#ef4444',
    ledBrightness: 0,
    isPulsing: false,
    isBuzzerActive: false,
    isVibrating: false,
  });

  const smoothAngleRef = useRef(10);
  const commandLogRef = useRef<{ time: number; command: string }[]>([]);

  // Simulate initial connection
  useEffect(() => {
    const saved = localStorage.getItem('pomodoro-device-connected');
    if (saved === 'true') {
      setConnectionState('connecting');
      const timer = setTimeout(() => {
        setConnectionState('connected');
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  // Update device state based on timer
  useEffect(() => {
    if (connectionState !== 'connected') return;

    // Smooth servo movement (simulates physical servo lag)
    const targetAngle = servoAngle;
    const diff = targetAngle - smoothAngleRef.current;
    smoothAngleRef.current += diff * 0.1; // Smooth interpolation

    const ledColor = getLEDColor(mode, timerState);
    const isPulsing = timerState === 'paused';
    const ledBrightness = timerState === 'idle' ? 0.3 : timerState === 'paused' ? 0.5 : 1.0;

    setDevice(prev => ({
      ...prev,
      servoAngle: smoothAngleRef.current,
      ledColor,
      ledBrightness,
      isPulsing,
      isBuzzerActive: false,
      isVibrating: false,
    }));
  }, [mode, timerState, servoAngle, connectionState]);

  // Battery drain simulation
  useEffect(() => {
    if (connectionState !== 'connected' || timerState !== 'running') return;
    const interval = setInterval(() => {
      setDevice(prev => ({
        ...prev,
        battery: Math.max(0, prev.battery - 0.1),
      }));
    }, 60000); // Drain 0.1% per minute
    return () => clearInterval(interval);
  }, [connectionState, timerState]);

  // Session complete effects
  useEffect(() => {
    if (connectionState !== 'connected') return;
    if (timeLeft === 0 && timerState === 'idle') {
      setDevice(prev => ({
        ...prev,
        isBuzzerActive: true,
        isVibrating: true,
        ledBrightness: 1,
      }));
      const timer = setTimeout(() => {
        setDevice(prev => ({
          ...prev,
          isBuzzerActive: false,
          isVibrating: false,
        }));
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [timeLeft, timerState, connectionState]);

  const connect = useCallback(() => {
    setConnectionState('connecting');
    setTimeout(() => {
      setConnectionState('connected');
      localStorage.setItem('pomodoro-device-connected', 'true');
      const randomName = DEVICE_NAMES[Math.floor(Math.random() * DEVICE_NAMES.length)];
      setDevice(prev => ({
        ...prev,
        name: randomName,
        battery: 70 + Math.random() * 30,
        signalStrength: 80 + Math.random() * 20,
      }));
    }, 2000);
  }, []);

  const disconnect = useCallback(() => {
    setConnectionState('disconnected');
    localStorage.setItem('pomodoro-device-connected', 'false');
    setDevice(prev => ({
      ...prev,
      servoAngle: 10,
      ledBrightness: 0,
      isPulsing: false,
    }));
    smoothAngleRef.current = 10;
  }, []);

  const sendCommand = useCallback((command: DeviceCommand) => {
    if (connectionState !== 'connected') return;
    commandLogRef.current = [
      { time: Date.now(), command: command.type },
      ...commandLogRef.current.slice(0, 19),
    ];
  }, [connectionState]);

  const commandLog = commandLogRef.current;

  return {
    connectionState,
    device,
    commandLog,
    connect,
    disconnect,
    sendCommand,
  };
}
