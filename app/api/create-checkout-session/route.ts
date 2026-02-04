import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'

// Using service role key for admin access
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16' as any,
})

export async function POST(req: NextRequest) {
  try {
    const { type, amount, priceId } = await req.json()
    
    if (!process.env.STRIPE_SECRET_KEY) {
      throw new Error('Missing STRIPE_SECRET_KEY')
    }
    
    // Validate User Session (Client-side token passed via headers or cookies)
    // Note: In App Router, we usually use cookies() or headers()
    // But for simplicity in this integration, we'll trust the client sends the user info or
    // we fetch user from Supabase using the access token passed in Authorization header.
    
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    
    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error } = await supabaseAdmin.auth.getUser(token)
    
    if (error || !user) {
         return NextResponse.json({ error: 'Unauthorized User' }, { status: 401 })
    }

    // Determine Base URL
    const origin = req.headers.get('origin') || 'https://reevloofficial.vercel.app'
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || origin

    let sessionConfig: Stripe.Checkout.SessionCreateParams = {
      payment_method_types: ['card'],
      billing_address_collection: 'auto',
      customer_email: user.email,
      line_items: [],
      mode: 'payment',
      success_url: `${baseUrl}/dashboard?success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/dashboard?canceled=true`,
      metadata: {
        user_id: user.id,
        type: type, // 'coin' or 'membership'
      },
    }

    if (type === 'coin') {
      sessionConfig.mode = 'payment'
      
      let unitAmount = 100 // Default $1.00
      let productName = `${amount} Virtual Tokens`

      // Fixed Price Logic
      if (amount === 500) {
         unitAmount = 500 // $5.00
         productName = '500 Virtual Tokens'
      } else if (amount === 1000) {
         unitAmount = 1000 // $10.00
         productName = '1,000 Virtual Tokens'
      } else if (amount === 2000) {
         unitAmount = 2000 // $20.00
         productName = '2,000 Virtual Tokens'
      } else if (amount === 5000) {
         unitAmount = 5000 // $50.00
         productName = '5,000 Virtual Tokens'
      }

      sessionConfig.line_items = [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: productName,
              description: 'Tokens for gifting and boosting',
            },
            unit_amount: unitAmount,
          },
          quantity: 1,
        },
      ]
      
      sessionConfig.metadata!.coins_amount = amount.toString()

    } else if (type === 'membership') {
      sessionConfig.mode = 'subscription'
      
      // Use inline price data for subscription to avoid needing a pre-created Price ID
      sessionConfig.line_items = [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: 'Reevlo Plus Membership',
              description: 'Upload longer videos, zero ads, verification badge, and priority support.',
            },
            unit_amount: 899, // $8.99
            recurring: {
              interval: 'month',
            },
          },
          quantity: 1,
        },
      ]
    }

    const session = await stripe.checkout.sessions.create(sessionConfig)

    return NextResponse.json({ sessionId: session.id, url: session.url })
  } catch (err: any) {
    console.error('Stripe Checkout Error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
