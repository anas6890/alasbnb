import prisma from "@/lib/prismadb";
import bcrypt from "bcrypt";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const body = await request.json();
  const { email, firstname, lastname, birthdate, password } = body;

  const hashedPassword = await bcrypt.hash(password, 12);

  const user = await prisma.user.create({
    data: {
      email,
      firstname,
      lastname,
      birthdate: new Date(birthdate),
      hashedPassword,
    },
  });

  return NextResponse.json(user);
}
