/**
 * Home Page — "Luminous Clarity" Design System
 * Hero + Stats + Companies + Services + Products Preview + CTA
 */
import { useEffect, useRef } from "react";
import { Link } from "wouter";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { ArrowRight, ExternalLink, Code2, Brain, Shield, Smartphone, Globe, Cpu, ChevronRight, Star, Zap, Target } from "lucide-react";

// Animated counter component
function CountUp({ target, suffix = "" }: { target: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const hasRun = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !hasRun.current) {
            hasRun.current = true;
            const duration = 2000;
            const start = Date.now();
            const tick = () => {
              const elapsed = Date.now() - start;
              const progress = Math.min(elapsed / duration, 1);
              const eased = 1 - Math.pow(1 - progress, 3);
              el.textContent = Math.round(eased * target) + suffix;
              if (progress < 1) requestAnimationFrame(tick);
            };
            requestAnimationFrame(tick);
          }
        });
      },
      { threshold: 0.5 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [target, suffix]);

  return <span ref={ref}>0{suffix}</span>;
}

// Scroll reveal setup
function useReveal() {
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) entry.target.classList.add("visible");
        });
      },
      { threshold: 0.08, rootMargin: "0px 0px -30px 0px" }
    );
    document.querySelectorAll(".reveal").forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);
}

const verticals = [
  { icon: Brain, label: "Enterprise AI & DevTools", count: "14", color: "oklch(0.52 0.22 270)" },
  { icon: Smartphone, label: "Consumer Mobile", count: "22", color: "oklch(0.72 0.14 165)" },
  { icon: Globe, label: "FinTech & E-Commerce", count: "12", color: "oklch(0.78 0.18 75)" },
  { icon: Shield, label: "CyberSecurity & Infra", count: "11", color: "oklch(0.55 0.18 30)" },
  { icon: Code2, label: "Spatial & Industry SaaS", count: "10", color: "oklch(0.65 0.16 310)" },
  { icon: Cpu, label: "IoT & Hardware", count: "8", color: "oklch(0.60 0.15 200)" },
];

const services = [
  {
    icon: Code2,
    title: "Software Outsourcing",
    desc: "End-to-end custom software development, mobile apps, and cloud platforms — delivered on time, within budget.",
    color: "oklch(0.52 0.22 270)",
  },
  {
    icon: Brain,
    title: "AI & R&D Services",
    desc: "Frontier research in AI, IoT, blockchain, and emerging technologies. We transform ideas into competitive advantages.",
    color: "oklch(0.78 0.18 75)",
  },
  {
    icon: Shield,
    title: "CyberSecurity",
    desc: "Enterprise-grade security infrastructure, threat intelligence, and compliance solutions for modern businesses.",
    color: "oklch(0.55 0.18 30)",
  },
  {
    icon: Zap,
    title: "Product Engineering",
    desc: "From concept to launch — we build, test, and ship 77+ products across 6 verticals with zero compromises.",
    color: "oklch(0.72 0.14 165)",
  },
];

export default function Home() {
  useReveal();

  return (
    <div className="min-h-screen bg-white">
      <Navigation />

      {/* ═══════════════════════════════════════════════════
          HERO SECTION
      ═══════════════════════════════════════════════════ */}
      <section
        className="relative min-h-screen flex items-center overflow-hidden"
        style={{
          background: "oklch(0.14 0.04 255)",
        }}
      >
        {/* Hero background image */}
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `url(https://d2xsxph8kpxj0f.cloudfront.net/310519663397835904/iKtH34UE32MfRNT3w4zNEC/hero-bg-oEb7iPGD3yJxqUDGfa3cGo.webp)`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />
        {/* Gradient overlay */}
        <div className="absolute inset-0" style={{ background: "linear-gradient(135deg, oklch(0.14 0.04 255) 40%, oklch(0.20 0.08 270) 100%)" }} />

        {/* Decorative outline numbers */}
        <div className="absolute right-0 top-1/2 -translate-y-1/2 opacity-5 select-none pointer-events-none hidden lg:block">
          <span style={{ fontFamily: "'Playfair Display', serif", fontSize: "22rem", fontWeight: 900, color: "transparent", WebkitTextStroke: "2px white", lineHeight: 1 }}>
            77
          </span>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-20">
          <div className="max-w-4xl">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/20 text-white/80 text-sm font-medium mb-8">
              <span className="text-base">🇺🇸</span>
              <span>Santa Clara, California</span>
              <span className="text-white/30">·</span>
              <span className="text-base">🇮🇳</span>
              <span>India R&D Center</span>
            </div>

            {/* Main headline */}
            <h1
              className="text-5xl sm:text-6xl lg:text-7xl xl:text-8xl font-bold text-white leading-[1.05] mb-6"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              Two continents.
              <br />
              <span style={{ color: "oklch(0.78 0.18 75)" }}>One standard</span>
              <br />
              of excellence.
            </h1>

            <p className="text-lg sm:text-xl text-white/70 max-w-2xl mb-10 leading-relaxed" style={{ fontFamily: "'DM Sans', sans-serif" }}>
              American Group LLC and SafeCodeX Research Center — delivering world-class software outsourcing, frontier AI research, and 77 products across 6 verticals. Built in California, researched in India, shipped worldwide.
            </p>

            <div className="flex flex-wrap gap-4">
              <Link
                href="/products"
                className="inline-flex items-center gap-2 px-7 py-4 rounded-xl font-semibold text-white transition-all btn-press shadow-lg"
                style={{ background: "oklch(0.52 0.22 270)", boxShadow: "0 8px 32px oklch(0.52 0.22 270 / 0.4)" }}
              >
                Explore All 77 Products
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/about"
                className="inline-flex items-center gap-2 px-7 py-4 rounded-xl font-semibold text-white border border-white/20 hover:bg-white/10 transition-all btn-press"
              >
                Our Story
                <ChevronRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom diagonal cut */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 80" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
            <path d="M0 80L1440 0V80H0Z" fill="white" />
          </svg>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════
          STATS BAR
      ═══════════════════════════════════════════════════ */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 lg:gap-12">
            {[
              { value: 77, suffix: "", label: "Active Products", color: "oklch(0.52 0.22 270)" },
              { value: 6, suffix: "", label: "Business Verticals", color: "oklch(0.78 0.18 75)" },
              { value: 20, suffix: "+", label: "Mobile Apps", color: "oklch(0.72 0.14 165)" },
              { value: 28, suffix: "", label: "Future Roadmap", color: "oklch(0.22 0.06 255)" },
            ].map((stat, i) => (
              <div key={i} className="reveal text-center" style={{ transitionDelay: `${i * 80}ms` }}>
                <div
                  className="text-5xl lg:text-6xl font-bold mb-2 stat-number"
                  style={{ color: stat.color }}
                >
                  <CountUp target={stat.value} suffix={stat.suffix} />
                </div>
                <div className="text-sm font-medium text-slate-500 uppercase tracking-widest">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════
          COMPANIES SECTION
      ═══════════════════════════════════════════════════ */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14 reveal">
              <div className="text-xs font-mono font-semibold uppercase tracking-widest text-slate-400 mb-3">Our Organization</div>
            <h2 className="text-4xl lg:text-5xl font-bold text-slate-900" style={{ fontFamily: "'Playfair Display', serif" }}>
              One company, two locations
            </h2>
            <p className="text-slate-500 mt-3 max-w-xl mx-auto text-sm">American Group LLC is the parent organization. SafeCodeX Research Center is our India engineering office — same team, same mission.</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* AGL Card */}
            <div className="reveal reveal-delay-1 rounded-2xl overflow-hidden group cursor-pointer" onClick={() => window.location.href = "/american-group-llc"}>
              <div
                className="relative h-64 overflow-hidden"
                style={{
                  backgroundImage: `url(https://d2xsxph8kpxj0f.cloudfront.net/310519663397835904/iKtH34UE32MfRNT3w4zNEC/agl-section-bg-DMovm5egAhSafcXUUAPE6Q.webp)`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }}
              >
                <div className="absolute inset-0" style={{ background: "linear-gradient(to top, oklch(0.14 0.04 255) 0%, transparent 60%)" }} />
                <div className="absolute bottom-6 left-6 flex items-center gap-3">
                  <img
                    src="https://d2xsxph8kpxj0f.cloudfront.net/310519663397835904/iKtH34UE32MfRNT3w4zNEC/agl-logo-36D5KR4hiUmfJgg45CfEdv.webp"
                    alt="AGL"
                    className="h-10 w-10 object-contain brightness-200"
                  />
                  <div>
                    <div className="text-white font-bold text-lg" style={{ fontFamily: "'Playfair Display', serif" }}>American Group LLC</div>
                    <div className="text-white/60 text-xs font-mono">🇺🇸 Santa Clara, California · S-Corp</div>
                  </div>
                </div>
              </div>
              <div className="bg-white border border-slate-100 p-6 group-hover:border-indigo-200 transition-colors">
                <p className="text-slate-600 text-sm leading-relaxed mb-4">
                  The parent organization — a California-based S-Corp technology company operating across six business verticals. From on-device LLMs and Wear OS apps to multi-cloud control planes and orbital edge-cloud orchestrators. This is the primary entity behind all 77 products.
                </p>
                <div className="flex flex-wrap gap-2 mb-5">
                  {["77 Active Repos", "6 Verticals", "20+ Mobile Apps", "8 Enterprise Platforms"].map((tag) => (
                    <span key={tag} className="px-3 py-1 rounded-full text-xs font-medium bg-indigo-50 text-indigo-700">{tag}</span>
                  ))}
                </div>
                <Link href="/american-group-llc" className="inline-flex items-center gap-2 text-sm font-semibold text-indigo-600 hover:text-indigo-800 transition-colors">
                  Explore AGL <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>

            {/* SCG Card */}
            <div className="reveal reveal-delay-2 rounded-2xl overflow-hidden group cursor-pointer" onClick={() => window.location.href = "/safecodex-research"}>
              <div
                className="relative h-64 overflow-hidden"
                style={{
                  backgroundImage: `url(https://d2xsxph8kpxj0f.cloudfront.net/310519663397835904/iKtH34UE32MfRNT3w4zNEC/scg-section-bg-6MiGbt85QJDHzM3FnDARSD.webp)`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }}
              >
                <div className="absolute inset-0" style={{ background: "linear-gradient(to top, oklch(0.18 0.04 75) 0%, transparent 60%)" }} />
                <div className="absolute bottom-6 left-6 flex items-center gap-3">
                  <img
                    src="https://d2xsxph8kpxj0f.cloudfront.net/310519663397835904/iKtH34UE32MfRNT3w4zNEC/scg-logo-W2HQYWhiqBqMj8z6dwYjXz.webp"
                    alt="SCG"
                    className="h-10 w-10 object-contain"
                  />
                  <div>
                    <div className="text-white font-bold text-lg" style={{ fontFamily: "'Playfair Display', serif" }}>SafeCodeX Research Center</div>
                    <div className="text-white/60 text-xs font-mono">🇮🇳 India · Pvt. Ltd.</div>
                  </div>
                </div>
              </div>
              <div className="bg-white border border-slate-100 p-6 group-hover:border-amber-200 transition-colors">
                <p className="text-slate-600 text-sm leading-relaxed mb-4">
                  Our India engineering office — incorporated as SafeCodeX Research Center Pvt. Ltd. to enable local R&D operations and talent access. Same organization, same standards, operating from India to serve global clients.
                </p>
                <div className="flex flex-wrap gap-2 mb-5">
                  {["India Office", "R&D Hub", "Engineering Talent", "Software Outsourcing"].map((tag) => (
                    <span key={tag} className="px-3 py-1 rounded-full text-xs font-medium bg-amber-50 text-amber-700">{tag}</span>
                  ))}
                </div>
                <Link href="/safecodex-research" className="inline-flex items-center gap-2 text-sm font-semibold text-amber-600 hover:text-amber-800 transition-colors">
                  Explore SafeCodeX <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════
          PRODUCT VERTICALS
      ═══════════════════════════════════════════════════ */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between mb-14 gap-6">
            <div className="reveal">
              <div className="text-xs font-mono font-semibold uppercase tracking-widest text-slate-400 mb-3">Product Portfolio</div>
              <h2 className="text-4xl lg:text-5xl font-bold text-slate-900" style={{ fontFamily: "'Playfair Display', serif" }}>
                77 products.
                <br />
                <span className="gradient-text-indigo">6 verticals.</span>
              </h2>
            </div>
            <div className="reveal reveal-delay-2">
              <Link
                href="/products"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-white btn-press"
                style={{ background: "oklch(0.52 0.22 270)" }}
              >
                View All Products <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {verticals.map((v, i) => (
              <Link
                key={v.label}
                href="/products"
                className={`reveal reveal-delay-${i + 1} product-card flex items-center gap-4 p-6 rounded-2xl border border-slate-100 bg-white hover:shadow-lg transition-all`}
              >
                <div
                  className="h-12 w-12 rounded-xl flex items-center justify-center shrink-0"
                  style={{ background: `${v.color.replace(")", " / 0.12)")}` }}
                >
                  <v.icon className="h-6 w-6" style={{ color: v.color }} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-slate-800 text-sm">{v.label}</div>
                  <div className="text-xs text-slate-400 mt-0.5 font-mono">{v.count} products</div>
                </div>
                <ChevronRight className="h-4 w-4 text-slate-300 shrink-0" />
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════
          SERVICES SECTION
      ═══════════════════════════════════════════════════ */}
      <section className="py-20" style={{ background: "oklch(0.97 0.005 255)" }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14 reveal">
            <div className="text-xs font-mono font-semibold uppercase tracking-widest text-slate-400 mb-3">What We Do</div>
            <h2 className="text-4xl lg:text-5xl font-bold text-slate-900" style={{ fontFamily: "'Playfair Display', serif" }}>
              Accelerating your success
              <br />
              <span className="gradient-text-indigo">with innovative IT solutions</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {services.map((s, i) => (
              <div
                key={s.title}
                className={`reveal reveal-delay-${i + 1} p-8 rounded-2xl bg-white border border-slate-100 hover:shadow-lg transition-all group`}
              >
                <div
                  className="h-14 w-14 rounded-2xl flex items-center justify-center mb-5"
                  style={{ background: `${s.color.replace(")", " / 0.1)")}` }}
                >
                  <s.icon className="h-7 w-7" style={{ color: s.color }} />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3" style={{ fontFamily: "'Playfair Display', serif" }}>
                  {s.title}
                </h3>
                <p className="text-slate-600 leading-relaxed text-sm">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>


      {/* ═══════════════════════════════════════════════════
          TECH TICKER
      ═══════════════════════════════════════════════════ */}
      <section className="py-8 overflow-hidden border-y border-slate-100" style={{ background: "oklch(0.97 0.005 255)" }}>
        <div className="flex whitespace-nowrap">
          <div className="marquee-track flex items-center gap-12 px-6">
            {["React Native", "Swift", "Python", "TypeScript", "Flutter", "Dart", "FastAPI", "Node.js", "AI/ML", "LLM", "RAG", "Blockchain", "IoT", "Wear OS", "ARKit", "WebAssembly", "Kubernetes", "AWS", "GCP", "Azure", "React Native", "Swift", "Python", "TypeScript", "Flutter", "Dart", "FastAPI", "Node.js", "AI/ML", "LLM", "RAG", "Blockchain", "IoT", "Wear OS", "ARKit", "WebAssembly", "Kubernetes", "AWS", "GCP", "Azure"].map((tech, i) => (
              <span key={i} className="text-sm font-mono font-medium text-slate-400 flex items-center gap-3">
                <span className="h-1 w-1 rounded-full bg-indigo-300 inline-block" />
                {tech}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════
          CTA SECTION
      ═══════════════════════════════════════════════════ */}
      <section className="py-24" style={{ background: "oklch(0.14 0.04 255)" }}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center reveal">
          <div className="text-xs font-mono font-semibold uppercase tracking-widest text-white/40 mb-4">Ready to Build?</div>
          <h2 className="text-4xl lg:text-6xl font-bold text-white mb-6" style={{ fontFamily: "'Playfair Display', serif" }}>
            Let's shape the future
            <br />
            <span style={{ color: "oklch(0.78 0.18 75)" }}>of technology together.</span>
          </h2>
          <p className="text-white/60 text-lg mb-10 max-w-2xl mx-auto">
            Partner with American Group LLC and SafeCodeX Research Center to unlock the full potential of your projects.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-xl font-semibold text-white btn-press"
              style={{ background: "oklch(0.52 0.22 270)", boxShadow: "0 8px 32px oklch(0.52 0.22 270 / 0.4)" }}
            >
              Start a Project <ArrowRight className="h-4 w-4" />
            </Link>
            <a
              href="https://safecodeg.com"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-xl font-semibold text-white border border-white/20 hover:bg-white/10 transition-all btn-press"
            >
              Visit SafeCodeG.com <ExternalLink className="h-4 w-4" />
            </a>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
