/**
 * Footer — Rich Aurora Obsidian Theme v6.0
 * Deep obsidian, violet/gold gradient accents, premium glass panels
 */
import { Link } from "wouter";
import {
  Linkedin,
  Youtube,
  Facebook,
  Mail,
  MapPin,
  Phone,
  ArrowUpRight,
} from "lucide-react";

const footerLinks = {
  company: [
    { label: "🇺🇸 American Group LLC", href: "/american-group-llc" },
    { label: "🇮🇳 India Operations", href: "/safecodex-research" },
  ],
  products: [
    { label: "All 77 Products", href: "/products" },
    { label: "Enterprise AI & DevTools", href: "/products" },
    { label: "Consumer Mobile", href: "/products" },
    { label: "FinTech & E-Commerce", href: "/products" },
    { label: "CyberSecurity & Infra", href: "/products" },
  ],
  legal: [
    { label: "About Us", href: "/about" },
    { label: "Careers", href: "/careers" },
    { label: "Contact", href: "/contact" },
    { label: "Privacy Policy", href: "/privacy-policy" },
    { label: "Terms of Service", href: "/terms" },
    { label: "Support Center", href: "/support" },
  ],
};

const socials = [
  {
    icon: Linkedin,
    href: "https://linkedin.com/company/americangroupllc",
    label: "LinkedIn",
    color: "#0A66C2",
  },
  {
    icon: Youtube,
    href: "https://youtube.com/@americangroupllc",
    label: "YouTube",
    color: "#FF0000",
  },
  {
    icon: Facebook,
    href: "https://facebook.com/americangroupllc",
    label: "Facebook",
    color: "#1877F2",
  },
];

export default function Footer() {
  return (
    <footer
      style={{
        background: "#030408",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Aurora background glow */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
          background:
            "radial-gradient(ellipse 80% 40% at 20% 100%, rgba(124,58,237,0.08) 0%, transparent 60%), radial-gradient(ellipse 60% 30% at 80% 80%, rgba(245,158,11,0.05) 0%, transparent 55%)",
        }}
      />

      {/* Top gradient border */}
      <div
        style={{
          height: "1px",
          background:
            "linear-gradient(90deg, transparent, rgba(124,58,237,0.5) 30%, rgba(245,158,11,0.4) 70%, transparent)",
        }}
      />

      <div className="max-w-7xl mx-auto px-6 lg:px-10 py-16 relative z-10">
        {/* Main grid */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 mb-14">
          {/* Brand column */}
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center gap-3 mb-6 group w-fit">
              <div
                className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 transition-all duration-300 group-hover:scale-110"
                style={{
                  background:
                    "linear-gradient(135deg, #7C3AED 0%, #5B21B6 60%, #F59E0B 100%)",
                  boxShadow:
                    "0 0 24px rgba(124,58,237,0.45), inset 0 1px 0 rgba(255,255,255,0.15)",
                }}
              >
                <span
                  className="text-white font-black text-base"
                  style={{ fontFamily: "Sora, sans-serif" }}
                >
                  A
                </span>
              </div>
              <div>
                <div
                  className="font-bold text-white text-sm leading-tight"
                  style={{ fontFamily: "Sora, sans-serif" }}
                >
                  American Group LLC
                </div>
                <div
                  className="text-[10px] font-mono tracking-widest uppercase mt-0.5"
                  style={{ color: "rgba(167,139,250,0.5)" }}
                >
                  safecodeg.com
                </div>
              </div>
            </Link>

            <p
              className="text-sm leading-relaxed mb-6 max-w-xs"
              style={{ color: "rgba(148,163,184,0.7)" }}
            >
              A California-based technology company delivering world-class
              software — 77 products across 8 verticals, trusted by businesses
              and consumers worldwide.
            </p>

            <div
              className="flex items-center gap-2 text-xs mb-1.5"
              style={{ color: "rgba(100,116,139,0.8)" }}
            >
              <MapPin
                className="w-3.5 h-3.5 flex-shrink-0"
                style={{ color: "rgba(167,139,250,0.7)" }}
              />
              <span>🇺🇸 Santa Clara, CA · Est. 2018</span>
            </div>

            {/* Social icons */}
            <div className="flex items-center gap-2.5 mt-6">
              {socials.map(({ icon: Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-300 hover:scale-110 hover:-translate-y-0.5"
                  style={{
                    background: "rgba(124,58,237,0.08)",
                    border: "1px solid rgba(124,58,237,0.18)",
                    color: "rgba(167,139,250,0.7)",
                  }}
                  onMouseEnter={e => {
                    (e.currentTarget as HTMLElement).style.background =
                      "rgba(124,58,237,0.18)";
                    (e.currentTarget as HTMLElement).style.borderColor =
                      "rgba(124,58,237,0.4)";
                    (e.currentTarget as HTMLElement).style.color =
                      "rgba(196,181,253,1)";
                    (e.currentTarget as HTMLElement).style.boxShadow =
                      "0 4px 16px rgba(124,58,237,0.25)";
                  }}
                  onMouseLeave={e => {
                    (e.currentTarget as HTMLElement).style.background =
                      "rgba(124,58,237,0.08)";
                    (e.currentTarget as HTMLElement).style.borderColor =
                      "rgba(124,58,237,0.18)";
                    (e.currentTarget as HTMLElement).style.color =
                      "rgba(167,139,250,0.7)";
                    (e.currentTarget as HTMLElement).style.boxShadow = "none";
                  }}
                >
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Company links */}
          <div>
            <h4
              className="text-xs font-bold uppercase tracking-widest mb-5"
              style={{ color: "rgba(167,139,250,0.5)" }}
            >
              Company
            </h4>
            <ul className="space-y-3">
              {footerLinks.company.map(link => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm transition-all duration-200 flex items-center gap-1 group"
                    style={{ color: "rgba(100,116,139,0.8)" }}
                    onMouseEnter={e => {
                      (e.currentTarget as HTMLElement).style.color =
                        "rgba(196,181,253,1)";
                    }}
                    onMouseLeave={e => {
                      (e.currentTarget as HTMLElement).style.color =
                        "rgba(100,116,139,0.8)";
                    }}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Products links */}
          <div>
            <h4
              className="text-xs font-bold uppercase tracking-widest mb-5"
              style={{ color: "rgba(245,158,11,0.5)" }}
            >
              Products
            </h4>
            <ul className="space-y-3">
              {footerLinks.products.map(link => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm transition-all duration-200"
                    style={{ color: "rgba(100,116,139,0.8)" }}
                    onMouseEnter={e => {
                      (e.currentTarget as HTMLElement).style.color =
                        "rgba(253,230,138,0.9)";
                    }}
                    onMouseLeave={e => {
                      (e.currentTarget as HTMLElement).style.color =
                        "rgba(100,116,139,0.8)";
                    }}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources links */}
          <div>
            <h4
              className="text-xs font-bold uppercase tracking-widest mb-5"
              style={{ color: "rgba(6,182,212,0.5)" }}
            >
              Resources
            </h4>
            <ul className="space-y-3">
              {footerLinks.legal.map(link => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm transition-all duration-200"
                    style={{ color: "rgba(100,116,139,0.8)" }}
                    onMouseEnter={e => {
                      (e.currentTarget as HTMLElement).style.color =
                        "rgba(103,232,249,0.9)";
                    }}
                    onMouseLeave={e => {
                      (e.currentTarget as HTMLElement).style.color =
                        "rgba(100,116,139,0.8)";
                    }}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* India Office strip */}
        <div
          className="rounded-2xl p-6 mb-10"
          style={{
            background:
              "linear-gradient(135deg, rgba(124,58,237,0.07) 0%, rgba(17,19,39,0.6) 100%)",
            border: "1px solid rgba(124,58,237,0.15)",
            boxShadow: "inset 0 1px 0 rgba(255,255,255,0.04)",
          }}
        >
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
            <div className="flex items-start gap-4">
              <span className="text-3xl">🇮🇳</span>
              <div>
                <div
                  className="font-semibold text-sm mb-1"
                  style={{
                    color: "rgba(255,255,255,0.85)",
                    fontFamily: "Sora, sans-serif",
                  }}
                >
                  SafeCodeX Research Center Pvt. Ltd. — India Operations
                </div>
                <div
                  className="text-xs"
                  style={{ color: "rgba(100,116,139,0.7)" }}
                >
                  Hyderabad, Telangana, India · Engineering support, QA, and R&D
                  operations
                </div>
              </div>
            </div>
            <div className="flex flex-wrap gap-5 text-sm">
              <a
                href="tel:+15104589059"
                className="flex items-center gap-2 transition-colors duration-200"
                style={{ color: "rgba(100,116,139,0.7)" }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLElement).style.color =
                    "rgba(196,181,253,1)";
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLElement).style.color =
                    "rgba(100,116,139,0.7)";
                }}
              >
                <Phone
                  className="w-3.5 h-3.5"
                  style={{ color: "rgba(167,139,250,0.6)" }}
                />
                🇺🇸 +1 (510) 458-9059
              </a>
              <a
                href="tel:+917416866689"
                className="flex items-center gap-2 transition-colors duration-200"
                style={{ color: "rgba(100,116,139,0.7)" }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLElement).style.color =
                    "rgba(196,181,253,1)";
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLElement).style.color =
                    "rgba(100,116,139,0.7)";
                }}
              >
                <Phone
                  className="w-3.5 h-3.5"
                  style={{ color: "rgba(167,139,250,0.6)" }}
                />
                🇮🇳 +91 74168 66689
              </a>
              <a
                href="mailto:contact@safecodeg.com"
                className="flex items-center gap-2 transition-colors duration-200"
                style={{ color: "rgba(100,116,139,0.7)" }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLElement).style.color =
                    "rgba(253,230,138,0.9)";
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLElement).style.color =
                    "rgba(100,116,139,0.7)";
                }}
              >
                <Mail
                  className="w-3.5 h-3.5"
                  style={{ color: "rgba(245,158,11,0.6)" }}
                />
                contact@safecodeg.com
              </a>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div
          className="flex flex-col lg:flex-row items-center justify-between gap-4 pt-6"
          style={{ borderTop: "1px solid rgba(124,58,237,0.1)" }}
        >
          <div
            className="text-xs text-center lg:text-left"
            style={{ color: "rgba(71,85,105,0.8)" }}
          >
            © {new Date().getFullYear()}{" "}
            <span style={{ color: "rgba(100,116,139,0.8)" }}>
              American Group LLC
            </span>{" "}
            · All rights reserved.
            <span
              className="block mt-1"
              style={{ color: "rgba(51,65,85,0.8)" }}
            >
              Registered in California, USA. India operations managed by
              SafeCodeX Research Center Pvt. Ltd., Hyderabad.
            </span>
          </div>
          <div className="flex items-center gap-5 text-xs flex-shrink-0">
            {[
              { href: "/privacy-policy", label: "Privacy Policy" },
              { href: "/terms", label: "Terms of Service" },
              { href: "/support", label: "Support" },
            ].map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className="transition-colors duration-200"
                style={{ color: "rgba(71,85,105,0.8)" }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLElement).style.color =
                    "rgba(167,139,250,0.9)";
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLElement).style.color =
                    "rgba(71,85,105,0.8)";
                }}
              >
                {label}
              </Link>
            ))}
            <span style={{ color: "rgba(51,65,85,0.8)" }}>v6.0</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
