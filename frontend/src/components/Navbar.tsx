import { useState } from "react";

interface NavbarProps {
  variant?: "landing" | "app";
  onNavigate?: (page: string) => void;
}

export function Navbar({ variant = "landing", onNavigate }: NavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleNavClick = (page: string) => {
    if (onNavigate) {
      onNavigate(page);
    }
    setMobileMenuOpen(false);
  };

  const handleLogoClick = () => {
    localStorage.removeItem("fullfill_visited");
    handleNavClick("home");
    window.location.reload();
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-200/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-12">
          {/* Logo - Always goes to landing */}
          <button
            onClick={handleLogoClick}
            className="text-lg font-semibold text-sky-600 hover:text-sky-700 transition-colors"
          >
            FullFill
          </button>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {variant === "landing" && (
              <>
                <button
                  onClick={() => handleNavClick("about")}
                  className="text-sm text-slate-600 hover:text-slate-900 transition-colors"
                >
                  About
                </button>
                <button
                  onClick={() => handleNavClick("data-sources")}
                  className="text-sm text-slate-600 hover:text-slate-900 transition-colors"
                >
                  Data Sources
                </button>
                <button
                  onClick={() => handleNavClick("search")}
                  className="text-sm text-slate-600 hover:text-slate-900 transition-colors"
                >
                  Search
                </button>
                <button
                  onClick={() => handleNavClick("login")}
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors"
                >
                  Sign In
                </button>
              </>
            )}
            {variant === "app" && (
              <>
                <button
                  onClick={() => handleNavClick("about")}
                  className="text-sm text-slate-600 hover:text-slate-900 transition-colors"
                >
                  About
                </button>
                <button
                  onClick={() => handleNavClick("data-sources")}
                  className="text-sm text-slate-600 hover:text-slate-900 transition-colors"
                >
                  Data Sources
                </button>
                <button
                  onClick={() => handleNavClick("admin340b")}
                  className="text-sm text-slate-600 hover:text-slate-900 transition-colors"
                >
                  340B Admin
                </button>
                <button
                  onClick={() => handleNavClick("profile")}
                  className="text-sm text-slate-600 hover:text-slate-900 transition-colors"
                >
                  Profile
                </button>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden text-slate-600 hover:text-slate-900 p-2"
            aria-label="Toggle menu"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              {mobileMenuOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-slate-200">
          <div className="px-4 py-3 space-y-3">
            {variant === "landing" && (
              <>
                <button
                  onClick={() => handleNavClick("about")}
                  className="block w-full text-left text-sm text-slate-600 hover:text-slate-900 transition-colors py-2"
                >
                  About
                </button>
                <button
                  onClick={() => handleNavClick("data-sources")}
                  className="block w-full text-left text-sm text-slate-600 hover:text-slate-900 transition-colors py-2"
                >
                  Data Sources
                </button>
                <button
                  onClick={() => handleNavClick("search")}
                  className="block w-full text-left text-sm text-slate-600 hover:text-slate-900 transition-colors py-2"
                >
                  Search
                </button>
                <button
                  onClick={() => handleNavClick("login")}
                  className="block w-full text-left text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors py-2"
                >
                  Sign In
                </button>
              </>
            )}
            {variant === "app" && (
              <>
                <button
                  onClick={() => handleNavClick("about")}
                  className="block w-full text-left text-sm text-slate-600 hover:text-slate-900 transition-colors py-2"
                >
                  About
                </button>
                <button
                  onClick={() => handleNavClick("data-sources")}
                  className="block w-full text-left text-sm text-slate-600 hover:text-slate-900 transition-colors py-2"
                >
                  Data Sources
                </button>
                <button
                  onClick={() => handleNavClick("admin340b")}
                  className="block w-full text-left text-sm text-slate-600 hover:text-slate-900 transition-colors py-2"
                >
                  340B Admin
                </button>
                <button
                  onClick={() => handleNavClick("profile")}
                  className="block w-full text-left text-sm text-slate-600 hover:text-slate-900 transition-colors py-2"
                >
                  Profile
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
