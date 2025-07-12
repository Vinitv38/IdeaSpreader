import { CreateIdea } from '@/components/create-idea'
import { ProtectedRoute } from '@/components/protected-route'

export default function CreatePage() {
  return (
    <ProtectedRoute>
      <CreateIdea />
    </ProtectedRoute>
  )
}