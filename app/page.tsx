import Navbar from './components/Navbar'
import Hero from './components/Hero'
import Features from './components/Features'
import CreatorRewards from './components/CreatorRewards'
import Membership from './components/Membership'
import TokenShop from './components/TokenShop'
import FAQ from './components/FAQ'
import Footer from './components/Footer'

export default function Home() {
  return (
    <main className="min-h-screen bg-white text-gray-900 selection:bg-blue-100 selection:text-blue-900">
      <Navbar />
      <Hero />
      <Features />
      <CreatorRewards />
      <Membership />
      <TokenShop />
      <FAQ />
      <Footer />
    </main>
  )
}
