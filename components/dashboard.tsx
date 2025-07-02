"use client"

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Progress } from '@/components/ui/progress'
import { 
  Plus, 
  Eye, 
  Share2, 
  Users, 
  TrendingUp, 
  Calendar,
  ExternalLink,
  Heart
} from 'lucide-react'
import { useAuth } from '@/hooks/use-auth'
import { useMockData } from '@/hooks/use-mock-data'
import { toast } from 'sonner'
import Link from 'next/link'

export function Dashboard() {
  const { user } = useAuth()
  const { userIdeas, userReferrals, totalReach, totalReferrals } = useMockData()
  const [newIdea, setNewIdea] = useState({
    title: '',
    description: '',
    category: ''
  })

  const handleCreateIdea = (e: React.FormEvent) => {
    e.preventDefault()
    // TODO: Implement idea creation
    toast.success('Idea created successfully!')
    setNewIdea({ title: '', description: '', category: '' })
  }

  const stats = [
    {
      title: 'Total Reach',
      value: totalReach.toLocaleString(),
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100 dark:bg-blue-900/20'
    },
    {
      title: 'Ideas Shared',
      value: userIdeas.length.toString(),
      icon: Share2,
      color: 'text-green-600',
      bgColor: 'bg-green-100 dark:bg-green-900/20'
    },
    {
      title: 'Referrals Made',
      value: totalReferrals.toLocaleString(),
      icon: TrendingUp,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100 dark:bg-purple-900/20'
    },
    {
      title: 'Active Chains',
      value: userReferrals.length.toString(),
      icon: ExternalLink,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100 dark:bg-orange-900/20'
    }
  ]

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Welcome back, {user?.name}! 👋
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mt-2">
            Ready to spread some brilliant ideas today?
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <Card key={index} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      {stat.title}
                    </p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {stat.value}
                    </p>
                  </div>
                  <div className={`p-3 rounded-full ${stat.bgColor}`}>
                    <stat.icon className={`h-6 w-6 ${stat.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Main Content */}
        <Tabs defaultValue="my-ideas" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="my-ideas">My Ideas</TabsTrigger>
            <TabsTrigger value="referrals">Referrals</TabsTrigger>
            <TabsTrigger value="create">Create Idea</TabsTrigger>
          </TabsList>

          {/* My Ideas Tab */}
          <TabsContent value="my-ideas" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {userIdeas.map((idea) => (
                <Card key={idea.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg line-clamp-2">
                          {idea.title}
                        </CardTitle>
                        <CardDescription className="mt-2 line-clamp-2">
                          {idea.description}
                        </CardDescription>
                      </div>
                      <Badge variant="secondary">{idea.category}</Badge>
                    </div>
                  </CardHeader>
                  
                  <CardContent>
                    <div className="grid grid-cols-3 gap-4 mb-4">
                      <div className="text-center">
                        <div className="flex items-center justify-center space-x-1 text-gray-500 dark:text-gray-400">
                          <Eye className="h-4 w-4" />
                          <span className="text-sm">{(idea.stats.views / 1000).toFixed(1)}K</span>
                        </div>
                        <span className="text-xs text-gray-400">Views</span>
                      </div>
                      <div className="text-center">
                        <div className="flex items-center justify-center space-x-1 text-gray-500 dark:text-gray-400">
                          <Share2 className="h-4 w-4" />
                          <span className="text-sm">{(idea.stats.referrals / 1000).toFixed(1)}K</span>
                        </div>
                        <span className="text-xs text-gray-400">Referrals</span>
                      </div>
                      <div className="text-center">
                        <div className="flex items-center justify-center space-x-1 text-gray-500 dark:text-gray-400">
                          <Users className="h-4 w-4" />
                          <span className="text-sm">{(idea.stats.reach / 1000).toFixed(1)}K</span>
                        </div>
                        <span className="text-xs text-gray-400">Reached</span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Reach Progress</span>
                        <span>{idea.stats.reach} people</span>
                      </div>
                      <Progress value={(idea.stats.reach / 20000) * 100} className="h-2" />
                    </div>

                    <div className="flex space-x-2 mt-4">
                      <Link href={`/idea/${idea.id}`} className="flex-1">
                        <Button variant="outline" className="w-full">
                          <ExternalLink className="h-4 w-4 mr-2" />
                          View
                        </Button>
                      </Link>
                      <Button variant="outline" size="icon">
                        <Heart className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Referrals Tab */}
          <TabsContent value="referrals" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Recent Referrals</CardTitle>
                <CardDescription>
                  Track how your referrals are spreading ideas
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {userReferrals.map((referral) => (
                    <div key={referral.id} className="flex items-center space-x-4 p-4 border rounded-lg">
                      <Avatar>
                        <AvatarImage src={referral.referredBy.avatar} />
                        <AvatarFallback>
                          {referral.referredBy.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      
                      <div className="flex-1">
                        <p className="font-medium text-gray-900 dark:text-white">
                          {referral.referredBy.name}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {referral.referredBy.email}
                        </p>
                      </div>

                      <div className="text-right">
                        <div className="flex items-center space-x-1 text-purple-600">
                          <ExternalLink className="h-4 w-4" />
                          <span className="font-medium">Chain: {referral.chainLength}</span>
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {referral.timestamp}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Create Idea Tab */}
          <TabsContent value="create" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Share a New Idea</CardTitle>
                <CardDescription>
                  Create an idea that could change the world
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleCreateIdea} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="title">Idea Title</Label>
                    <Input
                      id="title"
                      placeholder="Enter a compelling title for your idea"
                      value={newIdea.title}
                      onChange={(e) => setNewIdea(prev => ({ ...prev, title: e.target.value }))}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="category">Category</Label>
                    <Input
                      id="category"
                      placeholder="e.g., Education, Environment, Technology"
                      value={newIdea.category}
                      onChange={(e) => setNewIdea(prev => ({ ...prev, category: e.target.value }))}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      placeholder="Describe your idea in detail. What problem does it solve? How can it make a difference?"
                      rows={6}
                      value={newIdea.description}
                      onChange={(e) => setNewIdea(prev => ({ ...prev, description: e.target.value }))}
                      required
                    />
                  </div>

                  <Button type="submit" className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700">
                    <Plus className="h-4 w-4 mr-2" />
                    Create & Share Idea
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}