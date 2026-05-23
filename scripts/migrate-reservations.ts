import { PrismaClient, ReservationStatus } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Migrating PENDING reservations to CONFIRMED...');
  const result = await prisma.reservation.updateMany({
    where: {
      status: ReservationStatus.PENDING,
    },
    data: {
      status: ReservationStatus.CONFIRMED,
    },
  });
  console.log(`Migrated ${result.count} reservations.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
