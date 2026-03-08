import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { stripe } from "@/lib/stripe";
import { createClient } from "@supabase/supabase-js";

// Client Supabase avec la clé service (pas la clé anon)
// pour pouvoir modifier les abonnements sans RLS
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/** Webhook Stripe pour gérer les événements d'abonnement */
export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = headers().get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ erreur: "Signature manquante" }, { status: 400 });
  }

  let event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    console.error("Erreur vérification webhook:", err);
    return NextResponse.json({ erreur: "Signature invalide" }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object;
        const userId = session.metadata?.supabase_user_id;
        const planType = session.metadata?.plan_type;

        if (userId && planType) {
          await supabaseAdmin
            .from("subscriptions")
            .update({
              stripe_subscription_id: session.subscription as string,
              stripe_customer_id: session.customer as string,
              plan_type: planType,
              status: "active",
              current_period_start: new Date().toISOString(),
            })
            .eq("user_id", userId);

          // Enregistrer le paiement
          await supabaseAdmin.from("payments").insert({
            user_id: userId,
            stripe_payment_id: session.payment_intent as string,
            amount: session.amount_total ?? 0,
            currency: session.currency ?? "eur",
            status: "succeeded",
            plan_type: planType,
          });
        }
        break;
      }

      case "customer.subscription.updated": {
        const subscription = event.data.object;
        const customerId = subscription.customer as string;

        // Trouver l'utilisateur par customer_id
        const { data: sub } = await supabaseAdmin
          .from("subscriptions")
          .select("user_id")
          .eq("stripe_customer_id", customerId)
          .single();

        if (sub) {
          await supabaseAdmin
            .from("subscriptions")
            .update({
              status: subscription.status,
              current_period_start: new Date(
                subscription.current_period_start * 1000
              ).toISOString(),
              current_period_end: new Date(
                subscription.current_period_end * 1000
              ).toISOString(),
            })
            .eq("user_id", sub.user_id);
        }
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object;
        const customerId = subscription.customer as string;

        const { data: sub } = await supabaseAdmin
          .from("subscriptions")
          .select("user_id")
          .eq("stripe_customer_id", customerId)
          .single();

        if (sub) {
          await supabaseAdmin
            .from("subscriptions")
            .update({
              status: "canceled",
              plan_type: "starter",
            })
            .eq("user_id", sub.user_id);
        }
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object;
        const customerId = invoice.customer as string;

        const { data: sub } = await supabaseAdmin
          .from("subscriptions")
          .select("user_id")
          .eq("stripe_customer_id", customerId)
          .single();

        if (sub) {
          await supabaseAdmin
            .from("subscriptions")
            .update({ status: "past_due" })
            .eq("user_id", sub.user_id);
        }
        break;
      }
    }
  } catch (error) {
    console.error("Erreur traitement webhook:", error);
    return NextResponse.json(
      { erreur: "Erreur interne" },
      { status: 500 }
    );
  }

  return NextResponse.json({ recu: true });
}
