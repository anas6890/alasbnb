import { PrismaClient, ListingStatus, CancellationPolicy, ReservationType, ReservationStatus, NotificationType } from "@prisma/client";
import bcrypt from "bcrypt";
import { addDays, subDays } from "date-fns";

const prisma = new PrismaClient();

const CITIES = ["Paris", "Lyon", "Marseille", "Bordeaux", "Lille", "Nice", "Annecy", "Strasbourg", "Biarritz", "Chamonix"];
const CATEGORIES = ["Iconique", "Piscines", "Campagne", "Design", "Bord de mer", "Artique", "Châteaux", "Luxe", "Cabanes", "Villes"];
const EXP_CATEGORIES = ["Cuisine", "Art et culture", "Nature et plein air", "Sports", "Bien-être", "Vie nocturne"];

const IMAGES = [
  "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688",
  "https://images.unsplash.com/photo-1493809842364-78817add7ffb",
  "https://images.unsplash.com/photo-1505691938895-1758d7feb511",
  "https://images.unsplash.com/photo-1484154218962-a197022b5858",
  "https://images.unsplash.com/photo-1512917774080-9991f1c4c750",
  "https://images.unsplash.com/photo-1613977257363-707ba9348227",
  "https://images.unsplash.com/photo-1600585154340-be6161a56a0c",
  "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267",
  "https://images.unsplash.com/photo-1502672023488-70e25813eb80",
  "https://images.unsplash.com/photo-1510798831971-661eb04b3739",
  "https://images.unsplash.com/photo-1449156059431-787c5bc6173a",
  "https://images.unsplash.com/photo-1494526585095-c41746248156",
  "https://images.unsplash.com/photo-1480074568708-e7b720bb3f09",
  "https://images.unsplash.com/photo-1518780664697-55e3ad937233",
  "https://images.unsplash.com/photo-1513584684374-8bdb74ec9f88"
];

const COMMENTS = [
  "Incroyable séjour ! L'accueil était parfait et le lieu encore plus beau que sur les photos.",
  "Très bien situé, calme et propre. Je reviendrai sans hésiter.",
  "Une expérience unique que je recommande à tout le monde.",
  "Hôte très réactif et arrangeant. Le logement est spacieux et bien équipé.",
  "Un peu bruyant le samedi soir mais sinon parfait.",
  "Décoration magnifique et literie très confortable.",
  "Le guide était passionné et nous a fait découvrir des endroits secrets.",
  "Rapport qualité-prix excellent. Une vraie perle rare !"
];

async function main() {
  console.log("🔥 Réinitialisation Complète et Seed Massive...");

  // Reset
  await prisma.notification.deleteMany();
  await prisma.message.deleteMany();
  await prisma.conversation.deleteMany();
  await prisma.review.deleteMany();
  await prisma.reservation.deleteMany();
  await prisma.experienceSession.deleteMany();
  await prisma.experience.deleteMany();
  await prisma.listingAvailability.deleteMany();
  await prisma.listing.deleteMany();
  await prisma.user.deleteMany();

  const hashedPass = await bcrypt.hash("testtest", 10);

  // 1. Create Users
  const testUser = await prisma.user.create({
    data: {
      email: "test@gmail.com",
      firstname: "Admin",
      lastname: "Test",
      hashedPassword: hashedPass,
      image: "https://i.pravatar.cc/150?u=test",
      isVerified: true,
      bio: "Voyageur fréquent."
    }
  });

  const hosts = [];
  for (let i = 0; i < 15; i++) {
      const h = await prisma.user.create({
          data: {
              email: `user${i}@alasbnb.fr`,
              firstname: ["Marc", "Sophie", "Jean", "Julie", "Thomas", "Lea", "Antoine", "Sarah", "Pierre", "Camille", "Nicolas", "Ines", "Lucas", "Eva", "Maxime"][i],
              lastname: "D.",
              hashedPassword: hashedPass,
              isVerified: true,
              image: `https://i.pravatar.cc/150?u=host${i}`,
              bio: "Hôte Alasbnb."
          }
      });
      hosts.push(h);
  }

  // 2. Listings and Availabilities
  console.log("🏠 Logements et Calendriers...");
  const dbListings = [];
  for (let i = 0; i < 125; i++) {
    const host = hosts[i % hosts.length];
    const city = CITIES[i % CITIES.length];
    const category = CATEGORIES[i % CATEGORIES.length];
    
    const l = await prisma.listing.create({
      data: {
        hostId: host.id,
        title: `${category} à ${city} #${i+1}`,
        description: "Logement exceptionnel.",
        type: category,
        pricePerNight: Math.floor(Math.random() * 400) + 60,
        maxGuests: 4, bedrooms: 2, beds: 2, bathrooms: 1,
        images: [IMAGES[i % IMAGES.length] + "?w=1200", IMAGES[(i+1)%IMAGES.length] + "?w=1200"],
        location: {
            country: "France", city, state: city, lat: 48, lng: 2, zipCode: "75000"
        },
        status: ListingStatus.PUBLISHED,
        amenities: ["Wifi", "Cuisine"]
      }
    });
    dbListings.push(l);

    // Generate 30 days of availability for each listing
    const today = new Date();
    today.setHours(0,0,0,0);
    const availabilities = Array.from({ length: 30 }).map((_, day) => ({
        listingId: l.id,
        date: addDays(today, day),
        isAvailable: true
    }));
    await prisma.listingAvailability.createMany({ data: availabilities });
  }

  // 3. Experiences and Sessions
  console.log("🌟 Expériences et Sessions...");
  const dbExperiences = [];
  for (let i = 0; i < 120; i++) {
    const host = hosts[(i+2) % hosts.length];
    const city = CITIES[i % CITIES.length];
    const category = EXP_CATEGORIES[i % EXP_CATEGORIES.length];
    
    const e = await prisma.experience.create({
        data: {
            hostId: host.id,
            status: ListingStatus.PUBLISHED,
            title: `Activité ${category} - ${city}`,
            category,
            description: "Moment unique.",
            durationMinutes: 120,
            pricePerPerson: 50,
            maxGroupSize: 10,
            images: [IMAGES[(i+5)%IMAGES.length] + "?w=1000"],
            location: { country: "France", city, lat: 48, lng: 2 }
        }
    });
    dbExperiences.push(e);

    // 5 Upcoming sessions
    for(let s=0; s<5; s++) {
        await prisma.experienceSession.create({
            data: {
                experienceId: e.id,
                dateTime: addDays(new Date(), s + 1),
                spotsTotal: 10,
                spotsLeft: 10
            }
        });
    }
  }

  // 4. Notifications for Test User
  console.log("🔔 Notifications...");
  await prisma.notification.createMany({
      data: [
          { userId: testUser.id, type: NotificationType.MESSAGE_RECEIVED, title: "Nouveau message", body: "Vous avez un nouveau message de Sophie.", link: "/messages" },
          { userId: testUser.id, type: NotificationType.BOOKING_CONFIRMED, title: "Voyage confirmé", body: "Votre séjour à Paris est confirmé !", link: "/trips" }
      ]
  });

  // 5. Conversations
  console.log("💬 Discussions...");
  const conv = await prisma.conversation.create({
      data: { guestId: testUser.id, hostId: hosts[0].id, listingId: dbListings[0].id }
  });
  await prisma.message.create({
      data: { senderId: hosts[0].id, receiverId: testUser.id, conversationId: conv.id, content: "Bonjour ! Bienvenue chez moi." }
  });

  console.log("✅ Seed Total Terminé !");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });