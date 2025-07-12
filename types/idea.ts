export interface Idea {
  id: string;
  title: string;
  description: string;
  category: string;
  created_at: string;
  updated_at?: string;
  user_id: string;
  views: number;
  referrals: number;
  reach: number;
  file_urls: string[];
  is_public: boolean;
  is_featured: boolean;
}

export interface IdeaFormData {
  title: string;
  description: string;
  category: string;
  file_urls: string[];
  is_public: boolean;
}
