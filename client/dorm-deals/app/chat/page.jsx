"use client";

import { useState } from "react";

export default function ChatPage() {
  const [messages, setMessages] = useState([
    { sender: "seller", text: "Hi! Yes, the bike is still available." },
    { sender: "buyer", text: "Great! Can we meet at the IUT library tomorrow?" },
  ]);
  const [input, setInput] = useState("");

  const sendMessage = (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    setMessages([...messages, { sender: "buyer", text: input }]);
    setInput("");
  };

  return (
    <div className="relative min-h-screen flex flex-col">
      {/* Background layer (z-0) */}
      <div
        className="absolute inset-0 bg-cover bg-center filter blur-md scale-[1.02] z-0"
        style={{
          backgroundImage:
            "url('https://studio.uxpincdn.com/studio/wp-content/uploads/2023/04/Chat-User-Interface-Design.png.webp')",
        }}
      ></div>

      {/* Overlay */}
      <div className="absolute inset-0 bg-black/20 z-0" />

      {/* Content */}
      <div className="relative z-10 flex-grow px-4 py-8">
        <div className="max-w-2xl mx-auto bg-white/95 rounded-xl shadow-lg p-6 w-full">
          <h2 className="text-2xl font-bold mb-4">💬 Chat with Sani</h2>

          <div className="space-y-4 max-h-96 overflow-y-auto mb-4">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`p-3 rounded-lg w-fit max-w-[70%] ${
                  msg.sender === "buyer"
                    ? "bg-blue-500 text-white self-end ml-auto"
                    : "bg-gray-200 text-gray-800"
                }`}
              >
                {msg.text}
              </div>
            ))}
          </div>

          <form onSubmit={sendMessage} className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your message..."
              className="flex-grow px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="submit"
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
            >
              Send
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
