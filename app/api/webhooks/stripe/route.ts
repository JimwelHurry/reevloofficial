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
    console.log('Webhook signature verification success', event.type)
  } catch (err: any) {
    console.error(`Webhook signature verification failed: ${err.message}`)
    return NextResponse.json({ error: err.message }, { status: 400 })
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session
    console.log('✅ Processing checkout.session.completed', session.metadata)
    
    // Fulfill the purchase...
    const userId = session.metadata?.user_id
    const type = session.metadata?.type // 'coin' or 'membership'
    const amount = session.metadata?.amount ? parseInt(session.metadata.amount) : 0

    if (userId) {
      console.log(`Processing for User ID: ${userId}, Type: ${type}, Amount: ${amount}`)
      if (type === 'coin') {
        // Increment coins
        // We use an RPC call or direct update if we know the current balance.
        // Safer to use RPC 'increment_coins' if it exists, or just get -> update.
        // For simplicity here, we'll get -> update. Concurrency might be an issue in high volume but ok for MVP.
        
        const { data: profile, error: fetchError } = await supabaseAdmin
          .from('profiles')
          .select('coins')
          .eq('id', userId)
          .single()

        if (fetchError) {
            console.error('Error fetching profile:', fetchError)
        }

        const currentCoins = profile?.coins || 0
        const newBalance = currentCoins + amount

        const { error: updateError } = await supabaseAdmin
          .from('profiles')
          .update({ coins: newBalance })
          .eq('id', userId)
        
        if (updateError) {
            console.error('Error updating coins:', updateError)
        } else {
            console.log(`Successfully added ${amount} coins to user ${userId}. New balance: ${newBalance}`)
        }
      } else if (type === 'membership') {
        // Enable pro mode
        await supabaseAdmin
          .from('profiles')
          .update({ is_pro: true })
          .eq('id', userId)
        
        console.log(`Enabled Pro for user ${userId}`)
      }
    }
  } else if (event.type === 'customer.subscription.deleted') {
    const subscription = event.data.object as Stripe.Subscription
    const userId = subscription.metadata?.user_id
    
    if (userId) {
      console.log(`Processing subscription deletion for User ID: ${userId}`)
      await supabaseAdmin
        .from('profiles')
        .update({ is_pro: false })
        .eq('id', userId)
      
      console.log(`Disabled Pro for user ${userId}`)
    }
  }

  return NextResponse.json({ received: true })
}
