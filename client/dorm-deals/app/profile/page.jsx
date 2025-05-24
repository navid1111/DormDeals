"use client";

export default function ProfilePage() {
  const student = {
    name: "Sani",
    university: "Islamic University of Technology (IUT)",
    department: "CSE",
    year: "3rd Year",
    email: "sani@iut-dhaka.edu",
    listings: [
      {
        title: "Mountain Bike – Almost New",
        price: "15000",
        condition: "Like New",
        imageUrl:
          "https://images.ctfassets.net/5vy1mse9fkav/4PwYl7Aljqzi16sUaNqzB0/f6e3bdb01a7beeb180fac885b212f299/fat-boy-mc.jpg?fm=webp&w=960",
      },
      {
        title: "Headphones (JBL)",
        price: "1800",
        condition: "Good",
        imageUrl:
          "https://plus.unsplash.com/premium_photo-1679513691474-73102089c117?q=80&w=2013&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
      },
    ],
  };

  return (
    <div className="relative min-h-screen">
      {/* ✅ Background with overlay (z-0, behind everything) */}
      <div
        className="absolute inset-0 bg-cover bg-center brightness-75 z-0"
        style={{
          backgroundImage:
            "url('https://img.freepik.com/free-photo/black-frame-with-copy-space-top-view_23-2148824398.jpg')",
        }}
      />

      {/* ✅ Main Content */}
      <div className="relative z-10 px-4 py-16">
        <div className="max-w-4xl mx-auto bg-white/90 backdrop-blur-sm shadow-xl rounded-xl p-8">
          <div className="flex items-center mb-6">
            <div className="bg-blue-100 p-3 rounded-full mr-4">
              <span className="text-3xl">👤</span>
            </div>
            <h1 className="text-3xl font-bold text-gray-800">{student.name}'s Profile</h1>
          </div>

          <div className="grid md:grid-cols-2 gap-6 mb-10">
            <div className="space-y-3">
              <p className="text-gray-700">
                <span className="font-semibold text-gray-900">University:</span>{" "}
                {student.university}
              </p>
              <p className="text-gray-700">
                <span className="font-semibold text-gray-900">Department:</span>{" "}
                {student.department}
              </p>
            </div>
            <div className="space-y-3">
              <p className="text-gray-700">
                <span className="font-semibold text-gray-900">Year:</span> {student.year}
              </p>
              <p className="text-gray-700">
                <span className="font-semibold text-gray-900">Email:</span> {student.email}
              </p>
            </div>
          </div>

          <h2 className="text-2xl font-semibold mb-6 pt-6 border-t border-gray-200 flex items-center">
            <span className="bg-blue-100 p-2 rounded-full mr-3">📦</span>
            Your Listings
          </h2>

          <div className="grid sm:grid-cols-2 gap-6">
            {student.listings.map((item, index) => (
              <div
                key={index}
                className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow"
              >
                <img
                  src={item.imageUrl}
                  alt={item.title}
                  className="h-48 w-full object-cover"
                />
                <div className="p-4">
                  <h3 className="font-semibold text-lg text-gray-900 mb-1">{item.title}</h3>
                  <p className="text-blue-600 font-medium text-lg mb-1">{item.price} BDT</p>
                  <span className="inline-block bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded">
                    {item.condition}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
