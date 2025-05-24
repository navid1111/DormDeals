export default function ListingDetail({ params }) {
  const { id } = params;

  const saniBike = {
    id,
    title: "Bike – Almost New",
    price: "150000",
    condition: "Like New",
    description:
      "High-performance mountain bike, barely used. Perfect for campus rides and weekend trips. Includes helmet and lock.",
    university: "IUT",
    seller: "Sani, 3rd Year, CSE",
    imageUrl:
      "https://images.ctfassets.net/5vy1mse9fkav/4PwYl7Aljqzi16sUaNqzB0/f6e3bdb01a7beeb180fac885b212f299/fat-boy-mc.jpg?fm=webp&w=960",
  };

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center brightness-75"
        style={{
          backgroundImage:
            "url('https://cdn.vectorstock.com/i/2000v/73/73/village-market-scene-vector-44357373.avif')",
        }}
      ></div>

      {/* Optional white overlay */}
      <div className="absolute inset-0 bg-white/30 z-0"></div>

      {/* Foreground Content */}
      <div className="relative z-10 min-h-screen flex items-center justify-center px-4 py-16">
        <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-2xl p-8 max-w-4xl w-full">
          <img
            src={saniBike.imageUrl}
            alt={saniBike.title}
            className="w-full h-80 object-cover rounded-lg mb-6"
          />
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {saniBike.title}
          </h1>
          <p className="text-xl text-blue-600 font-semibold mb-2">
            {saniBike.price} BDT
          </p>
          <p className="text-sm text-gray-600 mb-4">
            Condition: {saniBike.condition}
          </p>
          <p className="text-gray-800 mb-4">{saniBike.description}</p>
          <p className="text-sm text-gray-500 mb-6">📍 {saniBike.university}</p>
          <div className="text-sm text-gray-700 mb-4">
            <span className="font-semibold">Seller:</span> {saniBike.seller}
          </div>
          <button className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition">
            Message Sani
          </button>
        </div>
      </div>
    </div>
  );
}
