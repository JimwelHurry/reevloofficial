'use client'

import { useState } from 'react'
import { loadStripe } from '@stripe/stripe-js'
import { supabase } from '@/app/lib/supabase'

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

export default function TokenShop() {
  const [loading, setLoading] = useState(false)

  const handleBuy = async (amount: number, price: number) => {
    setLoading(true)
    try {
      // Get current user session for auth header
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) throw new Error('Please login first')

      const res = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({ 
          type: 'coin', 
          amount: amount, 
        }),
      })
      
      const { sessionId, url, error } = await res.json()
      
      if (error) throw new Error(error)
      
      if (url) {
        window.location.href = url
      } else {
        throw new Error("No checkout URL returned")
      }
    } catch (err: any) {
      alert(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-6 bg-white rounded-lg shadow-md border border-gray-100">
      <h2 className="text-2xl font-bold mb-4 text-gray-800">Virtual Token Shop</h2>
      <p className="text-gray-500 mb-6">Buy tokens to gift creators and boost your videos.</p>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Package 1 */}
        <div className="border rounded-xl p-4 hover:border-[#7C3AED] transition cursor-pointer flex flex-col items-center">
          <div className="text-3xl mb-2">🪙 500</div>
          <div className="font-bold text-lg">500 Tokens</div>
          <div className="text-gray-500 mb-4">$5.00</div>
          <button 
            onClick={() => handleBuy(500, 5)}
            disabled={loading}
            className="w-full bg-[#7C3AED] text-white py-2 rounded-lg hover:bg-[#6D28D9] disabled:opacity-50"
          >
            {loading ? 'Processing...' : 'Buy Now'}
          </button>
        </div>

        {/* Package 2 */}
        <div className="border rounded-xl p-4 border-[#7C3AED]/30 bg-purple-50 hover:border-[#7C3AED] transition cursor-pointer flex flex-col items-center relative overflow-hidden">
          <div className="absolute top-0 right-0 bg-[#FACC15] text-xs font-bold px-2 py-1 rounded-bl">POPULAR</div>
          <div className="text-3xl mb-2">💰 1,000</div>
          <div className="font-bold text-lg">1,000 Tokens</div>
          <div className="text-gray-500 mb-4">$10.00</div>
          <button 
             onClick={() => handleBuy(1000, 10)}
             disabled={loading}
             className="w-full bg-[#7C3AED] text-white py-2 rounded-lg hover:bg-[#6D28D9] disabled:opacity-50"
          >
            {loading ? 'Processing...' : 'Buy Now'}
          </button>
        </div>

        {/* Package 3 */}
        <div className="border rounded-xl p-4 hover:border-[#7C3AED] transition cursor-pointer flex flex-col items-center">
          <div className="text-3xl mb-2">💎 2,000</div>
          <div className="font-bold text-lg">2,000 Tokens</div>
          <div className="text-gray-500 mb-4">$20.00</div>
          <button 
             onClick={() => handleBuy(2000, 20)}
             disabled={loading}
             className="w-full bg-[#7C3AED] text-white py-2 rounded-lg hover:bg-[#6D28D9] disabled:opacity-50"
          >
            {loading ? 'Processing...' : 'Buy Now'}
          </button>
        </div>

        {/* Package 4 */}
        <div className="border rounded-xl p-4 hover:border-[#7C3AED] transition cursor-pointer flex flex-col items-center">
          <div className="text-3xl mb-2">👑 5,000</div>
          <div className="font-bold text-lg">5,000 Tokens</div>
          <div className="text-gray-500 mb-4">$50.00</div>
          <button 
             onClick={() => handleBuy(5000, 50)}
             disabled={loading}
             className="w-full bg-[#7C3AED] text-white py-2 rounded-lg hover:bg-[#6D28D9] disabled:opacity-50"
          >
            {loading ? 'Processing...' : 'Buy Now'}
          </button>
        </div>
      </div>
    </div>
  )
}
