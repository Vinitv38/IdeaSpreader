"use client";

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

export interface IdeaWithStats {
  id: string;
  title: string;
  description: string;
  category: string;
  created_at: string;
  updated_at: string;
  views: number;
  file_urls: string[] | null;
  user_id: string;
  referrals: number;
  reach: number;
  is_public: boolean;
  is_featured?: boolean;
}

export function useIdeasWithStats(userId: string | undefined) {
  const [ideas, setIdeas] = useState<IdeaWithStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  
  const refresh = () => setRefreshTrigger(prev => prev + 1);

  useEffect(() => {
    const fetchIdeasWithStats = async () => {
      if (!userId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        
        // Fetch user's ideas
        const { data: userIdeas, error: ideasError } = await supabase
          .from('idea')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false });
        
        if (ideasError) throw ideasError;
        if (!userIdeas) {
          setIdeas([]);
          return;
        }

        // Fetch stats for all ideas in parallel
        const ideasWithStats = await Promise.all(
          userIdeas.map(async (idea) => {
            // Get direct referrals count with error handling
            let referralCount = 0;
            try {
              const { count, error: referralError } = await supabase
                .from('spread_chain')
                .select('*', { count: 'exact', head: true })
                .eq('idea_id', idea.id);
              
              if (referralError) {
                console.error('Error fetching referrals for idea', idea.id, ':', referralError);
              } else {
                referralCount = count || 0;
              }
            } catch (error) {
              console.error('Unexpected error in referral count for idea', idea.id, ':', error);
            }
            
            // Get unique users reached (total reach) with error handling
            let reachEmails = [];
            try {
              const { data, error: reachError } = await supabase
                .from('spread_chain')
                .select('referred_email')
                .eq('idea_id', idea.id);
              
              if (reachError) {
                console.error('Error fetching reach for idea', idea.id, ':', reachError);
              } else if (data) {
                reachEmails = data.map(item => item.referred_email).filter(Boolean);
              }
            } catch (error) {
              console.error('Unexpected error in reach data for idea', idea.id, ':', error);
            }
            
            // Count unique email addresses
            const uniqueEmails = new Set(reachEmails);
            const reachCount = uniqueEmails.size;
            
            return {
              ...idea,
              referrals: referralCount,
              reach: reachCount + 1, // +1 for the original creator
              views: idea.views || 0
            };
          })
        );

        setIdeas(ideasWithStats);
      } catch (error) {
        console.error('Error fetching ideas with stats:', error);
        setError(error instanceof Error ? error : new Error('Failed to fetch ideas'));
      } finally {
        setLoading(false);
      }
    };

    fetchIdeasWithStats();
  }, [userId, refreshTrigger]);
  
  return { ideas, loading, error, refresh };
}