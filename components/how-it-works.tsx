"use client"

import { Card, CardContent } from '@/components/ui/card'
import { Eye, BookOpen, Share2, TrendingUp } from 'lucide-react'

const steps = [
  {
    icon: Eye,
    title: 'Receive',
    description: 'Discover amazing ideas shared by others in your network or explore trending ideas.',
    color: 'from-purple-500 to-purple-600'
  },
  {
    icon: BookOpen,
    title: 'Read',
    description: 'Dive deep into ideas that resonate with you. Learn something new every day.',
    color: 'from-blue-500 to-blue-600'
  },
  {
    icon: Share2,
    title: 'Refer',
    description: 'Share ideas that inspire you with at least 3 people in your network.',
    color: 'from-green-500 to-green-600'
  },
  {
    icon: TrendingUp,
    title: 'Spread',
    description: 'Watch your referrals create chains of inspiration, reaching thousands of people.',
    color: 'from-pink-500 to-pink-600'
  }
]

export function HowItWorks() {
  return (
    <section id="how-it-works" className="py-20 bg-white dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            How It Works
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Join the movement of idea spreading in four simple steps. Every great change starts with a single idea.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <Card key={index} className="relative overflow-hidden group hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
              <CardContent className="p-6 text-center">
                <div className={`w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r ${step.color} flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                  <step.icon className="h-8 w-8 text-white" />
                </div>
                <div className="absolute top-4 right-4 w-8 h-8 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center text-sm font-bold text-gray-600 dark:text-gray-400">
                  {index + 1}
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                  {step.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  {step.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Connection lines for desktop */}
        <div className="hidden lg:block relative mt-8">
          <div className="absolute top-0 left-0 w-full h-1 flex items-center justify-center">
            <div className="flex items-center space-x-8 w-full max-w-4xl">
              {[0, 1, 2].map((index) => (
                <div key={index} className="flex-1 h-0.5 bg-gradient-to-r from-purple-300 to-blue-300 dark:from-purple-600 dark:to-blue-600"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}