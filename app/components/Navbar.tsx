'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Menu, X, User, LogOut, LayoutDashboard } from 'lucide-react'
import { twMerge } from 'tailwind-merge'
import { supabase } from '../lib/supabase'
import { useRouter } from 'next/navigation'

export default function Navbar() {
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    // Check initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <div className="fixed top-0 left-0 right-0 z-50 flex justify-center pt-6 px-4">
      <nav className={twMerge(
        "bg-white/80 backdrop-blur-md border border-gray-200 rounded-full px-6 py-3 shadow-sm transition-all duration-300",
        "flex items-center justify-between w-full max-w-5xl"
      )}>
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 font-bold text-xl text-gray-900 tracking-tight">
          <span className="bg-black text-white px-2 py-1 rounded-lg">R</span>
          Reevlo Official
        </Link>

        {/* Desktop Links */}
        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-600">
          <Link href="/" className="hover:text-black transition-colors">Home</Link>
          <Link href="/#about" className="hover:text-black transition-colors">About</Link>
          <Link href="/#shop" className="hover:text-black transition-colors flex items-center gap-1">
            Buy Tokens
          </Link>
        </div>

        {/* Action Buttons */}
        <div className="hidden md:flex items-center gap-3">
          {user ? (
            <div className="flex items-center gap-3">
              <Link 
                href="/dashboard" 
                className="flex items-center gap-2 bg-gray-100 text-gray-900 px-4 py-2 rounded-full text-sm font-medium hover:bg-gray-200 transition-colors"
              >
                <LayoutDashboard size={16} />
                Dashboard
              </Link>
              <button 
                onClick={handleLogout}
                className="p-2 text-gray-500 hover:text-red-600 transition-colors"
                title="Log out"
              >
                <LogOut size={20} />
              </button>
            </div>
          ) : (
            <Link href="/login" className="flex items-center gap-2 bg-black text-white px-5 py-2 rounded-full text-sm font-medium hover:bg-gray-800 transition-colors">
              <User size={16} />
              Login
            </Link>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button 
          className="md:hidden p-2 text-gray-600"
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </nav>

      {/* Mobile Menu Dropdown */}
      {isOpen && (
        <div className="absolute top-24 left-4 right-4 bg-white rounded-2xl shadow-xl border border-gray-100 p-4 flex flex-col gap-4 md:hidden animate-in fade-in slide-in-from-top-4">
          <Link href="/" onClick={() => setIsOpen(false)} className="p-2 hover:bg-gray-50 rounded-lg">Home</Link>
          <Link href="/#about" onClick={() => setIsOpen(false)} className="p-2 hover:bg-gray-50 rounded-lg">About</Link>
          <Link href="/#shop" onClick={() => setIsOpen(false)} className="p-2 hover:bg-gray-50 rounded-lg">Buy Tokens</Link>
          <div className="h-px bg-gray-100 my-1" />
          
          {user ? (
            <>
              <Link href="/dashboard" onClick={() => setIsOpen(false)} className="w-full block text-center bg-gray-100 text-gray-900 py-3 rounded-xl font-medium">
                Dashboard
              </Link>
              <button onClick={() => { handleLogout(); setIsOpen(false); }} className="w-full block text-center text-red-600 py-3 rounded-xl font-medium hover:bg-red-50">
                Log Out
              </button>
            </>
          ) : (
            <Link href="/login" onClick={() => setIsOpen(false)} className="w-full block text-center bg-black text-white py-3 rounded-xl font-medium">
              Login
            </Link>
          )}
        </div>
      )}
    </div>
  )
}
