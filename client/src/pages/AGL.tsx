/**
 * American Group LLC Page — "Luminous Clarity" Design System
 * Deep navy + Electric Indigo palette
 */
import { useEffect } from "react";
import { Link } from "wouter";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { ArrowRight, ExternalLink, Github, Brain, Smartphone, Globe, Shield, Code2, Cpu, ChevronRight } from "lucide-react";

function useReveal() {
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => { entries.forEach((e) => { if (e.isIntersecting) e.target.classList.add("visible"); }); },
      { threshold: 0.08, rootMargin: "0px 0px -30px 0px" }
    );
    document.querySelectorAll(".reveal").forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);
}

const verticals = [
  {
    icon: Brain,
    emoji: "🤖",
    title: "Enterprise AI & DevTools",
    count: 14,
    color: "oklch(0.52 0.22 270)",
    bg: "oklch(0.52 0.22 270 / 0.08)",
    desc: "Frontier AI research, cognitive agents, enterprise document pipelines, and platform suites powering the next generation of intelligent software.",
    products: ["CogniCore AI Platform", "Thinking Machines Lab", "Cognission AI", "DocStream Enterprise", "DataCore Enterprise", "InfraForge Enterprise"],
  },
  {
    icon: Smartphone,
    emoji: "📱",
    title: "Consumer Mobile & Lifestyle",
    count: 22,
    color: "oklch(0.72 0.14 165)",
    bg: "oklch(0.72 0.14 165 / 0.08)",
    desc: "Native and cross-platform mobile apps for iOS, Android, and Wear OS covering health, fitness, entertainment, utilities, and daily life.",
    products: ["MyHealth", "VirtuBand", "NearServe", "Local Buddy", "Offline Buddy", "BuddyPlay"],
  },
  {
    icon: Globe,
    emoji: "💳",
    title: "FinTech & E-Commerce",
    count: 12,
    color: "oklch(0.78 0.18 75)",
    bg: "oklch(0.78 0.18 75 / 0.08)",
    desc: "Digital banking, payment processing, DeFi protocols, and e-commerce platforms for the modern financial ecosystem.",
    products: ["NeoBank Pro", "PayStream", "CryptoVault", "TradeSphere", "ShopForge", "InvoiceAI"],
  },
  {
    icon: Shield,
    emoji: "🔒",
    title: "CyberSecurity & Infrastructure",
    count: 11,
    color: "oklch(0.55 0.18 30)",
    bg: "oklch(0.55 0.18 30 / 0.08)",
    desc: "Enterprise security platforms, threat intelligence, zero-trust architecture, and cloud infrastructure automation.",
    products: ["SecureCore", "ThreatWatch", "ZeroTrust Gateway", "CloudArmor", "VaultOS", "SecAudit"],
  },
  {
    icon: Code2,
    emoji: "🏙️",
    title: "Spatial & Industry SaaS",
    count: 10,
    color: "oklch(0.65 0.16 310)",
    bg: "oklch(0.65 0.16 310 / 0.08)",
    desc: "AR/VR applications, spatial computing platforms, and vertical SaaS for healthcare, real estate, and industrial sectors.",
    products: ["SpaceForge AR", "MedSpatial", "RealityLayer", "IndustrialAR", "CasinoOS", "UrbanMesh"],
  },
  {
    icon: Cpu,
    emoji: "⚙️",
    title: "IoT & Hardware",
    count: 8,
    color: "oklch(0.60 0.15 200)",
    bg: "oklch(0.60 0.15 200 / 0.08)",
    desc: "Connected device firmware, edge computing platforms, and hardware-software integration for smart environments.",
    products: ["EdgeNode", "SmartHome OS", "SensorMesh", "FirmwareForge", "IoTGateway", "HardwareKit"],
  },
];

export default function AGLPage() {
  useReveal();

  return (
    <div className="min-h-screen bg-white">
      <Navigation />

      {/* Hero */}
      <section
        className="relative pt-28 pb-20 overflow-hidden"
        style={{ background: "oklch(0.14 0.04 255)" }}
      >
        <div
          className="absolute inset-0 opacity-25"
          style={{
            backgroundImage: `url(https://d2xsxph8kpxj0f.cloudfront.net/310519663397835904/iKtH34UE32MfRNT3w4zNEC/agl-section-bg-DMovm5egAhSafcXUUAPE6Q.webp)`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />
        <div className="absolute inset-0" style={{ background: "linear-gradient(135deg, oklch(0.14 0.04 255) 50%, oklch(0.20 0.08 270) 100%)" }} />
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 mb-6">
            <img
              src="https://d2xsxph8kpxj0f.cloudfront.net/310519663397835904/iKtH34UE32MfRNT3w4zNEC/agl-logo-36D5KR4hiUmfJgg45CfEdv.webp"
              alt="AGL"
              className="h-14 w-14 object-contain brightness-200"
            />
            <div>
              <div className="text-white/50 text-xs font-mono uppercase tracking-widest">🇺🇸 Headquarters · Santa Clara, California · S-Corp</div>
            </div>
          </div>
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-mono font-semibold mb-5"
            style={{ background: "oklch(0.52 0.22 270 / 0.2)", color: "oklch(0.75 0.15 270)", border: "1px solid oklch(0.52 0.22 270 / 0.35)" }}>
            🏢 Parent Organization · All 77 Products
          </div>
          <h1 className="text-5xl lg:text-7xl font-bold text-white mb-5" style={{ fontFamily: "'Playfair Display', serif" }}>
            American Group LLC
          </h1>
          <p className="text-xl text-white/70 max-w-2xl mb-4 leading-relaxed">
            The parent organization — a California-based S-Corp technology company shipping 77 products across Mobile, Enterprise AI, FinTech, CyberSecurity, Spatial Computing, and IoT & Hardware.
          </p>
          <p className="text-sm text-white/45 max-w-xl mb-8 font-mono">
            With our India engineering office, SafeCodeX Research Center, we operate as a single unified organization across two continents.
          </p>
          <div className="flex flex-wrap gap-4">
            <Link
              href="/products"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-white btn-press"
              style={{ background: "oklch(0.52 0.22 270)" }}
            >
              Explore All 77 Products <ArrowRight className="h-4 w-4" />
            </Link>
            <a
              href="https://americangroupllc.github.io"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-white border border-white/20 hover:bg-white/10 transition-all btn-press"
            >
              <Github className="h-4 w-4" /> View on GitHub
            </a>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 60" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
            <path d="M0 60L1440 0V60H0Z" fill="white" />
          </svg>
        </div>
      </section>

      {/* Stats */}
      <section className="py-14 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { value: "77", label: "Active Repositories", color: "oklch(0.52 0.22 270)" },
              { value: "6", label: "Business Verticals", color: "oklch(0.78 0.18 75)" },
              { value: "20+", label: "Mobile Apps Shipping", color: "oklch(0.72 0.14 165)" },
              { value: "28", label: "Future Roadmap Products", color: "oklch(0.22 0.06 255)" },
            ].map((s, i) => (
              <div key={i} className="reveal" style={{ transitionDelay: `${i * 80}ms` }}>
                <div className="text-5xl font-bold stat-number mb-2" style={{ color: s.color }}>{s.value}</div>
                <div className="text-xs font-medium text-slate-500 uppercase tracking-widest">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* About */}
      <section className="py-16 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl reveal">
            <div className="text-xs font-mono font-semibold uppercase tracking-widest text-slate-400 mb-3">About AGL</div>
            <h2 className="text-4xl font-bold text-slate-900 mb-6" style={{ fontFamily: "'Playfair Display', serif" }}>
              One Company, Many Surfaces
            </h2>
            <p className="text-slate-600 leading-relaxed mb-4">
              American Group LLC is a California-based S-Corp technology holding company operating across six distinct business verticals. We build the entire stack — from on-device LLMs and Wear OS apps to multi-cloud control planes, orbital edge-cloud orchestrators, and casino floor operating systems.
            </p>
            <p className="text-slate-600 leading-relaxed mb-4">
              Our 77 active repositories span Consumer Mobile Apps, Enterprise AI & DevTools, FinTech & E-Commerce, CyberSecurity & Infrastructure, Spatial Computing & Industry SaaS, and IoT & Hardware. Each vertical is engineered to operate independently while sharing a common identity platform, backend gateway, and CI/CD infrastructure.
            </p>
            <p className="text-slate-600 leading-relaxed">
              With a 28-product future roadmap covering AI SaaS, DevTools, and Cybersecurity verticals, American Group LLC is positioned to be a defining force in the next generation of software-driven enterprises.
            </p>
          </div>
        </div>
      </section>

      {/* Verticals */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14 reveal">
            <div className="text-xs font-mono font-semibold uppercase tracking-widest text-slate-400 mb-3">Portfolio</div>
            <h2 className="text-4xl lg:text-5xl font-bold text-slate-900" style={{ fontFamily: "'Playfair Display', serif" }}>
              Six business verticals
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {verticals.map((v, i) => (
              <div
                key={v.title}
                className={`reveal reveal-delay-${(i % 3) + 1} p-6 rounded-2xl border border-slate-100 bg-white product-card`}
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="h-12 w-12 rounded-xl flex items-center justify-center text-2xl" style={{ background: v.bg }}>
                    {v.emoji}
                  </div>
                  <div>
                    <div className="font-bold text-slate-900 text-sm">{v.title}</div>
                    <div className="text-xs font-mono text-slate-400">{v.count} products</div>
                  </div>
                </div>
                <p className="text-slate-600 text-sm leading-relaxed mb-4">{v.desc}</p>
                <div className="flex flex-wrap gap-1.5">
                  {v.products.slice(0, 4).map((p) => (
                    <span key={p} className="px-2 py-0.5 rounded-md text-xs font-medium bg-slate-50 text-slate-600 border border-slate-100">
                      {p}
                    </span>
                  ))}
                  {v.products.length > 4 && (
                    <span className="px-2 py-0.5 rounded-md text-xs font-medium bg-slate-50 text-slate-400 border border-slate-100">
                      +{v.products.length - 4} more
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
          <div className="text-center mt-10 reveal">
            <Link
              href="/products"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-xl font-semibold text-white btn-press"
              style={{ background: "oklch(0.52 0.22 270)" }}
            >
              View All 77 Products <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20" style={{ background: "oklch(0.97 0.005 255)" }}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center reveal">
          <h2 className="text-4xl font-bold text-slate-900 mb-4" style={{ fontFamily: "'Playfair Display', serif" }}>
            Ready to partner with AGL?
          </h2>
          <p className="text-slate-600 mb-8">
            Explore our full product portfolio or get in touch to discuss how we can work together.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/contact" className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl font-semibold text-white btn-press" style={{ background: "oklch(0.52 0.22 270)" }}>
              Contact Us <ArrowRight className="h-4 w-4" />
            </Link>
            <a href="https://americangroupllc.github.io" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl font-semibold text-slate-700 border border-slate-200 hover:bg-white transition-all btn-press">
              <ExternalLink className="h-4 w-4" /> Visit AGL Website
            </a>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
