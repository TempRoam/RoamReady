//this will store the activity info that is used on the itnerary page
//the data is written here, but later should be gotten from supabase
//the categories belong to an activity
//each activity is under one of these 3
export type Category = "culture" | "food" | "sightseeing";

//this is what info each activity needs to have.
export type Activity = {
  id: string; // this is to idneftiy each activity, unique ID
  start: string; // the date and satrt time of the activity (ex: YYYY(YEAR)-MM(MONTH)-DD(DAY)T(seperates the date from the time)HH(hour 09 = 9am)MM(minutes 00=0mins)
  title: string; // nameof the activity
  location: string; //where the activity will be
  description: string; // the short info of the activity
  image: string; // path to activities image
  category: Category; // category used to organize and style the activity
};

//list of activites displayed on the page
// each activity follows the type from above 
// 3 examples given below
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