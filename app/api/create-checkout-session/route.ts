import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'

// Using service role key for admin access
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-10-16.acacia', // Ensure this matches your Stripe version
})

export async function POST(req: NextRequest) {
  try {
    const { type, amount, priceId } = await req.json()
    
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

    let sessionConfig: Stripe.Checkout.SessionCreateParams = {
      payment_method_types: ['card'],
      billing_address_collection: 'auto',
      customer_email: user.email,
      line_items: [],
      mode: 'payment',
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/dashboard?success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/dashboard?canceled=true`,
      metadata: {
        user_id: user.id,
        type: type, // 'coin' or 'membership'
      },
    }

    if (type === 'coin') {
      sessionConfig.mode = 'payment'
      sessionConfig.line_items = [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: `${amount} Virtual Tokens`,
              description: 'Tokens for gifting and boosting',
            },
            unit_amount: 100, // Default logic ($1.00) - Overridden below
          },
          quantity: 1,
        },
      ]
      
      // Fixed Price Logic
      if (amount === 500) {
         sessionConfig.line_items[0].price_data!.unit_amount = 500 // $5.00
         sessionConfig.line_items[0].price_data!.product_data!.name = '500 Virtual Tokens'
      } else if (amount === 1000) {
         sessionConfig.line_items[0].price_data!.unit_amount = 1000 // $10.00
         sessionConfig.line_items[0].price_data!.product_data!.name = '1,000 Virtual Tokens'
      } else if (amount === 5000) {
         sessionConfig.line_items[0].price_data!.unit_amount = 5000 // $50.00
         sessionConfig.line_items[0].price_data!.product_data!.name = '5,000 Virtual Tokens'
      }
      
      sessionConfig.metadata!.coins_amount = amount.toString()

    } else if (type === 'membership') {
      sessionConfig.mode = 'subscription'
      sessionConfig.line_items = [
        {
          price: priceId, // Ensure you pass the correct Stripe Price ID
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
