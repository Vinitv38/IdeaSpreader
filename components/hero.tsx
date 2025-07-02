"use client"

import { Button } from '@/components/ui/button'
import { ArrowRight, Sparkles, Users, TrendingUp } from 'lucide-react'
import Link from 'next/link'

export function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-float"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-float" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-40 left-40 w-80 h-80 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-float" style={{ animationDelay: '4s' }}></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="space-y-8">
          {/* Badge */}
          <div className="inline-flex items-center px-4 py-2 bg-white/20 dark:bg-gray-800/20 backdrop-blur-sm rounded-full border border-white/30 dark:border-gray-700/30">
            <Sparkles className="h-4 w-4 text-purple-600 mr-2" />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Join thousands spreading ideas worldwide
            </span>
          </div>

          {/* Main heading */}
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-gray-900 dark:text-white leading-tight">
            One idea.{' '}
            <span className="gradient-text">Infinite reach.</span>
          </h1>

          {/* Subheading */}
          <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed">
            Share your brilliant ideas and watch them spread across the world through the power of referrals. 
            Every idea has the potential to change lives.
          </p>

          {/* Stats */}
          <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-8 text-center">
            <div className="flex items-center space-x-2">
              <Users className="h-5 w-5 text-purple-600" />
              <span className="text-gray-600 dark:text-gray-300">
                <span className="font-bold text-gray-900 dark:text-white">50K+</span> Active Spreaders
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5 text-blue-600" />
              <span className="text-gray-600 dark:text-gray-300">
                <span className="font-bold text-gray-900 dark:text-white">1M+</span> Ideas Shared
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <Sparkles className="h-5 w-5 text-pink-600" />
              <span className="text-gray-600 dark:text-gray-300">
                <span className="font-bold text-gray-900 dark:text-white">10M+</span> Lives Reached
              </span>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4">
            <Link href="/signup">
              <Button size="lg" className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-8 py-3 text-lg font-semibold rounded-full shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200">
                Start Spreading Ideas
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="#featured">
              <Button variant="outline" size="lg" className="px-8 py-3 text-lg font-semibold rounded-full border-2 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-200">
                Explore Ideas
              </Button>
            </Link>
          </div>

          {/* Featured idea preview */}
          <div className="mt-16 max-w-2xl mx-auto">
            <div className="glass rounded-2xl p-6 shadow-xl">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-sm">SC</span>
                </div>
                <div>
                  <p className="font-semibold text-gray-900 dark:text-white">Sarah Chen</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Shared 2 hours ago</p>
                </div>
              </div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                Micro-Learning Revolution: 5-Minute Daily Skills
              </h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm mb-4">
                Transform your life by learning new skills in just 5 minutes per day...
              </p>
              <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
                <span>🔥 8.9K views</span>
                <span>📤 3.8K referrals</span>
                <span>🌍 15.4K reached</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}