import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function POST() {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    
    // Check if the bucket already exists
    const { data: buckets, error: listError } = await supabase
      .storage
      .listBuckets();
    
    if (listError) throw listError;
    
    const bucketExists = buckets?.some(bucket => bucket.name === 'idea-files');
    
    if (!bucketExists) {
      // Create the bucket if it doesn't exist
      const { error: createError } = await supabase
        .storage
        .createBucket('idea-files', {
          public: true,
          allowedMimeTypes: [
            'image/jpeg',
            'image/png',
            'image/gif',
            'image/webp',
            'application/pdf',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'application/vnd.ms-excel',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'application/vnd.ms-powerpoint',
            'application/vnd.openxmlformats-officedocument.presentationml.presentation',
            'text/plain',
            'application/rtf'
          ],
          fileSizeLimit: 10 * 1024 * 1024, // 10MB
        });
      
      if (createError) throw createError;
      
        // Set bucket policies using Row Level Security (RLS)
      // Note: You'll need to set up RLS policies in the Supabase dashboard
      // for the storage.objects table to control access to files
      console.log('Please configure Row Level Security (RLS) policies in the Supabase dashboard for the storage.objects table');
      
      // The actual file size and type restrictions are already handled by the bucket creation options
      
      return NextResponse.json({ 
        success: true, 
        message: 'Storage bucket created and configured successfully' 
      });
    }
    
    return NextResponse.json({ 
      success: true, 
      message: 'Storage bucket already exists' 
    });
    
  } catch (error) {
    console.error('Error initializing storage:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: error instanceof Error ? error.message : 'Failed to initialize storage' 
      },
      { status: 500 }
    );
  }
}
