"use client";

import { useState, useEffect } from 'react';

interface Idea {
  id: string;
  title: string;
  description: string;
  author: {
    name: string;
    avatar: string;
    initials: string;
  };
  category: string;
  createdAt: string;
  stats: {
    views: number;
    referrals: number;
    reach: number;
    likes: number;
  };
}

interface Referral {
  id: string;
  ideaId: string;
  referredBy: {
    name: string;
    email: string;
    avatar: string;
  };
  chainLength: number;
  timestamp: string;
}

// Mock data for demonstration
const mockIdeas: Idea[] = [
  {
    id: '1',
    title: 'Micro-Learning Revolution: 5-Minute Daily Skills',
    description: 'Transform your life by learning new skills in just 5 minutes per day. This simple approach makes consistent learning achievable for everyone, regardless of their busy schedule. Research shows that micro-learning improves retention by 17% and reduces learning time by 28%.',
    author: {
      name: 'Sarah Chen',
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b47c?w=100&h=100&fit=crop&crop=face',
      initials: 'SC'
    },
    category: 'Education',
    createdAt: '2024-01-15',
    stats: {
      views: 8924,
      referrals: 3847,
      reach: 15420,
      likes: 9234
    }
  },
  {
    id: '2',
    title: 'Green Commute Challenge: Reduce Carbon by 30%',
    description: 'Join the movement to reduce your carbon footprint through sustainable commuting. Simple changes like carpooling, cycling, or using public transport can make a massive environmental impact.',
    author: {
      name: 'Alex Rivera',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face',
      initials: 'AR'
    },
    category: 'Environment',
    createdAt: '2024-01-10',
    stats: {
      views: 5623,
      referrals: 2341,
      reach: 8950,
      likes: 4567
    }
  },
  {
    id: '3',
    title: 'Local Business Spotlight: Support Your Community',
    description: 'Discover amazing local businesses in your area and help build stronger communities. Every dollar spent locally generates 3x more economic activity than chain stores.',
    author: {
      name: 'Maya Patel',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face',
      initials: 'MP'
    },
    category: 'Community',
    createdAt: '2024-01-08',
    stats: {
      views: 3412,
      referrals: 1567,
      reach: 6234,
      likes: 2890
    }
  }
];

const mockReferrals: Referral[] = [
  {
    id: '1',
    ideaId: '1',
    referredBy: {
      name: 'Emma Wilson',
      email: 'emma@example.com',
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b47c?w=100&h=100&fit=crop&crop=face'
    },
    chainLength: 3,
    timestamp: '2 hours ago'
  },
  {
    id: '2',
    ideaId: '2',
    referredBy: {
      name: 'David Chen',
      email: 'david@example.com',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face'
    },
    chainLength: 5,
    timestamp: '4 hours ago'
  },
  {
    id: '3',
    ideaId: '1',
    referredBy: {
      name: 'Lisa Rodriguez',
      email: 'lisa@example.com',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face'
    },
    chainLength: 2,
    timestamp: '1 day ago'
  }
];

export function useMockData() {
  const [userIdeas] = useState<Idea[]>(mockIdeas);
  const [userReferrals] = useState<Referral[]>(mockReferrals);

  const totalReach = userIdeas.reduce((sum, idea) => sum + idea.stats.reach, 0);
  const totalReferrals = userIdeas.reduce((sum, idea) => sum + idea.stats.referrals, 0);

  const getIdeaById = (id: string): Idea | null => {
    return mockIdeas.find(idea => idea.id === id) || null;
  };

  return {
    userIdeas,
    userReferrals,
    totalReach,
    totalReferrals,
    getIdeaById
  };
}