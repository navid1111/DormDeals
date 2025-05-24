'use client';

import Link from "next/link";
import { useAuth } from "./context/AuthContext";

export default function Home() {
  const { user, isAuthenticated } = useAuth();
  
  const getDashboardLink = () => {
    if (!isAuthenticated) return '/auth/login';
    return user?.role === 'admin' || user?.role === 'university-admin'
      ? '/dashboard/admin'
      : '/dashboard/user';
  };

  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-blue-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <h1 className="text-2xl font-bold">Dorm Deals</h1>
            <nav>
              <ul className="flex space-x-4">
                <li>
                  <Link href="/" className="px-3 py-2 rounded-md text-sm font-medium bg-blue-900">
                    Home
                  </Link>
                </li>
                <li>
                  <Link href="/listings" className="px-3 py-2 rounded-md text-sm font-medium hover:bg-blue-700">
                    Listings
                  </Link>
                </li>
                {isAuthenticated ? (
                  <li>
                    <Link 
                      href={getDashboardLink()}
                      className="px-3 py-2 rounded-md text-sm font-medium hover:bg-blue-700"
                    >
                      Dashboard
                    </Link>
                  </li>
                ) : (
                  <li>
                    <Link href="/auth/login" className="px-3 py-2 rounded-md text-sm font-medium hover:bg-blue-700">
                      Login
                    </Link>
                  </li>
                )}
              </ul>
            </nav>
          </div>
        </div>
      </header>

      <main className="flex-grow">
        {/* Hero Section */}
        <div className="relative bg-blue-800">
          <div className="max-w-7xl mx-auto px-4 py-24 sm:px-6 lg:px-8 flex flex-col items-center text-center">
            <h2 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl md:text-6xl">
              <span className="block">Student-to-Student Marketplace</span>
              <span className="block text-blue-300">For University Essentials</span>
            </h2>
            <p className="mt-6 max-w-lg mx-auto text-xl text-blue-100 sm:max-w-3xl">
              Buy and sell textbooks, supplies, dorm essentials, and more with students from your university.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row justify-center gap-4">
              <Link
                href="/listings"
                className="px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 md:py-4 md:text-lg md:px-10"
              >
                Browse Listings
              </Link>
              <Link
                href={isAuthenticated ? '/listings/new' : '/auth/login'}
                className="px-8 py-3 border border-transparent text-base font-medium rounded-md text-blue-600 bg-white hover:bg-gray-100 md:py-4 md:text-lg md:px-10"
              >
                Create Listing
              </Link>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="lg:text-center">
              <h2 className="text-base text-blue-600 font-semibold tracking-wide uppercase">Features</h2>
              <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
                A Better Way to Buy and Sell
              </p>
              <p className="mt-4 max-w-2xl text-xl text-gray-500 lg:mx-auto">
                Dorm Deals makes it easy to connect with other students at your university.
              </p>
            </div>

            <div className="mt-10">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                <div className="p-6 border rounded-lg bg-gray-50">
                  <div className="flex items-center justify-center h-12 w-12 rounded-md bg-blue-500 text-white mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-6 w-6">
                      <path fillRule="evenodd" d="M4 8a6 6 0 1112 0c0 1.887.454 3.665 1.257 5.234a.75.75 0 01-.515 1.076 32.903 32.903 0 01-7.151 0 .75.75 0 01-.515-1.076A11.959 11.959 0 004 8zm2.476 6.347c-.803.06-1.597.121-2.4.316.242.262.496.514.763.757 1.094 1.01 2.354 1.847 3.768 2.446 2.33.986 4.89.657 7.31-1.331.207-.172.419-.35.623-.534a32.406 32.406 0 00-2.07-.324c-3.119-.265-6.255-.265-9.374 0a18.869 18.869 0 01-2.38.33z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-gray-900">Verified University Students</h3>
                  <p className="mt-2 text-gray-500">
                    All users are verified with their university email addresses for secure transactions.
                  </p>
                </div>
                <div className="p-6 border rounded-lg bg-gray-50">
                  <div className="flex items-center justify-center h-12 w-12 rounded-md bg-blue-500 text-white mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-6 w-6">
                      <path fillRule="evenodd" d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.452 4.391l3.328 3.329a.75.75 0 11-1.06 1.06l-3.329-3.328A7 7 0 012 9z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-gray-900">Easy Search</h3>
                  <p className="mt-2 text-gray-500">
                    Find exactly what you need with filters for categories, price, and more.
                  </p>
                </div>
                <div className="p-6 border rounded-lg bg-gray-50">
                  <div className="flex items-center justify-center h-12 w-12 rounded-md bg-blue-500 text-white mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-6 w-6">
                      <path d="M3.505 2.365A41.369 41.369 0 019 2c1.863 0 3.697.124 5.495.365 1.247.167 2.18 1.108 2.435 2.268a4.45 4.45 0 00-.577-.069 43.141 43.141 0 00-4.706 0C9.229 4.696 7.5 6.727 7.5 8.998v2.24c0 1.413.67 2.735 1.76 3.562l-2.98 2.98A.75.75 0 015 17.25v-3.443c-.501-.048-1-.106-1.495-.172C2.033 13.438 1 12.162 1 10.72V5.28c0-1.441 1.033-2.717 2.505-2.914z" />
                      <path d="M14 6c-.762 0-1.52.02-2.271.062C10.157 6.148 9 7.472 9 8.998v2.24c0 1.519 1.147 2.839 2.71 2.935.214.013.428.024.642.034.2.009.385.09.518.224l2.35 2.35a.75.75 0 001.28-.531v-2.07c1.453-.195 2.5-1.463 2.5-2.915V8.998c0-1.526-1.157-2.85-2.729-2.936A41.645 41.645 0 0014 6z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-gray-900">Direct Messaging</h3>
                  <p className="mt-2 text-gray-500">
                    Chat directly with buyers and sellers to arrange meetups and transactions.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <footer className="bg-gray-800 text-white">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <h3 className="text-lg font-semibold">Dorm Deals</h3>
              <p className="text-sm text-gray-400">A marketplace for university students</p>
            </div>
            <div className="flex space-x-6">
              <Link href="/about" className="text-gray-400 hover:text-white">About</Link>
              <Link href="/help" className="text-gray-400 hover:text-white">Help</Link>
              <Link href="/privacy" className="text-gray-400 hover:text-white">Privacy</Link>
              <Link href="/terms" className="text-gray-400 hover:text-white">Terms</Link>
            </div>
          </div>
          <div className="mt-4 text-center text-sm text-gray-400">
            &copy; {new Date().getFullYear()} Dorm Deals. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
