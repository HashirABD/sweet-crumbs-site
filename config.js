// =============================================================================
// Sweet Crumbs Lahore - Client Configuration Block
// Edit this file to customize business details, colors, and menu items.
// =============================================================================

window.SITE_CONFIG = {
  // 1. Business Info
  businessName: "Sweet Crumbs Lahore",
  tagline: "Fresh Cakes & Brownies Made for You",
  subTagline: "We bake fresh cakes, brownies, and cookies with pure butter. Order anytime for delivery in 30-40 minutes across Lahore.",
  orderNotice: "Order anytime. Same-day delivery in 30-40 minutes.",

  // 2. Contact & Socials
  phoneDisplay: "0323 3732647",
  whatsappNumber: "923233732647", // Digits only, country code included, no +, no spaces
  instagramHandle: "@sweetcrumbslahore",
  instagramUrl: "https://www.instagram.com/sweetcrumbslahore",
  location: "Gulberg III, Lahore",
  googleMapsUrl: "https://maps.google.com/?q=Gulberg+III+Lahore",
  deliveryInfo: "Fast delivery across Lahore in 30-40 minutes: Gulberg, DHA, Cantt, Model Town, Johar Town, Bahria Town, and nearby areas.",
  openingHours: "Open every day: 10:00 AM to 11:00 PM (Delivery in 30-40 minutes)",

  // 3. Brand Theme & Colors
  colors: {
    primary: "#7A381E",
    primaryDark: "#582613",
    primaryLight: "#F5ECE1",
    accent: "#C86A2E",
    accentHover: "#A8531D",
    whatsapp: "#25D366",
    whatsappDark: "#1EBE5D",
    bgPage: "#FDF9F4",
    bgCard: "#FFFFFF",
    textMain: "#2C1E18",
    textMuted: "#72645B",
    borderLight: "#EFE5D8"
  },

  // 4. Hero Badges
  heroBadges: [
    { icon: "✨", text: "100% Pure Butter" },
    { icon: "🍫", text: "Real Chocolate" },
    { icon: "🛵", text: "Delivery in 30-40 mins" }
  ],

  // 5. How to Order Steps
  howToOrder: [
    {
      step: "1",
      title: "Choose Your Items",
      desc: "Pick your favorite cakes, brownies, or treats and select how many you want."
    },
    {
      step: "2",
      title: "Tap 'Send Order on WhatsApp'",
      desc: "Your order list is ready. Tap the green button to open WhatsApp."
    },
    {
      step: "3",
      title: "We deliver in 30-40 minutes",
      desc: "We confirm your order and deliver fresh treats to your door in 30-40 minutes!"
    }
  ],

  // 6. About Section
  about: {
    badge: "About Us",
    heading: "Baked at Home with Real Butter",
    paragraphs: [
      "Sweet Crumbs is a home bakery in Lahore. We love baking fresh treats for birthdays, tea time, and celebrations.",
      "We only use real butter and good chocolate. We never use premixes or artificial flavors. Order anytime for fresh delivery in 30-40 minutes."
    ],
    stats: [
      { value: "100%", label: "Fresh & Halal" },
      { value: "30-40 Mins", label: "Fast Delivery" },
      { value: "All Lahore", label: "Home Delivery" }
    ]
  },

  // 7. 10 Signature Menu Items (PKR prices & emojis, no external image dependencies)
  menu: [
    {
      id: 1,
      name: "Chocolate Fudge Cake",
      category: "Cakes",
      badge: "Bestseller",
      pricePKR: 2450,
      description: "Rich, moist chocolate sponge layered with smooth chocolate fudge ganache.",
      emoji: "🎂"
    },
    {
      id: 2,
      name: "Vanilla Birthday Cake",
      category: "Cakes",
      badge: "Celebration",
      pricePKR: 2200,
      description: "Classic light vanilla sponge cake with sweet cream frosting and colorful sprinkles.",
      emoji: "🎂"
    },
    {
      id: 3,
      name: "Red Velvet Cake",
      category: "Cakes",
      badge: "Popular",
      pricePKR: 2650,
      description: "Moist red velvet sponge with layers of real whipped cream cheese frosting.",
      emoji: "🍰"
    },
    {
      id: 4,
      name: "Chocolate Brownies (box of 6)",
      category: "Brownies",
      badge: "Fresh Daily",
      pricePKR: 1950,
      description: "Fudgy dark Belgian chocolate brownies with a glossy crackly top.",
      emoji: "🍫"
    },
    {
      id: 5,
      name: "Cupcakes (box of 6)",
      category: "Cupcakes",
      badge: "Favorites",
      pricePKR: 1800,
      description: "Six soft cupcakes with vanilla, chocolate, and strawberry buttercream swirls.",
      emoji: "🧁"
    },
    {
      id: 6,
      name: "Chocolate Chip Cookies (box of 6)",
      category: "Cookies",
      badge: "Chewy",
      pricePKR: 1450,
      description: "Warm, chewy cookies packed with melted chocolate chunks and sea salt.",
      emoji: "🍪"
    },
    {
      id: 7,
      name: "Cheesecake Slice",
      category: "Desserts",
      badge: "Creamy",
      pricePKR: 950,
      description: "Classic creamy New York cheesecake slice on a golden butter biscuit crust.",
      emoji: "🍰"
    },
    {
      id: 8,
      name: "Cinnamon Rolls (box of 4)",
      category: "Pastries",
      badge: "Warm & Gooey",
      pricePKR: 1600,
      description: "Fluffy rolled buns filled with brown sugar cinnamon and sweet cream glaze.",
      emoji: "🥐"
    },
    {
      id: 9,
      name: "Tea Cake",
      category: "Tea Cakes",
      badge: "Chai Time",
      pricePKR: 1200,
      description: "Traditional soft and buttery golden loaf cake. Fresh and tender, perfect with chai.",
      emoji: "🍞"
    },
    {
      id: 10,
      name: "Donuts (box of 4)",
      category: "Donuts",
      badge: "Must Try",
      pricePKR: 1400,
      description: "Four soft, airy donuts with chocolate fudge frosting and sweet honey glaze.",
      emoji: "🍩"
    }
  ]
};

