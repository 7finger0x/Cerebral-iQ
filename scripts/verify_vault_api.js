import { fetchItemsForDomain } from '../src/data/api.js';

async function verifyAPI() {
  console.log('--- SIGNAL AUTOMATE: API Vault Verification (Supabase Bridge) ---');

  // Test Case 1: Fetch known domain (gf_reasoning_patterns)
  // This will trigger the Supabase query via OR 
  console.log('Testing domain: gf_reasoning_patterns...');
  const gf_items = await fetchItemsForDomain('gf_reasoning_patterns');
  
  console.log(`Successfully fetched ${gf_items.length} items.`);
  if (gf_items.length === 0) throw new Error('Failed to fetch items from vault or fallback.');

  // Test Case 2: Verify Expert content was 'unrolled' correctly
  const expert_item = gf_items.find(i => i.id === 'gf7');
  if (expert_item) {
    console.log('--- DATA PARITY CHECK: gf7 ---');
    console.log(`Stem: ${expert_item.stem}`);
    console.log(`Difficulty: ${expert_item.difficulty}`);
    if (expert_item.difficulty !== 'expert') throw new Error('Item property mapping failed.');
  } else {
    console.log('Warning: gf7 (expert) not found in the first batch? Checking fetch limits.');
  }

  // Test Case 3: Verify fallback logic for invalid domain
  console.log('Testing fallback logic for invalid domain...');
  const invalid_items = await fetchItemsForDomain('non_existent_domain_99');
  if (invalid_items.length !== 0) throw new Error('Fallback logic incorrectly returned data for invalid domain.');

  console.log('--- VALIDATION SUCCESSFUL: API VAULT BRIDGE STABLE ---');
}

verifyAPI().catch(err => {
  console.error(`--- VALIDATION FAILED: ${err.message} ---`);
  process.exit(1);
});
