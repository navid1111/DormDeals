"use client";

export default function MeetupPage() {
  const meetupLocations = [
    {
      name: "IUT Main Gate",
      coordinates: "Gate Area",
      description: "Well-lit area, great for item exchange.",
      imageUrl:
        "https://upload.wikimedia.org/wikipedia/commons/2/21/Five_Fundamentals_Gate%2C_Islamic_University_of_Technology.jpg?20230706144017",
    },
    {
      name: "Central Library",
      coordinates: "Library Entrance",
      description: "Public and safe. Monitored during the day.",
      imageUrl:
        "https://images.unsplash.com/photo-1507842217343-583bb7270b66?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=MnwxMTc3M3wwfDF8c2VhcmNofDF8fGxpYnJhcnl8ZW58MHx8fHwxNjU4NDAwNTQ4&ixlib=rb-1.2.1&q=80&w=2000",
    },
    {
      name: "Cafeteria Front",
      coordinates: "Cafe",
      description: "Lots of student traffic during lunch hours.",
      imageUrl:
        "https://upload.wikimedia.org/wikipedia/commons/e/ea/Cafeteria%2C_Islamic_University_of_Technology.jpg?20060808095058",
    },
  ];

  return (
    <div
      className="min-h-screen py-16 px-4 bg-cover bg-center"
      style={{
        backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url('https://images.unsplash.com/photo-1516321497487-e288fb19713f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=MnwxMTc3M3wwfDF8c2VhcmNofDJ8fGNhbXB1c3xlbnwwfHx8fDE2NjA2NjY2NjY&ixlib=rb-1.2.1&q=80&w=2000')`,
      }}
    >
      <div className="max-w-4xl mx-auto bg-white shadow-lg rounded-xl p-8">
        <h1 className="text-3xl font-bold text-center mb-6 text-white">
          📍 Suggested Meetup Spots
        </h1>
        <p className="text-center text-gray-200 mb-8">
          Choose a safe, public spot on campus to exchange items.
        </p>

        <div className="grid md:grid-cols-3 gap-6">
          {meetupLocations.map((loc, index) => (
            <div key={index} className="bg-blue-50 p-4 rounded-lg shadow hover:shadow-md transition">
              <img
                src={loc.imageUrl}
                alt={loc.name}
                className="w-full h-40 object-cover rounded-md mb-3"
              />
              <h2 className="text-xl font-semibold text-blue-800 mb-1">{loc.name}</h2>
              <p className="text-gray-700 mb-1">{loc.coordinates}</p>
              <p className="text-sm text-gray-600">{loc.description}</p>
              <button className="mt-3 px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 transition">
                Suggest This Spot
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}