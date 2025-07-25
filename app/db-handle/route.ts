import { NextResponse } from 'next/server';
import { 
  createProfile, 
  createIdea, 
  createSpreadChain, 
  getIdea, 
  getIdeaStats, 
  getIdeaById, 
  getReferredIdeas 
} from '@/lib/db-handler';

// Handle POST requests
export async function POST(request: Request) {
  try {
    const { action, data } = await request.json();
    
    if (!action) {
      return NextResponse.json(
        { error: 'Action parameter is required' },
        { status: 400 }
      );
    }
    
    switch (action) {
      case 'createProfile': {
        if (!data?.user) {
          return NextResponse.json(
            { error: 'User data is required' },
            { status: 400 }
          );
        }
        const profile = await createProfile(data.user);
        return NextResponse.json(profile);
      }
        
      case 'createIdea': {
        if (!data?.title || !data?.description || !data?.category) {
          return NextResponse.json(
            { error: 'Title, description, and category are required' },
            { status: 400 }
          );
        }
        
        const idea = await createIdea(
          data.title,
          data.description,
          data.category,
          data.is_public || false,
          data.file_urls || []
        );
        return NextResponse.json(idea);
      }
        
      case 'createSpreadChain': {
        if (!data?.ideaId || !data?.email) {
          return NextResponse.json(
            { error: 'Idea ID and email are required' },
            { status: 400 }
          );
        }
        
        const chain = await createSpreadChain(
          data.ideaId,
          data.referrerId || null,
          data.email
        );
        return NextResponse.json(chain);
      }
        
      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'An error occurred' },
      { status: 500 }
    );
  }
}

// Handle GET requests
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');
    const userId = searchParams.get('userId');
    const ideaId = searchParams.get('ideaId');
    const email = searchParams.get('email');
    
    if (!action) {
      return NextResponse.json(
        { error: 'Action parameter is required' },
        { status: 400 }
      );
    }
    
    switch (action) {
      case 'getIdea': {
        if (!userId) {
          return NextResponse.json(
            { error: 'User ID is required' },
            { status: 400 }
          );
        }
        const ideas = await getIdea(userId);
        return NextResponse.json(ideas);
      }
        
      case 'getIdeaStats': {
        if (!ideaId) {
          return NextResponse.json(
            { error: 'Idea ID is required' },
            { status: 400 }
          );
        }
        const stats = await getIdeaStats(ideaId);
        return NextResponse.json(stats);
      }
        
      case 'getIdeaById': {
        if (!ideaId) {
          return NextResponse.json(
            { error: 'Idea ID is required' },
            { status: 400 }
          );
        }
        const idea = await getIdeaById(ideaId);
        return NextResponse.json(idea);
      }
        
      case 'getReferredIdeas': {
        if (!email) {
          return NextResponse.json(
            { error: 'Email is required' },
            { status: 400 }
          );
        }
        const referredIdeas = await getReferredIdeas(email);
        return NextResponse.json(referredIdeas);
      }
        
      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'An error occurred' },
      { status: 500 }
    );
  }
}
