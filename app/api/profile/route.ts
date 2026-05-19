import { NextResponse } from "next/server";
import prisma from "@/lib/prismadb";
import getCurrentUser from "@/app/actions/getCurrentUser";

export async function PUT(request: Request) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) return NextResponse.error();

    const body = await request.json();
    const { firstname, lastname, phone, bio, preferredLang, currency, image } = body;

    const updatedUser = await prisma.user.update({
      where: {
        id: currentUser.id,
      },
      data: {
        firstname,
        lastname,
        phone,
        bio,
        preferredLang,
        currency,
        image,
      },
    });

    return NextResponse.json(updatedUser);
  } catch (error) {
    return NextResponse.error();
  }
}
