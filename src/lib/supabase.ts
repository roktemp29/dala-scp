import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://isbvtqzecysxqwzyfceb.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlzYnZ0cXplY3lzeHF3enlmY2ViIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA4MjAyMjAsImV4cCI6MjA5NjM5NjIyMH0.MlLSl2yTWrDyY36gwaFVEdyuO3qHe7cRoxUUSKITxFA';

export const supabase = createClient(supabaseUrl, supabaseKey);