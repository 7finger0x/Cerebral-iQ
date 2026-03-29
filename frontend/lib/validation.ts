import { z } from 'zod';

/**
 * WAIS-5 Subtest Raw Score Ranges
 * Strictly validated against the Technical Manual.
 */
export const WaisRawScoreSchema = z.object({
  Similarities: z.number().min(0).max(36),
  Vocabulary: z.number().min(0).max(45),
  BlockDesign: z.number().min(0).max(66),
  MatrixReasoning: z.number().min(0).max(26),
  FigureWeights: z.number().min(0).max(27),
  DigitSequencing: z.number().min(0).max(30),
  Coding: z.number().min(0).max(117),
  VisualPuzzles: z.number().min(0).max(26),
  SymbolSearch: z.number().min(0).max(60),
  RunningDigits: z.number().min(0).max(30),
});

export type WaisRawScores = z.infer<typeof WaisRawScoreSchema>;

/**
 * Validates a specific subtest score before submission.
 */
export function validateSubtestScore(subtest: string, score: number): boolean {
  const fieldMapping: Record<string, keyof WaisRawScores> = {
    'FRI': 'MatrixReasoning',
    'VCI': 'Vocabulary',
    'VSI': 'BlockDesign',
    'WMI': 'DigitSequencing',
    'Gs': 'Coding',
  };

  const field = fieldMapping[subtest];
  if (!field) return true; // Default passthrough

  try {
    const singleFieldValidator = WaisRawScoreSchema.pick({ [field]: true } as any);
    singleFieldValidator.parse({ [field]: score });
    return true;
  } catch (err) {
    return false;
  }
}
