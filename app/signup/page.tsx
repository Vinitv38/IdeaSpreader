'use client';
import { AuthForm } from '@/components/auth-form'
import { Navbar } from '@/components/navbar'
import { useAuth } from '@/hooks/use-auth'
import { useRouter } from 'next/navigation'

export default function SignupPage() {
  const { user } = useAuth()
  const router = useRouter()
  if (user) {
    router.push('/')
    return ;   
  }
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <Navbar />
      <div className="flex items-center justify-center min-h-[calc(100vh-80px)] px-4">
        <AuthForm mode="signup" />
      </div>
    </div>
  )
}