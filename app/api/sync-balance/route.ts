import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import { stripe } from '../../lib/stripe'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

// Admin client to update user balance
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)

export async function POST(req: Request) {
  try {
    const { userId, email } = await req.json()

    if (!userId || !email) {
      return NextResponse.json({ error: 'Missing userId or email' }, { status: 400 })
    }

    // 1. Fetch recent successful sessions from Stripe for this customer
    // Note: In a real app, we should store stripe_customer_id in profiles.
    // For now, we search by email.
    const sessions = await stripe.checkout.sessions.list({
      limit: 10,
      customer_details: { email: email },
      status: 'complete',
      expand: ['data.line_items'],
    })

    // 2. Fetch user profile to get processed_sessions
    const { data: profile, error: fetchError } = await supabaseAdmin
      .from('profiles')
      .select('coins, processed_sessions')
      .eq('id', userId)
      .single()

    if (fetchError) {
      console.error('Error fetching profile:', fetchError)
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
    }

    const processedSessions = new Set(profile.processed_sessions || [])
    let newCoins = 0
    let sessionsToProcess: string[] = []

    // 3. Iterate and find unprocessed sessions
    for (const session of sessions.data) {
      if (processedSessions.has(session.id)) continue

      // Check metadata
      const type = session.metadata?.type
      const amount = session.metadata?.amount ? parseInt(session.metadata.amount) : 0

      if (type === 'coin' && amount > 0) {
        newCoins += amount
        sessionsToProcess.push(session.id)
      } else if (type === 'membership') {
        // Found a membership purchase that wasn't processed
        sessionsToProcess.push(session.id)
        // We will set is_pro to true
        // Note: We don't toggle it off here, we only enable it if found.
      }
    }

    if (sessionsToProcess.length === 0) {
      return NextResponse.json({ message: 'No new payments found', synced: 0 })
    }

    // 4. Update profile
    const finalBalance = (profile.coins || 0) + newCoins
    const finalProcessed = [...processedSessions, ...sessionsToProcess]

    // Determine if we need to update is_pro
    // We check if any of the NEW sessions are membership type
    const hasNewMembership = sessions.data.some(s => 
      sessionsToProcess.includes(s.id) && s.metadata?.type === 'membership'
    )

    const updatePayload: any = {
      coins: finalBalance,
      processed_sessions: finalProcessed
    }

    if (hasNewMembership) {
      updatePayload.is_pro = true
    }

    const { error: updateError } = await supabaseAdmin
      .from('profiles')
      .update(updatePayload)
      .eq('id', userId)
    
    if (updateError) {
      console.error('Error updating profile:', updateError)
      return NextResponse.json({ error: 'Failed to update balance' }, { status: 500 })
    }

    return NextResponse.json({ 
      success: true, 
      synced: newCoins, 
      membershipUpdated: hasNewMembership,
      newBalance: finalBalance,
      processedCount: sessionsToProcess.length
    })

  } catch (err: any) {
    console.error('Sync Error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
