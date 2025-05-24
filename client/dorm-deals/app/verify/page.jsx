"use client";

import { useState } from "react";

export default function VerifyPage() {
  const [email, setEmail] = useState("");
  const [university, setUniversity] = useState("");
  const [department, setDepartment] = useState("");
  const [year, setYear] = useState("");
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email.endsWith(".edu")) {
      setError("Only .edu emails are allowed for student verification.");
      return;
    }
    setError("");
    setSubmitted(true);
  };

  return (
    <div
      className="min-h-screen px-4 py-16 flex justify-center items-center bg-cover bg-center"
      style={{
        backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url('https://images.unsplash.com/photo-1523050854058-8df90110c9f1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=MnwxMTc3M3wwfDF8c2VhcmNofDN8fHVuaXZlcnNpdHl8ZW58MHx8fHwxNjYwNjY2NjY2&ixlib=rb-1.2.1&q=80&w=2000')`,
      }}
    >
      <div className="bg-white p-8 rounded-xl shadow-md w-full max-w-lg">
        <h1 className="text-3xl font-bold mb-6 text-center text-white">
          🎓 Verify Student Identity
        </h1>

        {!submitted ? (
          <form onSubmit={handleSubmit} className="space-y-5">
            <input
              type="email"
              placeholder="University Email (e.g., student@iut-dhaka.edu)"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-2"
              required
            />
            <input
              type="text"
              placeholder="University Name"
              value={university}
              onChange={(e) => setUniversity(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-2"
              required
            />
            <input
              type="text"
              placeholder="Department (e.g., CSE)"
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-2"
              required
            />
            <select
              value={year}
              onChange={(e) => setYear(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-2"
              required
            >
              <option value="">Year of Study</option>
              <option value="1st Year">1st Year</option>
              <option value="2nd Year">2nd Year</option>
              <option value="3rd Year">3rd Year</option>
              <option value="4th Year">4th Year</option>
              <option value="Masters">Masters</option>
            </select>

            {error && <p className="text-red-600 text-sm">{error}</p>}

            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition"
            >
              Verify and Save
            </button>
          </form>
        ) : (
          <div className="text-center">
            <h2 className="text-xl font-semibold text-green-600 mb-4">✅ Verified Successfully</h2>
            <p className="text-gray-200">Welcome, {department} student from {university}!</p>
          </div>
        )}
      </div>
    </div>
  );
}