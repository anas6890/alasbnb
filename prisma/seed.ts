import { PrismaClient, ListingStatus, ReservationType, ReservationStatus, CancellationPolicy } from '@prisma/client';
import bcrypt from 'bcrypt';
import { fakerFR as faker } from '@faker-js/faker';

const prisma = new PrismaClient();

const LISTING_PHOTO_IDS = [
  '1512917774080-9991f1c4c750', '1502672260266-1c1c24240f57', '1600596542815-ffad4c1539a9',
  '1518780664697-55e3ad937233', '1583608205776-bfd35f0d9f83', '1564013799919-ab600027ffc6',
  '1570129477492-45c003edd2be', '1542314831-c6a4d140938a', '1522708323590-d24dbb6b0267',
  '1484154218962-a197022b5858', '1600585154340-be6161a56a0c', '1600607686527-6fb886090705',
  '1512918728653-8b02220f8d1f', '1513694203202-71d7eda62b08', '1512915922686-57711496a7ca',
  '1493809842364-4bfce7dd08d2', '1494526585095-c158ac8169d7', '1449844908441-8829872d2607',
  '1524326555132-ce5343467c69', '1480074468102-84dc591cc2ea', '1410143899120-cf68a8ab96f4'
];

const EXP_PHOTO_IDS = [
  '1556910103-1c02745a872f', '1514933651103-005eec06c04b', '1522812871321-255d61ea15a9',
  '1469854523086-cc02fe5d8800', '1528605248644-14dd04022da1', '1533900298318-6b8da08a523e',
  '1516483638261-f4dafaf00bc2', '1517457373958-b7bdd4587205', '1501504905252-473c47e087f8',
  '1468164016595-6108e4c60c8b', '1516450360452-8700301ced43', '1511632765486-a01c40ac2cba',
  '1452421822248-d4c2b47f0c81', '1470434767159-d3e3810f3c55', '1488190256547-455bfc989679',
  '1526628953301-3e589a6dd3bc', '1461896817220-c2828feafa4d', '1473496169904-6a58cb22204c'
];

const getUniqueImages = (ids: string[], count: number) => {
  const shuffled = faker.helpers.shuffle(ids).slice(0, count);
  // Add a fake param to make URLs distinct in caching if needed, though different combinations give varied looks
  return shuffled.map(id => `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&q=80&w=1200&uid=${faker.string.uuid().slice(0,6)}`);
};

const GLOBAL_LOCATIONS = [
  { city: 'Paris', country: 'France', baseLat: 48.8566, baseLng: 2.3522 },
  { city: 'Nice', country: 'France', baseLat: 43.7032, baseLng: 7.2661 },
  { city: 'Lyon', country: 'France', baseLat: 45.7640, baseLng: 4.8357 },
  { city: 'Londres', country: 'Royaume-Uni', baseLat: 51.5074, baseLng: -0.1278 },
  { city: 'Barcelone', country: 'Espagne', baseLat: 41.3851, baseLng: 2.1734 },
  { city: 'Madrid', country: 'Espagne', baseLat: 40.4168, baseLng: -3.7038 },
  { city: 'Rome', country: 'Italie', baseLat: 41.9028, baseLng: 12.4964 },
  { city: 'Milan', country: 'Italie', baseLat: 45.4642, baseLng: 9.1900 },
  { city: 'New York', country: 'États-Unis', baseLat: 40.7128, baseLng: -74.0060 },
  { city: 'Los Angeles', country: 'États-Unis', baseLat: 34.0522, baseLng: -118.2437 },
  { city: 'Marrakech', country: 'Maroc', baseLat: 31.6295, baseLng: -7.9811 },
  { city: 'Casablanca', country: 'Maroc', baseLat: 33.5731, baseLng: -7.5898 },
  { city: 'Tokyo', country: 'Japon', baseLat: 35.6762, baseLng: 139.6503 },
  { city: 'Kyoto', country: 'Japon', baseLat: 35.0116, baseLng: 135.7681 },
  { city: 'Bali', country: 'Indonésie', baseLat: -8.3405, baseLng: 115.0920 },
  { city: 'Sydney', country: 'Australie', baseLat: -33.8688, baseLng: 151.2093 }
];

const getRandomLocation = () => {
  const loc = faker.helpers.arrayElement(GLOBAL_LOCATIONS);
  return {
    city: loc.city,
    country: loc.country,
    // Add small random offset so pins spread out
    lat: loc.baseLat + faker.number.float({ min: -0.05, max: 0.05 }),
    lng: loc.baseLng + faker.number.float({ min: -0.05, max: 0.05 }),
    address: faker.location.streetAddress()
  };
};

const REAL_REVIEWS_LISTINGS = [
  "Séjour incroyable, le logement était parfait et très propre !",
  "L'hôte était très accueillant, on se sentait comme à la maison. Je recommande fortement.",
  "Emplacement idéal, au cœur de la ville et proche de tout. Parfait pour découvrir les alentours.",
  "Un peu bruyant la nuit avec la rue passante, mais sinon très bien équipé.",
  "Vue magnifique depuis le balcon, nous reviendrons assurément pour nos prochaines vacances.",
  "Rien à redire, tout était absolument conforme aux photos. Très bel espace.",
  "Superbe appartement, la décoration est soignée et le lit très confortable.",
  "Logement exceptionnel ! On a adoré la petite attention à notre arrivée.",
  "L'expérience globale était correcte, rapport qualité-prix honorable.",
  "Propreté impeccable. Les instructions pour l'arrivée autonome étaient super claires."
];

const REAL_REVIEWS_EXPERIENCES = [
  "Une expérience inoubliable ! Le guide était passionné et passionnant.",
  "J'ai adoré chaque minute. C'était très interactif et enrichissant.",
  "Activité très bien organisée. On a appris énormément de choses dans une super ambiance.",
  "Je recommande vivement, parfait à faire en famille ou entre amis !",
  "Un grand merci à notre hôte pour sa patience et son professionnalisme.",
  "Moment magique, l'un des points forts de notre voyage.",
  "Très sympa, même si un peu court à notre goût. Mais on a passé un super moment.",
  "Incontournable pour découvrir la culture locale de manière authentique.",
  "On s'est régalé ! Une super découverte, je le conseille à 100%.",
  "Génial ! L'hôte connaît parfaitement son sujet et sait transmettre sa passion."
];

async function main() {
  console.log('🧹 Nettoyage de la base de données...');
  await prisma.notification.deleteMany();
  await prisma.message.deleteMany();
  await prisma.conversation.deleteMany();
  await prisma.review.deleteMany();
  await prisma.reservation.deleteMany();
  await prisma.experienceSession.deleteMany();
  await prisma.experience.deleteMany();
  await prisma.listingAvailability.deleteMany();
  await prisma.listing.deleteMany();
  await prisma.account.deleteMany();
  await prisma.user.deleteMany();

  const hashedPassword = await bcrypt.hash('password', 12);

  console.log('👥 Création des hôtes (50)...');
  const hosts = [];
  for (let i = 0; i < 50; i++) {
    const host = await prisma.user.create({
      data: {
        email: `host${i + 1}@test.com`,
        firstname: faker.person.firstName(),
        lastname: faker.person.lastName(),
        hashedPassword,
        image: `https://ui-avatars.com/api/?name=${faker.person.firstName()}+${faker.person.lastName()}&background=random`,
        bio: faker.person.bio(),
      }
    });
    hosts.push(host);
  }

  console.log('👥 Création des voyageurs (100)...');
  const guests = [];
  for (let i = 0; i < 100; i++) {
    const guest = await prisma.user.create({
      data: {
        email: `guest${i + 1}@test.com`,
        firstname: faker.person.firstName(),
        lastname: faker.person.lastName(),
        hashedPassword,
        image: `https://ui-avatars.com/api/?name=${faker.person.firstName()}+${faker.person.lastName()}&background=random`,
        bio: faker.person.bio(),
      }
    });
    guests.push(guest);
  }

  console.log('🏠 Création des logements (150) et des disponibilités...');
  const listings = [];
  for (let i = 0; i < 150; i++) {
    const host = faker.helpers.arrayElement(hosts);
    const loc = getRandomLocation();

    const listing = await prisma.listing.create({
      data: {
        hostId: host.id,
        status: ListingStatus.PUBLISHED,
        title: `Magnifique ${faker.helpers.arrayElement(['logement', 'villa', 'appartement', 'maison', 'loft', 'studio'])} à ${loc.city}`,
        description: faker.lorem.paragraphs(3),
        type: faker.helpers.arrayElement(['apartment', 'house', 'villa', 'cabin']),
        pricePerNight: faker.number.int({ min: 50, max: 900 }),
        cleaningFee: faker.number.int({ min: 10, max: 150 }),
        maxGuests: faker.number.int({ min: 2, max: 12 }),
        bedrooms: faker.number.int({ min: 1, max: 6 }),
        beds: faker.number.int({ min: 1, max: 8 }),
        bathrooms: faker.number.int({ min: 1, max: 4 }),
        images: getUniqueImages(LISTING_PHOTO_IDS, faker.number.int({ min: 4, max: 6 })),
        amenities: faker.helpers.arrayElements(['Wifi', 'Kitchen', 'TV', 'Washer', 'Pool', 'Air conditioning', 'Gym', 'Free parking', 'Balcony', 'Heating'], 6),
        location: loc,
        cancellationPolicy: faker.helpers.arrayElement([CancellationPolicy.FLEXIBLE, CancellationPolicy.MODERATE, CancellationPolicy.STRICT]),
        instantBook: faker.datatype.boolean()
      }
    });
    listings.push(listing);

    const availabilities = [];
    for (let d = 0; d < 60; d++) {
      if (Math.random() > 0.3) { // 70% available
        const date = new Date();
        date.setDate(date.getDate() + d);
        date.setHours(0, 0, 0, 0);
        availabilities.push({
          listingId: listing.id,
          date: date,
          isAvailable: true
        });
      }
    }
    if (availabilities.length > 0) {
      await prisma.listingAvailability.createMany({ data: availabilities });
    }
  }

  console.log('🎈 Création des expériences (100) et des sessions...');
  const experiences = [];
  const sessions = [];
  for (let i = 0; i < 100; i++) {
    const host = faker.helpers.arrayElement(hosts);
    const loc = getRandomLocation();

    const experience = await prisma.experience.create({
      data: {
        hostId: host.id,
        status: ListingStatus.PUBLISHED,
        title: `Expérience: ${faker.commerce.productName()} à ${loc.city}`,
        category: faker.helpers.arrayElement(['cuisine', 'art', 'sport', 'nature', 'culture', 'bien-être']),
        description: faker.lorem.paragraphs(2),
        durationMinutes: faker.number.int({ min: 60, max: 360 }),
        pricePerPerson: faker.number.int({ min: 20, max: 250 }),
        maxGroupSize: faker.number.int({ min: 2, max: 15 }),
        images: getUniqueImages(EXP_PHOTO_IDS, faker.number.int({ min: 3, max: 5 })),
        included: faker.helpers.arrayElements(['Matériel', 'Boissons', 'Transport', 'Repas', 'Photos souvenirs', 'Guide professionnel'], 3),
        languages: faker.helpers.arrayElements(['Français', 'Anglais', 'Espagnol', 'Italien', 'Allemand'], 2),
        location: loc,
      }
    });
    experiences.push(experience);

    for (let s = 1; s <= faker.number.int({ min: 5, max: 10 }); s++) {
      const sessionDate = new Date();
      sessionDate.setDate(sessionDate.getDate() + faker.number.int({ min: 1, max: 60 }));
      sessionDate.setHours(faker.number.int({ min: 8, max: 18 }), 0, 0, 0);

      const session = await prisma.experienceSession.create({
        data: {
          experienceId: experience.id,
          dateTime: sessionDate,
          spotsTotal: experience.maxGroupSize,
          spotsLeft: experience.maxGroupSize,
        }
      });
      sessions.push(session);
    }
  }

  console.log('📅 Création des réservations et vraies reviews...');

  for (let i = 0; i < guests.length; i++) {
    const guest = guests[i];
    
    const nbReservationsL = faker.number.int({ min: 1, max: 4 });
    for (let j = 0; j < nbReservationsL; j++) {
      const pastListing = faker.helpers.arrayElement(listings);
      const checkIn = new Date();
      checkIn.setDate(checkIn.getDate() - faker.number.int({ min: 5, max: 120 }));
      const nights = faker.number.int({ min: 2, max: 10 });
      const checkOut = new Date(checkIn);
      checkOut.setDate(checkOut.getDate() + nights);

      const pastReservation = await prisma.reservation.create({
        data: {
          type: ReservationType.LISTING,
          userId: guest.id,
          listingId: pastListing.id,
          checkIn,
          checkOut,
          nights,
          adults: faker.number.int({ min: 1, max: 4 }),
          totalPrice: pastListing.pricePerNight * nights + pastListing.cleaningFee,
          status: ReservationStatus.CONFIRMED,
          listingSnapshot: {
            listingId: pastListing.id,
            title: pastListing.title,
            type: pastListing.type,
            city: pastListing.location.city,
            country: pastListing.location.country,
            image: pastListing.images[0],
            lat: pastListing.location.lat,
            lng: pastListing.location.lng,
          },
          hostSnapshot: {
            hostId: pastListing.hostId,
            firstname: 'Hôte',
            lastname: 'Test',
          }
        }
      });

      if (Math.random() > 0.2) {
        const r1 = faker.number.int({ min: 3, max: 5 });
        const r2 = faker.number.int({ min: 4, max: 5 });
        const avg = (r1 * 5 + r2) / 6;

        await prisma.review.create({
          data: {
            authorId: guest.id,
            reservationId: pastReservation.id,
            listingId: pastListing.id,
            ratingCleanliness: r1,
            ratingAccuracy: r2,
            ratingCheckin: r1,
            ratingCommunication: r2,
            ratingLocation: r1,
            ratingValue: r2,
            avgRating: avg,
            comment: faker.helpers.arrayElement(REAL_REVIEWS_LISTINGS) + " " + faker.lorem.sentence(),
            createdAt: checkOut
          }
        });

        const listingStats = await prisma.review.aggregate({
          where: { listingId: pastListing.id },
          _avg: { avgRating: true },
          _count: { id: true }
        });

        await prisma.listing.update({
          where: { id: pastListing.id },
          data: {
            avgRating: listingStats._avg.avgRating || avg,
            totalReviews: listingStats._count.id
          }
        });
      }
    }

    const nbReservationsE = faker.number.int({ min: 0, max: 3 });
    for (let j = 0; j < nbReservationsE; j++) {
      const futureSession = faker.helpers.arrayElement(sessions);
      if(futureSession.spotsLeft <= 0) continue;

      const exp = experiences.find(e => e.id === futureSession.experienceId);
      if (exp) {
        const past = futureSession.dateTime < new Date();
        const reservation = await prisma.reservation.create({
          data: {
            type: ReservationType.EXPERIENCE,
            userId: guest.id,
            sessionId: futureSession.id,
            adults: faker.number.int({ min: 1, max: Math.min(2, futureSession.spotsLeft) }),
            totalPrice: exp.pricePerPerson,
            status: ReservationStatus.CONFIRMED,
            experienceSnapshot: {
              experienceId: exp.id,
              title: exp.title,
              category: exp.category,
              city: exp.location.city,
              country: exp.location.country,
              image: exp.images[0],
            },
            hostSnapshot: {
              hostId: exp.hostId,
              firstname: 'Hôte',
              lastname: 'Test',
            }
          }
        });
        await prisma.experienceSession.update({
          where: { id: futureSession.id },
          data: { spotsLeft: { decrement: reservation.adults } }
        });

        if (past && Math.random() > 0.2) {
          const r = faker.number.int({ min: 4, max: 5 });
          await prisma.review.create({
            data: {
              authorId: guest.id,
              reservationId: reservation.id,
              experienceId: exp.id,
              avgRating: r,
              comment: faker.helpers.arrayElement(REAL_REVIEWS_EXPERIENCES),
              createdAt: new Date(futureSession.dateTime.getTime() + 86400000)
            }
          });
          const expStats = await prisma.review.aggregate({
            where: { experienceId: exp.id },
            _avg: { avgRating: true },
            _count: { id: true }
          });
          await prisma.experience.update({
            where: { id: exp.id },
            data: {
              avgRating: expStats._avg.avgRating || r,
              totalReviews: expStats._count.id
            }
          });
        }
      }
    }
  }

  console.log('✅ Base de données MongoDB entièrement peuplée !');
  console.log(`- ${hosts.length} Hôtes`);
  console.log(`- ${guests.length} Voyageurs`);
  console.log(`- ${listings.length} Logements (répartis Mondialement, Images uniques)`);
  console.log(`- ${experiences.length} Expériences (Images uniques)`);
  console.log('Comptes de test (Mot de passe: password) :');
  console.log('- Hôte 1 : host1@test.com');
  console.log('- Voyageur 1 : guest1@test.com');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
