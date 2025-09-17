export default function LandingPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-sky-50 to-white">
      {/* Hero Section */}
      <div className="max-w-2xl text-center px-6">
        <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 leading-tight mb-4">
          Welcome to <span className="text-sky-600">Enquiry System CRM</span>
        </h1>
        <p className="text-gray-600 text-lg mb-8">
          A modern platform to manage enquiries efficiently.  
          Track, assign, and close enquiries all in one place.
        </p>

        <div className="flex justify-center gap-4">
          <a
            href="/login"
            className="px-6 py-3 rounded-lg bg-sky-600 text-white font-medium shadow hover:bg-sky-700 transition"
          >
            Login
          </a>
          <a
            href="/register"
            className="px-6 py-3 rounded-lg border border-sky-600 text-sky-600 font-medium hover:bg-sky-50 transition"
          >
            Sign Up
          </a>
        </div>
      </div>

      {/* Footer */}
      <footer className="absolute bottom-5 text-sm text-gray-500">
        © {new Date().getFullYear()} Enquiry System. All rights reserved.
      </footer>
    </div>
  );
}
