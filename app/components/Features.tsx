import { DollarSign, Trophy, Smartphone, Wallet } from 'lucide-react'

const features = [
  {
    icon: DollarSign,
    title: 'Monetization First',
    description: 'Paid content locks, virtual gifting, and view rewards built-in.'
  },
  {
    icon: Trophy,
    title: 'Competitions',
    description: 'Weekly video challenges with real prizes.'
  },
  {
    icon: Smartphone,
    title: 'Progressive Web App',
    description: 'No download required. Install directly from your browser.'
  },
  {
    icon: Wallet,
    title: 'Secure Wallet',
    description: 'Built-in digital wallet to manage your earnings and deposits.'
  }
]

export default function Features() {
  return (
    <section className="py-24 bg-white px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-4">Key Features</h2>
          <p className="text-lg text-gray-500 max-w-2xl mx-auto">
            Everything you need to succeed as a creator.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, i) => (
            <div key={i} className="flex flex-col items-center text-center p-6 rounded-2xl bg-gray-50 hover:bg-gray-100 transition-colors">
              <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-sm mb-6 text-blue-600">
                <feature.icon size={32} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
              <p className="text-gray-500 leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
