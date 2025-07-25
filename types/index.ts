export type User = {
  id: string
  name: string | null
  email: string | null
  avatar_url: string | null
}

export type Idea = {
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
