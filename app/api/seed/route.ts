import { NextResponse } from "next/server";
import bcrypt from "bcrypt";
import prisma from "@/lib/prismadb";

export async function GET() {
  try {
    // 1. Clean up existing data (optional, but safer for a "clean" seed)
    // Be careful with this in production!
    /*
    await prisma.reservation.deleteMany();
    await prisma.review.deleteMany();
    await prisma.listingAvailability.deleteMany();
    await prisma.listing.deleteMany();
    await prisma.experience.deleteMany();
    await prisma.user.deleteMany();
    */

    // 2. Create a Test User (Host)
    const hashedPassword = await bcrypt.hash("password123", 12);
    const testUser = await prisma.user.upsert({
      where: { email: "test@alasbnb.com" },
      update: {},
      create: {
        email: "test@alasbnb.com",
        firstname: "Jean",
        lastname: "Host",
        hashedPassword,
        image: "https://ui-avatars.com/api/?name=Jean+Host&background=00B4D8&color=fff",
      },
    });

    // 3. Create Sample Listings
    const listingsData = [
      {
        title: "Villa de Luxe avec Piscine",
        description: "Une magnifique villa située sur les hauteurs, offrant une vue imprenable et tout le confort moderne.",
        type: "villa",
        pricePerNight: 250,
        maxGuests: 6,
        bedrooms: 3,
        beds: 4,
        bathrooms: 2,
        images: ["https://images.unsplash.com/photo-1566073566663-6fb86d94c161?auto=format&fit=crop&w=800&q=80"],
        amenities: ["Piscine", "Wifi", "Cuisine", "Stationnement gratuit sur place"],
        location: {
          city: "Nice",
          country: "France",
          lat: 43.7102,
          lng: 7.2620,
        },
        status: "PUBLISHED" as any,
      },
      {
        title: "Appartement Design au Coeur de Paris",
        description: "Studio élégant et lumineux, parfait pour un séjour romantique au centre de la ville lumière.",
        type: "apartment",
        pricePerNight: 120,
        maxGuests: 2,
        bedrooms: 1,
        beds: 1,
        bathrooms: 1,
        images: ["https://images.unsplash.com/photo-1554995207-c18210cc2328?auto=format&fit=crop&w=800&q=80"],
        amenities: ["Wifi", "Cuisine", "Lave-linge"],
        location: {
          city: "Paris",
          country: "France",
          lat: 48.8566,
          lng: 2.3522,
        },
        status: "PUBLISHED" as any,
      }
    ];

    for (const listing of listingsData) {
      await prisma.listing.create({
        data: {
          ...listing,
          hostId: testUser.id,
        }
      });
    }

     // 4. Create Sample Experience
     await prisma.experience.create({
       data: {
         title: "Dégustation de Vins et Fromages",
         category: "cuisine",
         description: "Venez découvrir les secrets des meilleurs crus français accompagnés de fromages artisanaux.",
         durationMinutes: 120,
         pricePerPerson: 45,
         maxGroupSize: 10,
         images: ["https://images.unsplash.com/photo-1506768066919-2f5ec3c7618c?auto=format&fit=crop&w=800&q=80"],
         languages: ["Français", "Anglais"],
         location: {
           city: "Bordeaux",
           country: "France",
           lat: 44.8378,
           lng: -0.5792,
         },
         status: "PUBLISHED" as any,
         hostId: testUser.id,
       }
     });

    return NextResponse.json({ 
      message: "Base de données peuplée avec succès !",
      user: testUser.email,
      listingsCount: listingsData.length,
      experiencesCount: 1
    });

  } catch (error: any) {
    console.error("Seeding error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
