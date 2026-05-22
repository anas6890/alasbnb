import { NextResponse } from "next/server";
import prisma from "@/lib/prismadb";
import getCurrentUser from "@/app/actions/getCurrentUser";
import { pusherServer } from "@/lib/pusher";

export async function GET(
  request: Request,
  props: { params: Promise<{ reservationId: string }> }
) {
  try {
    const params = await props.params;
    const { reservationId } = params;
    
    const currentUser = await getCurrentUser();
    if (!currentUser) return NextResponse.error();

    if (!reservationId || typeof reservationId !== "string") {
      throw new Error("Invalid ID");
    }

    const messages = await prisma.message.findMany({
      where: {
        reservationId: reservationId,
      },
      include: {
        sender: true,
      },
      orderBy: {
        createdAt: "asc",
      },
    });

    return NextResponse.json(messages);
  } catch (error: any) {
    return NextResponse.error();
  }
}

export async function POST(
  request: Request,
  props: { params: Promise<{ reservationId: string }> }
) {
  try {
    const params = await props.params;
    const { reservationId } = params;

    const currentUser = await getCurrentUser();
    if (!currentUser) return NextResponse.error();

    if (!reservationId || typeof reservationId !== "string") {
      throw new Error("Invalid ID");
    }

    const body = await request.json();
    const { content, receiverId } = body;

    if (!content || !receiverId) {
      return NextResponse.error();
    }

    const message = await prisma.message.create({
      data: {
        content,
        reservationId,
        senderId: currentUser.id,
        receiverId,
      },
      include: {
        sender: true,
      }
    });

    await pusherServer.trigger(reservationId, "messages:new", message);

    return NextResponse.json(message);
  } catch (error: any) {
    return NextResponse.error();
  }
}
