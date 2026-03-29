import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const ItemBank = JSON.parse(readFileSync('./src/data/ItemBank.json', 'utf8'));

const mapToDb = (items, domain, subtest) => items.map(i => {
  const { id, difficulty, type, ...rest } = i;
  return {
    id,
    domain,
    subtest,
    difficulty: difficulty || 'medium',
    task_type: type || 'standard',
    content: rest,
    is_active: true
  };
});

async function ingest() {
  console.log('--- DASH INGEST: Item Bank Migration ---');
  
  const allItems = [
    ...mapToDb(ItemBank.gf_reasoning_patterns, 'gf', 'reasoning_patterns'),
    ...mapToDb(ItemBank.gc_verbal_knowledge, 'gc', 'verbal_knowledge'),
    ...mapToDb(ItemBank.gwm_number_sequence, 'gwm', 'number_sequence'),
    ...mapToDb(ItemBank.gs_speed_coding, 'gs', 'speed_coding'),
    ...mapToDb(ItemBank.gv_visual_patterns, 'gv', 'visual_patterns'),
    ...mapToDb(ItemBank.gfq_quantitative_reasoning, 'gfq', 'quantitative_reasoning'),
    ...mapToDb(ItemBank.gc_information, 'gc', 'information')
  ];

  const { data, error } = await supabase
    .from('assessment_items')
    .upsert(allItems, { onConflict: 'id' });

  if (error) {
    console.error(`--- INGEST FAILED: ${error.message} ---`);
    process.exit(1);
  }

  console.log(`--- INGEST SUCCESSFUL: ${allItems.length} items ported ---`);
}

ingest();
