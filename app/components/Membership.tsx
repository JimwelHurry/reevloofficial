'use client'

import { useState } from 'react'
import { loadStripe } from '@stripe/stripe-js'
import { supabase } from '@/app/lib/supabase'

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

export default function Membership() {
  const [loading, setLoading] = useState(false)

  const handleSubscribe = async () => {
    setLoading(true)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) throw new Error('Please login first')

      const res = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({ 
          type: 'membership',
          priceId: 'price_1Qxxxxxxxxxxxxxx', // Replace with your actual Stripe Price ID
        }),
      })
      
      const { sessionId, error } = await res.json()
      
      if (error) throw new Error(error)
      
      const stripe = await stripePromise
      if (stripe) {
        await (stripe as any).redirectToCheckout({ sessionId })
      }
    } catch (err: any) {
      alert(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-6 bg-gradient-to-br from-[#7C3AED] to-[#EC4899] rounded-lg shadow-xl text-white">
      <div className="flex flex-col md:flex-row justify-between items-center">
        <div className="mb-4 md:mb-0">
          <h2 className="text-3xl font-bold mb-2">Reevlo Plus Membership</h2>
          <ul className="space-y-2 text-indigo-50">
            <li>✅ Upload longer videos (up to 10 mins)</li>
            <li>✅ Zero ads experience</li>
            <li>✅ Profile verification badge</li>
            <li>✅ Priority support</li>
          </ul>
        </div>
        
        <div className="bg-white/10 p-6 rounded-xl backdrop-blur-sm text-center min-w-[200px]">
          <div className="text-sm uppercase tracking-wider mb-1">Monthly</div>
          <div className="text-4xl font-bold mb-4">$8.99<span className="text-lg font-normal">/mo</span></div>
          <button 
            onClick={handleSubscribe}
            disabled={loading}
            className="w-full bg-white text-[#7C3AED] font-bold py-3 rounded-lg hover:bg-gray-100 transition disabled:opacity-70"
          >
            {loading ? 'Redirecting...' : 'Upgrade Now'}
          </button>
        </div>
      </div>
    </div>
  )
}
