// hooks/use-ideas-with-stats.ts
"use client";

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

interface IdeaWithStats {
  id: string;
  title: string;
  description: string;
  category: string;
  created_at: string;
  views: number;
  referrals: number;
  reach: number;
}

export function useIdeasWithStats(userId: string) {
  const [ideas, setIdeas] = useState<IdeaWithStats[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchIdeasWithStats = async () => {
      try {
        setLoading(true);
        
        // Fetch user's ideas
        const { data: userIdeas, error: ideasError } = await supabase
          .from('idea')
          .select('*')
          .eq('user_id', userId);
        
        if (ideasError) throw ideasError;

        // Fetch stats for all ideas in parallel
        const ideasWithStats = await Promise.all(
          userIdeas.map(async (idea) => {
            const { count: referralCount } = await supabase
              .from('spread_chain')
              .select('*', { count: 'exact', head: true })
              .eq('idea_id', idea.id);
            
            const { count: reachCount } = await supabase
              .from('spread_chain')
              .select('*', { count: 'exact', head: true })
              .eq('idea_id', idea.id);
            
            return {
              ...idea,
              referrals: referralCount || 0,
              reach: reachCount || 0
            };
          })
        );

        setIdeas(ideasWithStats);
      } catch (error) {
        console.error('Error fetching ideas with stats:', error);
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      fetchIdeasWithStats();
    }
  }, [userId]);

  return { ideas, loading };
}