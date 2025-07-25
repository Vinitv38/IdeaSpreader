import Link from 'next/link'
import { formatDistanceToNow } from 'date-fns'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { Eye, MessageSquare, ThumbsUp } from 'lucide-react'

type User = {
  id: string
  name: string | null
  email: string | null
  avatar_url: string | null
}

type Idea = {
  id: string
  title: string
  description: string | null
  created_at: string
  user: User
  is_public: boolean
  views_count?: number
  likes_count?: number
  comments_count?: number
  tags?: string[]
}

export function IdeaCard({ idea }: { idea: Idea }) {
  const formattedDate = formatDistanceToNow(new Date(idea.created_at), { addSuffix: true })
  const userInitials = idea.user?.name?.split(' ').map(n => n[0]).join('').toUpperCase() || '?'

  return (
    <Link href={`/idea/${idea.id}`} className="group">
      <Card className="h-full flex flex-col transition-all duration-200 hover:shadow-lg hover:border-purple-500/20 dark:border-gray-700 dark:hover:border-purple-500/50">
        <CardHeader className="pb-2">
          <div className="flex items-center space-x-3">
            <Avatar className="h-8 w-8">
              <AvatarImage src={idea.user?.avatar_url || ''} alt={idea.user?.name || 'User'} />
              <AvatarFallback className="bg-gradient-to-r from-purple-600 to-blue-600 text-white text-xs">
                {userInitials}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-white line-clamp-1">
                {idea.user?.name || 'Anonymous'}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">{formattedDate}</p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="flex-1">
          <h3 className="font-semibold text-lg text-gray-900 dark:text-white mb-2 line-clamp-2 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
            {idea.title}
          </h3>
          {idea.description && (
            <p className="text-gray-600 dark:text-gray-300 text-sm line-clamp-3">
              {idea.description}
            </p>
          )}
          {idea.tags && idea.tags.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1">
              {idea.tags.slice(0, 3).map((tag) => (
                <Badge key={tag} variant="secondary" className="text-xs">
                  {tag}
                </Badge>
              ))}
              {idea.tags.length > 3 && (
                <Badge variant="outline" className="text-xs">
                  +{idea.tags.length - 3}
                </Badge>
              )}
            </div>
          )}
        </CardContent>
        <CardFooter className="pt-0">
          <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400 w-full">
            <div className="flex items-center space-x-1">
              <Eye className="h-4 w-4" />
              <span>{idea.views_count || 0}</span>
            </div>
            <div className="flex items-center space-x-1">
              <ThumbsUp className="h-4 w-4" />
              <span>{idea.likes_count || 0}</span>
            </div>
            <div className="flex items-center space-x-1">
              <MessageSquare className="h-4 w-4" />
              <span>{idea.comments_count || 0}</span>
            </div>
          </div>
        </CardFooter>
      </Card>
    </Link>
  )
}
