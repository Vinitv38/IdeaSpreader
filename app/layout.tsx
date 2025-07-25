import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { ThemeProvider } from '@/components/theme-provider'
import { Toaster } from '@/components/ui/sonner'
import { StorageInitializer } from '@/components/storage-initializer'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'SparkLoop - One idea. Infinite reach.',
  description: 'Share your ideas and watch them spread across the world through referrals.',
  icons: {
    icon: '/favicon.svg',
    shortcut: '/favicon.svg',
    apple: '/favicon.svg',
  },
  openGraph: {
    title: 'SparkLoop - One idea. Infinite reach.',
    description: 'Share your ideas and watch them spread across the world through referrals.',
    url: 'https://sparkloop.app',
    siteName: 'SparkLoop',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'SparkLoop - One idea. Infinite reach.',
    description: 'Share your ideas and watch them spread across the world through referrals.',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem={false}
          disableTransitionOnChange
        >
          {children}
          <Toaster />
          <StorageInitializer />
        </ThemeProvider>
      </body>
    </html>
  )
}