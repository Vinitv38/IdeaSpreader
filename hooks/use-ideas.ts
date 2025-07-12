"use client";

import { supabase } from '@/lib/supabase';
import { useState, useEffect } from 'react';
// import { createClient } from '@/utils/supabase/client';

interface Idea {
  id: string;
  title: string;
  description: string;
  category: string;
  file_urls: string[];
  created_at: string;
  updated_at: string;
  views: number;
}

export function useIdeas(userId: string | undefined) {
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!userId) return;

    const fetchIdeas = async () => {
      try {
        // const supabase = createClient();
        const { data, error } = await supabase
          .from('idea')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false });

        if (error) throw error;
        setIdeas(data || []);
      } catch (err) {
        console.error('Error fetching ideas:', err);
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };

    fetchIdeas();
  }, [userId]);

  const createIdea = async (idea: Omit<Idea, 'id' | 'created_at' | 'updated_at' | 'views'>) => {
    try {
      // const supabase = createClient();
      const { data, error } = await supabase
        .from('idea')
        .insert([{ ...idea, user_id: userId }])
        .select()
        .single();

      if (error) throw error;
      setIdeas(prev => [data, ...prev]);
      return data;
    } catch (err) {
      console.error('Error creating idea:', err);
      throw err;
    }
  };

  return { ideas, loading, error, createIdea };
}


