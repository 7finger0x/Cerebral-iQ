import { AdaptiveSession, engine } from '../src/engine/CerebralEngine.js';
import { readFileSync } from 'fs';
const ItemBank = JSON.parse(readFileSync('./src/data/ItemBank.json', 'utf8'));

const gf_items = ItemBank.gf_reasoning_patterns;

function runTest() {
  console.log('--- SIGNAL AUTOMATE: G_f Weighted Scoring Validation ---');

  // Case 1: All Expert Correct
  const expert_session = new AdaptiveSession(gf_items.filter(i => i.difficulty === 'expert'));
  expert_session.processAnswer(true); // Expert item gf7
  expert_session.processAnswer(true); // Expert item gf8
  
  const expert_score = expert_session.getScore();
  console.log(`Expert items correct (2x): ${expert_score}`);
  if (expert_score !== 4.0) throw new Error('Expert weighting logic failed.');

  // Case 2: Easy vs Hard Comparison
  const mixed_items = [
    { id: 't1', difficulty: 'easy' },
    { id: 't2', difficulty: 'hard' }
  ];
  const compare_session = new AdaptiveSession(mixed_items);
  compare_session.processAnswer(true); // Easy (0.5)
  compare_session.processAnswer(true); // Hard (1.5)
  
  const total_score = compare_session.getScore();
  console.log(`Combined Easy(0.5) + Hard(1.5): ${total_score}`);
  if (total_score !== 2.0) throw new Error('Difficulty weighting cross-check failed.');

  // Case 3: Z-Score with expert weight
  const z_expert = engine.calculateZ(10, 'gf', 'expert');
  const z_medium = engine.calculateZ(10, 'gf', 'medium');
  console.log(`Z-Score Expert (1.6x): ${z_expert.toFixed(2)}`);
  console.log(`Z-Score Medium (1.0x): ${z_medium.toFixed(2)}`);
  
  if (Math.abs(z_expert / z_medium - 1.6) > 0.01) {
    throw new Error('CerebralEngine.calculateZ expert multiplier error.');
  }

  console.log('--- VALIDATION SUCCESSFUL: G_f CORE STABLE ---');
}

try {
  runTest();
} catch (e) {
  console.error(`--- VALIDATION FAILED: ${e.message} ---`);
  process.exit(1);
}
