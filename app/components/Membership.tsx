'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Check, Star, Loader2 } from 'lucide-react'
import { supabase } from '../lib/supabase'

export default function Membership({ darkMode = false }: { darkMode?: boolean }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

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
    <section className={`py-24 px-4 ${darkMode ? 'bg-transparent' : 'bg-gray-50'}`}>
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
                <li className={`flex items-center gap-3 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  <div className={`p-1 rounded-full ${darkMode ? 'bg-green-500/20 text-green-400' : 'bg-green-100 text-green-600'}`}><Check size={16} /></div>
                  Unlock exclusive Creator Content
                </li>
                <li className={`flex items-center gap-3 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  <div className={`p-1 rounded-full ${darkMode ? 'bg-green-500/20 text-green-400' : 'bg-green-100 text-green-600'}`}><Check size={16} /></div>
                  Ad-free experience
                </li>
                <li className={`flex items-center gap-3 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  <div className={`p-1 rounded-full ${darkMode ? 'bg-green-500/20 text-green-400' : 'bg-green-100 text-green-600'}`}><Check size={16} /></div>
                  Premium profile badge
                </li>
                <li className={`flex items-center gap-3 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  <div className={`p-1 rounded-full ${darkMode ? 'bg-green-500/20 text-green-400' : 'bg-green-100 text-green-600'}`}><Check size={16} /></div>
                  Priority support
                </li>
              </ul>
            </div>

            <div className={`p-8 rounded-2xl text-center min-w-[280px] border ${
              darkMode ? 'bg-black/50 border-white/10' : 'bg-gray-50 border-gray-100'
            }`}>
              <div className="text-gray-500 font-medium mb-2">Monthly Subscription</div>
              <div className={`text-5xl font-bold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>$8.99</div>
              <div className="text-sm text-gray-400 mb-6">per month</div>
              <button 
                onClick={handleSubscribe}
                disabled={loading}
                className={`w-full py-4 rounded-xl font-bold transition-colors shadow-lg flex items-center justify-center gap-2 ${
                darkMode 
                  ? 'bg-white text-black hover:bg-gray-200 shadow-white/10' 
                  : 'bg-black text-white hover:bg-gray-800 shadow-black/20'
              }`}>
                {loading ? (
                  <>
                    <Loader2 size={20} className="animate-spin" />
                    Processing...
                  </>
                ) : (
                  'Join Reevlo Plus'
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
