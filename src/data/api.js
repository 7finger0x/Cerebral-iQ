import { supabase } from '../lib/supabaseClient.js';
import ItemBank from './ItemBank.json' with { type: 'json' };

// In Phase 3, this file centralizes data fetching.
// If the DB is fully connected, we pull items. For now we simulate an async fetch from the DB.

/**
 * Adaptive Item Fetcher (CS-04 Protocol)
 * AC-01: Global Supabase Vault fetch.
 * AC-02: Local JSON Fallback (ItemBank.json).
 */
export async function fetchItemsForDomain(domainKey) {
  try {
    // 1. Supabase Query Attempt (Production Vault)
    const { data: dbItems, error } = await supabase
      .from('assessment_items')
      .select('*')
      .or(`domain.eq.${domainKey},subtest.eq.${domainKey}`)
      .eq('is_active', true);

    if (!error && dbItems && dbItems.length > 0) {
      // Data-Transformation: Unroll 'content' jsonb back to top-level attributes [clinical-sync]
      return dbItems.map(item => ({
        id: item.id,
        difficulty: item.difficulty,
        type: item.task_type,
        ...item.content
      }));
    }

    // 2. Local Fallback (Development/Offline Persistence)
    if (Object.keys(ItemBank).includes(domainKey)) {
      return ItemBank[domainKey];
    }

    throw new Error(`Domain ${domainKey} not found in database or fallback.`);
  } catch (error) {
    // Silent fail over to empty or fallback on critical error
    return ItemBank[domainKey] || [];
  }
}

export async function saveAssessmentSession(userId, scores) {
  try {
    // Removed artificial delay per IDE warnings
    await Promise.resolve();

    // const { error } = await supabase.from('assessments').insert([{ user_id: userId, profile: scores }]);
    // if (error) throw error;
    
    return true;
  } catch (error) {
    return false;
  }
}

// Phase 5: Fetch Historic User Assessments
export async function fetchUserAssessments(userId) {
  try {
    // Removed artificial delay per IDE warnings
    await Promise.resolve();

    // const { data, error } = await supabase.from('assessments').select('*').eq('user_id', userId).order('created_at', { ascending: false });
    // if (error) throw error;
    // return data;

    // Local Mock Fallback: Give them a fake history if they are logged in
    if (userId === "mock-user-123") {
      return [
        { id: 1, created_at: new Date(Date.now() - 86400000 * 30).toISOString(), profile: { gf: 6, gc: 12, gwm: 11, gs: 40 } },
        { id: 2, created_at: new Date(Date.now() - 86400000 * 60).toISOString(), profile: { gf: 5, gc: 11, gwm: 10, gs: 38 } }
      ];
    }
    
    return []; // New user or guest
  } catch (error) {
    return [];
  }
}
