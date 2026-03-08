import { NextRequest, NextResponse } from "next/server";
import { stripe, PLANS, type PlanType } from "@/lib/stripe";
import { createClient } from "@/lib/supabase/server";

/** Créer une session de checkout Stripe */
export async function POST(request: NextRequest) {
  try {
    const { plan } = await request.json();
    const supabase = createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ erreur: "Non authentifié" }, { status: 401 });
    }

    if (!plan || !(plan in PLANS)) {
      return NextResponse.json({ erreur: "Plan invalide" }, { status: 400 });
    }

    const planConfig = PLANS[plan as PlanType];

    if (!planConfig.stripe_price_id) {
      return NextResponse.json(
        { erreur: "Plan Enterprise : contactez-nous directement" },
        { status: 400 }
      );
    }

    // Vérifier si le client Stripe existe déjà
    const { data: subscription } = await supabase
      .from("subscriptions")
      .select("stripe_customer_id")
      .eq("user_id", user.id)
      .single();

    let customerId = subscription?.stripe_customer_id;

    // Créer un client Stripe si nécessaire
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        metadata: { supabase_user_id: user.id },
      });
      customerId = customer.id;

      // Sauvegarder l'ID client Stripe
      await supabase
        .from("subscriptions")
        .update({ stripe_customer_id: customerId })
        .eq("user_id", user.id);
    }

    // Créer la session de checkout
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [
        {
          price: planConfig.stripe_price_id,
          quantity: 1,
        },
      ],
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/dashboard?upgrade=success`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/pricing?canceled=true`,
      metadata: {
        supabase_user_id: user.id,
        plan_type: plan,
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("Erreur Stripe checkout:", error);
    return NextResponse.json(
      { erreur: "Erreur lors de la création du paiement" },
      { status: 500 }
    );
  }
}
