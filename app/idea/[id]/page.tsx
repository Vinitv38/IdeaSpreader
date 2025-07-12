import { IdeaView } from '@/components/idea-view'
import { supabase } from '@/lib/supabase'

// This function runs at build time
export async function generateStaticParams() {
  const { data: ideas } = await supabase
    .from('idea')
    .select('id')
  
  return ideas?.map(idea => ({
    id: idea.id
  })) || []
}

export default function IdeaPage({ params }: { params: { id: string } }) {
  return <IdeaView  />
}