import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const body = await request.json();
  const { agent_id, listing_id, message } = body;

  if (!agent_id || !message?.trim()) {
    return NextResponse.json(
      { error: "agent_id et message sont requis" },
      { status: 400 }
    );
  }

  // Check if conversation already exists
  let query = supabase
    .from("conversations")
    .select("id")
    .eq("visitor_id", user.id)
    .eq("agent_id", agent_id);

  if (listing_id) {
    query = query.eq("listing_id", listing_id);
  } else {
    query = query.is("listing_id", null);
  }

  const { data: existing } = await query.maybeSingle();

  let conversationId: string;

  if (existing) {
    // Conversation already exists, use it
    conversationId = existing.id;
  } else {
    // Create new conversation
    const { data: newConv, error: convError } = await supabase
      .from("conversations")
      .insert({
        visitor_id: user.id,
        agent_id,
        listing_id: listing_id || null,
        dernier_message: message.trim(),
        dernier_message_at: new Date().toISOString(),
        agent_non_lu: 1,
        visiteur_non_lu: 0,
      })
      .select("id")
      .single();

    if (convError || !newConv) {
      return NextResponse.json(
        { error: "Erreur lors de la création de la conversation" },
        { status: 500 }
      );
    }

    conversationId = newConv.id;
  }

  // Send the first message
  const { error: msgError } = await supabase.from("messages").insert({
    conversation_id: conversationId,
    sender_id: user.id,
    contenu: message.trim(),
  });

  if (msgError) {
    return NextResponse.json(
      { error: "Erreur lors de l'envoi du message" },
      { status: 500 }
    );
  }

  // If conversation already existed, update dernier_message and increment agent unread
  if (existing) {
    const { data: currentConv } = await supabase
      .from("conversations")
      .select("agent_non_lu")
      .eq("id", conversationId)
      .single();

    await supabase
      .from("conversations")
      .update({
        dernier_message: message.trim(),
        dernier_message_at: new Date().toISOString(),
        agent_non_lu: ((currentConv?.agent_non_lu as number) ?? 0) + 1,
      })
      .eq("id", conversationId);
  }

  return NextResponse.json({ conversation_id: conversationId }, { status: 201 });
}
