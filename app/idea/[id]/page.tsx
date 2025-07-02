import { IdeaView } from '@/components/idea-view'

interface IdeaPageProps {
  params: {
    id: string
  }
}

export default function IdeaPage({ params }: IdeaPageProps) {
  return <IdeaView ideaId={params.id} />
}