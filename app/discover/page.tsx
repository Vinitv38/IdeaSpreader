'use client';

import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft, ChevronDown } from 'lucide-react';
import { useState, useEffect } from 'react';
import { IdeaCard } from '@/components/idea-card';
import { supabase } from '@/lib/supabase';
import { Navbar } from '@/components/navbar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

type Idea = {
  id: string;
  created_at: string;
  title: string;
  description: string | null;
  category: string;
  views: number;
  referrals: number;
  reach: number;
  file_urls: string[] | null;
  user_id: string;
};

// Available categories
const categories = [
  'All',
  'Technology',
  'Business',
  'Science',
  'Health',
  'Entertainment',
  'Sports',
  'Education',
  'Lifestyle',
  'Community',
];

export default function DiscoverPage() {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Fetch ideas based on selected category
  const fetchIdeas = async (category: string) => {
    try {
      setLoading(true);
      let query = supabase
        .from('idea')
        .select('*')
        .eq('is_public', true);
      
      if (category !== 'All') {
        query = query.eq('category', category);
      }
      
      const { data, error: fetchError } = await query
        .order('created_at', { ascending: false });
      
      if (fetchError) throw fetchError;
      
      setIdeas(data || []);
      setError(null);
    } catch (err) {
      console.error('Error fetching ideas:', err);
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  };

  // Initial data fetch
  useEffect(() => {
    fetchIdeas(selectedCategory);
  }, [selectedCategory]);

  const renderContent = () => {
    if (loading) {
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden animate-pulse h-64">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 w-3/4 mb-4"></div>
              <div className="h-3 bg-gray-200 dark:bg-gray-700 w-1/2 mb-2"></div>
              <div className="h-3 bg-gray-200 dark:bg-gray-700 w-2/3"></div>
            </div>
          ))}
        </div>
      );
    }

    if (error) {
      return (
        <div className="text-center py-16 px-6 rounded-2xl border border-dashed border-red-500/20 bg-red-500/5">
          <div className="mx-auto h-16 w-16 text-red-500 mb-4">
            <svg className="w-full h-full" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-foreground mb-2">Error loading ideas</h3>
          <p className="text-muted-foreground mb-6">Please try again later or refresh the page.</p>
          <Button 
            onClick={() => fetchIdeas(selectedCategory)}
            variant="outline"
            className="border-red-500 text-red-500 hover:bg-red-500/10"
          >
            Retry
          </Button>
        </div>
      );
    }

    if (ideas.length === 0) {
      return (
        <div className="text-center py-16 px-6 rounded-2xl border border-dashed border-muted-foreground/20 bg-gradient-to-br from-background to-muted/5">
          <div className="mx-auto h-20 w-20 text-muted-foreground/30 mb-6">
            <svg className="w-full h-full" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={0.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-foreground mb-2">No stories found</h3>
          <p className="text-muted-foreground mb-6">
            {selectedCategory === 'All' 
              ? 'No ideas have been shared yet. Be the first to share your story!'
              : `No ideas found in the ${selectedCategory.toLowerCase()} category.`}
          </p>
          <div className="flex justify-center gap-4">
            <Button 
              onClick={() => setSelectedCategory('All')}
              variant="outline"
              className="border-primary text-primary hover:bg-primary/10"
            >
              View All Categories
            </Button>
            <Link href="/create">
              <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
                Share Your Story
              </Button>
            </Link>
          </div>
        </div>
      );
    }

    return (
      <div className="h-[calc(100vh-300px)] sm:h-[60vh] overflow-y-auto -mx-2 sm:mx-0 px-2 sm:px-0">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 pb-6">
          {ideas.map((idea) => (
            <div key={idea.id} className="h-full">
              <IdeaCard 
                idea={{
                  ...idea,
                  user: { 
                    id: idea.user_id, 
                    name: 'Anonymous', 
                    email: null, 
                    avatar_url: null 
                  },
                  is_public: true,
                  views_count: idea.views,
                }}
              />
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Toggle mobile filter dropdown
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <Navbar />
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-float"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-float" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-40 left-40 w-80 h-80 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-float" style={{ animationDelay: '4s' }}></div>
      </div>
      
      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        <div className="mb-6 sm:mb-8">
          <Link 
            href="/" 
            className="inline-flex items-center text-sm text-muted-foreground hover:text-primary transition-colors mb-3 sm:mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-1" /> Back to Home
          </Link>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
                Discover Stories
              </h1>
              <p className="text-muted-foreground text-sm sm:text-base">
                Explore all public stories shared by our community
              </p>
            </div>
            
            {/* Mobile Filter Dropdown */}
            <div className="sm:hidden">
              <DropdownMenu onOpenChange={setIsMobileFilterOpen}>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="w-full flex items-center justify-between">
                    {selectedCategory}
                    <ChevronDown className={`ml-2 h-4 w-4 transition-transform ${isMobileFilterOpen ? 'rotate-180' : ''}`} />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-[calc(100vw-2rem)] max-h-[60vh] overflow-y-auto">
                  {categories.map((category) => (
                    <DropdownMenuItem 
                      key={category} 
                      className={`cursor-pointer ${selectedCategory === category ? 'bg-muted' : ''}`}
                      onClick={() => setSelectedCategory(category)}
                    >
                      {category}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
          
          {/* Desktop Category Filter */}
          <div className="hidden sm:flex flex-wrap gap-2 pt-2">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-3 py-1.5 rounded-full text-xs sm:text-sm font-medium transition-colors whitespace-nowrap ${
                  selectedCategory === category
                    ? 'bg-primary text-primary-foreground shadow-md'
                    : 'bg-muted/50 hover:bg-muted text-foreground/80 hover:text-foreground'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* Content Area */}
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg rounded-xl sm:rounded-2xl shadow-lg sm:shadow-xl p-4 sm:p-6 border border-gray-200 dark:border-gray-700">
          {renderContent()}
        </div>
      </main>
    </div>
  );
}
