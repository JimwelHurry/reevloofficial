'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../lib/supabase'
import { User } from '@supabase/supabase-js'
import TokenShop from '../components/TokenShop'
import Membership from '../components/Membership'
import PayoutRequest from '../components/PayoutRequest'
import { 
  Wallet, 
  Loader2, 
  LayoutDashboard, 
  User as UserIcon, 
  Settings, 
  CreditCard, 
  LogOut,
  ShoppingBag,
  Download,
  DollarSign,
  ArrowUpRight,
  RefreshCw,
  Check,
  X
} from 'lucide-react'
import Link from 'next/link'

export default function Dashboard() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<any>(null)
  const [virtualMoney, setVirtualMoney] = useState(0)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'success' | 'no_updates' | 'error'>('idle')
  const [syncMessage, setSyncMessage] = useState('')

  const handleSyncBalance = async () => {
    if (!user) return
    setSyncStatus('syncing')
    try {
      const res = await fetch('/api/sync-balance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, email: user.email })
      })
      const data = await res.json()
      if (data.success) {
        // Refetch balances
        const { data: wallet } = await supabase.from('rewards_balance').select('virtual_money').eq('user_id', user.id).single()
        if (wallet) setVirtualMoney(wallet.virtual_money)
        
        setSyncStatus('success')
        setSyncMessage('Synced!')
      } else {
        setSyncStatus('error')
        setSyncMessage('Failed')
      }
    } catch (err) {
      setSyncStatus('error')
      setSyncMessage('Error')
    } finally {
      setTimeout(() => {
        setSyncStatus('idle')
        setSyncMessage('')
      }, 3000)
    }
  }

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        router.push('/login')
      } else {
        setUser(session.user)
        
        // Fetch profile data
        const { data: profileData } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single()
        
        if (profileData) setProfile(profileData)

        // Fetch Rewards Balance
        const { data: wallet } = await supabase
          .from('rewards_balance')
          .select('virtual_money')
          .eq('user_id', session.user.id)
          .single()
        
        if (wallet) setVirtualMoney(wallet.virtual_money)
        
        setLoading(false)
      }
    }
    checkUser()
  }, [router])

  useEffect(() => {
    if (user) {
      // Auto-sync on load or when returning from Stripe
      const params = new URLSearchParams(window.location.search)
      if (params.get('success') === 'true') {
        handleSyncBalance()
        // Clean up URL without refresh
        window.history.replaceState({}, '', '/dashboard')
      } else {
        // Also sync on normal load to ensure up-to-date balance
        handleSyncBalance()
      }
    }
  }, [user])

  // Real-time subscription for profile updates
  useEffect(() => {
    if (!user) return

    const channel = supabase
      .channel('profile-updates')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'profiles',
          filter: `id=eq.${user.id}`,
        },
        (payload) => {
          console.log('Real-time profile update:', payload)
          setProfile(payload.new)
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [user])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center">
        <Loader2 className="animate-spin text-white" size={32} />
      </div>
    )
  }

  if (!user) return null

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white flex font-sans selection:bg-green-500/30 selection:text-green-200">
      {/* Sidebar */}
      <aside className="w-64 border-r border-white/10 flex flex-col fixed h-full bg-[#0A0A0A] z-20">
        <div className="p-6">
          <Link href="/" className="flex items-center gap-2 font-bold text-xl tracking-tight">
            <span className="bg-white text-black px-2 py-1 rounded-lg">R</span>
            Reevlo
          </Link>
        </div>

        <nav className="flex-1 px-4 space-y-8">
          <div>
            <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4 px-2">Account</div>
            <div className="space-y-1">
              <button 
                onClick={() => setActiveTab('overview')}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === 'overview' 
                    ? 'bg-white/10 text-white' 
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <LayoutDashboard size={18} />
                Overview
              </button>
              <button 
                onClick={() => setActiveTab('profile')}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === 'profile' 
                    ? 'bg-white/10 text-white' 
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <UserIcon size={18} />
                Profile
              </button>
              <button 
                onClick={() => setActiveTab('settings')}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === 'settings' 
                    ? 'bg-white/10 text-white' 
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <Settings size={18} />
                Settings
              </button>
            </div>
          </div>

          <div>
            <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4 px-2">Store</div>
            <div className="space-y-1">
              <button 
                onClick={() => setActiveTab('shop')}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === 'shop' 
                    ? 'bg-white/10 text-white' 
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <ShoppingBag size={18} />
                Buy Tokens
              </button>
              <button 
                onClick={() => setActiveTab('payout')}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === 'payout' 
                    ? 'bg-white/10 text-white' 
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <DollarSign size={18} />
                Withdrawals
              </button>
              <button 
                onClick={() => setActiveTab('membership')}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === 'membership' 
                    ? 'bg-white/10 text-white' 
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <CreditCard size={18} />
                Membership
              </button>
            </div>
          </div>
        </nav>

        <div className="p-4 border-t border-white/10">
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
          >
            <LogOut size={18} />
            Log out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-64 p-8 md:p-12 max-w-7xl mx-auto w-full">
        {/* Header */}
        <header className="flex justify-between items-center mb-12">
          <div>
            <h1 className="text-3xl font-bold mb-2">Hello! {user.email?.split('@')[0]}</h1>
            <p className="text-gray-400">Welcome to your Reevlo portal.</p>
          </div>
          <button className="flex items-center gap-2 bg-[#2ECC71] text-black px-4 py-2 rounded-lg font-bold text-sm hover:bg-[#27AE60] transition-colors">
            <Download size={16} />
            Download App
          </button>
        </header>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-12">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="bg-[#111] border border-white/10 rounded-2xl p-6 relative overflow-hidden group hover:border-white/20 transition-colors">
                <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/3 group-hover:bg-green-500/20 transition-colors" />
                <div className="relative z-10">
                  <div className="flex items-center gap-3 mb-4 text-gray-400">
                    <DollarSign size={20} />
                    <span className="text-sm font-medium">Total Balance</span>
                  </div>
                  <div className="text-4xl font-bold text-white mb-2">$0.00</div>
                  <div className="flex items-center justify-between mt-4">
                    <div className="text-sm text-gray-500">Lifetime Earnings: $0.00</div>
                    <button disabled className="flex items-center gap-1 text-xs bg-white/10 text-gray-400 px-3 py-1.5 rounded-full hover:bg-white/20 hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                      Withdraw <ArrowUpRight size={12} />
                    </button>
                  </div>
                </div>
              </div>

              <div className="bg-[#111] border border-white/10 rounded-2xl p-6 relative overflow-hidden group hover:border-white/20 transition-colors">
                <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/3 group-hover:bg-purple-500/20 transition-colors" />
                <div className="relative z-10">
                  <div className="flex items-center gap-3 mb-4 text-gray-400">
                    <Wallet size={20} />
                    <span className="text-sm font-medium">Virtual Tokens</span>
                  </div>
                  <div className="text-4xl font-bold text-white mb-2">{profile?.coins?.toLocaleString() || '0'}</div>
                  <div className="flex items-center justify-between mt-2">
                    <div className="text-sm text-gray-500">Use to gift or boost</div>
                    <button 
                      onClick={handleSyncBalance}
                      disabled={syncStatus !== 'idle'}
                      className={`text-xs px-3 py-1.5 rounded-full flex items-center gap-1 disabled:opacity-80 transition-all duration-300 ${
                        syncStatus === 'success' ? 'bg-green-500/20 text-green-400' :
                        syncStatus === 'error' ? 'bg-red-500/20 text-red-400' :
                        'bg-white/10 text-gray-400 hover:bg-white/20 hover:text-white'
                      }`}
                    >
                      {syncStatus === 'syncing' && <Loader2 size={12} className="animate-spin" />}
                      {syncStatus === 'success' && <Check size={12} />}
                      {syncStatus === 'no_updates' && <Check size={12} />}
                      {syncStatus === 'error' && <X size={12} />}
                      {syncStatus === 'idle' && <RefreshCw size={12} />}
                      
                      {syncStatus === 'idle' ? 'Sync' : syncMessage || 'Syncing...'}
                    </button>
                  </div>
                </div>
              </div>

              <div className="bg-[#111] border border-white/10 rounded-2xl p-6 relative overflow-hidden group hover:border-white/20 transition-colors">
                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/3 group-hover:bg-blue-500/20 transition-colors" />
                <div className="relative z-10">
                  <div className="flex items-center gap-3 mb-4 text-gray-400">
                    <CreditCard size={20} />
                    <span className="text-sm font-medium">Reevlo Plus</span>
                  </div>
                  <div className="text-2xl font-bold text-white mb-2">{profile?.is_pro ? 'Active' : 'Inactive'}</div>
                  <div className="text-sm text-gray-500">{profile?.is_pro ? 'Premium features unlocked' : 'Upgrade to unlock features'}</div>
                </div>
              </div>
            </div>

            {/* Recent Activity or Shop Preview */}
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold">Quick Access</h2>
              </div>
              
              <div className="bg-[#111] border border-white/10 rounded-3xl p-8">
                <TokenShop />
              </div>

              <div className="mt-8 bg-[#111] border border-white/10 rounded-3xl p-8">
                <Membership />
              </div>
            </div>
          </div>
        )}

        {/* Shop Tab */}
        {activeTab === 'shop' && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
            <TokenShop />
          </div>
        )}

        {/* Membership Tab */}
        {activeTab === 'membership' && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
            <Membership />
          </div>
        )}

        {/* Payout Tab */}
        {activeTab === 'payout' && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
            <div className="max-w-2xl">
              <PayoutRequest 
                balance={virtualMoney} 
                onUpdate={async () => {
                   const { data: wallet } = await supabase.from('rewards_balance').select('virtual_money').eq('user_id', user!.id).single()
                   if (wallet) setVirtualMoney(wallet.virtual_money)
                }} 
              />
            </div>
          </div>
        )}

        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
            <div className="bg-[#111] border border-white/10 rounded-2xl p-8 max-w-2xl">
              <h2 className="text-2xl font-bold mb-6">My Profile</h2>
              
              <div className="flex items-center gap-6 mb-8">
                <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center text-4xl font-bold text-gray-400">
                  {user.email?.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white mb-1">{user.email?.split('@')[0]}</h3>
                  <p className="text-gray-400">{user.email}</p>
                  <span className={`inline-block mt-2 px-3 py-1 rounded-full text-xs font-medium ${
                    profile?.is_pro 
                      ? 'bg-blue-500/20 text-blue-400' 
                      : 'bg-white/10 text-gray-300'
                  }`}>
                    {profile?.is_pro ? 'Reevlo Plus Member' : 'Free Member'}
                  </span>
                </div>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-white/5 rounded-xl border border-white/5">
                    <label className="text-xs text-gray-500 uppercase tracking-wider font-bold block mb-1">User ID</label>
                    <code className="text-sm text-gray-300 break-all">{user.id}</code>
                  </div>
                  <div className="p-4 bg-white/5 rounded-xl border border-white/5">
                    <label className="text-xs text-gray-500 uppercase tracking-wider font-bold block mb-1">Last Sign In</label>
                    <p className="text-sm text-gray-300">{new Date(user.last_sign_in_at || '').toLocaleDateString()}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Settings Tab */}
        {activeTab === 'settings' && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
            <div className="bg-[#111] border border-white/10 rounded-2xl p-8 max-w-2xl">
              <h2 className="text-2xl font-bold mb-6">Account Settings</h2>
              
              <div className="space-y-6">
                <div className="flex items-center justify-between py-4 border-b border-white/5">
                  <div>
                    <h3 className="font-medium text-white">Email Notifications</h3>
                    <p className="text-sm text-gray-400">Receive updates about your account and new features</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" defaultChecked />
                    <div className="w-11 h-6 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between py-4 border-b border-white/5">
                  <div>
                    <h3 className="font-medium text-white">Marketing Emails</h3>
                    <p className="text-sm text-gray-400">Receive special offers and promotions</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" />
                    <div className="w-11 h-6 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500"></div>
                  </label>
                </div>

                <div className="pt-6">
                  <h3 className="font-medium text-red-500 mb-2">Danger Zone</h3>
                  <p className="text-sm text-gray-400 mb-4">Once you delete your account, there is no going back. Please be certain.</p>
                  <button className="px-4 py-2 border border-red-500/20 bg-red-500/10 text-red-500 rounded-lg text-sm font-medium hover:bg-red-500/20 transition-colors">
                    Delete Account
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
