'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Check, Star, Loader2, BadgeCheck, Ban, Sparkles, Trophy, Lock, Zap } from 'lucide-react'
import { supabase } from '../lib/supabase'

export default function Membership({ darkMode = false }: { darkMode?: boolean }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const features = [
    {
      icon: BadgeCheck,
      title: 'Verified Badge',
      description: 'Get a verified badge on your profile to stand out'
    },
    {
      icon: Sparkles,
      title: 'Special Animated Name',
      description: 'Stand out with a special animated name in Reevlo colors'
    },
    {
      icon: Star,
      title: 'Exclusive Features',
      description: 'Access to premium features and early updates'
    },
    {
      icon: Trophy,
      title: 'Free Competition Entry',
      description: 'Get one free entry to any premium competition every month'
    },
    {
      icon: Lock,
      title: 'Private Content Access',
      description: 'Unlock exclusive access to purchase and view private creator content'
    }
  ]

  const handleSubscribe = async () => {
    try {
      setLoading(true)
      
      // Check if user is logged in
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session) {
        router.push('/login?redirect=/dashboard')
        return
      }

      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({
          price: 8.99,
          amount: 1,
          name: 'Reevlo Plus',
          type: 'membership',
          mode: 'subscription'
        }),
      })

      const { sessionId, url, error } = await response.json()
      
      if (error) {
        console.error(error)
        alert('Payment initialization failed: ' + error)
        return
      }

      if (url) {
        window.location.href = url
      }
    } catch (err) {
      console.error(err)
      alert('An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <section id="membership" className={`py-24 px-4 ${darkMode ? 'bg-transparent' : 'bg-gray-50'}`}>
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h2 className={`text-3xl md:text-5xl font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Reevlo Plus</h2>
          <p className={`text-lg ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Upgrade your experience with our premium membership.</p>
        </div>

        <div className={`rounded-3xl p-8 md:p-12 shadow-xl border relative overflow-hidden ${
          darkMode ? 'bg-white/5 border-white/10' : 'bg-white border-gray-100'
        }`}>
          <div className="absolute top-0 right-0 bg-gradient-to-bl from-yellow-400 to-orange-500 w-32 h-32 opacity-10 rounded-bl-full" />
          
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-4">
                <div className={`p-2 rounded-lg ${darkMode ? 'bg-white text-black' : 'bg-black text-white'}`}>
                  <Star size={24} fill="currentColor" />
                </div>
                <h3 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Membership Benefits</h3>
              </div>
              
              <ul className="space-y-4">
                {features.map((feature, index) => (
                  <li key={index} className={`flex items-start gap-3 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    <div className={`p-1 rounded-full mt-1 ${darkMode ? 'bg-green-500/20 text-green-400' : 'bg-green-100 text-green-600'}`}>
                      <feature.icon size={16} />
                    </div>
                    <div>
                      <span className="font-semibold block">{feature.title}</span>
                      <span className="text-sm opacity-80">{feature.description}</span>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            <div className={`p-8 rounded-2xl text-center min-w-[280px] border ${
              darkMode ? 'bg-white/5 border-white/10' : 'bg-gray-50 border-gray-100'
            }`}>
              <div className={`text-sm font-medium mb-2 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>MONTHLY PLAN</div>
              <div className={`text-4xl font-bold mb-1 ${darkMode ? 'text-white' : 'text-gray-900'}`}>$8.99</div>
              <div className={`text-sm mb-6 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Cancel anytime</div>
              
              <button
                onClick={handleSubscribe}
                disabled={loading}
                className="w-full bg-gradient-to-r from-yellow-400 to-orange-500 text-white font-bold py-3 px-6 rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <Loader2 className="animate-spin" size={20} />
                ) : (
                  <>
                    <span>Subscribe Now</span>
                    <Star size={18} fill="currentColor" />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
