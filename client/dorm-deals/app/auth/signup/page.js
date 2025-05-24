'use client';

import { useAuth } from '@/app/context/AuthContext';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';

export default function Signup() {
  // Basic information
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');

  // Academic information
  const [university, setUniversity] = useState('');
  const [studentId, setStudentId] = useState('');
  const [department, setDepartment] = useState('');
  const [program, setProgram] = useState('Undergraduate');
  const [yearOfStudy, setYearOfStudy] = useState('1');
  const [graduationYear, setGraduationYear] = useState(
    (new Date().getFullYear() + 4).toString(),
  );

  // Form state
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [universities, setUniversities] = useState([]);

  const { register, isAuthenticated } = useAuth();
  const router = useRouter();

  // If user is already logged in, redirect
  useEffect(() => {
    if (isAuthenticated) {
      router.push('/dashboard/user');
    }
  }, [isAuthenticated, router]);

  // Fetch universities on component mount
  useEffect(() => {
    const fetchUniversities = async () => {
      try {
        const response = await fetch(
          'http://localhost:3000/api/v1/universities',
        );
        if (response.ok) {
          const data = await response.json();
          setUniversities(data.data || []);
        }
      } catch (error) {
        console.error('Failed to fetch universities:', error);
        // For demo, providing some default universities
        setUniversities([
          {
            _id: '1',
            name: 'Bangladesh University of Engineering and Technology',
          },
          { _id: '2', name: 'Dhaka University' },
          { _id: '3', name: 'North South University' },
          { _id: '4', name: 'BRAC University' },
        ]);
      }
    };

    fetchUniversities();
  }, []);

  // Update the nextStep function to show success/error toasts
  const nextStep = () => {
    if (step === 1) {
      // Validate first step
      if (!firstName || !lastName || !email || !password || !confirmPassword) {
        setError('Please fill in all required fields');
        toast.error('Please fill in all required fields');
        return;
      }
      if (password !== confirmPassword) {
        setError('Passwords do not match');
        toast.error('Passwords do not match');
        return;
      }
      if (password.length < 8) {
        setError('Password must be at least 8 characters long');
        toast.error('Password must be at least 8 characters long');
        return;
      }
      // Email validation
      const emailPattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
      if (!emailPattern.test(email)) {
        setError('Please enter a valid email address');
        toast.error('Please enter a valid email address');
        return;
      }
      toast.success('Basic information validated successfully!');
    }
    setError('');
    setStep(step + 1);
  };

  // Update the prevStep function to include toast for user feedback
  const prevStep = () => {
    setError('');
    setStep(step - 1);
    toast.info('Returning to previous step');
  };

  // Your handleSubmit function already has toast implemented, but let's modify validation to be clearer
  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Validate second step with more specific error messages
    if (!university) {
      setError('Please select your university');
      toast.error('Please select your university');
      setLoading(false);
      return;
    }
    
    if (!studentId) {
      setError('Please provide your student ID');
      toast.error('Please provide your student ID');
      setLoading(false);
      return;
    }
    
    if (!department) {
      setError('Please enter your department');
      toast.error('Please enter your department');
      setLoading(false);
      return;
    }
    
    if (!phoneNumber) {
      setError('Please provide your phone number');
      toast.error('Please provide your phone number');
      setLoading(false);
      return;
    }
    
    if (!dateOfBirth) {
      setError('Please provide your date of birth');
      toast.error('Please provide your date of birth');
      setLoading(false);
      return;
    }

    const userData = {
      firstName,
      lastName,
      email,
      password,
      phoneNumber,
      dateOfBirth,
      university,
      studentId,
      department,
      program,
      yearOfStudy: parseInt(yearOfStudy),
      graduationYear: parseInt(graduationYear),
    };

    try {
      toast.loading('Creating your account...', { id: 'signup' });
      const result = await register(userData);

      if (result.success) {
        toast.success(
          'Account created successfully! Please check your email to verify your account.',
          { id: 'signup' }
        );
        router.push('/auth/login');
      } else {
        // Display the error message from the API in a toast
        toast.error(result.message || 'Failed to create account', { id: 'signup' });
        setError(result.message || 'Failed to create account');
      }
    } catch (error) {
      // Display any unexpected errors as toast
      toast.error(error.message || 'An error occurred during signup. Please try again.', { id: 'signup' });
      setError(error.message || 'An error occurred during signup. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 sm:px-6 lg:px-8 py-12">
      <div className="max-w-md w-full space-y-8">
        <div>
          <div className="w-full flex justify-center">
            <Link href="/" className="text-center">
              <h1 className="text-3xl font-bold text-blue-600">Dorm Deals</h1>
            </Link>
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Create your account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Or{' '}
            <Link
              href="/auth/login"
              className="font-medium text-blue-600 hover:text-blue-500"
            >
              sign in to your existing account
            </Link>
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg
                  className="h-5 w-5 text-red-500"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        <div className="flex justify-center">
          <div className="flex items-center">
            <div
              className={`flex items-center justify-center h-8 w-8 rounded-full ${
                step >= 1 ? 'bg-blue-600' : 'bg-gray-300'
              }`}
            >
              <span className="text-white font-medium">1</span>
            </div>
            <div
              className={`h-1 w-8 ${step >= 2 ? 'bg-blue-600' : 'bg-gray-300'}`}
            ></div>
            <div
              className={`flex items-center justify-center h-8 w-8 rounded-full ${
                step >= 2 ? 'bg-blue-600' : 'bg-gray-300'
              }`}
            >
              <span className="text-white font-medium">2</span>
            </div>
          </div>
        </div>

        <form
          className="mt-8 space-y-6"
          onSubmit={step === 2 ? handleSubmit : e => e.preventDefault()}
        >
          {step === 1 ? (
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">
                Basic Information
              </h3>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="firstName"
                    className="block text-sm font-medium text-gray-700"
                  >
                    First Name
                  </label>
                  <input
                    id="firstName"
                    name="firstName"
                    type="text"
                    required
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    value={firstName}
                    onChange={e => setFirstName(e.target.value)}
                  />
                </div>
                <div>
                  <label
                    htmlFor="lastName"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Last Name
                  </label>
                  <input
                    id="lastName"
                    name="lastName"
                    type="text"
                    required
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    value={lastName}
                    onChange={e => setLastName(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700"
                >
                  Email address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                />
                <p className="mt-1 text-xs text-gray-500">
                  Please use your university email if possible.
                </p>
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-gray-700"
                >
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                />
              </div>

              <div>
                <label
                  htmlFor="confirmPassword"
                  className="block text-sm font-medium text-gray-700"
                >
                  Confirm Password
                </label>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  required
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                />
              </div>

              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={nextStep}
                  className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Next
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">
                Academic Information
              </h3>

              <div>
                <label
                  htmlFor="phoneNumber"
                  className="block text-sm font-medium text-gray-700"
                >
                  Phone Number
                </label>
                <input
                  id="phoneNumber"
                  name="phoneNumber"
                  type="tel"
                  required
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="+88 01XXXXXXXXX"
                  value={phoneNumber}
                  onChange={e => setPhoneNumber(e.target.value)}
                />
              </div>

              <div>
                <label
                  htmlFor="dateOfBirth"
                  className="block text-sm font-medium text-gray-700"
                >
                  Date of Birth
                </label>
                <input
                  id="dateOfBirth"
                  name="dateOfBirth"
                  type="date"
                  required
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  value={dateOfBirth}
                  onChange={e => setDateOfBirth(e.target.value)}
                />
              </div>

              <div>
                <label
                  htmlFor="university"
                  className="block text-sm font-medium text-gray-700"
                >
                  University
                </label>
                <select
                  id="university"
                  name="university"
                  required
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  value={university}
                  onChange={e => setUniversity(e.target.value)}
                >
                  <option value="">Select your university</option>
                  {universities.map(univ => (
                    <option key={univ._id} value={univ._id}>
                      {univ.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  htmlFor="studentId"
                  className="block text-sm font-medium text-gray-700"
                >
                  Student ID
                </label>
                <input
                  id="studentId"
                  name="studentId"
                  type="text"
                  required
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  value={studentId}
                  onChange={e => setStudentId(e.target.value)}
                />
              </div>

              <div>
                <label
                  htmlFor="department"
                  className="block text-sm font-medium text-gray-700"
                >
                  Department
                </label>
                <input
                  id="department"
                  name="department"
                  type="text"
                  required
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="e.g., Computer Science"
                  value={department}
                  onChange={e => setDepartment(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="program"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Program
                  </label>
                  <select
                    id="program"
                    name="program"
                    required
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    value={program}
                    onChange={e => setProgram(e.target.value)}
                  >
                    <option value="Undergraduate">Undergraduate</option>
                    <option value="Graduate">Graduate</option>
                    <option value="Postgraduate">Postgraduate</option>
                    <option value="PhD">PhD</option>
                  </select>
                </div>
                <div>
                  <label
                    htmlFor="yearOfStudy"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Year of Study
                  </label>
                  <select
                    id="yearOfStudy"
                    name="yearOfStudy"
                    required
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    value={yearOfStudy}
                    onChange={e => setYearOfStudy(e.target.value)}
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8].map(year => (
                      <option key={year} value={year.toString()}>
                        Year {year}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label
                  htmlFor="graduationYear"
                  className="block text-sm font-medium text-gray-700"
                >
                  Expected Graduation Year
                </label>
                <select
                  id="graduationYear"
                  name="graduationYear"
                  required
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  value={graduationYear}
                  onChange={e => setGraduationYear(e.target.value)}
                >
                  {Array.from(
                    { length: 10 },
                    (_, i) => new Date().getFullYear() + i,
                  ).map(year => (
                    <option key={year} value={year.toString()}>
                      {year}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex justify-between">
                <button
                  type="button"
                  onClick={prevStep}
                  className="inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className={`inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white ${
                    loading
                      ? 'bg-blue-400 cursor-not-allowed'
                      : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
                  }`}
                >
                  {loading ? 'Creating account...' : 'Sign up'}
                </button>
              </div>
            </div>
          )}
        </form>

        <div className="text-xs text-black text-center">
          By signing up, you agree to our{' '}
          <Link href="/terms" className="text-blue-600 hover:underline">
            Terms of Service
          </Link>{' '}
          and{' '}
          <Link href="/privacy" className="text-blue-600 hover:underline">
            Privacy Policy
          </Link>
          .
        </div>
      </div>
    </div>
  );
}
