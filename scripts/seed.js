const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcrypt");

const prisma = new PrismaClient();

const CITIES = [
  { city: "Paris", country: "France", lat: 48.8566, lng: 2.3522 },
  { city: "Londres", country: "Royaume-Uni", lat: 51.5074, lng: -0.1278 },
  { city: "New York", country: "États-Unis", lat: 40.7128, lng: -74.0060 },
  { city: "Tokyo", country: "Japon", lat: 35.6762, lng: 139.6503 },
  { city: "Madrid", country: "Espagne", lat: 40.4168, lng: -3.7038 },
  { city: "Rome", country: "Italie", lat: 41.9028, lng: 12.4964 },
  { city: "Bali", country: "Indonésie", lat: -8.4095, lng: 115.1889 },
  { city: "Sydney", country: "Australie", lat: -33.8688, lng: 151.2093 },
  { city: "Le Cap", country: "Afrique du Sud", lat: -33.9249, lng: 18.4241 },
  { city: "Rio de Janeiro", country: "Brésil", lat: -22.9068, lng: -43.1729 },
  { city: "Barcelone", country: "Espagne", lat: 41.3851, lng: 2.1734 },
  { city: "Lisbonne", country: "Portugal", lat: 38.7223, lng: -9.1393 },
  { city: "Amsterdam", country: "Pays-Bas", lat: 52.3676, lng: 4.9041 },
  { city: "Dubaï", country: "Émirats arabes unis", lat: 25.2048, lng: 55.2708 },
  { city: "Kyoto", country: "Japon", lat: 35.0116, lng: 135.7681 }
];

const IMAGES = [
  "https://images.unsplash.com/photo-1566836139788-37fc67e20246?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1554995207-c18210cc2328?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1568605114967-8ac60ecded8b?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1560165897-fc0cad00d5de?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1585128798051-2d45c6c6e7ce?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1539932017732-a3a33e079e12?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1494145904049-552f1f8ce5f5?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1478221143597-40f3a1265fcf?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1566073566663-6fb86d94c161?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1608570657551-8747e7a9c88?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1600210691290-ec4915cda22f?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1522578474514-e3995abf1a73?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1590523277543-a3db3d56e6c7?auto=format&fit=crop&w=1200&q=80",
];

const TYPES = ["apartment", "house", "villa", "cabin", "boat"];
const CANCELLATION_POLICIES = ["FLEXIBLE", "MODERATE", "STRICT", "NON_REFUNDABLE"];
const TITLES = [
  "Magnifique logement avec vue", "Refuge paisible au coeur de la ville", "Superbe villa luxueuse", 
  "Appartement moderne et lumineux", "Studio cosy pour escapade romantique", "Chalet chaleureux en pleine nature",
  "Maison familiale spacieuse", "Penthouse avec terrasse panoramique", "Loft design industriel",
  "Oasis de tranquillité avec piscine"
];
const COMMENTS = [
  "Séjour incroyable, tout était parfait du début à la fin ! Je recommande vivement.",
  "Très bien situé, très propre. L'hôte était très réactif.",
  "Le logement correspondait parfaitement aux photos. Literie très confortable.",
  "Un peu bruyant le soir mais l'emplacement compense largement. Très belle décoration.",
  "Expérience inoubliable, l'un des meilleurs Airbnb que j'ai pu visiter.",
  "Propreté irréprochable et indications d'arrivée très claires. Merci beaucoup !",
  "Superbe vue, l'appartement est très bien équipé pour cuisiner.",
  "Hôte exceptionnel, plein de bonnes recommandations pour les restaurants locaux."
];

function getRandomItem(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function getRandomNumber(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getRandomImages() {
  const numImages = getRandomNumber(3, 6);
  const shuffled = [...IMAGES].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, numImages);
}

async function main() {
  console.log("Starting massive database wipe...");

  // 1. Wipe database
  await prisma.review.deleteMany();
  await prisma.reservation.deleteMany();
  await prisma.listingAvailability.deleteMany();
  await prisma.listing.deleteMany();
  await prisma.experienceSession.deleteMany();
  await prisma.experience.deleteMany();
  await prisma.message.deleteMany();
  await prisma.user.deleteMany();

  console.log("Database wiped successfully.");

  // 2. Create Users (Hosts and Guests)
  const hashedPassword = await bcrypt.hash("password123", 10);
  const users = [];

  console.log("Creating users...");
  for (let i = 0; i < 20; i++) {
    const isHost = i < 8; // First 8 are hosts
    const user = await prisma.user.create({
      data: {
        email: `user${i}@alasbnb.com`,
        firstname: isHost ? `Hôte${i}` : `Guest${i}`,
        lastname: "Test",
        hashedPassword,
        image: `https://ui-avatars.com/api/?name=${isHost ? 'Hote' : 'Guest'}+${i}&background=00B4D8&color=fff`,
        createdAt: new Date(Date.now() - getRandomNumber(100, 1000) * 86400000), // Random join date
      }
    });
    users.push(user);
  }
  const hosts = users.slice(0, 8);
  const guests = users.slice(8);

  console.log("Creating 120 listings...");
  
  // 3. Create 120 Listings
  const createdListings = [];
  for (let i = 0; i < 120; i++) {
    const host = getRandomItem(hosts);
    const cityData = getRandomItem(CITIES);
    const images = getRandomImages();
    
    // Create Listing
    const listing = await prisma.listing.create({
      data: {
        title: `${getRandomItem(TITLES)} à ${cityData.city}`,
        description: "Un lieu exceptionnel parfait pour vous détendre. Profitez des commodités haut de gamme et de la proximité avec les attractions principales de la région.",
        type: getRandomItem(TYPES),
        pricePerNight: getRandomNumber(50, 600),
        cleaningFee: getRandomNumber(10, 50),
        maxGuests: getRandomNumber(2, 10),
        bedrooms: getRandomNumber(1, 5),
        beds: getRandomNumber(1, 6),
        bathrooms: getRandomNumber(1, 3),
        images: images,
        amenities: ["Wifi", "Cuisine", "Climatisation", "Télévision", getRandomNumber(1, 10) > 5 ? "Piscine" : "Balcon"],
        location: {
          city: cityData.city,
          country: cityData.country,
          lat: cityData.lat + (Math.random() - 0.5) * 0.05, // Slight randomization of coordinates
          lng: cityData.lng + (Math.random() - 0.5) * 0.05,
        },
        cancellationPolicy: getRandomItem(CANCELLATION_POLICIES),
        status: "PUBLISHED",
        hostId: host.id,
      }
    });
    createdListings.push(listing);
  }

  console.log("Creating reservations and dynamic reviews...");

  // 4. Create Reservations and Reviews to populate dynamic ratings
  for (const listing of createdListings) {
    const numReviews = getRandomNumber(2, 12); // Each listing gets 2 to 12 reviews
    let sumClean = 0, sumAcc = 0, sumCheck = 0, sumComm = 0, sumLoc = 0, sumVal = 0, sumAvg = 0;

    for (let j = 0; j < numReviews; j++) {
      const guest = getRandomItem(guests);
      
      // Create a dummy reservation for the review
      const reservation = await prisma.reservation.create({
        data: {
          type: "LISTING",
          userId: guest.id,
          listingId: listing.id,
          totalPrice: listing.pricePerNight * 2,
          status: "COMPLETED",
          checkIn: new Date(Date.now() - getRandomNumber(30, 200) * 86400000),
          checkOut: new Date(Date.now() - getRandomNumber(10, 28) * 86400000),
        }
      });

      // Generate random high ratings (Airbnb usually skews high, between 4 and 5)
      const rClean = getRandomNumber(4, 5);
      const rAcc = getRandomNumber(4, 5);
      const rCheck = getRandomNumber(4, 5);
      const rComm = getRandomNumber(4, 5);
      const rLoc = getRandomNumber(4, 5);
      const rVal = getRandomNumber(3, 5);
      const avg = (rClean + rAcc + rCheck + rComm + rLoc + rVal) / 6;

      sumClean += rClean; sumAcc += rAcc; sumCheck += rCheck; 
      sumComm += rComm; sumLoc += rLoc; sumVal += rVal; sumAvg += avg;

      await prisma.review.create({
        data: {
          authorId: guest.id,
          reservationId: reservation.id,
          listingId: listing.id,
          ratingCleanliness: rClean,
          ratingAccuracy: rAcc,
          ratingCheckin: rCheck,
          ratingCommunication: rComm,
          ratingLocation: rLoc,
          ratingValue: rVal,
          avgRating: avg,
          comment: getRandomItem(COMMENTS),
          createdAt: new Date(Date.now() - getRandomNumber(1, 100) * 86400000)
        }
      });
    }

    // Update the listing with the recalculated averages!
    await prisma.listing.update({
      where: { id: listing.id },
      data: {
        totalReviews: numReviews,
        avgRating: sumAvg / numReviews,
        avgRatingCleanliness: sumClean / numReviews,
        avgRatingAccuracy: sumAcc / numReviews,
        avgRatingCheckin: sumCheck / numReviews,
        avgRatingCommunication: sumComm / numReviews,
        avgRatingLocation: sumLoc / numReviews,
        avgRatingValue: sumVal / numReviews,
      }
    });
  }

  console.log("Seeding complete! 120 listings created with dynamic reviews.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
