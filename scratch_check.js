import prisma from "./lib/prismadb.js";

async function check() {
  console.log("Prisma keys:", Object.keys(prisma));
  console.log("Experience model:", (prisma as any).experience);
}

check();
