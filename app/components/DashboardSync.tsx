'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabase } from '@/app/lib/supabase'

export default function DashboardSync() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [syncing, setSyncing] = useState(false)
  const [balance, setBalance] = useState({ virtual_money: 0, is_premium: false })

  useEffect(() => {
    const success = searchParams.get('success')
    const checkSync = async () => {
        if (success) {
            setSyncing(true)
            const { data: { session } } = await supabase.auth.getSession()
            if (session) {
                await fetch('/api/sync-balance', { 
                    method: 'POST',
                    headers: { 'Authorization': `Bearer ${session.access_token}` },
                    body: JSON.stringify({ userId: session.user.id }) // Fallback
                })
            }
            setSyncing(false)
            router.replace('/dashboard')
        }
    }
    checkSync()
  }, [searchParams, router, supabase])

  useEffect(() => {
    const fetchInitial = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        // Fetch Membership Status
        const { data: profile } = await supabase.from('profiles').select('is_premium').eq('id', user.id).single()
        
        // Fetch Coin Balance from REWARDS_BALANCE (Unified Schema)
        const { data: wallet } = await supabase.from('rewards_balance').select('virtual_money').eq('user_id', user.id).single()

        setBalance({
            is_premium: profile?.is_premium || false,
            virtual_money: wallet?.virtual_money || 0
        })

        // Subscribe to changes
        const channel = supabase
          .channel('dashboard-updates')
          .on('postgres_changes', 
            { event: 'UPDATE', schema: 'public', table: 'profiles', filter: `id=eq.${user.id}` }, 
            (payload: any) => setBalance(prev => ({ ...prev, is_premium: payload.new.is_premium }))
          )
          .on('postgres_changes',
            { event: 'UPDATE', schema: 'public', table: 'rewards_balance', filter: `user_id=eq.${user.id}` },
            (payload: any) => setBalance(prev => ({ ...prev, virtual_money: payload.new.virtual_money }))
          )
          .subscribe()

        return () => { supabase.removeChannel(channel) }
      }
    }

    fetchInitial()
  }, [])

  return (
    <div className="mb-8 grid grid-cols-1 md:grid-cols-2 gap-4">
      {syncing && (
        <div className="col-span-2 bg-blue-100 text-blue-800 p-3 rounded text-center animate-pulse">
          🔄 Verifying your purchase...
        </div>
      )}
      
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h3 className="text-gray-500 text-sm font-medium uppercase">Your Tokens</h3>
        <div className="text-4xl font-bold text-gray-800 mt-2">
          {balance.virtual_money.toLocaleString()} <span className="text-lg text-gray-400">Coins</span>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h3 className="text-gray-500 text-sm font-medium uppercase">Membership Status</h3>
        <div className="flex items-center mt-2">
          {balance.is_premium ? ( 
             <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full font-bold text-xl flex items-center">
               ⭐ PRO MEMBER
             </span>
          ) : (
             <span className="text-gray-500 text-xl">Free Plan</span>
          )}
        </div>
      </div>
    </div>
  )
}
