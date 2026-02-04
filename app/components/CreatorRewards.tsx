import { TrendingUp, Percent, CreditCard } from 'lucide-react'

export default function CreatorRewards() {
  return (
    <section className="py-24 bg-black text-white px-4">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div>
            <h2 className="text-3xl md:text-5xl font-bold mb-6">Creator Earnings</h2>
            <p className="text-lg text-gray-400 mb-12 leading-relaxed">
              We put creators first. With transparent earning models and fast payouts, 
              Reevlo is designed to help you build a sustainable career.
            </p>
            
            <div className="space-y-8">
              <div className="flex gap-4">
                <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center shrink-0">
                  <TrendingUp size={24} />
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-2">View Rewards</h3>
                  <p className="text-gray-400">Earn $1.00 for every 1,000 qualified views on your content.</p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-12 h-12 rounded-full bg-purple-600 flex items-center justify-center shrink-0">
                  <Percent size={24} />
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-2">High Commission</h3>
                  <p className="text-gray-400">Creators keep 80% of all earnings. We take a standard 20% platform fee.</p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-12 h-12 rounded-full bg-green-600 flex items-center justify-center shrink-0">
                  <CreditCard size={24} />
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-2">Fast Withdrawals</h3>
                  <p className="text-gray-400">Payouts via Stripe with a low minimum balance of just $10.</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-3xl blur-2xl opacity-30" />
            <div className="relative bg-gray-900 rounded-3xl p-8 border border-gray-800">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <div className="text-sm text-gray-400 mb-1">Total Earnings</div>
                  <div className="text-4xl font-bold">$2,450.50</div>
                </div>
                <div className="bg-green-500/10 text-green-500 px-3 py-1 rounded-full text-sm font-medium">
                  +15% this week
                </div>
              </div>
              
              <div className="space-y-4">
                {[75, 40, 60, 85, 55, 90, 70].map((h, i) => (
                  <div key={i} className="bg-gray-800 rounded-full h-2 overflow-hidden">
                    <div 
                      className="bg-gradient-to-r from-blue-500 to-purple-500 h-full rounded-full" 
                      style={{ width: `${h}%` }}
                    />
                  </div>
                ))}
              </div>
              
              <div className="mt-8 pt-8 border-t border-gray-800 flex justify-between items-center">
                <div className="text-sm text-gray-400">Next Payout</div>
                <div className="font-medium">Available via Stripe</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
