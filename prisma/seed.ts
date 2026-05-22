import { PrismaClient, ListingStatus, CancellationPolicy, ReservationType, ReservationStatus } from "@prisma/client";
import bcrypt from "bcrypt";
import { addDays, subDays } from "date-fns";

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
  console.log("🌱 Début du nettoyage de la base de données...");

  // Delete all existing data
  await prisma.review.deleteMany();
  await prisma.reservation.deleteMany();
  await prisma.experienceSession.deleteMany();
  await prisma.experience.deleteMany();
  await prisma.listingAvailability.deleteMany();
  await prisma.listing.deleteMany();
  await prisma.account.deleteMany();
  await prisma.user.deleteMany();

  console.log("🧹 Base de données nettoyée.");

  // Create users
  const hashedPassword = await bcrypt.hash("password123", 10);

  const host = await prisma.user.create({
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

  const guest = await prisma.user.create({
    data: {
      email: "guest@alasbnb.com",
      firstname: "Marc",
      lastname: "Voyageur",
      hashedPassword,
      image: "https://images.unsplash.com/photo-1599566150163-29194dcaad36?auto=format&fit=crop&w=200&q=80"
    }
  });

  console.log("👤 Utilisateurs créés.");

  // Create listings for Madrid
  const madridListings = [
    {
      title: "Appartement - Ventas",
      type: "apartment",
      price: 213,
      rating: 4.76,
      images: [images[4], images[3], images[2]]
    },
    {
      title: "Appartement - Salamanque",
      type: "apartment",
      price: 230,
      rating: 4.84,
      images: [images[1], images[5], images[0]]
    },
    {
      title: "Appartement - Tetuán",
      type: "apartment",
      price: 340,
      rating: 4.89,
      images: [images[5], images[2], images[1]]
    },
    {
      title: "Appartement - Latina",
      type: "apartment",
      price: 300,
      rating: 4.80,
      images: [images[3], images[0], images[4]]
    },
    {
      title: "Appartement - Gran Vía",
      type: "apartment",
      price: 247,
      rating: 4.77,
      images: [images[2], images[1], images[5]]
    }
  ];

  for (const listing of madridListings) {
    const createdListing = await prisma.listing.create({
      data: {
        hostId: host.id,
        status: ListingStatus.PUBLISHED,
        title: listing.title,
        description: "Un superbe logement au cœur de Madrid. Idéal pour explorer la ville.",
        type: listing.type,
        pricePerNight: listing.price,
        maxGuests: 4,
        bedrooms: 2,
        beds: 2,
        bathrooms: 1,
        images: listing.images,
        amenities: ["Wifi", "Kitchen", "AC", "TV"],
        location: {
          city: "Madrid",
          country: "ES",
          lat: 40.4168,
          lng: -3.7038
        },
        avgRating: listing.rating,
        totalReviews: Math.floor(Math.random() * 50) + 10
      }
    });

    const reservation = await prisma.reservation.create({
      data: {
        type: ReservationType.LISTING,
        userId: guest.id,
        listingId: createdListing.id,
        totalPrice: createdListing.pricePerNight * 2,
        status: ReservationStatus.COMPLETED
      }
    });

    await prisma.review.create({
      data: {
        authorId: guest.id,
        reservationId: reservation.id,
        listingId: createdListing.id,
        avgRating: listing.rating,
        comment: "Séjour fantastique à Madrid, hôte très accueillant !"
      }
    });
  }

  // Create listings for Marrakech
  const marrakechListings = [
    {
      title: "Villa - Marrakech",
      type: "villa",
      price: 700,
      rating: 5.0,
      images: [images[0], images[2], images[3]]
    },
    {
      title: "Hébergement - Marrakech",
      type: "house",
      price: 678,
      rating: 4.89,
      images: [images[1], images[0], images[4]]
    },
    {
      title: "Appartement - Marrakech",
      type: "apartment",
      price: 97,
      rating: 4.78,
      images: [images[2], images[5], images[1]]
    },
    {
      title: "Appartement - Izdihar",
      type: "apartment",
      price: 71,
      rating: 4.85,
      images: [images[3], images[4], images[2]]
    },
    {
      title: "Villa - Palmeraie",
      type: "villa",
      price: 642,
      rating: 5.0,
      images: [images[4], images[3], images[0]]
    }
  ];

  for (const listing of marrakechListings) {
    const createdListing = await prisma.listing.create({
      data: {
        hostId: host.id,
        status: ListingStatus.PUBLISHED,
        title: listing.title,
        description: "Un magnifique espace à Marrakech. Profitez du soleil et de la culture locale.",
        type: listing.type,
        pricePerNight: listing.price,
        maxGuests: 6,
        bedrooms: 3,
        beds: 3,
        bathrooms: 2,
        images: listing.images,
        amenities: ["Wifi", "Pool", "AC", "TV", "Breakfast"],
        location: {
          city: "Marrakech",
          country: "MA",
          lat: 31.6295,
          lng: -7.9811
        },
        avgRating: listing.rating,
        totalReviews: Math.floor(Math.random() * 100) + 20
      }
    });

    const reservation = await prisma.reservation.create({
      data: {
        type: ReservationType.LISTING,
        userId: guest.id,
        listingId: createdListing.id,
        totalPrice: createdListing.pricePerNight * 2,
        status: ReservationStatus.COMPLETED
      }
    });

    await prisma.review.create({
      data: {
        authorId: guest.id,
        reservationId: reservation.id,
        listingId: createdListing.id,
        avgRating: listing.rating,
        comment: "Endroit magique, parfait pour des vacances en famille."
      }
    });
  }
  
  // Create experiences
  await prisma.experience.create({
    data: {
      hostId: host.id,
      status: ListingStatus.PUBLISHED,
      title: "Cours de cuisine marocaine authentique",
      category: "cuisine",
      description: "Apprenez à cuisiner un tajine avec une famille locale.",
      durationMinutes: 180,
      pricePerPerson: 45,
      maxGroupSize: 10,
      images: [images[5]],
      location: {
        city: "Marrakech",
        country: "MA",
        lat: 31.6295,
        lng: -7.9811
      },
      avgRating: 4.9,
      totalReviews: 120
    }
  });

  console.log("✅ Base de données alimentée avec succès.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
