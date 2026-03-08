import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { createClient } from "@/lib/supabase/server";

/** Ouvrir le portail client Stripe pour gérer l'abonnement */
export async function POST() {
  try {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ erreur: "Non authentifié" }, { status: 401 });
    }

    const { data: subscription } = await supabase
      .from("subscriptions")
      .select("stripe_customer_id")
      .eq("user_id", user.id)
      .single();

    if (!subscription?.stripe_customer_id) {
      return NextResponse.json(
        { erreur: "Aucun abonnement trouvé" },
        { status: 404 }
      );
    }

    const session = await stripe.billingPortal.sessions.create({
      customer: subscription.stripe_customer_id,
      return_url: `${process.env.NEXT_PUBLIC_BASE_URL}/dashboard/profil`,
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("Erreur portail Stripe:", error);
    return NextResponse.json(
      { erreur: "Erreur lors de l'accès au portail" },
      { status: 500 }
    );
  }
}
