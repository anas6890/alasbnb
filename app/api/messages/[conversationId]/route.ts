import { NextResponse } from "next/server";
import prisma from "@/lib/prismadb";
import getCurrentUser from "@/app/actions/getCurrentUser";
import { pusherServer } from "@/lib/pusher";

interface IParams {
  conversationId?: string;
}

export async function GET(
  request: Request,
  { params }: { params: Promise<IParams> }
) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

    const resolvedParams = await params;
    const { conversationId } = resolvedParams;
    if (!conversationId) return NextResponse.json({ error: "ID requis" }, { status: 400 });

    // Marquer les messages reçus comme lus
    await prisma.message.updateMany({
      where: {
        conversationId: conversationId,
        receiverId: currentUser.id,
        isRead: false,
      },
      data: {
        isRead: true,
        readAt: new Date(),
      },
    });

    const messages = await prisma.message.findMany({
      where: { conversationId: conversationId },
      include: {
        sender: true,
        receiver: true,
      },
      orderBy: { createdAt: "asc" },
    });

    return NextResponse.json(messages);
  } catch (error) {
    console.error("MESSAGES_API_ERROR", error);
    return NextResponse.json({ error: "Erreur interne" }, { status: 500 });
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<IParams> }
) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

    const resolvedParams = await params;
    const { conversationId } = resolvedParams;
    if (!conversationId) return NextResponse.json({ error: "ID requis" }, { status: 400 });

    const body = await request.json();
    const { content } = body;

    if (!content) {
      return NextResponse.json({ error: "Contenu requis" }, { status: 400 });
    }

    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId },
    });

    if (!conversation) {
      return NextResponse.json({ error: "Conversation introuvable" }, { status: 404 });
    }

    // Vérifier que l'utilisateur fait partie de la conversation
    if (conversation.guestId !== currentUser.id && conversation.hostId !== currentUser.id) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
    }

    const receiverId =
      conversation.guestId === currentUser.id
        ? conversation.hostId
        : conversation.guestId;

    // Créer le message
    const message = await prisma.message.create({
      data: {
        content,
        senderId: currentUser.id,
        receiverId,
        conversationId,
      },
      include: {
        sender: true,
        receiver: true,
      },
    });

    // Mettre à jour le timestamp de la conversation
    await prisma.conversation.update({
      where: { id: conversation.id },
      data: { updatedAt: new Date() },
    });

    // ── Créer une notification persistante en base ─────────────────────
    const senderName = `${currentUser.firstname} ${currentUser.lastname}`.trim();
    const preview =
      content.length > 60 ? content.substring(0, 57) + "…" : content;

    const notification = await prisma.notification.create({
      data: {
        userId: receiverId,
        type: "MESSAGE_RECEIVED",
        title: `💬 Message de ${senderName}`,
        body: preview,
        link: conversation.hostId === receiverId
          ? `/hosting/messages?selected=${conversationId}`
          : `/messages?selected=${conversationId}`,
      },
    });

    // ── Pusher : temps réel ──────────────────────────────────────────────
    // 1. Nouveau message dans la conversation
    await pusherServer.trigger(`conversation-${conversationId}`, "messages:new", message);

    // 2. Notification enrichie pour le destinataire (badge + toast)
    await pusherServer.trigger(`user-${receiverId}`, "notifications:new", {
      id: notification.id,
      type: "MESSAGE_RECEIVED",
      title: notification.title,
      body: notification.body,
      link: notification.link,
      createdAt: notification.createdAt,
      senderName,
      senderImage: currentUser.image,
      conversationId,
    });

    // Compatibilité avec l'ancien event (badge messages)
    await pusherServer.trigger(`user-${receiverId}`, "messages:unread", { count: 1 });

    return NextResponse.json(message);
  } catch (error) {
    console.error("MESSAGES_API_POST_ERROR", error);
    return NextResponse.json({ error: "Erreur interne" }, { status: 500 });
  }
}