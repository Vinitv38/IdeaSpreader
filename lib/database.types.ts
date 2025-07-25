export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      idea: {
        Row: {
          id: string
          created_at: string
          title: string
          description: string
          category: string
          views: number
          referrals: number
          reach: number
          file_urls: string[] | null
          user_id: string
        }
        Insert: {
          id?: string
          created_at?: string
          title: string
          description: string
          category: string
          views?: number
          referrals?: number
          reach?: number
          file_urls?: string[] | null
          user_id: string
        }
        Update: {
          id?: string
          created_at?: string
          title?: string
          description?: string
          category?: string
          views?: number
          referrals?: number
          reach?: number
          file_urls?: string[] | null
          user_id?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
