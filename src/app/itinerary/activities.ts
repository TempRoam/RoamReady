// Activity data for the itinerary page.
// The shape matches the itinerary_items table (start_time, title, location,
// category, notes), so later this array can be replaced by a Supabase query.

export type Category = "culture" | "food" | "sightseeing";

export type Activity = {
  id: string;
  start: string; // local date and time written as "YYYY-MM-DDTHH:MM"
  title: string;
  location: string;
  description: string;
  image: string;
  category: Category;
};

export const activities: Activity[] = [
  {
    id: "senso-ji",
    start: "2027-05-12T09:00",
    title: "Senso-ji Temple",
    location: "Asakusa",
    description:
      "Explore Tokyo's oldest and most famous temple, with its historic streets and vibrant atmosphere.",
    image: "/images/senso-ji.jpg",
    category: "culture",
  },
  {
    id: "tsukiji",
    start: "2027-05-12T12:00",
    title: "Lunch at Tsukiji",
    location: "Tsukiji Outer Market",
    description:
      "Enjoy fresh seafood and local favorites at Tokyo's iconic market.",
    image: "/images/tsukiji-market.jpg",
    category: "food",
  },
  {
    id: "shibuya",
    start: "2027-05-12T15:00",
    title: "Explore Shibuya",
    location: "Shibuya Crossing",
    description:
      "Experience Tokyo's most famous intersection and vibrant shopping district.",
    image: "/images/Shibuya.jpg",
    category: "sightseeing",
  },
];