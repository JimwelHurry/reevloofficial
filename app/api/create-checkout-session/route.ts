import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import { stripe } from '../../lib/stripe'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

export async function POST(req: Request) {
  try {
    const { price, amount, name, type, mode = 'payment' } = await req.json()
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Get the user from the authorization header or cookie
    // Since this is called from the client, we should verify the session
    const authHeader = req.headers.get('Authorization')
    let user = null

    if (authHeader) {
      const token = authHeader.replace('Bearer ', '')
      const { data: { user: authUser }, error } = await supabase.auth.getUser(token)
      if (!error) user = authUser
    }

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const origin = 'https://reevlo.com'

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: name,
              description: type === 'coin' ? `${amount} Virtual Coins` : 'Reevlo Plus Membership',
            },
            unit_amount: Math.round(price * 100), // Stripe expects cents
            recurring: mode === 'subscription' ? { interval: 'month' } : undefined,
          },
          quantity: 1,
        },
      ],
      mode: mode, // 'payment' for coins, 'subscription' for membership
      success_url: `${origin}/dashboard?success=true`,
      cancel_url: `${origin}/dashboard?canceled=true`,
      metadata: {
        user_id: user.id,
        type, // 'coin' or 'membership'
        amount: amount?.toString(), // Amount of coins
      },
      customer_email: user.email,
    })

    return NextResponse.json({ sessionId: session.id, url: session.url })
  } catch (err: any) {
    console.error('Stripe Checkout Error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
