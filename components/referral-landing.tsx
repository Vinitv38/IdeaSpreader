"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { 
  Users, 
  TrendingUp, 
  Zap, 
  ArrowRight,
  Share2,
  Target,
  Crown
} from 'lucide-react'
import { useMockData } from '@/hooks/use-mock-data'
import { ReferralSystem } from '@/lib/referral-system'
import Link from 'next/link'

interface ReferralLandingProps {
  referralCode: string
}

export function ReferralLanding({ referralCode }: ReferralLandingProps) {
  const { userIdeas } = useMockData()
  const [referralData, setReferralData] = useState<any>(null)
  
  // Get the featured idea (for demo, use first idea)
  const featuredIdea = userIdeas[0]

  useEffect(() => {
    // In production, fetch referral data from database using referralCode
    // For demo, create mock referral data
    setReferralData({
      referrerName: 'Sarah Chen',
      referrerAvatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b47c?w=100&h=100&fit=crop&crop=face',
      chainLevel: 3,
      totalReach: 847,
      message: 'I thought you\'d love this brilliant idea! It\'s been spreading like wildfire.'
    })
  }, [referralCode])

  if (!referralData) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300">Loading referral...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center px-4 py-2 bg-white/20 dark:bg-gray-800/20 backdrop-blur-sm rounded-full border border-white/30 dark:border-gray-700/30 mb-6">
            <Zap className="h-4 w-4 text-purple-600 mr-2" />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              You've been invited to join the viral chain!
            </span>
          </div>
          
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            🎉 Special Invitation
          </h1>
          
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            <strong>{referralData.referrerName}</strong> shared an amazing idea with you. 
            Join the viral chain and help spread brilliant ideas worldwide!
          </p>
        </div>

        {/* Referrer Info */}
        <Card className="mb-8 glass">
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <Avatar className="h-16 w-16">
                <AvatarImage src={referralData.referrerAvatar} alt={referralData.referrerName} />
                <AvatarFallback>
                  {referralData.referrerName.split(' ').map((n: string) => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-2">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {referralData.referrerName}
                  </h3>
                  <Badge variant="secondary" className="bg-purple-100 text-purple-700">
                    <Crown className="h-3 w-3 mr-1" />
                    Chain Level {referralData.chainLevel}
                  </Badge>
                </div>
                
                <p className="text-gray-600 dark:text-gray-300 mb-3">
                  "{referralData.message}"
                </p>
                
                <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                  <div className="flex items-center space-x-1">
                    <Users className="h-4 w-4" />
                    <span>{referralData.totalReach} people reached</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <TrendingUp className="h-4 w-4" />
                    <span>Active spreader</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Featured Idea */}
        <Card className="mb-8 glass">
          <CardHeader>
            <div className="flex items-start justify-between">
              <Badge variant="secondary">{featuredIdea.category}</Badge>
              <div className="flex items-center space-x-1 text-purple-600">
                <Share2 className="h-4 w-4" />
                <span className="text-sm font-medium">
                  {(featuredIdea.stats.referrals / 1000).toFixed(1)}K referrals
                </span>
              </div>
            </div>
            
            <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white">
              {featuredIdea.title}
            </CardTitle>
          </CardHeader>

          <CardContent>
            <p className="text-gray-700 dark:text-gray-300 text-lg leading-relaxed mb-6">
              {featuredIdea.description.substring(0, 200)}...
            </p>

            <div className="grid grid-cols-3 gap-4 mb-6 text-center">
              <div>
                <div className="text-2xl font-bold text-blue-600">
                  {(featuredIdea.stats.views / 1000).toFixed(1)}K
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">Views</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-600">
                  {(featuredIdea.stats.reach / 1000).toFixed(1)}K
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">Reached</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-purple-600">
                  {(featuredIdea.stats.referrals / 1000).toFixed(1)}K
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">Referrals</div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
              <Link href={`/idea/${featuredIdea.id}?ref=${referralCode}&from=${referralData.referrerName}`} className="flex-1">
                <Button className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-lg py-6">
                  <Target className="h-5 w-5 mr-2" />
                  View Idea & Join Chain
                  <ArrowRight className="h-5 w-5 ml-2" />
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* How It Works */}
        <Card className="glass">
          <CardHeader>
            <CardTitle>How the Viral Chain Works</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/20 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-lg font-bold text-purple-600">1</span>
                </div>
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                  View the Idea
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Click to read the full idea and discover something amazing
                </p>
              </div>
              
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-lg font-bold text-blue-600">2</span>
                </div>
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                  Share with 3 People
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  If you love it, share it with exactly 3 people you know
                </p>
              </div>
              
              <div className="text-center">
                <div className="w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-lg font-bold text-green-600">3</span>
                </div>
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                  Create Viral Impact
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Watch as your referrals continue the chain exponentially
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}