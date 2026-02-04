'use client'

import { useState } from 'react'
import { supabase } from '@/app/lib/supabase'
import { DollarSign, AlertCircle, CheckCircle } from 'lucide-react'

export default function PayoutRequest({ balance, onUpdate }: { balance: number, onUpdate: () => void }) {
  const [amount, setAmount] = useState<number>(0)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

  const CONVERSION_RATE = 0.01 // $0.01 per coin
  const MIN_WITHDRAWAL_COINS = 5000 // $50.00

  const usdValue = (amount * CONVERSION_RATE).toFixed(2)

  const handleRequest = async () => {
    setMessage(null)
    
    if (amount < MIN_WITHDRAWAL_COINS) {
      setMessage({ type: 'error', text: `Minimum withdrawal is ${MIN_WITHDRAWAL_COINS.toLocaleString()} coins ($${(MIN_WITHDRAWAL_COINS * CONVERSION_RATE).toFixed(2)})` })
      return
    }

    if (amount > balance) {
      setMessage({ type: 'error', text: 'Insufficient balance' })
      return
    }

    setLoading(true)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) throw new Error('Please login first')

      const res = await fetch('/api/request-payout', {
        method: 'POST',
        headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({ amount }),
      })
      
      const data = await res.json()
      
      if (!data.success) throw new Error(data.error)

      setMessage({ type: 'success', text: 'Payout request submitted successfully!' })
      setAmount(0)
      onUpdate() // Refresh parent balance
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
      <h2 className="text-2xl font-bold mb-4 text-gray-800 flex items-center gap-2">
        <DollarSign className="text-green-600" />
        Request Payout
      </h2>
      
      <div className="mb-6 bg-gray-50 p-4 rounded-md">
        <div className="text-sm text-gray-500 mb-1">Available Balance</div>
        <div className="text-3xl font-bold text-gray-900">{balance.toLocaleString()} Coins</div>
        <div className="text-sm text-green-600 font-medium">≈ ${(balance * CONVERSION_RATE).toFixed(2)} USD</div>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Amount to Withdraw (Coins)
          </label>
          <input
            type="number"
            value={amount || ''}
            onChange={(e) => setAmount(Number(e.target.value))}
            className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-green-500 outline-none text-gray-900"
            placeholder="Enter amount"
            min={MIN_WITHDRAWAL_COINS}
          />
          <div className="text-right text-sm text-gray-500 mt-1">
            You will receive: <span className="font-bold text-gray-900">${usdValue} USD</span>
          </div>
        </div>

        {message && (
          <div className={`p-3 rounded-md flex items-center gap-2 text-sm ${
            message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
          }`}>
            {message.type === 'success' ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
            {message.text}
          </div>
        )}

        <button
          onClick={handleRequest}
          disabled={loading || amount <= 0}
          className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Processing...' : 'Submit Request'}
        </button>

        <p className="text-xs text-gray-400 text-center mt-4">
          Withdrawals are processed via Stripe within 3-5 business days. <br/>
          Minimum withdrawal: {MIN_WITHDRAWAL_COINS.toLocaleString()} Coins.
        </p>
      </div>
    </div>
  )
}
