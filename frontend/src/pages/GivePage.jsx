// import React from "react";
// import RoommateCard from "../components/RoommateCard";

// const roommates = [
//   {
//     name: "Priya Perera",
//     age: 24,
//     occupation: "Software Engineer",
//     location: "Colombo 7",
//     rating: 4.8,
//     tags: ["Cooking", "Reading", "Yoga", "Writing"],
//     bio:
//       "Friendly and tidy. Loves quiet evenings, good food, and weekend hikes. Looking for a respectful roommate.",
//     avatarUrl:
//       "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=400&auto=format&fit=crop",
//   },
// ];

// const GivePage = () => {
//   const handleConnect = (name) => {
//     alert(`Connect request sent to ${name}`);
//   };

//   return (
//     <div className="mx-auto max-w-7xl px-4 py-8">
//       <h1 className="text-2xl font-bold mb-4">Find your perfect roommate</h1>
//       <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
//         {roommates.map((r) => (
//           <RoommateCard key={r.name} {...r} onConnect={() => handleConnect(r.name)} />
//         ))}
//       </div>
//     </div>
//   );
// };

// export default GivePage;

import React from "react";
import RoommateCard from "../components/RoommateCard";

const roommates = [
  {
    name: "Priya Perera",
    age: 24,
    occupation: "Software Engineer",
    location: "Colombo 7",
    rating: 4.8,
    tags: ["Cooking", "Reading", "Yoga", "Writing"],
    bio: "Friendly and tidy. Loves quiet evenings, good food, and weekend hikes.",
    avatarUrl:
      "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=400&auto=format&fit=crop",
  },
  {
    name: "Nimal Fernando",
    age: 27,
    occupation: "Graphic Designer",
    location: "Colombo 5",
    rating: 4.6,
    tags: ["Art", "Movies", "Cycling"],
    bio: "Creative and easy-going. Enjoys design projects and weekend cycling trips.",
    avatarUrl:
      "https://images.unsplash.com/photo-1502767089025-6572583495b4?q=80&w=400&auto=format&fit=crop",
  },
  {
    name: "Sajini Silva",
    age: 22,
    occupation: "Medical Student",
    location: "Colombo 3",
    rating: 4.9,
    tags: ["Cooking", "Volunteering", "Music"],
    bio: "Organized and caring. Loves cooking healthy meals and volunteering at clinics.",
    avatarUrl:
      "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?q=80&w=400&auto=format&fit=crop",
  },
  {
    name: "Kasun Jayasuriya",
    age: 29,
    occupation: "Marketing Specialist",
    location: "Colombo 2",
    rating: 4.7,
    tags: ["Travel", "Photography", "Football"],
    bio: "Adventurous and social. Loves exploring new places and playing football on weekends.",
    avatarUrl:
      "https://images.unsplash.com/photo-1527980965255-d3b416303d12?q=80&w=400&auto=format&fit=crop",
  },
];

const GivePage = () => {
  const handleConnect = (name) => {
    alert(`Connect request sent to ${name}`);
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <h1 className="text-2xl font-bold mb-4">Find your perfect roommate</h1>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {roommates.map((r) => (
          <RoommateCard
            key={`${r.name}-${r.age}-${r.location}`}
            {...r}
            onConnect={() => handleConnect(r.name)}
          />
        ))}
      </div>
    </div>
  );
};

export default GivePage;