import { PrismaClient, ListingStatus, ReservationType, ReservationStatus, CancellationPolicy } from '@prisma/client';

const prisma = new PrismaClient();

const cities = [
  { city: 'Marrakech', country: 'Maroc', lat: 31.6295, lng: -7.9811 },
  { city: 'Casablanca', country: 'Maroc', lat: 33.5731, lng: -7.5898 },
  { city: 'Rabat', country: 'Maroc', lat: 34.0209, lng: -6.8416 },
  { city: 'Tanger', country: 'Maroc', lat: 35.7595, lng: -5.8340 },
  { city: 'Agadir', country: 'Maroc', lat: 30.4278, lng: -9.5981 },
  { city: 'Fès', country: 'Maroc', lat: 34.0331, lng: -5.0003 },
  { city: 'Chefchaouen', country: 'Maroc', lat: 35.1688, lng: -5.2636 },
  { city: 'Essaouira', country: 'Maroc', lat: 31.5125, lng: -9.7700 }
];

const listingImages = [
  'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1493809842364-78817add7ffb?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1502672260266-1c1e5211e4b8?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1539020140153-e479b8c22e70?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1501183638710-841dd1904471?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1449844908441-8829872d2607?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1510798831971-661eb04b3739?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1460317442991-0ec209397118?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&w=1200&q=80',
];

const experienceImages = [
  'https://images.unsplash.com/photo-1541518763669-27fef04b14ea?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1478147427282-58a87a120781?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1513151233558-d860c5398176?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1528605105345-5344ea20e269?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1526405230239-01c34a2e8c20?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=1200&q=80',
];

const profileImages = [
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80',
  'https://images.unsplash.com/photo-1599566150163-29194dcaad36?auto=format&fit=crop&w=200&q=80',
  'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=200&q=80',
  'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80',
  'https://images.unsplash.com/photo-1527980965255-d3b416303d12?auto=format&fit=crop&w=200&q=80',
];

const adjectives = ['Magnifique', 'Superbe', 'Incroyable', 'Charmant', 'Luxueux', 'Authentique', 'Moderne', 'Spacieux', 'Cosy', 'Vue imprenable sur'];
const nouns = ['Appartement', 'Riad', 'Villa', 'Maison', 'Loft', 'Studio', 'Chalet', 'Cabane'];
const expCategories = ['cuisine', 'art', 'sport', 'nature', 'bien-être', 'culture'];
const reviewsContent = [
  'Un séjour inoubliable, je recommande vivement !',
  'Lieu magnifique, très propre et hôte très accueillant.',
  'Exactement comme sur les photos. Très bel emplacement.',
  'L\'expérience était fantastique, nous avons beaucoup appris.',
  'Je reviendrai sans hésiter, tout était parfait de A à Z.',
  'Un peu bruyant mais le logement compense par sa beauté.',
  'Idéal pour des vacances en famille, très spacieux.',
  'Une immersion totale, super guide !',
];

const getRandom = (arr: any[]) => arr[Math.floor(Math.random() * arr.length)];
const getRandomInt = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;
const getRandomImages = (source: string[], count: number) => {
  const shuffled = [...source].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
};

async function main() {
  console.log('Clearing database...');
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

  console.log('Generating 50 Users (Hosts & Guests)...');
  const users = [];
  for (let i = 0; i < 50; i++) {
    const user = await prisma.user.create({
      data: {
        email: `user${i}@alasbnb.com`,
        firstname: `FirstName${i}`,
        lastname: `LastName${i}`,
        isVerified: true,
        image: getRandom(profileImages),
      }
    });
    users.push(user);
  }

  const hosts = users.slice(0, 20); // First 20 are hosts
  const guests = users.slice(20, 50); // Remaining 30 are guests

  console.log('Generating 100 Listings...');
  const listings = [];
  for (let i = 0; i < 100; i++) {
    const cityObj = getRandom(cities);
    const host = getRandom(hosts);
    const listing = await prisma.listing.create({
      data: {
        hostId: host.id,
        status: ListingStatus.PUBLISHED,
        title: `${getRandom(adjectives)} ${getRandom(nouns)} à ${cityObj.city}`,
        description: `Profitez d'un séjour exceptionnel à ${cityObj.city}. Ce logement offre tout le confort nécessaire pour un voyage mémorable.`,
        type: getRandom(['apartment', 'house', 'villa', 'riad', 'loft', 'studio']),
        pricePerNight: getRandomInt(40, 300),
        cleaningFee: getRandomInt(10, 50),
        maxGuests: getRandomInt(2, 8),
        bedrooms: getRandomInt(1, 4),
        beds: getRandomInt(1, 6),
        bathrooms: getRandomInt(1, 3),
        images: getRandomImages(listingImages, getRandomInt(2, 4)),
        amenities: ['Wifi', 'Climatisation', 'Cuisine', 'TV'],
        location: {
          city: cityObj.city,
          country: cityObj.country,
          lat: cityObj.lat + (Math.random() - 0.5) * 0.05, // Slight jitter
          lng: cityObj.lng + (Math.random() - 0.5) * 0.05,
        },
        avgRating: 0,
        totalReviews: 0,
      }
    });
    listings.push(listing);
  }

  console.log('Generating 100 Experiences...');
  const experiences = [];
  for (let i = 0; i < 100; i++) {
    const cityObj = getRandom(cities);
    const host = getRandom(hosts);
    const category = getRandom(expCategories);
    const exp = await prisma.experience.create({
      data: {
        hostId: host.id,
        status: ListingStatus.PUBLISHED,
        title: `Découverte ${category} à ${cityObj.city}`,
        category: category,
        description: `Rejoignez-nous pour une aventure inoubliable de type ${category} en plein coeur de ${cityObj.city}.`,
        durationMinutes: getRandomInt(60, 240),
        pricePerPerson: getRandomInt(20, 100),
        maxGroupSize: getRandomInt(4, 15),
        images: getRandomImages(experienceImages, getRandomInt(1, 3)),
        included: ['Matériel', 'Guide', 'Boisson'],
        languages: ['fr', 'en'],
        location: {
          city: cityObj.city,
          country: cityObj.country,
          lat: cityObj.lat + (Math.random() - 0.5) * 0.05,
          lng: cityObj.lng + (Math.random() - 0.5) * 0.05,
        },
        avgRating: 0,
        totalReviews: 0,
      }
    });
    experiences.push(exp);
  }

  console.log('Generating 100 Experience Sessions...');
  const sessions = [];
  for (let i = 0; i < 100; i++) {
    const exp = getRandom(experiences);
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + getRandomInt(1, 30));
    const session = await prisma.experienceSession.create({
      data: {
        experienceId: exp.id,
        dateTime: futureDate,
        spotsTotal: exp.maxGroupSize,
        spotsLeft: getRandomInt(1, exp.maxGroupSize),
      }
    });
    sessions.push(session);
  }

  console.log('Generating Reservations and Reviews for Listings...');
  for (let i = 0; i < 150; i++) {
    const guest = getRandom(guests);
    const listing = getRandom(listings);
    const host = hosts.find(h => h.id === listing.hostId) || hosts[0];
    const checkIn = new Date();
    checkIn.setDate(checkIn.getDate() - getRandomInt(5, 60)); // Past dates
    const checkOut = new Date(checkIn);
    checkOut.setDate(checkIn.getDate() + getRandomInt(1, 7));

    const reservation = await prisma.reservation.create({
      data: {
        type: ReservationType.LISTING,
        userId: guest.id,
        listingId: listing.id,
        checkIn,
        checkOut,
        nights: 2,
        totalPrice: listing.pricePerNight * 2 + listing.cleaningFee,
        status: ReservationStatus.COMPLETED,
        listingSnapshot: {
          listingId: listing.id,
          title: listing.title,
          type: listing.type,
          city: listing.location.city,
          country: listing.location.country,
          image: listing.images[0],
          lat: listing.location.lat,
          lng: listing.location.lng,
        },
        hostSnapshot: {
          hostId: host.id,
          firstname: host.firstname,
          lastname: host.lastname,
          image: host.image,
        }
      }
    });

    const rating = getRandomInt(4, 5);
    await prisma.review.create({
      data: {
        authorId: guest.id,
        reservationId: reservation.id,
        listingId: listing.id,
        ratingCleanliness: rating,
        ratingAccuracy: rating,
        ratingCheckin: rating,
        ratingCommunication: rating,
        ratingLocation: rating,
        ratingValue: rating,
        avgRating: rating,
        comment: getRandom(reviewsContent)
      }
    });

    // Update listing stats manually since there are no DB triggers in seed
    await prisma.listing.update({
      where: { id: listing.id },
      data: {
        totalReviews: { increment: 1 },
        avgRating: rating // Simplification, not true average but works for seed
      }
    });
  }

  console.log('Generating Reservations and Reviews for Experiences...');
  for (let i = 0; i < 50; i++) {
    const guest = getRandom(guests);
    const session = getRandom(sessions);
    const experience = experiences.find(e => e.id === session.experienceId);
    if (!experience) continue;
    const host = hosts.find(h => h.id === experience.hostId) || hosts[0];

    const reservation = await prisma.reservation.create({
      data: {
        type: ReservationType.EXPERIENCE,
        userId: guest.id,
        sessionId: session.id,
        totalPrice: experience.pricePerPerson,
        status: ReservationStatus.COMPLETED,
        experienceSnapshot: {
          experienceId: experience.id,
          title: experience.title,
          category: experience.category,
          city: experience.location.city,
          country: experience.location.country,
          image: experience.images[0],
        },
        hostSnapshot: {
          hostId: host.id,
          firstname: host.firstname,
          lastname: host.lastname,
          image: host.image,
        }
      }
    });

    const rating = getRandomInt(4, 5);
    await prisma.review.create({
      data: {
        authorId: guest.id,
        reservationId: reservation.id,
        experienceId: experience.id,
        ratingCleanliness: rating,
        ratingAccuracy: rating,
        ratingCheckin: rating,
        ratingCommunication: rating,
        ratingLocation: rating,
        ratingValue: rating,
        avgRating: rating,
        comment: getRandom(reviewsContent)
      }
    });

    await prisma.experience.update({
      where: { id: experience.id },
      data: {
        totalReviews: { increment: 1 },
        avgRating: rating
      }
    });
  }

  console.log('Database seeded successfully with 100 listings and 100 experiences!');
}

main()
  .catch((e) => {
    console.error(e);
    throw e;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
