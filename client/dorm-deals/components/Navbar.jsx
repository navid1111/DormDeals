export default function Navbar() {
  return (
    <nav className="bg-blue-600 py-3 px-6 shadow-md flex items-center gap-3">
      {/* Logo Image */}
      <img
        src="https://www.shutterstock.com/image-vector/online-shop-logos-logo-suitable-260nw-2307863637.jpg"
        alt="Logo"
        className="h-8 w-8 rounded-sm bg-white object-cover"
      />

      {/* Brand Text */}
      <h1 className="text-white text-xl font-semibold tracking-wide">
        Student Marketplace
      </h1>
    </nav>
  );
}
