"use client"

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Progress } from '@/components/ui/progress'
import { 
  Share2, 
  Users, 
  Eye, 
  Heart, 
  Calendar,
  Send,
  Copy,
  CheckCircle
} from 'lucide-react'
import { useMockData } from '@/hooks/use-mock-data'
import { toast } from 'sonner'

interface IdeaViewProps {
  ideaId: string
}

export function IdeaView({ ideaId }: IdeaViewProps) {
  const { getIdeaById } = useMockData()
  const idea = getIdeaById(ideaId)
  const [referralEmails, setReferralEmails] = useState(['', '', ''])
  const [isSharing, setIsSharing] = useState(false)
  const [hasShared, setHasShared] = useState(false)

  if (!idea) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <Card className="max-w-md mx-auto">
          <CardContent className="p-8 text-center">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Idea Not Found
            </h2>
            <p className="text-gray-600 dark:text-gray-300">
              The idea you're looking for doesn't exist or has been removed.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  const handleEmailChange = (index: number, value: string) => {
    const newEmails = [...referralEmails]
    newEmails[index] = value
    setReferralEmails(newEmails)
  }

  const handleShare = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSharing(true)

    // Validate emails
    const validEmails = referralEmails.filter(email => email.trim() && email.includes('@'))
    
    if (validEmails.length < 3) {
      toast.error('Please enter at least 3 valid email addresses')
      setIsSharing(false)
      return
    }

    // TODO: Implement actual sharing logic
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    setHasShared(true)
    setIsSharing(false)
    toast.success(`Idea shared with ${validEmails.length} people!`)
  }

  const copyShareLink = () => {
    const shareLink = `${window.location.origin}/idea/${idea.id}`
    navigator.clipboard.writeText(shareLink)
    toast.success('Share link copied to clipboard!')
  }

  const reachProgress = (idea.stats.reach / 50000) * 100

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Idea Header */}
        <Card className="mb-8">
          <CardHeader>
            <div className="flex items-start justify-between mb-4">
              <Badge variant="secondary">{idea.category}</Badge>
              <Button variant="outline" size="sm" onClick={copyShareLink}>
                <Copy className="h-4 w-4 mr-2" />
                Copy Link
              </Button>
            </div>
            
            <CardTitle className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
              {idea.title}
            </CardTitle>

            <div className="flex items-center space-x-4 mt-4">
              <Avatar>
                <AvatarImage src={idea.author.avatar} alt={idea.author.name} />
                <AvatarFallback>{idea.author.initials}</AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium text-gray-900 dark:text-white">
                  {idea.author.name}
                </p>
                <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                  <div className="flex items-center space-x-1">
                    <Calendar className="h-4 w-4" />
                    <span>{idea.createdAt}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Eye className="h-4 w-4" />
                    <span>{idea.stats.views.toLocaleString()} views</span>
                  </div>
                </div>
              </div>
            </div>
          </CardHeader>

          <CardContent>
            <p className="text-gray-700 dark:text-gray-300 text-lg leading-relaxed mb-6">
              {idea.description}
            </p>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-6 mb-6">
              <div className="text-center">
                <div className="flex items-center justify-center space-x-2 text-blue-600 mb-1">
                  <Share2 className="h-5 w-5" />
                  <span className="text-2xl font-bold">{(idea.stats.referrals / 1000).toFixed(1)}K</span>
                </div>
                <span className="text-sm text-gray-500 dark:text-gray-400">Referrals</span>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center space-x-2 text-green-600 mb-1">
                  <Users className="h-5 w-5" />
                  <span className="text-2xl font-bold">{(idea.stats.reach / 1000).toFixed(1)}K</span>
                </div>
                <span className="text-sm text-gray-500 dark:text-gray-400">People Reached</span>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center space-x-2 text-red-600 mb-1">
                  <Heart className="h-5 w-5" />
                  <span className="text-2xl font-bold">{(idea.stats.likes / 1000).toFixed(1)}K</span>
                </div>
                <span className="text-sm text-gray-500 dark:text-gray-400">Likes</span>
              </div>
            </div>

            {/* Reach Progress */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="font-medium">Global Reach Progress</span>
                <span>{idea.stats.reach.toLocaleString()} / 50,000 people</span>
              </div>
              <Progress value={reachProgress} className="h-3" />
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Help this idea reach 50,000 people worldwide!
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Referral Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              {hasShared ? (
                <>
                  <CheckCircle className="h-6 w-6 text-green-600" />
                  <span>Thank You for Spreading This Idea! 🎉</span>
                </>
              ) : (
                <>
                  <Share2 className="h-6 w-6 text-purple-600" />
                  <span>Help Spread This Idea</span>
                </>
              )}
            </CardTitle>
            <p className="text-gray-600 dark:text-gray-300">
              {hasShared 
                ? "Your referrals are now part of the chain! Watch as this idea spreads further."
                : "Share this idea with at least 3 people to join the spreading chain."
              }
            </p>
          </CardHeader>

          <CardContent>
            {!hasShared ? (
              <form onSubmit={handleShare} className="space-y-6">
                <div className="space-y-4">
                  {referralEmails.map((email, index) => (
                    <div key={index} className="space-y-2">
                      <Label htmlFor={`email-${index}`}>
                        Email {index + 1} {index < 3 && <span className="text-red-500">*</span>}
                      </Label>
                      <Input
                        id={`email-${index}`}
                        type="email"
                        placeholder="Enter email address"
                        value={email}
                        onChange={(e) => handleEmailChange(index, e.target.value)}
                        required={index < 3}
                      />
                    </div>
                  ))}
                </div>

                <Button 
                  type="submit" 
                  className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                  disabled={isSharing}
                >
                  {isSharing ? (
                    'Sharing...'
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-2" />
                      Share This Idea
                    </>
                  )}
                </Button>

                <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
                  By sharing, you agree to our community guidelines and help create positive change.
                </p>
              </form>
            ) : (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Idea Successfully Shared!
                </h3>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  You've joined the referral chain. Your friends will receive this idea and can continue spreading it.
                </p>
                <Button variant="outline" onClick={copyShareLink}>
                  <Copy className="h-4 w-4 mr-2" />
                  Share Link with More People
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}