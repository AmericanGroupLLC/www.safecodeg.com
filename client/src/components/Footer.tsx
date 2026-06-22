/**
 * Footer — MNC Enterprise Dark Theme v5.0
 * Full dark, premium layout, AGL-first, all legal links
 */
import { Link } from "wouter";
import { Linkedin, Youtube, Facebook, Mail, MapPin, Phone } from "lucide-react";

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
  { icon: Linkedin, href: "https://linkedin.com/company/americangroupllc", label: "LinkedIn" },
  { icon: Youtube, href: "https://youtube.com/@americangroupllc", label: "YouTube" },
  { icon: Facebook, href: "https://facebook.com/americangroupllc", label: "Facebook" },
];

export default function Footer() {
  return (
    <footer style={{ background: "#040710", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
      <div className="max-w-7xl mx-auto px-6 lg:px-10 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 mb-16">

          {/* Brand column */}
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center gap-3 mb-5 group w-fit">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "linear-gradient(135deg, #6366F1, #4F46E5)" }}>
                <span className="text-white font-black text-base" style={{ fontFamily: "Sora, sans-serif" }}>A</span>
              </div>
              <div>
                <div className="font-bold text-white text-sm leading-tight">American Group LLC</div>
                <div className="text-xs text-white/30 font-mono tracking-widest uppercase">safecodeg.com</div>
              </div>
            </Link>

            <p className="text-slate-500 text-sm leading-relaxed mb-6 max-w-xs">
              A California-based technology company delivering world-class software, 77 products across 8 verticals, and enterprise-grade IT solutions — shipped worldwide.
            </p>

            <div className="flex items-center gap-2 text-slate-600 text-xs mb-1">
              <MapPin className="w-3.5 h-3.5 text-indigo-500 flex-shrink-0" />
              <span>🇺🇸 Santa Clara, CA · Est. 2018</span>
            </div>

            <div className="flex items-center gap-3 mt-5">
              {socials.map(({ icon: Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="w-9 h-9 rounded-lg flex items-center justify-center text-slate-500 hover:text-white transition-all duration-200 hover:scale-110"
                  style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}
                >
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Link columns */}
          <div>
            <h4 className="text-white/35 text-xs font-semibold uppercase tracking-widest mb-5">Company</h4>
            <ul className="space-y-3">
              {footerLinks.company.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-slate-500 hover:text-white text-sm transition-colors duration-200">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-white/35 text-xs font-semibold uppercase tracking-widest mb-5">Products</h4>
            <ul className="space-y-3">
              {footerLinks.products.map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className="text-slate-500 hover:text-white text-sm transition-colors duration-200">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-white/35 text-xs font-semibold uppercase tracking-widest mb-5">Resources</h4>
            <ul className="space-y-3">
              {footerLinks.legal.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-slate-500 hover:text-white text-sm transition-colors duration-200">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* India Office row */}
        <div className="py-8 border-y border-white/5 mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="flex items-start gap-4">
              <span className="text-2xl">🇮🇳</span>
              <div>
                <div className="text-white/75 font-semibold text-sm mb-1">SafeCodeX Research Center Pvt. Ltd. — India Operations</div>
                <div className="text-slate-500 text-xs">Hyderabad, Telangana, India · Engineering support, QA, and R&D operations</div>
              </div>
            </div>
            <div className="flex flex-wrap gap-6 text-sm">
              <a href="tel:+15104589059" className="flex items-center gap-2 text-slate-500 hover:text-white transition-colors">
                <Phone className="w-3.5 h-3.5 text-indigo-400" />
                🇺🇸 +1 (510) 458-9059
              </a>
              <a href="tel:+917416866689" className="flex items-center gap-2 text-slate-500 hover:text-white transition-colors">
                <Phone className="w-3.5 h-3.5 text-indigo-400" />
                🇮🇳 +91 74168 66689
              </a>
              <a href="mailto:contact@safecodeg.com" className="flex items-center gap-2 text-slate-500 hover:text-white transition-colors">
                <Mail className="w-3.5 h-3.5 text-indigo-400" />
                contact@safecodeg.com
              </a>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
          <div className="text-slate-600 text-xs text-center lg:text-left">
            © {new Date().getFullYear()} <span className="text-slate-500">American Group LLC</span> · All rights reserved.
            <span className="block mt-1 text-slate-700">American Group LLC is a registered company in California, USA. India operations managed by SafeCodeX Research Center Pvt. Ltd., Hyderabad.</span>
          </div>
          <div className="flex items-center gap-5 text-xs flex-shrink-0">
            <Link href="/privacy-policy" className="text-slate-600 hover:text-white transition-colors">Privacy Policy</Link>
            <Link href="/terms" className="text-slate-600 hover:text-white transition-colors">Terms of Service</Link>
            <Link href="/support" className="text-slate-600 hover:text-white transition-colors">Support</Link>
            <span className="text-slate-700">v5.0</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
