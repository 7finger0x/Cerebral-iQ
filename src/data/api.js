import { supabase } from '../lib/supabaseClient';
import ItemBank from './ItemBank.json';

// In Phase 3, this file centralizes data fetching.
// If the DB is fully connected, we pull items. For now we simulate an async fetch from the DB.

export async function fetchItemsForDomain(domainKey) {
  try {
    // Removed artificial delay per IDE warnings
    await Promise.resolve();

    // Mock API call using Supabase structure:
    // const { data, error } = await supabase.from('item_bank').select('*').eq('domain', domainKey);
    // if (error) throw error;
    // return data;

    // For local MVP fallback:
    if (Object.keys(ItemBank).includes(domainKey)) {
      return ItemBank[domainKey];
    } else {
      throw new Error(`Domain ${domainKey} not found in database.`);
    }
  } catch (error) {
    return [];
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
