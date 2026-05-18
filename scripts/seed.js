const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcrypt");

const prisma = new PrismaClient();

async function main() {
  console.log("Purging existing database collections...");
  await prisma.listingAvailability.deleteMany({});
  await prisma.review.deleteMany({});
  await prisma.reservation.deleteMany({});
  await prisma.experienceSession.deleteMany({});
  await prisma.listing.deleteMany({});
  await prisma.experience.deleteMany({});
  await prisma.user.deleteMany({});

  console.log("Hashing password...");
  const hashedPassword = await bcrypt.hash("password123", 12);

  console.log("Creating users...");
  const hostKrimo = await prisma.user.create({
    data: {
      email: "krimo@test.com",
      firstname: "Krimo",
      lastname: "El Idrissi",
      hashedPassword,
      image: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80",
      bio: "Hôte passionné de design et de voyages, ravi de vous accueillir à Marrakech et à Paris !",
      isVerified: true,
      createdAt: new Date("2024-01-01"),
    },
  });

  const userWouarda = await prisma.user.create({
    data: {
      email: "wouarda@test.com",
      firstname: "Wouarda",
      lastname: "Bennani",
      hashedPassword,
      image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80",
      isVerified: true,
      createdAt: new Date("2022-03-15"),
    },
  });

  const userFrancklin = await prisma.user.create({
    data: {
      email: "francklin@test.com",
      firstname: "Francklin",
      lastname: "Dubois",
      hashedPassword,
      image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80",
      isVerified: true,
      createdAt: new Date("2012-06-20"),
    },
  });

  const userDkl = await prisma.user.create({
    data: {
      email: "dkl@test.com",
      firstname: "Dkl",
      lastname: "Martin",
      hashedPassword,
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80",
      isVerified: true,
      createdAt: new Date("2017-09-10"),
    },
  });

  const userSeverine = await prisma.user.create({
    data: {
      email: "severine@test.com",
      firstname: "Severine",
      lastname: "Perrin",
      hashedPassword,
      image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=150&q=80",
      isVerified: true,
      createdAt: new Date("2019-11-05"),
    },
  });

  const userNabil = await prisma.user.create({
    data: {
      email: "nabil@test.com",
      firstname: "Nabil",
      lastname: "Amrani",
      hashedPassword,
      image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=150&q=80",
      isVerified: true,
      createdAt: new Date("2024-04-12"),
    },
  });

  const userInsaf = await prisma.user.create({
    data: {
      email: "insaf@test.com",
      firstname: "Insaf",
      lastname: "Haddad",
      hashedPassword,
      image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&q=80",
      isVerified: true,
      createdAt: new Date("2025-12-01"),
    },
  });

  console.log("Creating listings...");
  const villaMarrakech = await prisma.listing.create({
    data: {
      hostId: hostKrimo.id,
      status: "PUBLISHED",
      title: "Villa Aurélia / piscine privée / proche du centre",
      description: "Bienvenue dans notre somptueuse villa de haut standing. Située au calme dans un quartier résidentiel sécurisé à seulement 15-20 minutes du centre-ville et de la Médina de Marrakech, la Villa Aurélia offre une intimité totale et sans aucun vis-à-vis.\n\nVous profiterez d'un magnifique jardin arboré, d'une grande piscine privée scintillante, d'une cuisine entièrement équipée, de salons marocains contemporains spacieux, et de chambres d'invités confortables avec literie haut de gamme. Parfait pour des vacances inoubliables en famille ou entre amis. Service de navette et cuisinière à domicile disponible sur demande.",
      type: "Villa",
      pricePerNight: 187,
      maxGuests: 5,
      bedrooms: 2,
      beds: 3,
      bathrooms: 2,
      amenities: [
        "Cuisine",
        "Wifi",
        "Stationnement gratuit sur place",
        "Piscine",
        "Animaux acceptés",
        "Télévision",
        "Lave-linge",
        "Détecteur de fumée"
      ],
      location: {
        address: "Marrakech, Marrakesh-Safi, Maroc",
        city: "Marrakech",
        country: "Maroc",
        lat: 31.6295,
        lng: -7.9811,
      },
      images: [
        "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1000&q=80",
        "https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=1000&q=80",
        "https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&w=1000&q=80",
        "https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1000&q=80"
      ],
      avgRating: 5.0,
      totalReviews: 6,
      avgRatingCleanliness: 5.0,
      avgRatingAccuracy: 5.0,
      avgRatingCheckin: 5.0,
      avgRatingCommunication: 5.0,
      avgRatingLocation: 4.8,
      avgRatingValue: 5.0,
    },
  });

  const penthouseParis = await prisma.listing.create({
    data: {
      hostId: hostKrimo.id,
      status: "PUBLISHED",
      title: "Penthouse de prestige avec terrasse face à la Tour Eiffel",
      description: "Situé au dernier étage d'un immeuble haussmannien de grand standing, ce penthouse de luxe offre une vue panoramique époustouflante et directe sur la Tour Eiffel.\n\nEntièrement rénové par un architecte de renom, il dispose d'un salon baigné de lumière ouvrant sur un balcon filant, d'une salle à manger majestueuse, d'une suite parentale avec dressing, de deux autres grandes chambres et d'une cuisine en marbre ultramoderne. L'emplacement parfait pour vivre l'élégance parisienne.",
      type: "Appartement",
      pricePerNight: 340,
      maxGuests: 6,
      bedrooms: 3,
      beds: 4,
      bathrooms: 2,
      amenities: [
        "Cuisine",
        "Wifi",
        "Télévision",
        "Lave-linge",
        "Détecteur de fumée",
        "Caméras de surveillance extérieures présentes sur place"
      ],
      location: {
        address: "14 Avenue de la Bourdonnais, Paris, France",
        city: "Paris",
        country: "France",
        lat: 48.8584,
        lng: 2.2945,
      },
      images: [
        "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1000&q=80",
        "https://images.unsplash.com/photo-1505693395321-883724634266?auto=format&fit=crop&w=1000&q=80",
        "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1000&q=80",
        "https://images.unsplash.com/photo-1502005229762-fc1b2b812ca5?auto=format&fit=crop&w=1000&q=80"
      ],
      avgRating: 4.8,
      totalReviews: 2,
      avgRatingCleanliness: 5.0,
      avgRatingAccuracy: 4.8,
      avgRatingCheckin: 4.9,
      avgRatingCommunication: 5.0,
      avgRatingLocation: 5.0,
      avgRatingValue: 4.6,
    },
  });

  const chaletChamonix = await prisma.listing.create({
    data: {
      hostId: hostKrimo.id,
      status: "PUBLISHED",
      title: "Chalet d'exception au pied des pistes face au Mont-Blanc",
      description: "Authentique chalet savoyard alliant charme rustique et équipements modernes haut de gamme. Situé au pied des pistes de ski de Chamonix-Mont-Blanc, il offre une vue imprenable sur la chaîne montagneuse.\n\nComprend 4 chambres spacieuses, un grand séjour cathédrale chaleureux avec une magnifique cheminée en pierre centrale, un spa privé avec sauna extérieur chaud, et une cuisine ouverte conviviale. Parfait pour les passionnés de glisse et de nature.",
      type: "Chalet",
      pricePerNight: 220,
      maxGuests: 8,
      bedrooms: 4,
      beds: 6,
      bathrooms: 3,
      amenities: [
        "Cuisine",
        "Wifi",
        "Stationnement gratuit sur place",
        "Télévision",
        "Détecteur de fumée",
        "Détecteur de monoxyde de carbone"
      ],
      location: {
        address: "Route du Plampra, Chamonix-Mont-Blanc, France",
        city: "Chamonix",
        country: "France",
        lat: 45.9227,
        lng: 6.8685,
      },
      images: [
        "https://images.unsplash.com/photo-1518019349781-d5af2d536b5b?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1542718610-a1d656d1884c?auto=format&fit=crop&w=1000&q=80",
        "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1000&q=80",
        "https://images.unsplash.com/photo-1510798831971-661eb04b3739?auto=format&fit=crop&w=1000&q=80",
        "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1000&q=80"
      ],
      avgRating: 0,
      totalReviews: 0,
    },
  });

  console.log("Creating experiences...");
  const expQuad = await prisma.experience.create({
    data: {
      hostId: hostKrimo.id,
      status: "PUBLISHED",
      title: "Aventure intense en Quad et Thé sous la tente dans le désert d'Agafay",
      category: "nature",
      description: "Rejoignez-nous pour une aventure exceptionnelle à travers les dunes de pierre et les oasis cachées du désert d'Agafay. Après un briefing de sécurité et une prise en main guidée des quads, nous partirons pour une randonnée exaltante.\n\nÀ mi-parcours, nous ferons une pause traditionnelle pour déguster un thé à la menthe marocain sous une tente berbère face aux montagnes enneigées de l'Atlas. Le retour se fera au coucher du soleil pour des opportunités de photos incomparables !",
      durationMinutes: 180,
      pricePerPerson: 60,
      maxGroupSize: 10,
      included: ["Équipement de sécurité complet", "Quad homologué", "Thé à la menthe & biscuits marocains", "Guide certifié"],
      languages: ["Français", "Anglais", "Arabe"],
      location: {
        address: "Désert d'Agafay, Marrakech, Maroc",
        city: "Marrakech",
        country: "Maroc",
        lat: 31.4552,
        lng: -8.2045,
      },
      images: [
        "https://images.unsplash.com/photo-1509316975850-ff9c5edd0cd9?auto=format&fit=crop&w=1000&q=80",
        "https://images.unsplash.com/photo-1539650116574-8efeb43e2750?auto=format&fit=crop&w=1000&q=80",
        "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1000&q=80"
      ],
      avgRating: 4.9,
      totalReviews: 1,
    },
  });

  const expCooking = await prisma.experience.create({
    data: {
      hostId: hostKrimo.id,
      status: "PUBLISHED",
      title: "Cours de Tajine ancestral & Pain traditionnel dans un Riad secret",
      category: "cuisine",
      description: "Entrez dans les coulisses de la gastronomie marocaine ! Notre chef vous accueille dans la cuisine à ciel ouvert d'un superbe Riad traditionnel de la Médina.\n\nNous commencerons par visiter le souk local pour acheter nos épices fraîches et nos légumes. De retour au Riad, vous apprendrez à assembler et mijoter un véritable tajine d'agneau aux pruneaux ou un tajine de poulet au citron confit, ainsi qu'à façonner et cuire le pain Tafarnout. À la fin, nous dégusterons le repas tous ensemble autour de la piscine du Riad.",
      durationMinutes: 120,
      pricePerPerson: 45,
      maxGroupSize: 6,
      included: ["Ingrédients complets & épices", "Thé de bienvenue", "Repas complet préparé par vos soins", "Fiches recettes numériques"],
      languages: ["Français", "Anglais"],
      location: {
        address: "Riad Dar Zellige, Médina, Marrakech, Maroc",
        city: "Marrakech",
        country: "Maroc",
        lat: 31.6341,
        lng: -7.9892,
      },
      images: [
        "https://images.unsplash.com/photo-1505253716362-afaea1d3d1af?auto=format&fit=crop&w=1000&q=80",
        "https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?auto=format&fit=crop&w=1000&q=80",
        "https://images.unsplash.com/photo-1506084868230-bb9d95c24759?auto=format&fit=crop&w=1000&q=80"
      ],
      avgRating: 0,
      totalReviews: 0,
    },
  });

  const sessionQuad = await prisma.experienceSession.create({
    data: {
      experienceId: expQuad.id,
      dateTime: new Date(new Date().setDate(new Date().getDate() + 3)),
      spotsTotal: 10,
      spotsLeft: 8,
    },
  });

  console.log("Creating reservations...");
  const resWouarda = await prisma.reservation.create({
    data: {
      user: { connect: { id: userWouarda.id } },
      listing: { connect: { id: villaMarrakech.id } },
      checkIn: new Date(new Date().setDate(new Date().getDate() - 10)),
      checkOut: new Date(new Date().setDate(new Date().getDate() - 8)),
      totalPrice: 374,
      status: "CONFIRMED",
      type: "LISTING",
    },
  });

  const resFrancklin = await prisma.reservation.create({
    data: {
      user: { connect: { id: userFrancklin.id } },
      listing: { connect: { id: villaMarrakech.id } },
      checkIn: new Date(new Date().setDate(new Date().getDate() - 25)),
      checkOut: new Date(new Date().setDate(new Date().getDate() - 18)),
      totalPrice: 1309,
      status: "CONFIRMED",
      type: "LISTING",
    },
  });

  const resDkl = await prisma.reservation.create({
    data: {
      user: { connect: { id: userDkl.id } },
      listing: { connect: { id: villaMarrakech.id } },
      checkIn: new Date(new Date().setDate(new Date().getDate() - 15)),
      checkOut: new Date(new Date().setDate(new Date().getDate() - 13)),
      totalPrice: 374,
      status: "CONFIRMED",
      type: "LISTING",
    },
  });

  const resSeverine = await prisma.reservation.create({
    data: {
      user: { connect: { id: userSeverine.id } },
      listing: { connect: { id: villaMarrakech.id } },
      checkIn: new Date(new Date().setDate(new Date().getDate() - 7)),
      checkOut: new Date(new Date().setDate(new Date().getDate() - 6)),
      totalPrice: 187,
      status: "CONFIRMED",
      type: "LISTING",
    },
  });

  const resNabil = await prisma.reservation.create({
    data: {
      user: { connect: { id: userNabil.id } },
      listing: { connect: { id: villaMarrakech.id } },
      checkIn: new Date(new Date().setDate(new Date().getDate() - 30)),
      checkOut: new Date(new Date().setDate(new Date().getDate() - 28)),
      totalPrice: 374,
      status: "CONFIRMED",
      type: "LISTING",
    },
  });

  const resInsaf = await prisma.reservation.create({
    data: {
      user: { connect: { id: userInsaf.id } },
      listing: { connect: { id: villaMarrakech.id } },
      checkIn: new Date(),
      checkOut: new Date(new Date().setDate(new Date().getDate() + 2)),
      totalPrice: 374,
      status: "CONFIRMED",
      type: "LISTING",
    },
  });

  const resParis = await prisma.reservation.create({
    data: {
      user: { connect: { id: userFrancklin.id } },
      listing: { connect: { id: penthouseParis.id } },
      checkIn: new Date(new Date().setDate(new Date().getDate() - 5)),
      checkOut: new Date(new Date().setDate(new Date().getDate() - 2)),
      totalPrice: 1020,
      status: "CONFIRMED",
      type: "LISTING",
    },
  });

  const resQuad = await prisma.reservation.create({
    data: {
      user: { connect: { id: userWouarda.id } },
      session: { connect: { id: sessionQuad.id } },
      checkIn: new Date(),
      checkOut: new Date(),
      totalPrice: 120,
      status: "CONFIRMED",
      type: "EXPERIENCE",
    },
  });

  console.log("Creating reviews...");
  await prisma.review.create({
    data: {
      author: { connect: { id: userWouarda.id } },
      reservation: { connect: { id: resWouarda.id } },
      listing: { connect: { id: villaMarrakech.id } },
      ratingCleanliness: 5,
      ratingAccuracy: 5,
      ratingCheckin: 5,
      ratingCommunication: 5,
      ratingLocation: 5,
      ratingValue: 5,
      avgRating: 5.0,
      comment: "Nous avons passé un excellent séjour. Le logement est moderne propre et très agréable pour une famille. L'environnement est calme, propice à la détente et au repos. Nous reviendrons sans hésiter !",
      createdAt: new Date(new Date().setDate(new Date().getDate() - 2)),
    },
  });

  await prisma.review.create({
    data: {
      author: { connect: { id: userFrancklin.id } },
      reservation: { connect: { id: resFrancklin.id } },
      listing: { connect: { id: villaMarrakech.id } },
      ratingCleanliness: 5,
      ratingAccuracy: 5,
      ratingCheckin: 5,
      ratingCommunication: 5,
      ratingLocation: 5,
      ratingValue: 5,
      avgRating: 5.0,
      comment: "Très belle villa, au calme et située à 20min de la Medina. Un grand merci à Safa pour la préparation des petits déjeuners et dîners, c'était délicieux ! Une adresse que je recommande chaudement pour des vacances familiales relaxantes.",
      createdAt: new Date(new Date().setDate(new Date().getDate() - 21)),
    },
  });

  await prisma.review.create({
    data: {
      author: { connect: { id: userDkl.id } },
      reservation: { connect: { id: resDkl.id } },
      listing: { connect: { id: villaMarrakech.id } },
      ratingCleanliness: 5,
      ratingAccuracy: 5,
      ratingCheckin: 5,
      ratingCommunication: 5,
      ratingLocation: 5,
      ratingValue: 5,
      avgRating: 5.0,
      comment: "Superbe villa, calme et loin du bruit, Villa de haut standing. Sans vis-à-vis, vraiment un endroit idéal où vous pouvez vous reposer en toute intimité. Les photos sont conformes à la réalité.",
      createdAt: new Date(new Date().setDate(new Date().getDate() - 14)),
    },
  });

  await prisma.review.create({
    data: {
      author: { connect: { id: userSeverine.id } },
      reservation: { connect: { id: resSeverine.id } },
      listing: { connect: { id: villaMarrakech.id } },
      ratingCleanliness: 4,
      ratingAccuracy: 4,
      ratingCheckin: 4,
      ratingCommunication: 5,
      ratingLocation: 4,
      ratingValue: 4,
      avgRating: 4.1,
      comment: "Super villa très agréable, le seul petit bémol est la localisation géographique car les chauffeurs de taxis de la ville ont parfois beaucoup de mal à trouver la ruelle d'accès. Hormis cela tout était absolument parfait.",
      createdAt: new Date(new Date().setDate(new Date().getDate() - 7)),
    },
  });

  await prisma.review.create({
    data: {
      author: { connect: { id: userNabil.id } },
      reservation: { connect: { id: resNabil.id } },
      listing: { connect: { id: villaMarrakech.id } },
      ratingCleanliness: 5,
      ratingAccuracy: 5,
      ratingCheckin: 5,
      ratingCommunication: 5,
      ratingLocation: 5,
      ratingValue: 5,
      avgRating: 5.0,
      comment: "L'Hôte a été super gentil, accueillant et toujours disponible à l'écoute. Le voyage s'est déroulé à merveille, je recommande vivement ce lieu les yeux fermés et j'y retournerai avec grand plaisir !",
      createdAt: new Date("2026-04-12"),
    },
  });

  await prisma.review.create({
    data: {
      author: { connect: { id: userInsaf.id } },
      reservation: { connect: { id: resInsaf.id } },
      listing: { connect: { id: villaMarrakech.id } },
      ratingCleanliness: 5,
      ratingAccuracy: 5,
      ratingCheckin: 5,
      ratingCommunication: 5,
      ratingLocation: 5,
      ratingValue: 5,
      avgRating: 5.0,
      comment: "Abdel a pris grand soin de nous durant tout le séjour et a toujours été disponible très rapidement pour répondre à la moindre de nos questions ou besoins. Service d'une qualité rare, villa sublime. Nous reviendrons certainement !",
      createdAt: new Date(),
    },
  });

  await prisma.review.create({
    data: {
      author: { connect: { id: userFrancklin.id } },
      reservation: { connect: { id: resParis.id } },
      listing: { connect: { id: penthouseParis.id } },
      ratingCleanliness: 5,
      ratingAccuracy: 5,
      ratingCheckin: 5,
      ratingCommunication: 5,
      ratingLocation: 5,
      ratingValue: 4,
      avgRating: 4.8,
      comment: "Une vue absolument incroyable qui justifie amplement le prix. Prendre son café sur le balcon face à la Tour Eiffel est un souvenir inoubliable. L'appartement est impeccable et très bien équipé.",
      createdAt: new Date(new Date().setDate(new Date().getDate() - 1)),
    },
  });

  await prisma.review.create({
    data: {
      author: { connect: { id: userWouarda.id } },
      reservation: { connect: { id: resQuad.id } },
      experience: { connect: { id: expQuad.id } },
      avgRating: 4.9,
      comment: "Sensations fortes garanties ! Le désert d'Agafay est magnifique et l'accueil sous la tente berbère avec le thé à la menthe était fantastique au coucher de soleil. Guide très drôle !",
      createdAt: new Date(new Date().setDate(new Date().getDate() - 3)),
    },
  });

  console.log("Database seeded successfully!");
}

main()
  .catch((e) => {
    console.error("SEED_FAILED:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
