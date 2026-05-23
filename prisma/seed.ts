import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import { faker } from "@faker-js/faker";

const prisma = new PrismaClient();

const AVATARS = [
  "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200",
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=200",
  "https://images.unsplash.com/photo-1599566150163-29194dcaad36?auto=format&fit=crop&q=80&w=200",
  "https://images.unsplash.com/photo-1527980965255-d3b416303d12?auto=format&fit=crop&q=80&w=200",
  "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=200",
  "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=200",
  "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=200",
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200",
  "https://images.unsplash.com/photo-1552058544-f2b08422138a?auto=format&fit=crop&q=80&w=200",
  "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200"
];

const LISTING_IMAGES = [
  "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&q=80&w=1200",
  "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&q=80&w=1200",
  "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=1200",
  "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&q=80&w=1200",
  "https://images.unsplash.com/photo-1583608205776-bfd35f0d9f83?auto=format&fit=crop&q=80&w=1200",
  "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&q=80&w=1200",
  "https://images.unsplash.com/photo-1570129477492-45c003edd2be?auto=format&fit=crop&q=80&w=1200",
  "https://images.unsplash.com/photo-1480074568708-e7b720bb3f09?auto=format&fit=crop&q=80&w=1200",
  "https://images.unsplash.com/photo-1510798831971-661eb04b3739?auto=format&fit=crop&q=80&w=1200",
  "https://images.unsplash.com/photo-1582268611958-ebfd161ef9cf?auto=format&fit=crop&q=80&w=1200",
  "https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&q=80&w=1200",
  "https://images.unsplash.com/photo-1502672260266-1c1c24240f57?auto=format&fit=crop&q=80&w=1200",
  "https://images.unsplash.com/photo-1572120360610-d971b9d7767c?auto=format&fit=crop&q=80&w=1200",
  "https://images.unsplash.com/photo-1568605114967-8130f3a36994?auto=format&fit=crop&q=80&w=1200",
  "https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&q=80&w=1200"
];

const EXPERIENCE_IMAGES = [
  "https://images.unsplash.com/photo-1551632811-561732d1e306?auto=format&fit=crop&q=80&w=1200",
  "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&q=80&w=1200",
  "https://images.unsplash.com/photo-1540541338287-41700207dee6?auto=format&fit=crop&q=80&w=1200",
  "https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&q=80&w=1200",
  "https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?auto=format&fit=crop&q=80&w=1200",
  "https://images.unsplash.com/photo-1517436073-3b1b1519fca9?auto=format&fit=crop&q=80&w=1200",
  "https://images.unsplash.com/photo-1522869635100-9f4c5e86aa37?auto=format&fit=crop&q=80&w=1200",
  "https://images.unsplash.com/photo-1504609774616-568bf863c0bb?auto=format&fit=crop&q=80&w=1200",
  "https://images.unsplash.com/photo-1498654896293-37aacf113fd9?auto=format&fit=crop&q=80&w=1200",
  "https://images.unsplash.com/photo-1473496169904-658ba7c44d8a?auto=format&fit=crop&q=80&w=1200"
];

const CITIES = [
  { city: "Paris", country: "France", lat: 48.8566, lng: 2.3522 },
  { city: "New York", country: "United States", lat: 40.7128, lng: -74.0060 },
  { city: "Tokyo", country: "Japan", lat: 35.6762, lng: 139.6503 },
  { city: "London", country: "United Kingdom", lat: 51.5074, lng: -0.1278 },
  { city: "Rome", country: "Italy", lat: 41.9028, lng: 12.4964 },
  { city: "Barcelona", country: "Spain", lat: 41.3851, lng: 2.1734 },
  { city: "Marrakech", country: "Morocco", lat: 31.6295, lng: -7.9811 },
  { city: "Dubai", country: "United Arab Emirates", lat: 25.2048, lng: 55.2708 },
  { city: "Bali", country: "Indonesia", lat: -8.4095, lng: 115.1889 },
  { city: "Sydney", country: "Australia", lat: -33.8688, lng: 151.2093 }
];

const CATEGORIES = ["Sport", "Cuisine", "Art", "Culture", "Nature", "Bien-être"];
const TYPES = ["apartment", "house", "villa", "cabin", "boat", "treehouse"];

function getRandomItem<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function getRandomItems<T>(arr: T[], count: number): T[] {
  const shuffled = arr.sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

async function main() {
  console.log("🔥 Suppression des anciennes données...");
  
  // Wipe in reverse order of relationships
  await prisma.notification.deleteMany();
  await prisma.message.deleteMany();
  await prisma.conversation.deleteMany();
  await prisma.review.deleteMany();
  await prisma.listingAvailability.deleteMany();
  await prisma.reservation.deleteMany();
  await prisma.experienceSession.deleteMany();
  await prisma.experience.deleteMany();
  await prisma.listing.deleteMany();
  await prisma.account.deleteMany();
  await prisma.user.deleteMany();

  console.log("✅ Base de données purgée.");

  const hashedPassword = await bcrypt.hash("password123", 10);
  const users = [];

  console.log("👤 Création de 20 utilisateurs...");
  for (let i = 0; i < 20; i++) {
    const user = await prisma.user.create({
      data: {
        email: faker.internet.email(),
        hashedPassword,
        firstname: faker.person.firstName(),
        lastname: faker.person.lastName(),
        bio: faker.person.bio(),
        image: getRandomItem(AVATARS),
        isVerified: true,
        preferredLang: "fr",
        currency: "EUR",
      },
    });
    users.push(user);
  }
  console.log("✅ Utilisateurs créés.");

  console.log("🏠 Création de 100 logements...");
  const listings = [];
  for (let i = 0; i < 100; i++) {
    const host = getRandomItem(users);
    const location = getRandomItem(CITIES);
    const type = getRandomItem(TYPES);
    
    // Create random offset for lat/lng to spread them around the city
    const latOffset = (Math.random() - 0.5) * 0.1;
    const lngOffset = (Math.random() - 0.5) * 0.1;

    const images = getRandomItems(LISTING_IMAGES, 5);

    const listing = await prisma.listing.create({
      data: {
        hostId: host.id,
        status: "PUBLISHED",
        title: faker.lorem.words({ min: 3, max: 7 }),
        description: faker.lorem.paragraphs(2),
        type,
        pricePerNight: faker.number.int({ min: 40, max: 800 }),
        cleaningFee: faker.number.int({ min: 10, max: 100 }),
        securityDeposit: faker.number.int({ min: 0, max: 300 }),
        maxGuests: faker.number.int({ min: 1, max: 12 }),
        bedrooms: faker.number.int({ min: 1, max: 5 }),
        beds: faker.number.int({ min: 1, max: 8 }),
        bathrooms: faker.number.int({ min: 1, max: 4 }),
        images,
        amenities: getRandomItems(["Wifi", "Pool", "Kitchen", "AC", "TV", "Washer", "Parking", "Gym"], 5),
        location: {
          city: location.city,
          country: location.country,
          lat: location.lat + latOffset,
          lng: location.lng + lngOffset,
          address: faker.location.streetAddress(),
        },
      }
    });
    listings.push(listing);
  }
  console.log("✅ Logements créés.");

  console.log("🏄 Création de 100 expériences...");
  const experiences = [];
  for (let i = 0; i < 100; i++) {
    const host = getRandomItem(users);
    const location = getRandomItem(CITIES);
    const category = getRandomItem(CATEGORIES);
    
    const latOffset = (Math.random() - 0.5) * 0.1;
    const lngOffset = (Math.random() - 0.5) * 0.1;

    const images = getRandomItems(EXPERIENCE_IMAGES, 5);

    const experience = await prisma.experience.create({
      data: {
        hostId: host.id,
        status: "PUBLISHED",
        title: faker.lorem.words({ min: 3, max: 8 }),
        description: faker.lorem.paragraphs(2),
        category,
        durationMinutes: faker.number.int({ min: 60, max: 360 }),
        pricePerPerson: faker.number.int({ min: 15, max: 200 }),
        maxGroupSize: faker.number.int({ min: 2, max: 20 }),
        images,
        included: getRandomItems(["Equipment", "Drinks", "Snacks", "Transport", "Tickets", "Photos"], 3),
        languages: ["fr", "en"],
        location: {
          city: location.city,
          country: location.country,
          lat: location.lat + latOffset,
          lng: location.lng + lngOffset,
          address: faker.location.streetAddress(),
        },
      }
    });
    experiences.push(experience);

    // Create a few sessions for each experience
    for(let s = 0; s < 3; s++) {
        const futureDate = faker.date.future({ years: 0.5 });
        futureDate.setHours(faker.number.int({ min: 8, max: 18 }), 0, 0, 0);
        await prisma.experienceSession.create({
            data: {
                experienceId: experience.id,
                dateTime: futureDate,
                spotsTotal: experience.maxGroupSize,
                spotsLeft: experience.maxGroupSize
            }
        });
    }
  }
  console.log("✅ Expériences et sessions créées.");

  console.log("📅 Création des réservations et des avis...");
  for (let i = 0; i < 200; i++) {
    const isListing = Math.random() > 0.3;
    const guest = getRandomItem(users);
    
    if (isListing) {
      const listing = getRandomItem(listings);
      if (guest.id === listing.hostId) continue;
      
      const checkIn = faker.date.recent({ days: 30 });
      const nights = faker.number.int({ min: 1, max: 7 });
      const checkOut = new Date(checkIn);
      checkOut.setDate(checkOut.getDate() + nights);
      const totalPrice = listing.pricePerNight * nights + listing.cleaningFee;

      const host = users.find(u => u.id === listing.hostId)!;

      const res = await prisma.reservation.create({
        data: {
          userId: guest.id,
          listingId: listing.id,
          type: "LISTING",
          checkIn,
          checkOut,
          nights,
          totalPrice,
          pricePerNight: listing.pricePerNight,
          adults: 2,
          status: Math.random() > 0.1 ? "CONFIRMED" : "CANCELLED",
          listingSnapshot: {
            listingId: listing.id,
            title: listing.title,
            type: listing.type,
            city: listing.location.city,
            country: listing.location.country,
            image: listing.images[0],
            lat: listing.location.lat,
            lng: listing.location.lng
          },
          hostSnapshot: {
            hostId: host.id,
            firstname: host.firstname,
            lastname: host.lastname,
            image: host.image
          }
        }
      });

      // Create Review
      if (res.status === "CONFIRMED" && Math.random() > 0.3) {
        const rating = faker.number.int({ min: 3, max: 5 });
        const review = await prisma.review.create({
            data: {
                authorId: guest.id,
                reservationId: res.id,
                listingId: listing.id,
                avgRating: rating,
                ratingCleanliness: rating,
                ratingAccuracy: rating,
                ratingCheckin: rating,
                ratingCommunication: rating,
                ratingLocation: rating,
                ratingValue: rating,
                comment: faker.lorem.paragraph(),
                createdAt: checkOut
            }
        });
        
        // Update Listing rating
        await prisma.listing.update({
            where: { id: listing.id },
            data: {
                avgRating: (listing.avgRating * listing.totalReviews + rating) / (listing.totalReviews + 1),
                totalReviews: { increment: 1 }
            }
        });
      }
    } else {
        const experience = getRandomItem(experiences);
        if (guest.id === experience.hostId) continue;

        const session = await prisma.experienceSession.findFirst({ where: { experienceId: experience.id } });
        if(!session) continue;
        
        const adults = faker.number.int({ min: 1, max: 4 });
        if (session.spotsLeft < adults) continue;

        const host = users.find(u => u.id === experience.hostId)!;

        const res = await prisma.reservation.create({
            data: {
              userId: guest.id,
              sessionId: session.id,
              type: "EXPERIENCE",
              totalPrice: experience.pricePerPerson * adults,
              pricePerPerson: experience.pricePerPerson,
              adults,
              status: "CONFIRMED",
              experienceSnapshot: {
                experienceId: experience.id,
                title: experience.title,
                category: experience.category,
                city: experience.location.city,
                country: experience.location.country,
                image: experience.images[0]
              },
              hostSnapshot: {
                hostId: host.id,
                firstname: host.firstname,
                lastname: host.lastname,
                image: host.image
              }
            }
        });

        await prisma.experienceSession.update({
            where: { id: session.id },
            data: { spotsLeft: { decrement: adults } }
        });

        if (Math.random() > 0.4) {
            const rating = faker.number.int({ min: 4, max: 5 });
            await prisma.review.create({
                data: {
                    authorId: guest.id,
                    reservationId: res.id,
                    experienceId: experience.id,
                    avgRating: rating,
                    comment: faker.lorem.paragraph(),
                }
            });
            await prisma.experience.update({
                where: { id: experience.id },
                data: {
                    avgRating: (experience.avgRating * experience.totalReviews + rating) / (experience.totalReviews + 1),
                    totalReviews: { increment: 1 }
                }
            });
        }
    }
  }
  console.log("✅ Réservations et avis créés.");

  console.log("🎉 Terminé ! Tout le site a été peuplé.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });