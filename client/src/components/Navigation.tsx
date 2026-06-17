/**
 * Navigation Component — "Luminous Clarity" Design System
 * Transparent on top, frosted glass on scroll
 * Dual-company identity with 🇺🇸🇮🇳 badge
 */
import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { Menu, X, ChevronDown } from "lucide-react";

const navLinks = [
  { label: "Home", href: "/" },
  {
    label: "Companies",
    href: "#",
    children: [
      { label: "🇺🇸 American Group LLC", href: "/american-group-llc", desc: "Santa Clara, California" },
      { label: "🇮🇳 SafeCodeX Research", href: "/safecodex-research", desc: "India R&D Center" },
    ],
  },
  { label: "Products", href: "/products" },
  { label: "About", href: "/about" },
  { label: "Careers", href: "/careers" },
  { label: "Contact", href: "/contact" },
];

export default function Navigation() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [location] = useLocation();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
    setDropdownOpen(false);
  }, [location]);

  const isHome = location === "/";

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled || !isHome
            ? "bg-white/92 backdrop-blur-xl shadow-sm border-b border-slate-100"
            : "bg-transparent"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 lg:h-20">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-3 group">
              <div className="flex items-center gap-2">
                <img
                  src="https://d2xsxph8kpxj0f.cloudfront.net/310519663397835904/iKtH34UE32MfRNT3w4zNEC/agl-logo-36D5KR4hiUmfJgg45CfEdv.webp"
                  alt="AGL Logo"
                  className="h-8 w-8 object-contain"
                />
                <img
                  src="https://d2xsxph8kpxj0f.cloudfront.net/310519663397835904/iKtH34UE32MfRNT3w4zNEC/scg-logo-W2HQYWhiqBqMj8z6dwYjXz.webp"
                  alt="SCG Logo"
                  className="h-7 w-7 object-contain"
                />
              </div>
              <div className="hidden sm:block">
                <div className={`font-bold text-sm leading-tight tracking-tight transition-colors ${scrolled || !isHome ? "text-[oklch(0.22_0.06_255)]" : "text-white"}`}>
                  AGL <span className="text-[oklch(0.52_0.22_270)]">&</span> SafeCodeX
                </div>
                <div className={`text-[10px] font-mono tracking-widest uppercase transition-colors ${scrolled || !isHome ? "text-slate-400" : "text-white/60"}`}>
                  🇺🇸 California · India 🇮🇳
                </div>
              </div>
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden lg:flex items-center gap-1">
              {navLinks.map((link) =>
                link.children ? (
                  <div key={link.label} className="relative">
                    <button
                      onMouseEnter={() => setDropdownOpen(true)}
                      onMouseLeave={() => setDropdownOpen(false)}
                      className={`flex items-center gap-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        scrolled || !isHome
                          ? "text-slate-700 hover:text-[oklch(0.52_0.22_270)] hover:bg-slate-50"
                          : "text-white/90 hover:text-white hover:bg-white/10"
                      }`}
                    >
                      {link.label}
                      <ChevronDown className={`h-3.5 w-3.5 transition-transform ${dropdownOpen ? "rotate-180" : ""}`} />
                    </button>
                    {dropdownOpen && (
                      <div
                        className="absolute top-full left-0 mt-1 w-64 bg-white rounded-xl shadow-xl border border-slate-100 p-2 z-50"
                        onMouseEnter={() => setDropdownOpen(true)}
                        onMouseLeave={() => setDropdownOpen(false)}
                      >
                        {link.children.map((child) => (
                          <Link
                            key={child.href}
                            href={child.href}
                            className="flex flex-col px-4 py-3 rounded-lg hover:bg-slate-50 transition-colors group"
                          >
                            <span className="text-sm font-semibold text-slate-800 group-hover:text-[oklch(0.52_0.22_270)]">
                              {child.label}
                            </span>
                            <span className="text-xs text-slate-400 mt-0.5">{child.desc}</span>
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      location === link.href
                        ? "text-[oklch(0.52_0.22_270)] bg-indigo-50"
                        : scrolled || !isHome
                        ? "text-slate-700 hover:text-[oklch(0.52_0.22_270)] hover:bg-slate-50"
                        : "text-white/90 hover:text-white hover:bg-white/10"
                    }`}
                  >
                    {link.label}
                  </Link>
                )
              )}
            </nav>

            {/* CTA + Mobile Toggle */}
            <div className="flex items-center gap-3">
              <Link
                href="/contact"
                className="hidden lg:inline-flex items-center px-5 py-2.5 bg-[oklch(0.52_0.22_270)] text-white text-sm font-semibold rounded-lg hover:bg-[oklch(0.45_0.22_270)] transition-colors btn-press shadow-md shadow-indigo-200"
              >
                Get in Touch
              </Link>
              <button
                onClick={() => setMobileOpen(!mobileOpen)}
                className={`lg:hidden p-2 rounded-lg transition-colors ${
                  scrolled || !isHome ? "text-slate-700 hover:bg-slate-100" : "text-white hover:bg-white/10"
                }`}
                aria-label="Toggle menu"
              >
                {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setMobileOpen(false)} />
          <div className="absolute top-0 right-0 bottom-0 w-80 bg-white shadow-2xl flex flex-col">
            <div className="flex items-center justify-between p-5 border-b border-slate-100">
              <span className="font-bold text-slate-800">Menu</span>
              <button onClick={() => setMobileOpen(false)} className="p-1.5 rounded-lg hover:bg-slate-100">
                <X className="h-5 w-5 text-slate-600" />
              </button>
            </div>
            <nav className="flex-1 overflow-y-auto p-4 space-y-1">
              {navLinks.map((link) =>
                link.children ? (
                  <div key={link.label}>
                    <div className="px-4 py-2 text-xs font-mono font-semibold uppercase tracking-widest text-slate-400 mt-3 mb-1">
                      {link.label}
                    </div>
                    {link.children.map((child) => (
                      <Link
                        key={child.href}
                        href={child.href}
                        className="flex flex-col px-4 py-3 rounded-xl hover:bg-slate-50 transition-colors"
                      >
                        <span className="text-sm font-semibold text-slate-800">{child.label}</span>
                        <span className="text-xs text-slate-400">{child.desc}</span>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`block px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                      location === link.href
                        ? "bg-indigo-50 text-[oklch(0.52_0.22_270)]"
                        : "text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    {link.label}
                  </Link>
                )
              )}
            </nav>
            <div className="p-4 border-t border-slate-100">
              <Link
                href="/contact"
                className="block w-full text-center px-5 py-3 bg-[oklch(0.52_0.22_270)] text-white text-sm font-semibold rounded-xl hover:bg-[oklch(0.45_0.22_270)] transition-colors"
              >
                Get in Touch
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
