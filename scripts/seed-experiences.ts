import { PrismaClient, ListingStatus } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

const images = [
  "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1510798831971-661eb04b3739?auto=format&fit=crop&w=1200&q=80"
];

async function main() {
  console.log("🌱 Ajout de nouvelles expériences...");

  // Get or create host
  let host = await prisma.user.findFirst({ where: { email: "host@alasbnb.com" } });
  
  if (!host) {
    const hashedPassword = await bcrypt.hash("password123", 10);
    host = await prisma.user.create({
      data: {
        email: "host@alasbnb.com",
        firstname: "Elena",
        lastname: "Host",
        hashedPassword,
        image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80",
        bio: "Superhost passionate about sharing beautiful spaces.",
        isVerified: true
      }
    });
  }

  // Create experiences
  const experiences = [
    {
      title: "Vol en montgolfière au-dessus de la Cappadoce",
      category: "nature",
      description: "Vivez une expérience inoubliable en survolant les cheminées de fées au lever du soleil.",
      durationMinutes: 120,
      pricePerPerson: 150,
      maxGroupSize: 12,
      images: [images[3]],
      location: {
        city: "Göreme",
        country: "TR",
        lat: 38.6431,
        lng: 34.8280
      },
      avgRating: 4.95,
      totalReviews: 320
    },
    {
      title: "Visite guidée secrète de Rome en Vespa",
      category: "culture",
      description: "Découvrez les joyaux cachés de Rome, de nuit, sur une Vespa vintage, comme dans les films.",
      durationMinutes: 180,
      pricePerPerson: 85,
      maxGroupSize: 4,
      images: [images[1]],
      location: {
        city: "Rome",
        country: "IT",
        lat: 41.9028,
        lng: 12.4964
      },
      avgRating: 4.88,
      totalReviews: 89
    },
    {
      title: "Atelier de poterie dans la médina de Fès",
      category: "art",
      description: "Initiez-vous à l'art ancestral de la poterie et de la céramique avec un maître artisan.",
      durationMinutes: 150,
      pricePerPerson: 35,
      maxGroupSize: 6,
      images: [images[2]],
      location: {
        city: "Fès",
        country: "MA",
        lat: 34.0181,
        lng: -5.0078
      },
      avgRating: 4.92,
      totalReviews: 54
    },
    {
      title: "Cours de Surf pour débutants à Biarritz",
      category: "sport",
      description: "Apprenez à surfer sur les célèbres vagues de Biarritz avec un instructeur qualifié.",
      durationMinutes: 120,
      pricePerPerson: 55,
      maxGroupSize: 8,
      images: [images[4]],
      location: {
        city: "Biarritz",
        country: "FR",
        lat: 43.4832,
        lng: -1.5586
      },
      avgRating: 4.75,
      totalReviews: 12
    }
  ];

  for (const exp of experiences) {
    await prisma.experience.create({
      data: {
        hostId: host.id,
        status: ListingStatus.PUBLISHED,
        title: exp.title,
        category: exp.category,
        description: exp.description,
        durationMinutes: exp.durationMinutes,
        pricePerPerson: exp.pricePerPerson,
        maxGroupSize: exp.maxGroupSize,
        images: exp.images,
        location: exp.location,
        avgRating: exp.avgRating,
        totalReviews: exp.totalReviews,
      }
    });
  }

  console.log("✅ Nouvelles expériences ajoutées avec succès.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
