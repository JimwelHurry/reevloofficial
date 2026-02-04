import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight, Smartphone } from 'lucide-react'

export default function Hero() {
  return (
    <section className="pt-32 pb-16 px-4 md:pt-40 md:pb-24 overflow-hidden">
      <div className="max-w-6xl mx-auto flex flex-col items-center text-center">
        
        {/* Badge */}
        <div className="inline-flex items-center gap-2 bg-gray-100 border border-gray-200 rounded-full px-4 py-1.5 text-sm font-medium text-gray-600 mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
          </span>
          Reevlo is now live
        </div>

        {/* Headline */}
        <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-gray-900 mb-6 max-w-4xl animate-in fade-in slide-in-from-bottom-8 duration-700 delay-100">
          Watch. Create. Earn.
        </h1>

        {/* Subheadline */}
        <p className="text-lg md:text-xl text-gray-500 max-w-2xl mb-10 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200">
          The social video platform where your passion pays off.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-4 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-300">
          <a 
            href="https://reevlo.com" 
            target="_blank" 
            rel="noopener noreferrer"
            className="group flex items-center gap-2 bg-black text-white px-8 py-4 rounded-full font-semibold text-lg hover:bg-gray-800 transition-all hover:scale-105"
          >
            Launch App
            <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
          </a>
          
          <Link 
            href="#shop"
            className="flex items-center gap-2 bg-white border border-gray-200 text-gray-900 px-8 py-4 rounded-full font-semibold text-lg hover:bg-gray-50 transition-all"
          >
            Buy Tokens
          </Link>
        </div>

        {/* App Store Badges */}
        <div className="mt-12 flex items-center gap-4 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-400 opacity-80">
          <div className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-lg cursor-pointer hover:opacity-80 transition-opacity">
            <Smartphone size={24} />
            <div className="text-left">
              <div className="text-[10px] leading-none">Download on the</div>
              <div className="text-sm font-bold leading-none">App Store</div>
            </div>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-lg cursor-pointer hover:opacity-80 transition-opacity">
            <div className="text-left">
              <div className="text-[10px] leading-none">GET IT ON</div>
              <div className="text-sm font-bold leading-none">Google Play</div>
            </div>
          </div>
        </div>

        {/* Phone Mockup Image */}
        <div className="mt-20 relative w-full max-w-[300px] md:max-w-[350px] mx-auto animate-in fade-in slide-in-from-bottom-12 duration-1000 delay-500">
          <div className="absolute inset-0 bg-gradient-to-t from-blue-500/20 to-purple-500/20 blur-3xl rounded-full transform scale-150 opacity-50 -z-10" />
          <Image
            src="/hero-image.webp"
            alt="Reevlo App Interface"
            width={350}
            height={700}
            className="w-full h-auto drop-shadow-2xl rounded-[2.5rem] border-8 border-black bg-black"
            priority
          />
        </div>

      </div>
    </section>
  )
}
