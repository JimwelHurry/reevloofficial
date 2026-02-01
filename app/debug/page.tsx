'use client'

import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { User } from '@supabase/supabase-js'
import { useRouter } from 'next/navigation'
import { ShieldAlert, Plus, RefreshCw, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default function DebugPage() {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [adding, setAdding] = useState(false)
  const [amount, setAmount] = useState(100)
  const router = useRouter()

  const fetchProfile = async (userId: string) => {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()
    if (data) setProfile(data)
  }

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        router.push('/login')
        return
      }
      setUser(session.user)
      await fetchProfile(session.user.id)
      setLoading(false)
    }
    checkUser()
  }, [router])

  const handleAddCoins = async () => {
    if (!user) return
    setAdding(true)
    try {
      const res = await fetch('/api/debug/add-coins', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, amount }),
      })
      const data = await res.json()
      if (data.success) {
        await fetchProfile(user.id)
        alert('Coins added successfully!')
      } else {
        alert('Error: ' + data.error)
      }
    } catch (err: any) {
      alert('Error: ' + err.message)
    } finally {
      setAdding(false)
    }
  }

  if (loading) return <div className="p-10 text-white">Loading...</div>

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <div className="max-w-md mx-auto space-y-8">
        <Link href="/dashboard" className="flex items-center text-zinc-400 hover:text-white">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Dashboard
        </Link>

        <div className="bg-zinc-900 border border-red-900/50 p-6 rounded-xl space-y-4">
          <div className="flex items-center gap-3 text-red-500 mb-4">
            <ShieldAlert className="w-8 h-8" />
            <h1 className="text-2xl font-bold">Debug Tools</h1>
          </div>
          
          <div className="space-y-2">
            <p className="text-zinc-400">User ID:</p>
            <code className="block bg-black p-2 rounded text-xs text-zinc-500 break-all">
              {user?.id}
            </code>
          </div>

          <div className="p-4 bg-black/50 rounded-lg border border-zinc-800">
            <p className="text-sm text-zinc-400 mb-1">Current Balance</p>
            <div className="text-3xl font-bold text-yellow-500">
              {profile?.coins || 0} Tokens
            </div>
          </div>

          <div className="pt-4 border-t border-zinc-800 space-y-4">
            <h2 className="font-semibold">Manual Balance Adjustment</h2>
            <div className="flex gap-2">
              <input 
                type="number" 
                value={amount}
                onChange={(e) => setAmount(parseInt(e.target.value))}
                className="bg-black border border-zinc-700 rounded px-3 py-2 w-full"
              />
              <button
                onClick={handleAddCoins}
                disabled={adding}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded flex items-center gap-2 whitespace-nowrap disabled:opacity-50"
              >
                {adding ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                Add Coins
              </button>
            </div>
            <p className="text-xs text-zinc-500">
              Use this to manually add coins if Stripe webhooks are failing locally.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
