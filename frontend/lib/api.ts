const API_BASE_URL = process.env.NEXT_PUBLIC_ENGINE_URL || 'http://localhost:8000';

export interface Item {
  id: string;
  domain: string;
  type: string;
  a: number;
  b: number;
  c: number;
  metadata: any;
}

export interface AssessmentResponse {
  status: 'continuing' | 'complete';
  next_item: Item | null;
  item_idx: number;
  updated_theta: number;
}

export const engineApi = {
  startSession: async () => {
    const res = await fetch(`${API_BASE_URL}/assessment/start`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });
    if (!res.ok) throw new Error('Failed to start session');
    return res.json();
  },

  submitAnswer: async (sessionId: string, itemIdx: number, response: number, currentTheta: number, history: number[]): Promise<AssessmentResponse> => {
    const res = await fetch(`${API_BASE_URL}/assessment/submit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        session_id: sessionId,
        item_idx: itemIdx,
        response: response,
        current_theta: currentTheta,
        history: history
      }),
    });
    if (!res.ok) throw new Error('Failed to submit answer');
    return res.json();
  },

  finalizeScore: async (theta: number) => {
    const res = await fetch(`${API_BASE_URL}/assessment/finalize/${theta}`, {
      method: 'GET',
    });
    if (!res.ok) throw new Error('Failed to finalize score');
    return res.json();
  }
};
