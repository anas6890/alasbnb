import { NextResponse } from "next/server";
import prisma from "@/lib/prismadb";
import getCurrentUser from "@/app/actions/getCurrentUser";

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

    const messages = await prisma.message.findMany({
      where: {
        conversationId: conversationId,
      },
      include: {
        sender: true,
        receiver: true,
      },
      orderBy: {
        createdAt: "asc"
      }
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

      if(!content) {
        return NextResponse.json({ error: "Contenu requis" }, { status: 400 });
      }

      const conversation = await prisma.conversation.findUnique({
        where: { id: conversationId }
      });

      if(!conversation) {
        return NextResponse.json({ error: "Conversation introuvable" }, { status: 404 });
      }

      // Check if user is part of the conversation
      if(conversation.guestId !== currentUser.id && conversation.hostId !== currentUser.id) {
         return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
      }

      const receiverId = conversation.guestId === currentUser.id ? conversation.hostId : conversation.guestId;
  
      const message = await prisma.message.create({
        data: {
          content: content,
          senderId: currentUser.id,
          receiverId: receiverId,
          conversationId: conversationId,
        },
        include: {
          sender: true,
          receiver: true,
        }
      });

      await prisma.conversation.update({
        where: { id: conversation.id },
        data: { updatedAt: new Date() }
      });
  
      return NextResponse.json(message);
  
    } catch (error) {
      console.error("MESSAGES_API_POST_ERROR", error);
      return NextResponse.json({ error: "Erreur interne" }, { status: 500 });
    }
  }