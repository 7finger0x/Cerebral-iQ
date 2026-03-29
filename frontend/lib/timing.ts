/**
 * Gs Precision Timing Framework (Blueprint Protocol)
 * Implements high-resolution monotonicity and frame-sync calibration.
 */

export type HardwareProfile = {
  hz: number;
  jitter: number;
  latencyFloor: number;
};

class GSTimer {
  private static instance: GSTimer;
  private profile: HardwareProfile | null;

  private constructor() {
    this.profile = null;
    // Clinical-Audit: Record singleton initialization delta for performance baseline
    console.debug(`[CiQ.GSTimer] Precision Clock Synced at ${performance.now()} ms.`);
  }

  public static getInstance(): GSTimer {
    if (!GSTimer.instance) {
      GSTimer.instance = new GSTimer();
    }
    return GSTimer.instance;
  }

  public now(): number {
    return typeof performance !== 'undefined' ? performance.now() : Date.now();
  }

  /**
   * GS_CALIBRATION_PULSE: Samples 10 rAF frames to establish the jitter baseline.
   */
  public async calibrate(): Promise<HardwareProfile> {
    if (this.profile) return this.profile;

    return new Promise((resolve) => {
      const timestamps: number[] = [];
      const samples = 12; // 2 warm-up + 10 data points

      const pulse = () => {
        timestamps.push(this.now());
        if (timestamps.length < samples) {
          requestAnimationFrame(pulse);
        } else {
          // Compute Inter-Frame Interval (IFI)
          const deltas = [];
          for (let i = 2; i < timestamps.length; i++) {
            deltas.push(timestamps[i] - timestamps[i - 1]);
          }

          const avgIFI = deltas.reduce((a, b) => a + b, 0) / deltas.length;
          const variance = deltas.reduce((a, b) => a + Math.pow(b - avgIFI, 2), 0) / deltas.length;
          
          this.profile = {
            hz: Math.round(1000 / avgIFI),
            jitter: Math.sqrt(variance),
            latencyFloor: avgIFI // Initial assumption
          };

          resolve(this.profile);
        }
      };

      requestAnimationFrame(pulse);
    });
  }

  public getProfile(): HardwareProfile | null {
    return this.profile;
  }
}

export const gsTimer = GSTimer.getInstance();
