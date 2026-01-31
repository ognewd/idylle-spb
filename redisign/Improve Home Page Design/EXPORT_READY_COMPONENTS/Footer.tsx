import { Facebook, Instagram, Twitter, Youtube, Mail, Phone, MapPin, Clock } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-gradient-to-b from-gray-50 to-gray-100 border-t border-gray-200">
      {/* Newsletter section */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mx-auto text-center space-y-6">
            <div className="flex items-center justify-center gap-3 text-white">
              <Mail className="size-8" />
              <h3 className="text-3xl font-light">Subscribe to news</h3>
            </div>
            <p className="text-gray-300">
              Get exclusive offers and be the first to know about new collections
            </p>
            <div className="flex flex-col sm:flex-row gap-3 mt-6">
              <input
                type="email"
                placeholder="Your email"
                className="flex-1 px-6 py-4 rounded-xl border-0 focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
              <button className="bg-amber-600 hover:bg-amber-700 text-white px-8 py-4 rounded-xl font-medium transition-colors duration-300 whitespace-nowrap">
                Subscribe
              </button>
            </div>
            <label className="flex items-center justify-center gap-2 text-sm text-gray-300 cursor-pointer">
              <input type="checkbox" className="rounded" />
              <span>I agree to receive news and special offers</span>
            </label>
          </div>
        </div>
      </div>

      {/* Main footer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid md:grid-cols-4 gap-12">
          {/* Company info */}
          <div className="space-y-6">
            <div className="text-2xl font-light tracking-tight">
              Aroma <span className="font-normal">Boutique</span>
            </div>
            <p className="text-gray-600 leading-relaxed">
              Exclusive fragrances and home goods from leading global brands. We create an atmosphere of luxury and comfort in your home.
            </p>
            <div className="flex items-center gap-3">
              <a href="#" className="size-10 flex items-center justify-center rounded-full bg-gray-200 hover:bg-gray-900 text-gray-700 hover:text-white transition-all duration-300">
                <Facebook className="size-5" />
              </a>
              <a href="#" className="size-10 flex items-center justify-center rounded-full bg-gray-200 hover:bg-gray-900 text-gray-700 hover:text-white transition-all duration-300">
                <Instagram className="size-5" />
              </a>
              <a href="#" className="size-10 flex items-center justify-center rounded-full bg-gray-200 hover:bg-gray-900 text-gray-700 hover:text-white transition-all duration-300">
                <Twitter className="size-5" />
              </a>
              <a href="#" className="size-10 flex items-center justify-center rounded-full bg-gray-200 hover:bg-gray-900 text-gray-700 hover:text-white transition-all duration-300">
                <Youtube className="size-5" />
              </a>
            </div>
          </div>

          {/* Quick links */}
          <div className="space-y-4">
            <h4 className="text-lg font-medium text-gray-900">Quick links</h4>
            <ul className="space-y-3">
              {["Catalog", "Brands", "New items", "Sale", "About Us"].map((link) => (
                <li key={link}>
                  <a href="#" className="text-gray-600 hover:text-amber-600 transition-colors">
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Help Desk */}
          <div className="space-y-4">
            <h4 className="text-lg font-medium text-gray-900">Help Desk</h4>
            <ul className="space-y-3">
              {[
                "Delivery and payment",
                "Returns and exchanges",
                "Size chart",
                "Frequently asked questions",
                "Contacts"
              ].map((link) => (
                <li key={link}>
                  <a href="#" className="text-gray-600 hover:text-amber-600 transition-colors">
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contacts */}
          <div className="space-y-4">
            <h4 className="text-lg font-medium text-gray-900">Contacts</h4>
            <div className="space-y-4">
              <a href="tel:8-800-500-87-29" className="flex items-start gap-3 text-gray-600 hover:text-amber-600 transition-colors group">
                <Phone className="size-5 mt-0.5 flex-shrink-0" />
                <span>8-800-500-87-29</span>
              </a>
              <a href="mailto:info@aromaboutique.ru" className="flex items-start gap-3 text-gray-600 hover:text-amber-600 transition-colors group">
                <Mail className="size-5 mt-0.5 flex-shrink-0" />
                <span>info@aromaboutique.ru</span>
              </a>
              <div className="flex items-start gap-3 text-gray-600">
                <MapPin className="size-5 mt-0.5 flex-shrink-0" />
                <div>
                  <div>St. Petersburg,</div>
                  <div>Nevsky Prospect, 114-116</div>
                  <div className="text-sm text-gray-500">Nevsky Center Shopping Mall, 4th floor</div>
                </div>
              </div>
              <div className="flex items-start gap-3 text-gray-600">
                <Clock className="size-5 mt-0.5 flex-shrink-0" />
                <div>
                  <div>Mon-Sun: 10:00 - 23:00</div>
                  <div className="text-sm text-gray-500">(seven days a week)</div>
                </div>
              </div>
            </div>

            <div className="pt-4 space-y-2">
              <p className="text-sm text-gray-600">Help with ordering:</p>
              <div className="flex gap-2">
                <button className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                  WhatsApp
                </button>
                <button className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                  Telegram
                </button>
              </div>
              <p className="text-sm text-gray-600">8-921-599-00-90</p>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-gray-200 bg-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-gray-600">
            <p>© 2026 AROMA BOUTIQUE. All rights reserved.</p>
            <div className="flex gap-6">
              <a href="#" className="hover:text-amber-600 transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-amber-600 transition-colors">Terms of Service</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
