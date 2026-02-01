'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../lib/supabase'
import { User } from '@supabase/supabase-js'
import TokenShop from '../components/TokenShop'
import Membership from '../components/Membership'
import { 
  Wallet, 
  Loader2, 
  LayoutDashboard, 
  User as UserIcon, 
  Settings, 
  CreditCard, 
  LogOut,
  ShoppingBag,
  Download
} from 'lucide-react'
import Link from 'next/link'

export default function Dashboard() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        router.push('/login')
      } else {
        setUser(session.user)
      }
      setLoading(false)
    }

    checkUser()
  }, [router])

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
              <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-gray-400 hover:text-white hover:bg-white/5 transition-colors">
                <UserIcon size={18} />
                Profile
              </button>
              <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-gray-400 hover:text-white hover:bg-white/5 transition-colors">
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
              <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-gray-400 hover:text-white hover:bg-white/5 transition-colors">
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
                    <Wallet size={20} />
                    <span className="text-sm font-medium">Wallet Balance</span>
                  </div>
                  <div className="text-4xl font-bold text-white mb-2">0</div>
                  <div className="text-sm text-gray-500">Available Coins</div>
                </div>
              </div>

              <div className="bg-[#111] border border-white/10 rounded-2xl p-6 relative overflow-hidden group hover:border-white/20 transition-colors">
                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/3 group-hover:bg-blue-500/20 transition-colors" />
                <div className="relative z-10">
                  <div className="flex items-center gap-3 mb-4 text-gray-400">
                    <CreditCard size={20} />
                    <span className="text-sm font-medium">Membership</span>
                  </div>
                  <div className="text-2xl font-bold text-white mb-2">Free Plan</div>
                  <div className="text-sm text-gray-500">Upgrade to unlock features</div>
                </div>
              </div>

              <div className="bg-[#111] border border-white/10 rounded-2xl p-6 flex flex-col justify-center items-center text-center group hover:border-white/20 transition-colors cursor-pointer" onClick={() => setActiveTab('shop')}>
                <div className="bg-white/5 p-4 rounded-full mb-4 group-hover:bg-white/10 transition-colors">
                  <ShoppingBag size={24} className="text-gray-300" />
                </div>
                <h3 className="font-bold text-white mb-1">Buy Tokens</h3>
                <p className="text-sm text-gray-500">Top up your wallet</p>
              </div>
            </div>

            {/* Recent Activity or Shop Preview */}
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold">Quick Access</h2>
              </div>
              
              <div className="bg-[#111] border border-white/10 rounded-3xl p-8">
                <TokenShop darkMode={true} />
              </div>

              <div className="mt-8 bg-[#111] border border-white/10 rounded-3xl p-8">
                <Membership darkMode={true} />
              </div>
            </div>
          </div>
        )}

        {/* Shop Tab */}
        {activeTab === 'shop' && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
            <TokenShop darkMode={true} />
            <Membership darkMode={true} />
          </div>
        )}
      </main>
    </div>
  )
}
