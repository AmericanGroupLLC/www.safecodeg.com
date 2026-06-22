/**
 * Navigation — MNC Enterprise Dark Theme
 * Always dark, frosted glass on scroll, mega-style dropdown
 * AGL-first identity
 */
import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { Menu, X, ChevronDown, Building2, MapPin, Layers, Users, Phone, Mail } from "lucide-react";

const navLinks = [
  { label: "Home", href: "/" },
  {
    label: "About Us",
    href: "#",
    children: [
      { label: "American Group LLC", href: "/american-group-llc", desc: "HQ · Santa Clara, California", flag: "🇺🇸" },
      { label: "India Operations", href: "/safecodex-research", desc: "Hyderabad · SafeCodeX Pvt. Ltd.", flag: "🇮🇳" },
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
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
    setDropdownOpen(false);
  }, [location]);

  return (
    <>
      <header
        className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
        style={{
          background: scrolled
            ? "rgba(7,11,20,0.92)"
            : "rgba(7,11,20,0.60)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          borderBottom: scrolled ? "1px solid rgba(255,255,255,0.08)" : "1px solid transparent",
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10">
          <div className="flex items-center justify-between h-16 lg:h-20">

            {/* ── Logo ─────────────────────────────────────── */}
            <Link href="/" className="flex items-center gap-3 group">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "linear-gradient(135deg, #6366F1, #4F46E5)" }}>
                <span className="text-white font-black text-sm" style={{ fontFamily: "Sora, sans-serif" }}>A</span>
              </div>
              <div className="hidden sm:block">
                <div className="font-bold text-sm leading-tight text-white tracking-tight">
                  American Group LLC
                </div>
                <div className="text-[10px] font-mono tracking-widest uppercase text-white/40">
                  🇺🇸 Santa Clara, CA
                </div>
              </div>
            </Link>

            {/* ── Desktop Nav ───────────────────────────────── */}
            <nav className="hidden lg:flex items-center gap-1">
              {navLinks.map((link) =>
                link.children ? (
                  <div key={link.label} className="relative">
                    <button
                      onMouseEnter={() => setDropdownOpen(true)}
                      onMouseLeave={() => setDropdownOpen(false)}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium text-white/75 hover:text-white hover:bg-white/8 transition-all duration-200"
                    >
                      {link.label}
                      <ChevronDown className={`h-3.5 w-3.5 transition-transform duration-200 ${dropdownOpen ? "rotate-180" : ""}`} />
                    </button>
                    {dropdownOpen && (
                      <div
                        className="absolute top-full left-0 mt-2 w-72 rounded-2xl p-2 z-50"
                        style={{ background: "rgba(10,15,30,0.97)", border: "1px solid rgba(255,255,255,0.1)", boxShadow: "0 20px 60px rgba(0,0,0,0.6), 0 0 40px rgba(99,102,241,0.1)", backdropFilter: "blur(20px)" }}
                        onMouseEnter={() => setDropdownOpen(true)}
                        onMouseLeave={() => setDropdownOpen(false)}
                      >
                        {link.children.map((child) => (
                          <Link
                            key={child.href}
                            href={child.href}
                            className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/6 transition-colors group"
                          >
                            <span className="text-xl">{child.flag}</span>
                            <div>
                              <div className="text-sm font-semibold text-white group-hover:text-indigo-300 transition-colors">{child.label}</div>
                              <div className="text-xs text-slate-500 mt-0.5">{child.desc}</div>
                            </div>
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                      location === link.href
                        ? "text-white bg-indigo-500/20 border border-indigo-500/30"
                        : "text-white/75 hover:text-white hover:bg-white/8"
                    }`}
                  >
                    {link.label}
                  </Link>
                )
              )}
            </nav>

            {/* ── CTA + Mobile Toggle ───────────────────────── */}
            <div className="flex items-center gap-3">
              <Link
                href="/contact"
                className="hidden lg:inline-flex items-center px-5 py-2.5 rounded-xl text-sm font-bold text-white transition-all duration-300 hover:scale-105 hover:shadow-lg"
                style={{ background: "linear-gradient(135deg, #6366F1, #4F46E5)", boxShadow: "0 0 20px rgba(99,102,241,0.3)" }}
              >
                Get in Touch
              </Link>
              <button
                onClick={() => setMobileOpen(!mobileOpen)}
                className="lg:hidden p-2 rounded-lg text-white/75 hover:text-white hover:bg-white/8 transition-colors"
                aria-label="Toggle menu"
              >
                {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* ── Mobile Menu ───────────────────────────────────────────────────── */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
          <div className="absolute top-0 right-0 bottom-0 w-80 flex flex-col" style={{ background: "rgba(7,11,20,0.98)", borderLeft: "1px solid rgba(255,255,255,0.08)" }}>
            <div className="flex items-center justify-between p-5 border-b border-white/8">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: "linear-gradient(135deg, #6366F1, #4F46E5)" }}>
                  <span className="text-white font-black text-xs">A</span>
                </div>
                <span className="font-bold text-white text-sm">American Group LLC</span>
              </div>
              <button onClick={() => setMobileOpen(false)} className="p-1.5 rounded-lg hover:bg-white/8 text-white/60 hover:text-white transition-colors">
                <X className="h-5 w-5" />
              </button>
            </div>
            <nav className="flex-1 overflow-y-auto p-4 space-y-1">
              {navLinks.map((link) =>
                link.children ? (
                  <div key={link.label}>
                    <div className="px-4 py-2 text-xs font-mono font-semibold uppercase tracking-widest text-white/30 mt-3 mb-1">
                      {link.label}
                    </div>
                    {link.children.map((child) => (
                      <Link
                        key={child.href}
                        href={child.href}
                        className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/6 transition-colors"
                      >
                        <span className="text-lg">{child.flag}</span>
                        <div>
                          <div className="text-sm font-semibold text-white">{child.label}</div>
                          <div className="text-xs text-slate-500">{child.desc}</div>
                        </div>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`block px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                      location === link.href
                        ? "bg-indigo-500/20 text-indigo-300 border border-indigo-500/30"
                        : "text-white/75 hover:bg-white/6 hover:text-white"
                    }`}
                  >
                    {link.label}
                  </Link>
                )
              )}
            </nav>
            <div className="p-4 border-t border-white/8">
              <Link
                href="/contact"
                className="block w-full text-center px-5 py-3 rounded-xl text-sm font-bold text-white transition-all"
                style={{ background: "linear-gradient(135deg, #6366F1, #4F46E5)" }}
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
