const API_BASE_URL = process.env.NEXT_PUBLIC_ENGINE_URL || 'http://localhost:8000';

export interface Item {
  id: string;
  item_idx: number;
  domain: string;
  type: string;
  content?: string;
  a: number;
  b: number;
  c: number;
  metadata: Record<string, unknown>;
}

export interface AssessmentResponse {
  status: 'continuing' | 'complete';
  next_item: Item | null;
  item_idx: number;
  updated_theta: number;
}

export const engineApi = {
  startSession: async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/assessment/start`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      if (!res.ok) {
        const error = await res.json().catch(() => ({ detail: 'Unknown error' }));
        throw new Error(error.detail || 'Failed to start session');
      }
      return await res.json();
    } catch (err) {
      console.error('Engine Error (Start):', err);
      throw err;
    }
  },

  submitAnswer: async (sessionId: string, itemIdx: number, response: number, currentTheta: number, history: number[]): Promise<AssessmentResponse> => {
    try {
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
      if (!res.ok) {
        const error = await res.json().catch(() => ({ detail: 'Unknown error' }));
        throw new Error(error.detail || 'Failed to submit answer');
      }
      return await res.json();
    } catch (err) {
      console.error('Engine Error (Submit):', err);
      throw err;
    }
  },

  finalizeScore: async (theta: number) => {
    try {
      const res = await fetch(`${API_BASE_URL}/assessment/finalize/${theta}`, {
        method: 'GET',
      });
      if (!res.ok) {
        const error = await res.json().catch(() => ({ detail: 'Unknown error' }));
        throw new Error(error.detail || 'Failed to finalize score');
      }
      return await res.json();
    } catch (err) {
      console.error('Engine Error (Finalize):', err);
      throw err;
    }
  }
};
