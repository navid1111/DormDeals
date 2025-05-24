export default function Home() {
  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* 📸 Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center brightness-75"
        style={{
          backgroundImage:
            "url('https://as2.ftcdn.net/v2/jpg/03/64/41/07/1000_F_364410722_To5BhNoslW4QLWZ3KtkVFMckiFO0TFxn.jpg')",
        }}
      ></div>

      {/* 🌌 Animated Gradient */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-300 via-white to-blue-100 opacity-20 animate-pulse z-0"></div>

      {/* 💎 Texture Layer */}
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/paper-fibers.png')] opacity-10 z-0"></div>

      {/* 👀 Hero Section */}
      <div className="relative z-10 flex items-center justify-center min-h-screen px-4">
        <div className="backdrop-blur-lg bg-white/50 border border-white/30 rounded-3xl shadow-2xl p-10 max-w-3xl text-center animate-fade-in">
          <h1 className="text-5xl font-extrabold text-gray-900 drop-shadow mb-4">
            🎓 Student Marketplace
          </h1>
          <p className="text-lg text-gray-800 mb-8">
            Buy, sell, and swap textbooks, gadgets, bikes, and services — all trusted within your university network.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <button className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-full shadow-lg hover:scale-105 hover:bg-blue-700 transition-all duration-300">
              Browse Listings
            </button>
            <button className="px-6 py-3 bg-white text-blue-600 border border-blue-600 font-semibold rounded-full shadow-md hover:scale-105 hover:bg-blue-50 transition-all duration-300">
              Post Your Item
            </button>
          </div>
        </div>
      </div>

      {/* 🎒 What You Can Find Section */}
      <section className="relative z-10 bg-white py-20 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-10">
            📦 What Can You Find Here?
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-6">
            {[
              { label: "Laptops", emoji: "💻" },
              { label: "Textbooks", emoji: "📚" },
              { label: "Bikes", emoji: "🚲" },
              { label: "Headphones", emoji: "🎧" },
              { label: "Tutoring", emoji: "🧠" },
            ].map((item, idx) => (
              <div
                key={idx}
                className="bg-blue-50 hover:bg-blue-100 transition p-6 rounded-xl shadow-md flex flex-col items-center justify-center text-center"
              >
                <div className="text-4xl mb-2">{item.emoji}</div>
                <div className="text-lg font-medium text-gray-800">{item.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
