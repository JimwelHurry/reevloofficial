'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Coins, Zap, Gift, Loader2 } from 'lucide-react'
import { supabase } from '../lib/supabase'

const packages = [
  {
    name: 'Starter',
    amount: 500,
    price: 5.00,
    popular: false,
    color: 'bg-blue-500'
  },
  {
    name: 'Creator',
    amount: 1000,
    price: 10.00,
    popular: true,
    color: 'bg-purple-500'
  },
  {
    name: 'Pro',
    amount: 2000,
    price: 20.00,
    popular: false,
    color: 'bg-indigo-500'
  },
  {
    name: 'Ultimate',
    amount: 5000,
    price: 50.00,
    popular: false,
    color: 'bg-yellow-500'
  }
]

export default function TokenShop({ darkMode = false }: { darkMode?: boolean }) {
  const router = useRouter()
  const [loading, setLoading] = useState<string | null>(null)
  const [customAmount, setCustomAmount] = useState<string>('')
  
  const processBuy = async (price: number, amount: number, name: string) => {
    try {
      setLoading(name)
      
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
          price: price,
          amount: amount,
          name: name,
          type: 'coin'
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
      setLoading(null)
    }
  }

  const handleBuy = (pkg: typeof packages[0]) => {
    processBuy(pkg.price, pkg.amount, pkg.name)
  }

  const handleCustomBuy = () => {
    const amountUSD = parseFloat(customAmount)
    if (isNaN(amountUSD) || amountUSD < 1) {
      alert('Please enter a valid amount (minimum $1)')
      return
    }
    const tokens = Math.floor(amountUSD * 100)
    processBuy(amountUSD, tokens, 'Custom Amount')
  }

  return (
    <section id="shop" className={`py-24 px-4 ${darkMode ? 'bg-transparent' : 'bg-white'}`}>
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className={`text-3xl md:text-5xl font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Virtual Tokens</h2>
          <p className={`text-lg max-w-2xl mx-auto ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            Purchase tokens to boost your visibility and support your favorite creators.
          </p>
        </div>

        {/* Use Cases */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16 max-w-3xl mx-auto">
          <div className={`flex items-start gap-4 p-6 rounded-2xl border ${darkMode ? 'bg-white/5 border-white/10' : 'bg-blue-50 border-blue-100'}`}>
            <div className="bg-blue-600 text-white p-3 rounded-xl shrink-0">
              <Zap size={24} />
            </div>
            <div>
              <h3 className={`text-lg font-bold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Boost your Reel</h3>
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Use 1,000 Tokens to boost your Reel to top searches and get more views instantly.
              </p>
            </div>
          </div>
          <div className={`flex items-start gap-4 p-6 rounded-2xl border ${darkMode ? 'bg-white/5 border-white/10' : 'bg-pink-50 border-pink-100'}`}>
            <div className="bg-pink-500 text-white p-3 rounded-xl shrink-0">
              <Gift size={24} />
            </div>
            <div>
              <h3 className={`text-lg font-bold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Send Gifts</h3>
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Tip your favorite creators directly on their videos to show your appreciation.
              </p>
            </div>
          </div>
        </div>

        {/* Coin Packages */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {packages.map((pkg) => (
            <div 
              key={pkg.amount} 
              className={`relative rounded-2xl p-6 shadow-sm border transition-all hover:shadow-xl hover:-translate-y-1 ${
                darkMode 
                  ? 'bg-white/5 border-white/10' 
                  : 'bg-white border-gray-200'
              } ${pkg.popular ? 'border-blue-500 ring-2 ring-blue-500/20' : ''}`}
            >
              {pkg.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-blue-600 text-white px-4 py-1 rounded-full text-xs font-bold uppercase tracking-wide shadow-lg">
                  Most Popular
                </div>
              )}

              <div className="flex justify-center mb-6 text-gray-900">
                <Coins size={48} strokeWidth={1.5} className="text-yellow-500" />
              </div>

              <div className="text-center mb-2">
                <h3 className={`text-lg font-bold uppercase tracking-wide ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>{pkg.name}</h3>
              </div>

              <div className="text-center mb-6">
                <span className={`text-4xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{pkg.amount}</span>
                <span className="block text-xs font-medium text-gray-400 mt-1 uppercase">Tokens</span>
              </div>

              <div className="text-center mb-8">
                <span className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>${pkg.price.toFixed(2)}</span>
              </div>

              <button 
                onClick={() => handleBuy(pkg)}
                disabled={loading === pkg.name}
                className={`w-full py-3 rounded-xl font-semibold transition-colors flex items-center justify-center gap-2 ${
                pkg.popular 
                  ? 'bg-blue-600 text-white hover:bg-blue-700' 
                  : darkMode
                    ? 'bg-white/10 text-white hover:bg-white/20'
                    : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
              }`}>
                {loading === pkg.name ? (
                  <>
                    <Loader2 size={20} className="animate-spin" />
                    Processing...
                  </>
                ) : (
                  'Buy Now'
                )}
              </button>
            </div>
          ))}
        </div>
        
        {/* Custom Amount Section */}
        <div className={`max-w-xl mx-auto rounded-2xl p-8 border text-center ${darkMode ? 'bg-white/5 border-white/10' : 'bg-gray-50 border-gray-200'}`}>
          <h3 className={`text-xl font-bold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Custom Amount</h3>
          <p className={`text-sm mb-6 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Enter amount in USD to calculate tokens ($1 = 100 Tokens)</p>
          
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <div className="relative w-full">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">$</span>
              <input
                type="number"
                min="1"
                step="1"
                value={customAmount}
                onChange={(e) => setCustomAmount(e.target.value)}
                placeholder="Enter amount (e.g. 10)"
                className={`w-full pl-8 pr-4 py-3 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 transition-all ${
                  darkMode 
                    ? 'bg-black/50 border border-white/10 text-white placeholder-gray-600' 
                    : 'bg-white border border-gray-300 text-gray-900'
                }`}
              />
            </div>
            <button
              onClick={handleCustomBuy}
              disabled={loading === 'Custom Amount' || !customAmount || parseFloat(customAmount) < 1}
              className={`w-full sm:w-auto px-8 py-3 rounded-xl font-bold whitespace-nowrap transition-colors flex items-center justify-center gap-2 ${
                darkMode
                  ? 'bg-white text-black hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed'
                  : 'bg-black text-white hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed'
              }`}
            >
              {loading === 'Custom Amount' ? (
                <Loader2 size={20} className="animate-spin" />
              ) : (
                <>
                  Buy {customAmount && !isNaN(parseFloat(customAmount)) ? Math.floor(parseFloat(customAmount) * 100).toLocaleString() : '0'} Tokens
                </>
              )}
            </button>
          </div>
        </div>

        <div className="text-center mt-8 text-sm text-gray-400">
          Exchange Rate: $1.00 USD = 100 Tokens
        </div>
      </div>
    </section>
  )
}
