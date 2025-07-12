"use client"

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Eye, Users, Sparkles, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

// Simple Skeleton component
const Skeleton = ({ className = '' }: { className?: string }) => (
  <div className={`animate-pulse bg-gray-200 dark:bg-gray-700 rounded ${className}`} />
)

interface Profile {
  name: string
  avatar_url: string | null
}

interface Idea {
  id: string
  title: string
  description: string
  category: string
  created_at: string
  views: number
  referrals: number
  profiles: Profile[]
}

export function FeaturedIdeas() {
  const [ideas, setIdeas] = useState<Idea[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchFeaturedIdeas = async () => {
      try {
        setLoading(true)
        const { data, error } = await supabase
          .from('idea')
          .select(`
            id,
            title,
            description,
            category,
            created_at,
            views,
            referrals,
            profiles:user_id (name, avatar_url)
          `)
          .eq('is_public', true)
          .eq('is_featured', true)
          .order('created_at', { ascending: false })
          .limit(6)

        if (error) throw error
        setIdeas(data || [])
      } catch (error) {
        console.error('Error fetching featured ideas:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchFeaturedIdeas()
  }, [])

  if (loading) {
    return (
      <section className="py-12 bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center px-4 py-2 rounded-full bg-gradient-to-r from-purple-100 to-blue-100 dark:from-purple-900/30 dark:to-blue-900/30 mb-4">
              <Sparkles className="h-5 w-5 text-purple-600 dark:text-purple-400 mr-2" />
              <span className="text-sm font-medium text-purple-600 dark:text-purple-400">Featured Ideas</span>
            </div>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white sm:text-4xl">Discover What's Trending</h2>
            <p className="mt-4 text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Explore the most popular and innovative ideas from our community
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
              <Card key={i} className="h-full flex flex-col">
                <Skeleton className="h-48 w-full rounded-t-lg" />
                <CardHeader>
                  <Skeleton className="h-6 w-3/4 mb-2" />
                  <Skeleton className="h-4 w-1/2" />
                </CardHeader>
                <CardContent className="flex-1">
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-4 w-5/6" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    )
  }

  if (ideas.length === 0) {
    return null // Don't show the section if there are no featured ideas
  }

  // Predefined gradients for cards
  const gradients = [
    'from-blue-500 to-blue-600',
    'from-purple-500 to-pink-500',
    'from-green-500 to-teal-500',
    'from-yellow-500 to-orange-500',
    'from-pink-500 to-rose-500',
    'from-indigo-500 to-blue-500',
  ]

  return (
    <section className="py-12 bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center px-4 py-2 rounded-full bg-gradient-to-r from-purple-100 to-blue-100 dark:from-purple-900/30 dark:to-blue-900/30 mb-4">
            <Sparkles className="h-5 w-5 text-purple-600 dark:text-purple-400 mr-2" />
            <span className="text-sm font-medium text-purple-600 dark:text-purple-400">Featured Ideas</span>
          </div>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white sm:text-4xl">Discover What's Trending</h2>
          <p className="mt-4 text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Explore the most popular and innovative ideas from our community
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {ideas.map((idea, index) => {
            const gradient = gradients[index % gradients.length]
            const profile = idea.profiles?.[0] || null
            
            return (
              <Link key={idea.id} href={`/idea/${idea.id}`} className="block h-full group">
                <Card className="h-full flex flex-col transition-all duration-300 group-hover:shadow-lg dark:group-hover:shadow-purple-500/20">
                  <div className={`h-2 ${gradient} bg-gradient-to-r rounded-t-lg`} />
                  <CardHeader>
                    <div className="flex items-center justify-between mb-2">
                      <Badge variant="secondary" className="text-xs">
                        {idea.category || 'Uncategorized'}
                      </Badge>
                      <div className="flex items-center space-x-1 text-xs text-gray-500 dark:text-gray-400">
                        <Eye className="h-3 w-3" />
                        <span>{idea.views.toLocaleString()}</span>
                      </div>
                    </div>
                    <CardTitle className="text-lg font-bold line-clamp-2">{idea.title}</CardTitle>
                  </CardHeader>

                  <CardContent className="flex-1">
                    <p className="text-gray-600 dark:text-gray-300 text-sm mb-4 line-clamp-3">
                      {idea.description}
                    </p>
                    
                    <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
                      <div className="flex items-center space-x-2">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={profile?.avatar_url || ''} />
                          <AvatarFallback>
                            {profile?.name
                              ?.split(' ')
                              .map(n => n[0])
                              .join('')
                              .toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          {profile?.name || 'Anonymous'}
                        </span>
                      </div>
                      
                      <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
                        <div className="flex items-center space-x-1">
                          <Users className="h-4 w-4" />
                          <span>{idea.referrals.toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            )
          })}
        </div>
        
        <div className="mt-12 text-center">
          <Link href="/discover">
            <Button variant="outline" className="rounded-full px-8">
              View More Ideas
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  )
}