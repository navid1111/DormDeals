"use client";

import { useState } from "react";

export default function PostPage() {
  const [image, setImage] = useState(null);
  const [title, setTitle] = useState("");
  const [suggestedPrice, setSuggestedPrice] = useState(null);
  const [conditionHint, setConditionHint] = useState("");

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(URL.createObjectURL(file));

      // 🧠 Simulated AI condition estimator
      const filename = file.name.toLowerCase();
      if (filename.includes("new")) {
        setConditionHint("✨ Like New");
      } else if (filename.includes("used") || filename.includes("old")) {
        setConditionHint("📦 Fair");
      } else if (filename.includes("mid") || filename.includes("ok")) {
        setConditionHint("👍 Good");
      } else {
        setConditionHint("🤖 Estimated: Good");
      }
    }
  };

  const getSuggestedPrice = (title) => {
    const lower = title.toLowerCase();
    if (lower.includes("bike")) return 12000;
    if (lower.includes("laptop")) return 55000;
    if (lower.includes("headphone")) return 1500;
    if (lower.includes("book")) return 300;
    if (lower.includes("tablet")) return 9000;
    return null;
  };

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* ✅ BACKGROUND IMAGE LAYER */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage:
            "url('https://static.vecteezy.com/system/resources/previews/050/971/470/non_2x/a-football-texture-showcases-laced-stripes-against-a-flat-background-photo.jpg')",
        }}
      ></div>

      {/* ✅ SEMI-TRANSPARENT OVERLAY */}
      <div className="absolute inset-0 bg-white/40 z-0"></div>

      {/* ✅ FOREGROUND CONTENT */}
      <div className="relative z-10 flex items-center justify-center min-h-screen px-4 py-16">
        <div className="bg-white bg-opacity-90 rounded-xl shadow-2xl p-8 max-w-2xl w-full">
          <h1 className="text-3xl font-bold text-center mb-6">📤 Post Your Item</h1>

          <form className="space-y-5">
            {/* Item Title */}
            <input
              type="text"
              value={title}
              onChange={(e) => {
                const newTitle = e.target.value;
                setTitle(newTitle);
                setSuggestedPrice(getSuggestedPrice(newTitle));
              }}
              placeholder="Item Title"
              className="w-full border border-gray-300 rounded-lg px-4 py-2"
            />

            {/* Suggested Price */}
            {suggestedPrice && (
              <div className="text-sm text-green-700 mt-1">
                💡 Suggested Price: <strong>{suggestedPrice} BDT</strong>
              </div>
            )}

            {/* Price Input */}
            <input
              type="number"
              placeholder="Price (in BDT)"
              className="w-full border border-gray-300 rounded-lg px-4 py-2"
            />

            {/* Condition Dropdown */}
            <select className="w-full border border-gray-300 rounded-lg px-4 py-2">
              <option value="">Condition</option>
              <option value="new">New</option>
              <option value="like-new">Like New</option>
              <option value="good">Good</option>
              <option value="fair">Fair</option>
            </select>

            {/* Description */}
            <textarea
              placeholder="Description"
              rows={4}
              className="w-full border border-gray-300 rounded-lg px-4 py-2"
            ></textarea>

            {/* Image Upload */}
            <div>
              <label className="block font-medium mb-1">Upload Image</label>
              <input type="file" onChange={handleImageChange} />
              {image && (
                <>
                  <img
                    src={image}
                    alt="Preview"
                    className="mt-4 h-40 rounded-md object-cover"
                  />
                  {/* AI Condition Hint */}
                  {conditionHint && (
                    <div className="mt-2 text-sm text-green-700">
                      AI Condition Estimate: <strong>{conditionHint}</strong>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition"
            >
              Submit Listing
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
