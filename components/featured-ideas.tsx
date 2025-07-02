"use client"

import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Eye, Share2, Users, Heart } from 'lucide-react'
import Link from 'next/link'

const featuredIdeas = [
  {
    id: '1',
    title: 'Micro-Learning Revolution: 5-Minute Daily Skills',
    description: 'Transform your life by learning new skills in just 5 minutes per day. This simple approach makes consistent learning achievable for everyone, regardless of their busy schedule.',
    author: {
      name: 'Sarah Chen',
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b47c?w=100&h=100&fit=crop&crop=face',
      initials: 'SC'
    },
    category: 'Education',
    stats: {
      views: 8924,
      referrals: 3847,
      reach: 15420,
      likes: 9234
    },
    gradient: 'from-purple-500 to-pink-500'
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
    stats: {
      views: 5623,
      referrals: 2341,
      reach: 8950,
      likes: 4567
    },
    gradient: 'from-green-500 to-blue-500'
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
    stats: {
      views: 3412,
      referrals: 1567,
      reach: 6234,
      likes: 2890
    },
    gradient: 'from-orange-500 to-red-500'
  }
]

export function FeaturedIdeas() {
  return (
    <section id="featured" className="py-20 bg-gray-50 dark:bg-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Featured Ideas
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Discover the most impactful ideas spreading across our community. These ideas are changing lives and creating positive change.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {featuredIdeas.map((idea) => (
            <Card key={idea.id} className="group hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 overflow-hidden">
              <div className={`h-2 bg-gradient-to-r ${idea.gradient}`}></div>
              
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between mb-3">
                  <Badge variant="secondary" className="text-xs">
                    {idea.category}
                  </Badge>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <Heart className="h-4 w-4" />
                  </Button>
                </div>
                
                <h3 className="text-lg font-bold text-gray-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors line-clamp-2">
                  {idea.title}
                </h3>
              </CardHeader>

              <CardContent className="pt-0">
                <p className="text-gray-600 dark:text-gray-300 text-sm mb-4 line-clamp-3">
                  {idea.description}
                </p>

                <div className="flex items-center space-x-3 mb-4">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={idea.author.avatar} alt={idea.author.name} />
                    <AvatarFallback>{idea.author.initials}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {idea.author.name}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Idea Creator
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 mb-4 text-center">
                  <div className="flex flex-col items-center">
                    <div className="flex items-center space-x-1 text-gray-500 dark:text-gray-400">
                      <Eye className="h-3 w-3" />
                      <span className="text-xs">{(idea.stats.views / 1000).toFixed(1)}K</span>
                    </div>
                    <span className="text-xs text-gray-400">Views</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <div className="flex items-center space-x-1 text-gray-500 dark:text-gray-400">
                      <Share2 className="h-3 w-3" />
                      <span className="text-xs">{(idea.stats.referrals / 1000).toFixed(1)}K</span>
                    </div>
                    <span className="text-xs text-gray-400">Referrals</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <div className="flex items-center space-x-1 text-gray-500 dark:text-gray-400">
                      <Users className="h-3 w-3" />
                      <span className="text-xs">{(idea.stats.reach / 1000).toFixed(1)}K</span>
                    </div>
                    <span className="text-xs text-gray-400">Reached</span>
                  </div>
                </div>

                <Link href={`/idea/${idea.id}`}>
                  <Button className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white">
                    View & Refer
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center mt-12">
          <Link href="/signup">
            <Button size="lg" variant="outline" className="px-8 py-3 text-lg font-semibold">
              Explore All Ideas
            </Button>
          </Link>
        </div>
      </div>
    </section>
  )
}