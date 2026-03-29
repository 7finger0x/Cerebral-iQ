import { useState, useEffect, useCallback, useRef } from 'react';
import { gsTimer, type HardwareProfile } from '../lib/timing';

interface TimerResult {
  startTime: number | null;
  stopTime: number | null;
  elapsed: number;
  profile: HardwareProfile | null;
  isCalibrated: boolean;
  start: () => void;
  stop: () => number;
}

/**
 * useHighPrecisionTimer: Frontend hook for Gs-sensitive assessment subtests (Symbol Scan, Coding).
 * Implements monothic delta subtraction based on calibrated hardware latency floor.
 */
export const useHighPrecisionTimer = (): TimerResult => {
  const [isCalibrated, setIsCalibrated] = useState(false);
  const [profile, setProfile] = useState<HardwareProfile | null>(null);
  
  const startTimeRef = useRef<number | null>(null);
  const stopTimeRef = useRef<number | null>(null);
  const [elapsed, setElapsed] = useState(0);

  // Initial Calibration Pulse [CS-02]
  useEffect(() => {
    const calibrate = async () => {
      const result = await gsTimer.calibrate();
      setProfile(result);
      setIsCalibrated(true);
    };
    calibrate();
  }, []);

  const start = useCallback(() => {
    startTimeRef.current = gsTimer.now();
    stopTimeRef.current = null;
    setElapsed(0);
  }, []);

  const stop = useCallback((): number => {
    if (startTimeRef.current === null) return 0;
    
    stopTimeRef.current = gsTimer.now();
    
    // Delta Calculation with Jitter Floor Neutralization
    const rawDelta = stopTimeRef.current - startTimeRef.current;
    
    // Final delta: actual elapsed minus one display refresh (theoretical I/O lag)
    const normalizedDelta = Math.max(0, rawDelta - (profile?.latencyFloor || 0));
    
    setElapsed(normalizedDelta);
    return normalizedDelta;
  }, [profile]);

  return {
    startTime: startTimeRef.current,
    stopTime: stopTimeRef.current,
    elapsed,
    profile,
    isCalibrated,
    start,
    stop
  };
};

export default useHighPrecisionTimer;
