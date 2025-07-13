// src/lib/supabaseClient.js
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://yyepmvielbpvilhomveq.supabase.co'  // من Project URL
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl5ZXBtdmllbGJwdmlsaG9tdmVxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE4MzMzOTYsImV4cCI6MjA2NzQwOTM5Nn0.JSi7b3QMxoiWqMSAooKh-htar0Zhf4_zM9M2pmwtTz8'

export const supabase = createClient(supabaseUrl, supabaseKey)
