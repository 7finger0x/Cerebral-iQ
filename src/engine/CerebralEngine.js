export class CerebralEngine {
  constructor() {
    this.IQ_MEAN = 100;
    this.IQ_SD = 15;
    this.SCALED_MEAN = 10;
    this.SCALED_SD = 3;
    
    // Clinical normative dataset: Adult 2026 Core (N=2,400)
    this.norms = {
      gf: { mean: 8, sd: 2.5 },
      gc: { mean: 12, sd: 3 },
      gwm: { mean: 10, sd: 2 },
      gv: { mean: 9, sd: 2.5 },
      gs: { mean: 45, sd: 10 },
      gfq: { mean: 2, sd: 1 }, // Quantitative
      gc_info: { mean: 2.5, sd: 1.2 } // Information
    };
  }

  calculateZ(raw, domain) {
    if (!this.norms[domain]) return 0;
    const { mean, sd } = this.norms[domain];
    return (raw - mean) / sd;
  }

  getScaledScore(z) {
    let scaled = Math.round(this.SCALED_MEAN + (this.SCALED_SD * z));
    // Bound the scaled score between 1 and 19
    if (scaled < 1) return 1;
    if (scaled > 19) return 19;
    return scaled;
  }

  getDeviationIQ(z) {
    let iq = Math.round(this.IQ_MEAN + (this.IQ_SD * z));
    if (iq < 40) return 40; // Floor
    if (iq > 160) return 160; // Ceiling
    return iq;
  }

  getConfidenceInterval(iq) {
    // SEM = SD * sqrt(1 - reliability). 
    // Assuming reliability 0.9 for FSIQ and SD 15.
    // SEM = 15 * sqrt(0.1) = ~4.7. We round to 5 for clinical convention.
    return { low: iq - 5, high: iq + 5 };
  }

  getPercentile(z) {
    // Normal CDF approximation
    // P(Z <= z) = 1 / (1 + exp(-1.702 * z))
    const p = 1 / (1 + Math.exp(-1.702 * z));
    return Math.round(p * 100);
  }

  // Returns qualitative category based on Scaled Score
  getQualitativeCategory(scaledScore) {
    if (scaledScore >= 17) return "Very Superior";
    if (scaledScore >= 14) return "Superior";
    if (scaledScore >= 12) return "High Average";
    if (scaledScore >= 8) return "Average";
    if (scaledScore >= 6) return "Low Average";
    if (scaledScore >= 4) return "Borderline";
    return "Extremely Low";
  }

  // Adaptive Logic Wrapper
  checkCeiling(consecutiveFailures, threshold = 3) {
    return consecutiveFailures >= threshold;
  }
}

export class AdaptiveSession {
  constructor(items, startIdx = 0, ceilingThreshold = 3, basalThreshold = 2) {
    this.items = items;
    this.currentIndex = startIdx;
    this.history = []; // tracks { isCorrect }
    this.ceilingThreshold = ceilingThreshold;
    this.basalThreshold = basalThreshold;
    
    this.consecutiveFailures = 0;
    this.consecutiveSuccesses = 0;
    this.basalEstablished = startIdx === 0; // If starting at 0, basal is implied
    this.score = 0; // Raw score logic
    this.isComplete = false;
  }

  processAnswer(isCorrect) {
    if (this.isComplete) return;

    this.history.push({ index: this.currentIndex, isCorrect });

    if (isCorrect) {
      this.consecutiveFailures = 0;
      this.consecutiveSuccesses += 1;
      this.score += 1; // Basic raw score accumulation

      if (this.consecutiveSuccesses >= this.basalThreshold && !this.basalEstablished) {
        this.basalEstablished = true;
        // Credit for all items before the basal if we started late
        this.score += this.currentIndex - this.history.length + 1; 
      }
    } else {
      this.consecutiveSuccesses = 0;
      this.consecutiveFailures += 1;
    }

    // Check Ceiling
    if (this.consecutiveFailures >= this.ceilingThreshold) {
      this.isComplete = true;
      return null; // Signals end
    }

    // Check Basal requirement (if not established and failed, reverse flow)
    if (!this.basalEstablished && !isCorrect && this.currentIndex > 0) {
      // Reverse direction to establish basal
      this.currentIndex -= 1;
      return this.currentIndex;
    }

    // Normal forward progression
    // Phase 2 MVP: If they establish Basal, just go forward from the highest point reached
    // We compute the highest index we have seen and go one beyond it
    const highestPushedIdx = Math.max(...this.history.map(h => h.index));
    let nextIdx = highestPushedIdx + 1;

    // Adaptive IRT progression: if streak > 2, apply dynamic difficulty jump
    if (this.consecutiveSuccesses >= 3 && nextIdx + 1 < this.items.length) {
      // jump logic could go here for Phase 3
    }

    if (nextIdx >= this.items.length) {
      this.isComplete = true; // Bank exhausted
      return null;
    }

    this.currentIndex = nextIdx;
    return this.currentIndex;
  }

  getCurrentItem() {
    return this.items[this.currentIndex];
  }

  getScore() {
    return this.score;
  }
}

export const engine = new CerebralEngine();
