import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client with your project URL and service role key
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing required environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// Set CORS configuration for the storage bucket
async function setCorsConfig() {
  const { data, error } = await supabase
    .rpc('set_cors_config', {
      bucket_name: 'idea-files',
      origins: [
        'http://localhost:3000',
        'http://localhost:3001',
        'https://your-production-domain.com', // Replace with your production domain
        'https://*.vercel.app' // If you're using Vercel
      ]
    });

  if (error) {
    console.error('Error setting CORS config:', error);
    return;
  }
  
  console.log('CORS configuration updated successfully:', data);
}

setCorsConfig().catch(console.error);
