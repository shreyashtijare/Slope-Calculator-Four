import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const SUPABASE_URL = "https://djjfrmpjmepjyyqsqoaa.supabase.co"
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRqamZybXBqbWVwanl5cXNxb2FhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQwMTgxNTQsImV4cCI6MjA4OTU5NDE1NH0.-r2Fs1OqbGRQ5ZNc0HRvSSifJh9kYFapUIA7h1fwROA"

export const supabase = createClient(
  SUPABASE_URL,
  SUPABASE_KEY
)
