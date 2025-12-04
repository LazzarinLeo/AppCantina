import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://zhkzcyvvptibdcxvmojl.supabase.co';  //conexão link do supabase
//chave supabase
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inpoa3pjeXZ2cHRpYmRjeHZtb2psIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA0Mzg1ODksImV4cCI6MjA3NjAxNDU4OX0.zfqhm-HGly4z20HQv2AbuYcXPwRfvBTAlsFgkvzX9no'; // troque pela sua

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
