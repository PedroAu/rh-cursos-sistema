import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkSchema() {
  try {
    const { data, error } = await supabase
      .from('trilha')
      .select('count()', { count: 'exact', head: true });

    if (error) {
      console.error('❌ Table trilha not found:', error.message);
    } else {
      console.log('✅ Table trilha exists');
    }
  } catch (err) {
    console.error('Error:', err.message);
  }
}

checkSchema();
