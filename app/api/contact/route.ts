import { NextResponse } from "next/server";
import prisma from "@/lib/prismadb";
import getCurrentUser from "@/app/actions/getCurrentUser";
import { pusherServer } from "@/lib/pusher";

export async function POST(request: Request) {
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
        ...(listingId ? { listingId } : { experienceId }),
      },
    });

    if (!conversation) {
      conversation = await prisma.conversation.create({
        data: {
          guestId: targetGuestId,
          hostId: targetHostId,
          ...(listingId ? { listingId } : { experienceId }),
        },
      });
    }

    const receiverId =
      currentUser.id === targetHostId ? targetGuestId : targetHostId;

    // 2. Create the message
    const message = await prisma.message.create({
      data: {
        content,
        senderId: currentUser.id,
        receiverId,
        conversationId: conversation.id,
      },
      include: {
        sender: true,
      },
    });

    // 3. Update conversation timestamp
    await prisma.conversation.update({
      where: { id: conversation.id },
      data: { updatedAt: new Date() },
    });

    // 4. Créer une notification persistante pour le destinataire
    const senderName = `${currentUser.firstname} ${currentUser.lastname}`.trim();
    const preview = content.length > 60 ? content.substring(0, 57) + "…" : content;

    const notification = await prisma.notification.create({
      data: {
        userId: receiverId,
        type: "MESSAGE_RECEIVED",
        title: `💬 Message de ${senderName}`,
        body: preview,
        link:
          conversation.hostId === receiverId
            ? `/hosting/messages?selected=${conversation.id}`
            : `/messages?selected=${conversation.id}`,
      },
    });

    // 5. Pusher : nouveau message dans la conversation
    await pusherServer.trigger(
      `conversation-${conversation.id}`,
      "messages:new",
      message
    );

    // 6. Pusher : notification enrichie pour le destinataire
    await pusherServer.trigger(`user-${receiverId}`, "notifications:new", {
      id: notification.id,
      type: "MESSAGE_RECEIVED",
      title: notification.title,
      body: notification.body,
      link: notification.link,
      createdAt: notification.createdAt,
      senderName,
      senderImage: currentUser.image,
      conversationId: conversation.id,
    });

    return NextResponse.json(conversation);
  } catch (error) {
    console.error("CONTACT_API_ERROR", error);
    return NextResponse.json({ error: "Erreur interne" }, { status: 500 });
  }
}