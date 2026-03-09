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
  const { conversation_id, contenu } = body;

  if (!conversation_id || !contenu?.trim()) {
    return NextResponse.json(
      { error: "conversation_id et contenu sont requis" },
      { status: 400 }
    );
  }

  // Verify the user belongs to this conversation
  const { data: conversation } = await supabase
    .from("conversations")
    .select("id, agent_id, visitor_id")
    .eq("id", conversation_id)
    .single();

  if (!conversation) {
    return NextResponse.json(
      { error: "Conversation introuvable" },
      { status: 404 }
    );
  }

  const isAgent = conversation.agent_id === user.id;
  const isVisitor = conversation.visitor_id === user.id;

  if (!isAgent && !isVisitor) {
    return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
  }

  // Insert the message
  const { data: message, error: msgError } = await supabase
    .from("messages")
    .insert({
      conversation_id,
      sender_id: user.id,
      contenu: contenu.trim(),
    })
    .select()
    .single();

  if (msgError) {
    return NextResponse.json(
      { error: "Erreur lors de l'envoi du message" },
      { status: 500 }
    );
  }

  // Update conversation: dernier_message, dernier_message_at, and increment unread for the other party
  const updateData: Record<string, unknown> = {
    dernier_message: contenu.trim(),
    dernier_message_at: new Date().toISOString(),
  };

  // Increment the unread counter for the other party
  if (isAgent) {
    // Agent sent the message, increment visitor's unread count
    updateData.visiteur_non_lu = (conversation as any).visiteur_non_lu
      ? (conversation as any).visiteur_non_lu + 1
      : 1;
  } else {
    // Visitor sent the message, increment agent's unread count
    updateData.agent_non_lu = (conversation as any).agent_non_lu
      ? (conversation as any).agent_non_lu + 1
      : 1;
  }

  // We need to fetch the current unread count first since we only selected id, agent_id, visitor_id
  const { data: currentConv } = await supabase
    .from("conversations")
    .select("agent_non_lu, visiteur_non_lu")
    .eq("id", conversation_id)
    .single();

  if (currentConv) {
    if (isAgent) {
      updateData.visiteur_non_lu = (currentConv.visiteur_non_lu ?? 0) + 1;
    } else {
      updateData.agent_non_lu = (currentConv.agent_non_lu ?? 0) + 1;
    }
  }

  await supabase
    .from("conversations")
    .update(updateData)
    .eq("id", conversation_id);

  return NextResponse.json({ message }, { status: 201 });
}
