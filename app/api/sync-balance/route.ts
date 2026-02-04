import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-10-16.acacia',
})

export async function POST(req: NextRequest) {
  try {
    const { userId } = await req.json() // Pass userId explicitly or get from token
    
    if (!userId) {
        // Try to get from header token if body is empty
        const authHeader = req.headers.get('Authorization')
        if (authHeader) {
            const token = authHeader.replace('Bearer ', '')
            const { data: { user } } = await supabaseAdmin.auth.getUser(token)
            if (user) {
                // proceed with user.id
                return syncForUser(user.id, user.email!)
            }
        }
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    // Retrieve email from DB if only userId provided
    const { data: user } = await supabaseAdmin.auth.admin.getUserById(userId)
    if (!user.user) return NextResponse.json({ error: 'User not found' }, { status: 404 })

    return syncForUser(userId, user.user.email!)

  } catch (error: any) {
    console.error('Sync Error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

async function syncForUser(userId: string, email: string) {
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('processed_sessions')
      .eq('id', userId)
      .single()
      
    const processedSessions = new Set(profile?.processed_sessions || [])

    const sessions = await stripe.checkout.sessions.list({
      limit: 10, 
      customer_details: { email: email }, 
      status: 'complete',
      expand: ['data.line_items']
    })

    let updated = false
    
    for (const session of sessions.data) {
      if (!processedSessions.has(session.id)) {
        console.log(`Found unprocessed session: ${session.id}`)
        const type = session.metadata?.type
        
        if (type === 'coin') {
            const amount = parseInt(session.metadata?.coins_amount || '0', 10)
            await supabaseAdmin.rpc('add_virtual_coins', { target_user_id: userId, amount, session_id: session.id })
            updated = true
        } else if (type === 'membership') {
            await supabaseAdmin.rpc('activate_premium_membership', { target_user_id: userId, session_id: session.id })
            updated = true
        }
      }
    }

    return NextResponse.json({ success: true, updated })
}
