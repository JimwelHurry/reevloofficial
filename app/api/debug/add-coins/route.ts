import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey)

export async function POST(req: Request) {
  try {
    const { userId, amount } = await req.json()

    if (!userId || !amount) {
      return NextResponse.json({ error: 'Missing userId or amount' }, { status: 400 })
    }

    console.log(`[Debug] Adding ${amount} coins to user ${userId}`)

    // Get current coins first
    const { data: profile, error: fetchError } = await supabaseAdmin
      .from('profiles')
      .select('coins')
      .eq('id', userId)
      .single()

    if (fetchError) {
      console.error('[Debug] Error fetching profile:', fetchError)
      return NextResponse.json({ error: fetchError.message }, { status: 500 })
    }

    const currentCoins = profile?.coins || 0
    const newBalance = currentCoins + amount

    // Update coins
    const { error: updateError } = await supabaseAdmin
      .from('profiles')
      .update({ coins: newBalance })
      .eq('id', userId)

    if (updateError) {
      console.error('[Debug] Error updating coins:', updateError)
      return NextResponse.json({ error: updateError.message }, { status: 500 })
    }

    console.log(`[Debug] Success. New balance: ${newBalance}`)
    return NextResponse.json({ success: true, newBalance })
  } catch (error: any) {
    console.error('[Debug] Server error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
