/**
 * Navigation — Rich Aurora Obsidian Theme
 * Deep obsidian glass, violet glow, gold CTA, premium feel
 */
import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { Menu, X, ChevronDown } from "lucide-react";

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
  { label: "Dimensions", href: "/dimensions" },
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
        className="fixed top-0 left-0 right-0 z-50 transition-all duration-500"
        style={{
          background: scrolled
            ? "rgba(5,6,15,0.92)"
            : "rgba(5,6,15,0.55)",
          backdropFilter: "blur(28px) saturate(180%)",
          WebkitBackdropFilter: "blur(28px) saturate(180%)",
          borderBottom: scrolled
            ? "1px solid rgba(124,58,237,0.18)"
            : "1px solid rgba(124,58,237,0.06)",
          boxShadow: scrolled
            ? "0 1px 0 rgba(124,58,237,0.1), 0 8px 32px rgba(0,0,0,0.4)"
            : "none",
        }}
      >
        {/* Top accent line */}
        <div style={{ height: "2px", background: "linear-gradient(90deg, transparent, #7C3AED 30%, #F59E0B 70%, transparent)", opacity: scrolled ? 0 : 0.6 }} />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10">
          <div className="flex items-center justify-between h-16 lg:h-20">

            {/* ── Logo ─────────────────────────────────────── */}
            <Link href="/" className="flex items-center gap-3 group">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-all duration-300 group-hover:scale-110"
                style={{
                  background: "linear-gradient(135deg, #7C3AED 0%, #5B21B6 60%, #F59E0B 100%)",
                  boxShadow: "0 0 20px rgba(124,58,237,0.5), inset 0 1px 0 rgba(255,255,255,0.15)"
                }}
              >
                <span className="text-white font-black text-sm" style={{ fontFamily: "Sora, sans-serif" }}>A</span>
              </div>
              <div className="hidden sm:block">
                <div className="font-bold text-sm leading-tight text-white tracking-tight" style={{ fontFamily: "Sora, sans-serif" }}>
                  American Group LLC
                </div>
                <div className="text-[10px] font-mono tracking-widest uppercase" style={{ color: "rgba(167,139,250,0.6)" }}>
                  🇺🇸 Santa Clara, CA
                </div>
              </div>
            </Link>

            {/* ── Desktop Nav ───────────────────────────────── */}
            <nav className="hidden lg:flex items-center gap-0.5">
              {navLinks.map((link) =>
                link.children ? (
                  <div key={link.label} className="relative">
                    <button
                      onMouseEnter={() => setDropdownOpen(true)}
                      onMouseLeave={() => setDropdownOpen(false)}
                      className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200"
                      style={{
                        color: dropdownOpen ? "rgba(196,181,253,1)" : "rgba(255,255,255,0.7)",
                        background: dropdownOpen ? "rgba(124,58,237,0.1)" : "transparent",
                      }}
                    >
                      {link.label}
                      <ChevronDown className={`h-3.5 w-3.5 transition-transform duration-200 ${dropdownOpen ? "rotate-180" : ""}`} />
                    </button>
                    {dropdownOpen && (
                      <div
                        className="absolute top-full left-0 mt-2 w-76 rounded-2xl p-2 z-50"
                        style={{
                          background: "rgba(8,9,20,0.97)",
                          border: "1px solid rgba(124,58,237,0.25)",
                          boxShadow: "0 24px 64px rgba(0,0,0,0.7), 0 0 40px rgba(124,58,237,0.12)",
                          backdropFilter: "blur(24px)",
                          minWidth: "280px",
                        }}
                        onMouseEnter={() => setDropdownOpen(true)}
                        onMouseLeave={() => setDropdownOpen(false)}
                      >
                        {/* Dropdown header accent */}
                        <div style={{ height: "1px", background: "linear-gradient(90deg, #7C3AED, #F59E0B)", margin: "0 0 8px 0", borderRadius: "1px", opacity: 0.6 }} />
                        {link.children.map((child) => (
                          <Link
                            key={child.href}
                            href={child.href}
                            className="flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-200 group"
                            style={{ color: "rgba(255,255,255,0.8)" }}
                            onMouseEnter={(e) => {
                              (e.currentTarget as HTMLElement).style.background = "rgba(124,58,237,0.1)";
                              (e.currentTarget as HTMLElement).style.color = "white";
                            }}
                            onMouseLeave={(e) => {
                              (e.currentTarget as HTMLElement).style.background = "transparent";
                              (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.8)";
                            }}
                          >
                            <span className="text-2xl">{child.flag}</span>
                            <div>
                              <div className="text-sm font-semibold" style={{ fontFamily: "Sora, sans-serif" }}>{child.label}</div>
                              <div className="text-xs mt-0.5" style={{ color: "rgba(167,139,250,0.6)" }}>{child.desc}</div>
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
                    className="px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200"
                    style={{
                      color: location === link.href ? "rgba(196,181,253,1)" : "rgba(255,255,255,0.7)",
                      background: location === link.href ? "rgba(124,58,237,0.12)" : "transparent",
                      border: location === link.href ? "1px solid rgba(124,58,237,0.25)" : "1px solid transparent",
                    }}
                    onMouseEnter={(e) => {
                      if (location !== link.href) {
                        (e.currentTarget as HTMLElement).style.color = "white";
                        (e.currentTarget as HTMLElement).style.background = "rgba(124,58,237,0.07)";
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (location !== link.href) {
                        (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.7)";
                        (e.currentTarget as HTMLElement).style.background = "transparent";
                      }
                    }}
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
                className="hidden lg:inline-flex items-center px-5 py-2.5 rounded-xl text-sm font-bold text-white transition-all duration-300"
                style={{
                  background: "linear-gradient(135deg, #F59E0B 0%, #D97706 100%)",
                  color: "#1C0A00",
                  boxShadow: "0 0 20px rgba(245,158,11,0.35), inset 0 1px 0 rgba(255,255,255,0.2)",
                  fontFamily: "Sora, sans-serif",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.transform = "translateY(-1px)";
                  (e.currentTarget as HTMLElement).style.boxShadow = "0 6px 28px rgba(245,158,11,0.5), inset 0 1px 0 rgba(255,255,255,0.25)";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
                  (e.currentTarget as HTMLElement).style.boxShadow = "0 0 20px rgba(245,158,11,0.35), inset 0 1px 0 rgba(255,255,255,0.2)";
                }}
              >
                Get in Touch
              </Link>
              <button
                onClick={() => setMobileOpen(!mobileOpen)}
                className="lg:hidden p-2.5 rounded-xl transition-colors"
                style={{ color: "rgba(255,255,255,0.75)", background: "rgba(124,58,237,0.08)", border: "1px solid rgba(124,58,237,0.15)" }}
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
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
          <div
            className="absolute top-0 right-0 bottom-0 w-80 flex flex-col"
            style={{
              background: "rgba(5,6,15,0.98)",
              borderLeft: "1px solid rgba(124,58,237,0.2)",
              boxShadow: "-20px 0 60px rgba(0,0,0,0.6)",
            }}
          >
            {/* Mobile header */}
            <div className="flex items-center justify-between p-5" style={{ borderBottom: "1px solid rgba(124,58,237,0.15)" }}>
              <div className="flex items-center gap-2.5">
                <div
                  className="w-8 h-8 rounded-xl flex items-center justify-center"
                  style={{ background: "linear-gradient(135deg, #7C3AED, #F59E0B)", boxShadow: "0 0 12px rgba(124,58,237,0.4)" }}
                >
                  <span className="text-white font-black text-xs" style={{ fontFamily: "Sora, sans-serif" }}>A</span>
                </div>
                <span className="font-bold text-white text-sm" style={{ fontFamily: "Sora, sans-serif" }}>American Group LLC</span>
              </div>
              <button
                onClick={() => setMobileOpen(false)}
                className="p-1.5 rounded-lg transition-colors"
                style={{ color: "rgba(255,255,255,0.5)", background: "rgba(124,58,237,0.08)" }}
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Mobile nav links */}
            <nav className="flex-1 overflow-y-auto p-4 space-y-1">
              {navLinks.map((link) =>
                link.children ? (
                  <div key={link.label}>
                    <div className="px-4 py-2 text-xs font-mono font-semibold uppercase tracking-widest mt-3 mb-1" style={{ color: "rgba(167,139,250,0.5)" }}>
                      {link.label}
                    </div>
                    {link.children.map((child) => (
                      <Link
                        key={child.href}
                        href={child.href}
                        className="flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all"
                        style={{ color: "rgba(255,255,255,0.8)" }}
                        onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "rgba(124,58,237,0.1)"; }}
                        onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "transparent"; }}
                      >
                        <span className="text-xl">{child.flag}</span>
                        <div>
                          <div className="text-sm font-semibold text-white">{child.label}</div>
                          <div className="text-xs mt-0.5" style={{ color: "rgba(167,139,250,0.5)" }}>{child.desc}</div>
                        </div>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="block px-4 py-3 rounded-xl text-sm font-medium transition-all"
                    style={{
                      color: location === link.href ? "rgba(196,181,253,1)" : "rgba(255,255,255,0.75)",
                      background: location === link.href ? "rgba(124,58,237,0.15)" : "transparent",
                      border: location === link.href ? "1px solid rgba(124,58,237,0.3)" : "1px solid transparent",
                    }}
                  >
                    {link.label}
                  </Link>
                )
              )}
            </nav>

            {/* Mobile CTA */}
            <div className="p-4" style={{ borderTop: "1px solid rgba(124,58,237,0.15)" }}>
              <Link
                href="/contact"
                className="block w-full text-center px-5 py-3.5 rounded-xl text-sm font-bold transition-all"
                style={{
                  background: "linear-gradient(135deg, #F59E0B 0%, #D97706 100%)",
                  color: "#1C0A00",
                  boxShadow: "0 4px 20px rgba(245,158,11,0.3)",
                  fontFamily: "Sora, sans-serif",
                }}
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
