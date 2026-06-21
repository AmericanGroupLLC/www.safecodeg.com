/**
 * Footer Component — "Luminous Clarity" Design System
 * Deep navy background, AGL-primary brand
 */
import { Link } from "wouter";
import { Linkedin, Youtube, Facebook, Mail, MapPin, Phone } from "lucide-react";

const footerLinks = {
  companies: [
    { label: "🇺🇸 American Group LLC", href: "/american-group-llc" },
    { label: "🇮🇳 India Operations", href: "/safecodex-research" },
  ],
  products: [
    { label: "All 77 Products", href: "/products" },
    { label: "Enterprise AI & DevTools", href: "/products#enterprise-ai" },
    { label: "Consumer Mobile", href: "/products#mobile" },
    { label: "FinTech & E-Commerce", href: "/products#fintech" },
    { label: "CyberSecurity", href: "/products#cybersecurity" },
  ],
  company: [
    { label: "About Us", href: "/about" },
    { label: "Careers", href: "/careers" },
    { label: "Contact", href: "/contact" },
    { label: "Privacy Policy", href: "/privacy-policy" },
    { label: "Terms of Service", href: "/terms" },
    { label: "Support Center", href: "/support" },
  ],
};

const socials = [
  { icon: Linkedin, href: "https://linkedin.com/company/americangroupllc", label: "LinkedIn" },
  { icon: Youtube, href: "https://youtube.com/@americangroupllc", label: "YouTube" },
  { icon: Facebook, href: "https://facebook.com/americangroupllc", label: "Facebook" },
];

export default function Footer() {
  return (
    <footer style={{ background: "oklch(0.14 0.04 255)" }} className="text-white">
      {/* Main footer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 lg:gap-8">
          {/* Brand column */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <img
                src="https://d2xsxph8kpxj0f.cloudfront.net/310519663397835904/iKtH34UE32MfRNT3w4zNEC/agl-logo-36D5KR4hiUmfJgg45CfEdv.webp"
                alt="AGL"
                className="h-9 w-9 object-contain brightness-200"
              />

            </div>
            <h3 className="font-bold text-lg text-white mb-1" style={{ fontFamily: "'Playfair Display', serif" }}>
              American Group LLC
            </h3>
            <p className="text-sm text-slate-400 mt-3 leading-relaxed max-w-xs">
              A California-based technology company delivering world-class software outsourcing, 77 products across 6 verticals, and enterprise-grade IT solutions — shipped worldwide.
            </p>
            <div className="flex items-center gap-1 mt-4">
              <span className="text-xl">🇺🇸</span>
              <span className="text-xs text-slate-500 ml-2 font-mono">Santa Clara, CA · Est. 2018</span>
            </div>
            {/* Socials */}
            <div className="flex items-center gap-3 mt-6">
              {socials.map(({ icon: Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="p-2 rounded-lg bg-white/5 hover:bg-white/15 transition-colors text-slate-400 hover:text-white"
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Links columns */}
          <div>
            <h4 className="text-xs font-mono font-semibold uppercase tracking-widest text-slate-500 mb-4">Company</h4>
            <ul className="space-y-2.5">
              {footerLinks.companies.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm text-slate-400 hover:text-white transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-mono font-semibold uppercase tracking-widest text-slate-500 mb-4">Products</h4>
            <ul className="space-y-2.5">
              {footerLinks.products.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm text-slate-400 hover:text-white transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-mono font-semibold uppercase tracking-widest text-slate-500 mb-4">Company</h4>
            <ul className="space-y-2.5">
              {footerLinks.company.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm text-slate-400 hover:text-white transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
            <div className="mt-6 space-y-2">
              <div className="flex items-start gap-2 text-slate-400">
                <MapPin className="h-3.5 w-3.5 mt-0.5 shrink-0 text-slate-500" />
                <span className="text-xs">Santa Clara, CA, USA</span>
              </div>
              <div className="flex items-start gap-2 text-slate-400">
                <Phone className="h-3.5 w-3.5 mt-0.5 shrink-0 text-slate-500" />
                <span className="text-xs">🇺🇸 +1 (510) 458-9059</span>
              </div>
              <div className="flex items-start gap-2 text-slate-400">
                <MapPin className="h-3.5 w-3.5 mt-0.5 shrink-0 text-[oklch(0.78_0.18_75)]" />
                <span className="text-xs">Hyderabad, India</span>
              </div>
              <div className="flex items-start gap-2 text-slate-400">
                <Phone className="h-3.5 w-3.5 mt-0.5 shrink-0 text-[oklch(0.78_0.18_75)]" />
                <span className="text-xs">🇮🇳 +91 74168 66689</span>
              </div>
              <div className="flex items-start gap-2 text-slate-400">
                <Mail className="h-3.5 w-3.5 mt-0.5 shrink-0 text-slate-500" />
                <span className="text-xs">contact@safecodeg.com</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {/* Copyright full line */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mb-3">
            <div className="flex flex-col sm:flex-row items-center gap-2 text-center sm:text-left">
              <p className="text-xs text-slate-600">
                &copy; {new Date().getFullYear()} <span className="text-slate-500 font-medium">American Group LLC</span> 
              </p>
              <span className="hidden sm:inline text-slate-700">·</span>
              <p className="text-xs text-slate-700">All rights reserved.</p>
            </div>
            <div className="flex items-center gap-4">
              <Link href="/privacy-policy" className="text-xs text-slate-600 hover:text-slate-400 transition-colors">Privacy Policy</Link>
              <Link href="/terms" className="text-xs text-slate-600 hover:text-slate-400 transition-colors">Terms of Service</Link>
              <Link href="/support" className="text-xs text-slate-600 hover:text-slate-400 transition-colors">Support</Link>
              <span className="text-xs font-mono text-slate-700">v2.0.0</span>
            </div>
          </div>
          {/* Trademark sub-line */}
          <p className="text-center text-xs text-slate-800 mt-2">
            American Group LLC is a registered company in California, USA. All product names, logos, and brands are property of their respective owners.
            India operations managed by SafeCodeX Research Center Pvt. Ltd., Hyderabad.
          </p>
        </div>
      </div>
    </footer>
  );
}
