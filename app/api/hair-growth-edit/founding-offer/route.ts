import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';
import { FoundingOfferError, getFoundingAvailability } from '@/lib/pricing/growthEditFounding';

export const dynamic = 'force-dynamic';
export async function GET() {
  try {
    const admin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SECRET_KEY!);
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
    const { data: course, error } = await admin.from('courses').select('stripe_price_id')
      .eq('slug', 'hair-growth-edit').eq('is_published', true).maybeSingle();
    if (error || !course?.stripe_price_id) throw new FoundingOfferError('Pricing is temporarily unavailable.');
    const availability = await getFoundingAvailability(admin, stripe, course.stripe_price_id);
    return NextResponse.json(availability, { headers: { 'Cache-Control': 'no-store' } });
  } catch (error) {
    return NextResponse.json({
      error: error instanceof FoundingOfferError ? error.message : 'Pricing is temporarily unavailable.',
    }, { status: error instanceof FoundingOfferError ? error.status : 503, headers: { 'Cache-Control': 'no-store' } });
  }
}
