import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16' as any,
})

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!

export async function POST(req: NextRequest) {
  const body = await req.text()
  const sig = req.headers.get('stripe-signature')!

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret)
  } catch (err: any) {
    console.error(`Webhook signature verification failed: ${err.message}`)
    return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 })
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed':
        const session = event.data.object as Stripe.Checkout.Session
        await handleCheckoutSessionCompleted(session)
        break
        
      case 'customer.subscription.deleted':
        const subscription = event.data.object as Stripe.Subscription
        await handleSubscriptionDeleted(subscription)
        break
    }
  } catch (error: any) {
    console.error('Error handling webhook event:', error)
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 })
  }

  return NextResponse.json({ received: true })
}

async function handleCheckoutSessionCompleted(session: Stripe.Checkout.Session) {
  const userId = session.metadata?.user_id
  const type = session.metadata?.type
  const sessionId = session.id

  if (!userId || !type) {
    console.error('Missing metadata in Stripe session')
    return
  }

  // Idempotency check
  const { data: profile } = await supabaseAdmin
    .from('profiles')
    .select('processed_sessions')
    .eq('id', userId)
    .single()

  if (profile?.processed_sessions?.includes(sessionId)) {
    console.log(`Session ${sessionId} already processed. Skipping.`)
    return
  }

  if (type === 'coin') {
    const coinsAmount = parseInt(session.metadata?.coins_amount || '0', 10)
    
    // UNIFIED SCHEMA LOGIC: Update rewards_balance
    const { error } = await supabaseAdmin.rpc('add_virtual_coins', {
      target_user_id: userId,
      amount: coinsAmount,
      session_id: sessionId
    })
    
    if (error) {
        console.error('RPC add_virtual_coins failed:', error)
        // Fallback: Direct Update
        const { data: balance } = await supabaseAdmin
            .from('rewards_balance')
            .select('virtual_money')
            .eq('user_id', userId)
            .single()
            
        const currentMoney = balance?.virtual_money || 0
        
        await supabaseAdmin.from('rewards_balance').upsert({
            user_id: userId,
            virtual_money: currentMoney + coinsAmount,
            updated_at: new Date().toISOString()
        })
        
        // Mark session processed
        await supabaseAdmin.from('profiles').update({
            processed_sessions: [...(profile?.processed_sessions || []), sessionId]
        }).eq('id', userId)
    }

  } else if (type === 'membership') {
    // UNIFIED SCHEMA LOGIC: Update profiles.is_premium
    const { error } = await supabaseAdmin.rpc('activate_premium_membership', {
        target_user_id: userId,
        session_id: sessionId
    })

    if (error) {
         console.error('RPC activate_premium_membership failed:', error)
         // Fallback
         await supabaseAdmin.from('profiles').update({
             is_premium: true,
             premium_since: new Date().toISOString(),
             processed_sessions: [...(profile?.processed_sessions || []), sessionId]
         }).eq('id', userId)
    }
  }
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
    const userId = subscription.metadata?.user_id
    if (userId) {
        await supabaseAdmin
            .from('profiles')
            .update({ is_premium: false })
            .eq('id', userId)
    }
}
