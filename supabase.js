const SUPABASE_URL = 'https://zdybpplggppjrmxhfhik.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpkeWJwcGxnZ3BwanJteGhmaGlrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkxODY0MTcsImV4cCI6MjA3NDc2MjQxN30._1LRLhgIsNnc48Tj431F7xRWwHma0WCkc613ztmpjtU'

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) alert("¡Error! Debes configurar tus credenciales de Supabase.");

const { createClient } = supabase;
const dbClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);