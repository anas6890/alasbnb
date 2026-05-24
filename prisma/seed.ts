import { PrismaClient, ListingStatus, ReservationType, ReservationStatus, CancellationPolicy } from '@prisma/client';
import bcrypt from 'bcrypt';
import { fakerFR as faker } from '@faker-js/faker';

const prisma = new PrismaClient();

const LOCATIONS = [
  { city: 'Paris', country: 'France', lat: 48.8566, lng: 2.3522, address: 'Centre-ville' },
  { city: 'Lyon', country: 'France', lat: 45.7640, lng: 4.8357, address: 'Presqu\'île' },
  { city: 'Marseille', country: 'France', lat: 43.2965, lng: 5.3698, address: 'Vieux-Port' },
  { city: 'Bordeaux', country: 'France', lat: 44.8378, lng: -0.5792, address: 'Quinconces' },
  { city: 'Nice', country: 'France', lat: 43.7102, lng: 7.2620, address: 'Promenade des Anglais' },
  { city: 'Strasbourg', country: 'France', lat: 48.5734, lng: 7.7521, address: 'Petite France' },
  { city: 'Nantes', country: 'France', lat: 47.2184, lng: -1.5536, address: 'Île de Nantes' },
  { city: 'Lille', country: 'France', lat: 50.6292, lng: 3.0573, address: 'Vieux-Lille' },
  { city: 'Toulouse', country: 'France', lat: 43.6047, lng: 1.4442, address: 'Capitole' },
  { city: 'Montpellier', country: 'France', lat: 43.6119, lng: 3.8772, address: 'Place de la Comédie' }
];

const LISTING_IMAGES = [
  'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&q=80&w=1200',
  'https://images.unsplash.com/photo-1502672260266-1c1c24240f57?auto=format&fit=crop&q=80&w=1200',
  'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&q=80&w=1200',
  'https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&q=80&w=1200',
  'https://images.unsplash.com/photo-1583608205776-bfd35f0d9f83?auto=format&fit=crop&q=80&w=1200'
];

const EXP_IMAGES = [
  'https://images.unsplash.com/photo-1556910103-1c02745a872f?auto=format&fit=crop&q=80&w=1200',
  'https://images.unsplash.com/photo-1514933651103-005eec06c04b?auto=format&fit=crop&q=80&w=1200',
  'https://images.unsplash.com/photo-1522812871321-255d61ea15a9?auto=format&fit=crop&q=80&w=1200',
  'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&q=80&w=1200',
  'https://images.unsplash.com/photo-1528605248644-14dd04022da1?auto=format&fit=crop&q=80&w=1200'
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

  console.log('👥 Création des hôtes...');
  const hosts = [];
  for (let i = 0; i < 10; i++) {
    const host = await prisma.user.create({
      data: {
        email: `host${i + 1}@test.com`,
        firstname: faker.person.firstName(),
        lastname: faker.person.lastName(),
        hashedPassword,
        image: faker.image.avatar(),
      }
    });
    hosts.push(host);
  }

  console.log('👥 Création des voyageurs...');
  const guests = [];
  for (let i = 0; i < 10; i++) {
    const guest = await prisma.user.create({
      data: {
        email: `guest${i + 1}@test.com`,
        firstname: faker.person.firstName(),
        lastname: faker.person.lastName(),
        hashedPassword,
        image: faker.image.avatar(),
      }
    });
    guests.push(guest);
  }

  console.log('🏠 Création des logements et des disponibilités...');
  const listings = [];
  for (let i = 0; i < hosts.length; i++) {
    const host = hosts[i];
    const loc = LOCATIONS[i];
    
    const listing = await prisma.listing.create({
      data: {
        hostId: host.id,
        status: ListingStatus.PUBLISHED,
        title: `Magnifique logement à ${loc.city}`,
        description: faker.lorem.paragraphs(2),
        type: faker.helpers.arrayElement(['apartment', 'house', 'villa', 'cabin']),
        pricePerNight: faker.number.int({ min: 50, max: 500 }),
        cleaningFee: faker.number.int({ min: 10, max: 100 }),
        maxGuests: faker.number.int({ min: 2, max: 8 }),
        bedrooms: faker.number.int({ min: 1, max: 4 }),
        beds: faker.number.int({ min: 1, max: 5 }),
        bathrooms: faker.number.int({ min: 1, max: 3 }),
        images: faker.helpers.arrayElements(LISTING_IMAGES, 3),
        amenities: ['Wifi', 'Kitchen', 'TV', 'Washer'],
        location: loc,
        cancellationPolicy: CancellationPolicy.FLEXIBLE,
      }
    });
    listings.push(listing);

    // Create availabilities for the next 30 days
    const availabilities = [];
    for (let d = 0; d < 30; d++) {
      const date = new Date();
      date.setDate(date.getDate() + d);
      date.setHours(0, 0, 0, 0);
      
      availabilities.push({
        listingId: listing.id,
        date: date,
        isAvailable: true
      });
    }
    await prisma.listingAvailability.createMany({ data: availabilities });
  }

  console.log('🎈 Création des expériences et des sessions...');
  const experiences = [];
  const sessions = [];
  for (let i = 0; i < hosts.length; i++) {
    const host = hosts[i];
    const loc = LOCATIONS[i];
    
    const experience = await prisma.experience.create({
      data: {
        hostId: host.id,
        status: ListingStatus.PUBLISHED,
        title: `Expérience unique à ${loc.city}`,
        category: faker.helpers.arrayElement(['cuisine', 'art', 'sport', 'nature', 'culture']),
        description: faker.lorem.paragraphs(2),
        durationMinutes: faker.number.int({ min: 60, max: 240 }),
        pricePerPerson: faker.number.int({ min: 20, max: 150 }),
        maxGroupSize: faker.number.int({ min: 2, max: 10 }),
        images: faker.helpers.arrayElements(EXP_IMAGES, 3),
        included: ['Matériel', 'Boissons'],
        languages: ['Français', 'Anglais'],
        location: loc,
      }
    });
    experiences.push(experience);

    // Create a few sessions in the future
    for (let s = 1; s <= 5; s++) {
      const sessionDate = new Date();
      sessionDate.setDate(sessionDate.getDate() + (s * 3));
      sessionDate.setHours(14, 0, 0, 0);
      
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

  console.log('📅 Création des réservations et des commentaires...');
  
  for (let i = 0; i < guests.length; i++) {
    const guest = guests[i];
    
    // 1. Réserver un logement dans le passé (pour laisser un avis)
    const pastListing = faker.helpers.arrayElement(listings);
    const checkIn = new Date();
    checkIn.setDate(checkIn.getDate() - 10);
    const checkOut = new Date();
    checkOut.setDate(checkOut.getDate() - 7);
    
    const pastReservation = await prisma.reservation.create({
      data: {
        type: ReservationType.LISTING,
        userId: guest.id,
        listingId: pastListing.id,
        checkIn,
        checkOut,
        nights: 3,
        adults: 2,
        totalPrice: pastListing.pricePerNight * 3 + pastListing.cleaningFee,
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

    // Laisser un commentaire
    const r1 = faker.number.int({ min: 4, max: 5 });
    await prisma.review.create({
      data: {
        authorId: guest.id,
        reservationId: pastReservation.id,
        listingId: pastListing.id,
        ratingCleanliness: r1,
        ratingAccuracy: r1,
        ratingCheckin: r1,
        ratingCommunication: r1,
        ratingLocation: r1,
        ratingValue: r1,
        avgRating: r1,
        comment: faker.lorem.sentences(2),
      }
    });

    // Mettre à jour les stats du listing
    await prisma.listing.update({
      where: { id: pastListing.id },
      data: {
        avgRating: r1,
        totalReviews: { increment: 1 }
      }
    });

    // 2. Réserver une expérience dans le futur
    const futureSession = faker.helpers.arrayElement(sessions);
    const exp = experiences.find(e => e.id === futureSession.experienceId);
    if (exp) {
      await prisma.reservation.create({
        data: {
          type: ReservationType.EXPERIENCE,
          userId: guest.id,
          sessionId: futureSession.id,
          adults: 1,
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
      // Mettre à jour les places restantes
      await prisma.experienceSession.update({
        where: { id: futureSession.id },
        data: { spotsLeft: { decrement: 1 } }
      });
    }
  }

  console.log('✅ Base de données peuplée avec succès !');
  console.log('');
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