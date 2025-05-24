'use client';

import { useAuth } from '@/app/context/AuthContext';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

export default function DashboardNav() {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isAdmin = user?.role === 'admin' || user?.role === 'university-admin';
  const isGlobalAdmin = user?.role === 'admin';

  // Different menu items for admin and user
  const userMenuItems = [
    { name: 'Dashboard', href: '/dashboard/user' },
    { name: 'My Listings', href: '/dashboard/user/listings' },
    { name: 'Messages', href: '/dashboard/user/messages' },
    { name: 'Meetups', href: '/dashboard/user/meetups' },
    { name: 'Profile', href: '/dashboard/user/profile' },
  ];

  const adminMenuItems = [
    { name: 'Dashboard', href: '/dashboard/admin' },
    { name: 'Manage Listings', href: '/dashboard/admin/listings' },
    { name: 'Manage Reports', href: '/dashboard/admin/reports' },
    { name: 'User Verification', href: '/dashboard/admin/users' },
  ];

  // Add university admin specific items
  if (isGlobalAdmin) {
    adminMenuItems.push({ name: 'Manage Universities', href: '/dashboard/admin/universities' });
  }

  const menuItems = isAdmin ? adminMenuItems : userMenuItems;

  return (
    <nav className="bg-blue-800 text-white">
      {/* Desktop Navigation */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="flex-shrink-0 text-xl font-bold">
              Dorm Deals
            </Link>
            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-4">
                {menuItems.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`${
                      pathname === item.href
                        ? 'bg-blue-900 text-white'
                        : 'text-blue-200 hover:bg-blue-700'
                    } px-3 py-2 rounded-md text-sm font-medium`}
                  >
                    {item.name}
                  </Link>
                ))}
              </div>
            </div>
          </div>
          <div className="hidden md:block">
            <div className="ml-4 flex items-center md:ml-6">
              <span className="text-sm mr-4">
                Welcome, {user?.firstName || 'User'}
                {isAdmin && <span className="ml-1 text-xs text-blue-200">({user?.role})</span>}
              </span>
              <button
                onClick={logout}
                className="bg-blue-700 hover:bg-blue-600 text-white px-3 py-2 rounded-md text-sm font-medium"
              >
                Logout
              </button>
            </div>
          </div>
          <div className="-mr-2 flex md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              type="button"
              className="bg-blue-900 inline-flex items-center justify-center p-2 rounded-md text-blue-200 hover:text-white hover:bg-blue-700 focus:outline-none"
              aria-controls="mobile-menu"
              aria-expanded="false"
            >
              <span className="sr-only">Open main menu</span>
              {!mobileMenuOpen ? (
                <svg
                  className="block h-6 w-6"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              ) : (
                <svg
                  className="block h-6 w-6"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <div
        className={`${mobileMenuOpen ? 'block' : 'hidden'} md:hidden`}
        id="mobile-menu"
      >
        <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
          {menuItems.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className={`${
                pathname === item.href
                  ? 'bg-blue-900 text-white'
                  : 'text-blue-200 hover:bg-blue-700'
              } block px-3 py-2 rounded-md text-base font-medium`}
              onClick={() => setMobileMenuOpen(false)}
            >
              {item.name}
            </Link>
          ))}
          <div className="pt-4 pb-3 border-t border-blue-700">
            <div className="flex items-center px-5">
              <div className="text-sm font-medium">
                <div className="text-white">Welcome, {user?.firstName || 'User'}</div>
                {isAdmin && (
                  <div className="text-blue-200 text-xs">{user?.role}</div>
                )}
              </div>
            </div>
            <button
              onClick={logout}
              className="mt-3 w-full flex justify-center bg-blue-700 hover:bg-blue-600 text-white px-3 py-2 rounded-md text-sm font-medium"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
