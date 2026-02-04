'use client'

import { useState } from 'react'
import { Plus, Minus } from 'lucide-react'

const faqs = [
  {
    question: 'Is Reevlo free to use?',
    answer: 'Yes! Watching and creating is 100% free. Reevlo Plus is optional for premium perks.'
  },
  {
    question: 'How do I get paid?',
    answer: 'Earnings are credited to your in-app wallet and can be withdrawn directly to your bank account via Stripe.'
  },
  {
    question: 'Do I need to download an app?',
    answer: 'No. Reevlo is a web app. Just visit reevlo.com and tap "Add to Home Screen".'
  }
]

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0)

  return (
    <section className="py-24 bg-gray-50 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-4">Frequently Asked Questions</h2>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div 
              key={index} 
              className="bg-white rounded-2xl border border-gray-200 overflow-hidden transition-all duration-200"
            >
              <button 
                className="w-full flex items-center justify-between p-6 text-left"
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
              >
                <span className="font-bold text-gray-900 text-lg">{faq.question}</span>
                {openIndex === index ? (
                  <Minus size={20} className="text-gray-400 shrink-0" />
                ) : (
                  <Plus size={20} className="text-gray-400 shrink-0" />
                )}
              </button>
              
              <div 
                className={`px-6 transition-all duration-300 ease-in-out overflow-hidden ${
                  openIndex === index ? 'max-h-40 pb-6 opacity-100' : 'max-h-0 opacity-0'
                }`}
              >
                <p className="text-gray-500 leading-relaxed">
                  {faq.answer}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
