import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Use Service Role for admin operations (deducting balance)
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: NextRequest) {
  try {
    const { amount } = await req.json()
    
    // Validate Auth
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    
    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token)
    
    if (authError || !user) {
         return NextResponse.json({ error: 'Unauthorized User' }, { status: 401 })
    }

    const CONVERSION_RATE = 0.01
    const usdAmount = amount * CONVERSION_RATE

    // Call RPC function to atomic deduct and log
    const { data, error } = await supabaseAdmin.rpc('request_payout', {
      p_user_id: user.id,
      p_amount_coins: amount,
      p_amount_usd: usdAmount,
      p_payment_method: 'stripe'
    })

    if (error) {
      console.error('RPC Error:', error)
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    if (!data.success) {
      return NextResponse.json({ error: data.error }, { status: 400 })
    }

    return NextResponse.json({ success: true, payoutId: data.payout_id })

  } catch (err: any) {
    console.error('Payout Request Error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
