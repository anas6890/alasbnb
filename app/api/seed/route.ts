import prisma from "@/lib/prismadb";
import { NextResponse } from "next/server";
import bcrypt from "bcrypt";

export async function GET() {
  try {
    // CLEANUP: Delete existing data to avoid inconsistencies
    await prisma.reservation.deleteMany();
    await prisma.review.deleteMany();
    await prisma.listing.deleteMany();
    await prisma.experience.deleteMany();
    await prisma.user.deleteMany();

    // Try to find or create a valid demo user
    let user;
    const demoEmail = "demo-host@alasbnb.com";
    
    try {
      user = await prisma.user.findUnique({
        where: { email: demoEmail }
      });
    } catch (e) {
      console.log("Existing user data mismatch, creating fresh demo user...");
    }

    if (!user) {
      const hashedPassword = await bcrypt.hash("password123", 12);
      // Create a fresh demo user that matches the current schema
      user = await prisma.user.create({
        data: {
          firstname: "Demo",
          lastname: "Host",
          email: demoEmail,
          hashedPassword: hashedPassword,
          birthdate: new Date("1990-01-01"),
        }
      });
    }

    const demoListings = [
      {
        title: "Villa de Luxe avec Piscine à Marrakech",
        description: "Une oasis de paix avec jardin privé, piscine et service de conciergerie.",
        type: "Villa",
        pricePerNight: 350,
        maxGuests: 8,
        bedrooms: 4,
        beds: 6,
        bathrooms: 3,
        images: ["https://images.unsplash.com/photo-1512917774080-9991f1c4c750", "https://images.unsplash.com/photo-1512918766775-d26323f8c7f0"],
        address: "Palmeraie",
        city: "Marrakech",
        country: "Maroc",
        lat: 31.6295,
        lng: -7.9811,
        hostId: user.id,
      },
      {
        title: "Appartement Design - Centre Casablanca",
        description: "Loft moderne avec décoration industrielle et vue sur la mosquée Hassan II.",
        type: "Appartement",
        pricePerNight: 95,
        maxGuests: 2,
        bedrooms: 1,
        beds: 1,
        bathrooms: 1,
        images: ["https://images.unsplash.com/photo-1502672260266-1c1ef2d93688"],
        address: "Gauthier",
        city: "Casablanca",
        country: "Maroc",
        lat: 33.5731,
        lng: -7.5898,
        hostId: user.id,
      },
      {
        title: "Riad Authentique au cœur de la Médina",
        description: "Vivez une expérience royale dans ce riad du 17ème siècle magnifiquement restauré.",
        type: "Riad",
        pricePerNight: 150,
        maxGuests: 4,
        bedrooms: 2,
        beds: 3,
        bathrooms: 2,
        images: ["https://images.unsplash.com/photo-1541123356219-284ebe98ae3b"],
        address: "Talaâ Kebira",
        city: "Fès",
        country: "Maroc",
        lat: 34.0331,
        lng: -5.0003,
        hostId: user.id,
      },
      {
        title: "Chalet Cosy - Station de Ski Ifrane",
        description: "Chalet en bois avec cheminée, idéal pour les vacances d'hiver.",
        type: "Chalet",
        pricePerNight: 180,
        maxGuests: 5,
        bedrooms: 3,
        beds: 4,
        bathrooms: 2,
        images: ["https://images.unsplash.com/photo-1518780664697-55e3ad937233"],
        address: "Michlifen",
        city: "Ifrane",
        country: "Maroc",
        lat: 33.5273,
        lng: -5.1051,
        hostId: user.id,
      },
      {
        title: "Penthouse avec Terrasse Panoramique",
        description: "La plus belle vue de Tanger sur le détroit de Gibraltar.",
        type: "Penthouse",
        pricePerNight: 220,
        maxGuests: 6,
        bedrooms: 3,
        beds: 3,
        bathrooms: 2,
        images: ["https://images.unsplash.com/photo-1512914890251-2f96a9b0bbe2"],
        address: "Malabata",
        city: "Tanger",
        country: "Maroc",
        lat: 35.7595,
        lng: -5.8340,
        hostId: user.id,
      },
      {
        title: "Maison de Pêcheur en Bord de Mer",
        description: "Réveillez-vous au son des vagues dans ce petit coin de paradis.",
        type: "Maison",
        pricePerNight: 70,
        maxGuests: 2,
        bedrooms: 1,
        beds: 1,
        bathrooms: 1,
        images: ["https://images.unsplash.com/photo-1499793983690-e29da59ef1c2"],
        address: "Moulay Bousselham",
        city: "Kénitra",
        country: "Maroc",
        lat: 34.8778,
        lng: -6.2872,
        hostId: user.id,
      },
      {
        title: "Appartement de Luxe - Paris",
        description: "Elégant appartement avec balcon filant et vue sur la Tour Eiffel.",
        type: "Appartement",
        pricePerNight: 450,
        maxGuests: 4,
        bedrooms: 2,
        beds: 2,
        bathrooms: 2,
        images: ["https://images.unsplash.com/photo-1502672260266-1c1ef2d93688"],
        address: "Avenue Montaigne",
        city: "Paris",
        country: "France",
        lat: 48.8566,
        lng: 2.3522,
        hostId: user.id,
      },
      {
        title: "Loft Moderne - New York",
        description: "Grand loft industriel en plein coeur de Soho.",
        type: "Loft",
        pricePerNight: 550,
        maxGuests: 3,
        bedrooms: 1,
        beds: 2,
        bathrooms: 1,
        images: ["https://images.unsplash.com/photo-1536376072261-38c75010e6c9"],
        address: "Soho",
        city: "New York",
        country: "USA",
        lat: 40.7128,
        lng: -74.0060,
        hostId: user.id,
      }
    ];

    for (const listing of demoListings) {
      await prisma.listing.create({ data: listing });
    }

    const demoExperiences = [
      {
        title: "Balade à Dos de Chameau au Coucher du Soleil",
        category: "Aventure",
        description: "Une expérience magique dans le désert avec dîner traditionnel.",
        durationMinutes: 240,
        pricePerPerson: 55,
        maxGroupSize: 12,
        images: ["https://images.unsplash.com/photo-1509233725247-49e657c54213"],
        included: "Transport, Guide, Dîner berbère",
        city: "Merzouga",
        country: "Maroc",
        lat: 31.0992,
        lng: -4.0125,
        hostId: user.id,
      },
      {
        title: "Atelier Poterie Traditionnelle",
        category: "Artisanat",
        description: "Apprenez les secrets des artisans de Safi et repartez avec votre création.",
        durationMinutes: 120,
        pricePerPerson: 30,
        maxGroupSize: 6,
        images: ["https://images.unsplash.com/photo-1565193998248-d56286543ed2"],
        included: "Matériel, Argile, Thé",
        city: "Safi",
        country: "Maroc",
        lat: 32.2994,
        lng: -9.2372,
        hostId: user.id,
      },
      {
        title: "Surf Camp à Taghazout",
        category: "Sport",
        description: "Apprenez à surfer sur les meilleurs spots d'Afrique avec des pros.",
        durationMinutes: 180,
        pricePerPerson: 40,
        maxGroupSize: 8,
        images: ["https://images.unsplash.com/photo-1502680390469-be75c86b636f"],
        included: "Planche, Combinaison, Coaching",
        city: "Agadir",
        country: "Maroc",
        lat: 30.4278,
        lng: -9.5981,
        hostId: user.id,
      }
    ];

    for (const experience of demoExperiences) {
      await prisma.experience.create({ data: experience });
    }

    return NextResponse.json({ message: "Seeded successfully with 8 listings and 3 experiences!" });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
