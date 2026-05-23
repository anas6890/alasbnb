import { NextResponse } from "next/server";
import prisma from "@/lib/prismadb";
import getCurrentUser from "@/app/actions/getCurrentUser";

export async function GET() {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) return NextResponse.json({ unread: false });

    const unreadMessage = await prisma.message.findFirst({
      where: {
        receiverId: currentUser.id,
        isRead: false
      }
    });

    return NextResponse.json({ unread: !!unreadMessage });
  } catch (error) {
    console.error("UNREAD_MESSAGES_ERROR", error);
    return NextResponse.json({ unread: false });
  }
}
