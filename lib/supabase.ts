
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://hkpxswbwytjbhceubpjb.supabase.co';
const supabaseKey = 'sb_publishable_GlKYhnjyyRn_MqDxsg5lIQ_ITKxqaVx';

export const supabase = createClient(supabaseUrl, supabaseKey);
