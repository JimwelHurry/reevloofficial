import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="bg-white border-t border-gray-100 py-12 px-4">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
        <div className="flex items-center gap-2 font-bold text-xl text-gray-900">
          <span className="bg-black text-white px-2 py-1 rounded-lg">R</span>
          Reevlo Official
        </div>
        
        <div className="flex gap-8 text-sm text-gray-500">
          <Link href="#" className="hover:text-black transition-colors">Privacy Policy</Link>
          <Link href="#" className="hover:text-black transition-colors">Terms of Service</Link>
          <Link href="#" className="hover:text-black transition-colors">Contact Support</Link>
        </div>

        <div className="text-sm text-gray-400">
          © {new Date().getFullYear()} Reevlo. All rights reserved.
        </div>
      </div>
    </footer>
  )
}
