import { headers } from 'next/headers'
import { NextResponse } from 'next/server'
import { stripe } from '../../../lib/stripe'
import { supabaseAdmin } from '../../../lib/supabase-admin'
import Stripe from 'stripe'

export async function POST(req: Request) {
  const body = await req.text()
  const headersList = await headers()
  const signature = headersList.get('Stripe-Signature') as string

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (err: any) {
    console.error(`Webhook signature verification failed: ${err.message}`)
    return NextResponse.json({ error: err.message }, { status: 400 })
  }

  const session = event.data.object as Stripe.Checkout.Session

  if (event.type === 'checkout.session.completed') {
    // Fulfill the purchase...
    const userId = session.metadata?.user_id
    const type = session.metadata?.type // 'coin' or 'membership'
    const amount = session.metadata?.amount ? parseInt(session.metadata.amount) : 0

    if (userId) {
      if (type === 'coin') {
        // Increment coins
        // We use an RPC call or direct update if we know the current balance.
        // Safer to use RPC 'increment_coins' if it exists, or just get -> update.
        // For simplicity here, we'll get -> update. Concurrency might be an issue in high volume but ok for MVP.
        
        const { data: profile } = await supabaseAdmin
          .from('profiles')
          .select('coins')
          .eq('id', userId)
          .single()

        const currentCoins = profile?.coins || 0
        const newBalance = currentCoins + amount

        await supabaseAdmin
          .from('profiles')
          .update({ coins: newBalance })
          .eq('id', userId)
        
        console.log(`Added ${amount} coins to user ${userId}`)
      } else if (type === 'membership') {
        // Enable pro mode
        await supabaseAdmin
          .from('profiles')
          .update({ is_pro: true })
          .eq('id', userId)
        
        console.log(`Enabled Pro for user ${userId}`)
      }
    }
  }

  return NextResponse.json({ received: true })
}
