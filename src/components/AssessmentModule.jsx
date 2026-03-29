import { useState } from 'react';
import ReasoningPatterns from './subtests/ReasoningPatterns';
import VerbalKnowledge from './subtests/VerbalKnowledge';
import NumberSequence from './subtests/NumberSequence';
import SymbolScan from './subtests/SymbolScan';
import VisualPatterns from './subtests/VisualPatterns';
import QuantitativeReasoning from './subtests/QuantitativeReasoning';
import GeneralInformation from './subtests/GeneralInformation';
import { saveAssessmentSession } from '../data/api';

export default function AssessmentModule({ user, onComplete, onCancel }) {
  const [currentSubtestIndex, setCurrentSubtestIndex] = useState(0);
  const [scores, setScores] = useState({});

  const SUBTESTS = [
    { id: 'gf', component: ReasoningPatterns, title: 'Reasoning Patterns (Gf)' },
    { id: 'gc', component: VerbalKnowledge, title: 'Verbal Knowledge (Gc)' },
    { id: 'gc_info', component: GeneralInformation, title: 'Information (Gc)' },
    { id: 'gwm', component: NumberSequence, title: 'Number Sequence (Gwm)' },
    { id: 'gfq', component: QuantitativeReasoning, title: 'Quantitative Reasoning (Gfq)' },
    { id: 'gv', component: VisualPatterns, title: 'Visual Patterns (Gv)' },
    { id: 'gs', component: SymbolScan, title: 'Symbol Scan (Gs)' }
  ];

  const handleSubtestFinish = async (subtestId, rawScore) => {
    const updatedScores = { ...scores, [subtestId]: rawScore };
    setScores(updatedScores);
    
    if (currentSubtestIndex + 1 < SUBTESTS.length) {
      setCurrentSubtestIndex(currentSubtestIndex + 1);
    } else {
      // All done - Phase 3 Backend save
      await saveAssessmentSession(user?.id || 'guest', updatedScores);
      onComplete(updatedScores);
    }
  };

  const CurrentComponent = SUBTESTS[currentSubtestIndex].component;

  return (
    <div style={{ width: '100%', maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
        <h3 className="gradient-text">{SUBTESTS[currentSubtestIndex].title}</h3>
        <button onClick={onCancel} style={{ background: 'transparent', color: 'var(--color-text-muted)', border: 'none', cursor: 'pointer' }}>Quit Assessment</button>
      </div>
      <div className="glass-panel" style={{ padding: '2rem' }}>
        <CurrentComponent onFinish={(raw) => handleSubtestFinish(SUBTESTS[currentSubtestIndex].id, raw)} />
      </div>
    </div>
  );
}
