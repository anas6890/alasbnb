import { NextResponse } from "next/server";
import prisma from "@/lib/prismadb";
import getCurrentUser from "@/app/actions/getCurrentUser";
import { pusherServer } from "@/lib/pusher";

export async function POST(
  request: Request
) {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const body = await request.json();
    const { listingId, experienceId, hostId, guestId, content } = body;

    if ((!listingId && !experienceId) || !content) {
      return NextResponse.json({ error: "Données manquantes" }, { status: 400 });
    }

    // Determine roles
    const targetHostId = hostId || currentUser.id;
    const targetGuestId = guestId || currentUser.id;

    // 1. Find or create conversation
    let conversation = await prisma.conversation.findFirst({
        where: {
            guestId: targetGuestId,
            hostId: targetHostId,
            ...(listingId ? { listingId } : { experienceId })
        }
    });

    if (!conversation) {
        conversation = await prisma.conversation.create({
            data: {
                guestId: targetGuestId,
                hostId: targetHostId,
                ...(listingId ? { listingId } : { experienceId })
            }
        });
    }

    // 2. Create the message
    const message = await prisma.message.create({
      data: {
        content,
        senderId: currentUser.id,
        receiverId: currentUser.id === targetHostId ? targetGuestId : targetHostId,
        conversationId: conversation.id,
      },
      include: {
          sender: true,
      }
    });
    
    // 3. Update conversation timestamp
    await prisma.conversation.update({
        where: { id: conversation.id },
        data: { updatedAt: new Date() }
    });

    // Optionnel: Déclencher Pusher pour l'hôte si connecté
    await pusherServer.trigger(`conversation-${conversation.id}`, "messages:new", message);

    return NextResponse.json(conversation);

  } catch (error) {
    console.error("CONTACT_API_ERROR", error);
    return NextResponse.json({ error: "Erreur interne" }, { status: 500 });
  }
}