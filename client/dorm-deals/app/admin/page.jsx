"use client";

import { useState } from "react";

export default function AdminPanel() {
  const [listings, setListings] = useState([
    {
      id: 1,
      title: "Old Laptop",
      seller: "Faiza (DU)",
      condition: "Fair",
      price: 25000,
    },
    {
      id: 2,
      title: "Mountain Bike",
      seller: "Sani (IUT)",
      condition: "Like New",
      price: 15000,
    },
  ]);

  const handleApprove = (id) => {
    setListings((prev) => prev.filter((item) => item.id !== id));
    alert(`Listing #${id} approved ✅`);
  };

  const handleReject = (id) => {
    setListings((prev) => prev.filter((item) => item.id !== id));
    alert(`Listing #${id} rejected ❌`);
  };

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* ✅ Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center brightness-75"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=1740&q=80')",
        }}
      ></div>

      {/* ✅ Overlay */}
      <div className="absolute inset-0 bg-white/40 z-0"></div>

      {/* ✅ Foreground Panel */}
      <div className="relative z-10 py-16 px-4 flex justify-center items-start min-h-screen">
        <div className="max-w-4xl w-full bg-white/90 backdrop-blur-md shadow-xl rounded-xl p-8">
          <h1 className="text-3xl font-bold text-center mb-6">
            🛡️ Admin Moderation Panel
          </h1>

          {listings.length === 0 ? (
            <p className="text-center text-gray-600">All listings reviewed! 🎉</p>
          ) : (
            <div className="space-y-6">
              {listings.map((item) => (
                <div
                  key={item.id}
                  className="p-4 bg-blue-50 rounded-lg shadow flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3"
                >
                  <div>
                    <h2 className="text-lg font-semibold text-gray-800">
                      {item.title}
                    </h2>
                    <p className="text-sm text-gray-600">
                      Seller: {item.seller} | Condition: {item.condition} | Price: {item.price} BDT
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleApprove(item.id)}
                      className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => handleReject(item.id)}
                      className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition"
                    >
                      Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
