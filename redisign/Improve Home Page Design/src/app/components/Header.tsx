import { Search, Heart, ShoppingCart, User, Phone, MapPin } from "lucide-react";
import headerLogo from "figma:asset/b64cd68a4b5c3c9ad3f68577883f72e6fcd0450b.png";

export function Header() {
  return (
    <header className="bg-white border-b border-gray-100 sticky top-0 z-50">
      {/* Top bar */}
      <div className="bg-gray-50 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-2 text-sm">
            <div className="flex items-center gap-6">
              <a href="tel:8-800-500-87-29" className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors">
                <Phone className="size-4" />
                <span>8-800-500-87-29</span>
              </a>
              <a href="#" className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors">
                <MapPin className="size-4" />
                <span>St. Petersburg, Nevsky Prospect, 114-116</span>
              </a>
            </div>
            <div className="flex items-center gap-4">
              <a href="#about" className="text-gray-600 hover:text-gray-900 transition-colors">About Us</a>
              <a href="#delivery" className="text-gray-600 hover:text-gray-900 transition-colors">Delivery</a>
              <a href="#contacts" className="text-gray-600 hover:text-gray-900 transition-colors">Contacts</a>
            </div>
          </div>
        </div>
      </div>

      {/* Main header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between py-4">
          {/* Logo */}
          <div className="flex-shrink-0">
            <img src={headerLogo} alt="AROMA Boutique" className="h-16" />
          </div>

          {/* Search bar */}
          <div className="flex-1 max-w-2xl mx-12">
            <div className="relative">
              <input
                type="text"
                placeholder="Search for fragrances"
                className="w-full pl-4 pr-12 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
              />
              <button className="absolute right-2 top-1/2 -translate-y-1/2 bg-gray-900 text-white p-2 rounded-md hover:bg-gray-800 transition-colors">
                <Search className="size-5" />
              </button>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-4">
            <button className="relative p-2 hover:bg-gray-50 rounded-lg transition-colors">
              <Heart className="size-6 text-gray-700" />
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs size-5 flex items-center justify-center rounded-full">
                1
              </span>
            </button>
            <button className="p-2 hover:bg-gray-50 rounded-lg transition-colors">
              <ShoppingCart className="size-6 text-gray-700" />
            </button>
            <button className="p-2 hover:bg-gray-50 rounded-lg transition-colors">
              <User className="size-6 text-gray-700" />
            </button>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center gap-8 py-4">
            <a href="#business" className="text-gray-700 hover:text-amber-600 transition-colors">
              Fragrances for business
            </a>
            <a href="#home" className="text-gray-700 hover:text-amber-600 transition-colors">
              Home fragrances
            </a>
            <a href="#comfort" className="text-gray-700 hover:text-amber-600 transition-colors">
              Comfort and interior
            </a>
            <a href="#present" className="text-gray-700 hover:text-amber-600 transition-colors">
              Present
            </a>
            <a href="#bathroom" className="text-gray-700 hover:text-amber-600 transition-colors">
              Bathroom
            </a>
            <a href="#dealers" className="text-gray-700 hover:text-amber-600 transition-colors">
              For dealers
            </a>
            <a href="#stock" className="text-amber-600 hover:text-amber-700 transition-colors">
              Stock
            </a>
            <a href="#sale" className="text-red-600 hover:text-red-700 transition-colors">
              Sale
            </a>
          </div>
        </div>
      </nav>
    </header>
  );
}
