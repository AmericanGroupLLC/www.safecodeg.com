/**
 * American Group LLC Page — MNC Enterprise Dark Theme v5.0
 * Full dark, premium design, AGL-first identity
 */
import { motion } from "framer-motion";
import { Link } from "wouter";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { ArrowRight, Brain, Smartphone, Globe, Shield, Code2, Cpu, TrendingUp, Users, CheckCircle, Building2 } from "lucide-react";

const verticals = [
  {
    icon: Brain,
    emoji: "🤖",
    title: "Enterprise AI & DevTools",
    count: 12,
    color: "#818CF8",
    bg: "rgba(99,102,241,0.12)",
    desc: "Frontier AI research, cognitive agents, enterprise document pipelines, and platform suites powering the next generation of intelligent software.",
    products: ["CogniCore AI Platform", "Thinking Machines Lab", "Cognission AI", "DocStream Enterprise", "DataCore Enterprise", "InfraForge Enterprise"],
  },
  {
    icon: Smartphone,
    emoji: "📱",
    title: "Consumer Mobile & Lifestyle",
    count: 18,
    color: "#34D399",
    bg: "rgba(16,185,129,0.12)",
    desc: "Native and cross-platform mobile apps for iOS, Android, and Wear OS covering health, fitness, entertainment, utilities, and daily life.",
    products: ["MyHealth", "VirtuBand", "NearServe", "Local Buddy", "Offline Buddy", "BuddyPlay"],
  },
  {
    icon: TrendingUp,
    emoji: "💳",
    title: "FinTech & E-Commerce",
    count: 14,
    color: "#FBBF24",
    bg: "rgba(245,158,11,0.12)",
    desc: "Digital banking, payment processing, DeFi protocols, and e-commerce platforms for the modern financial ecosystem.",
    products: ["ApexMarketWatch", "BudgetBuddy", "CryptoCore", "PayFlow", "DealHunter", "ShopSmart"],
  },
  {
    icon: Shield,
    emoji: "🛡️",
    title: "CyberSecurity & Infra",
    count: 8,
    color: "#F87171",
    bg: "rgba(239,68,68,0.12)",
    desc: "Enterprise security systems, SIEM platforms, zero-trust networking, and infrastructure automation for modern organizations.",
    products: ["SecureCore", "ThreatWatch", "ZeroTrust Gateway", "CloudArmor", "VaultOS", "SecAudit"],
  },
  {
    icon: Code2,
    emoji: "🏙️",
    title: "Spatial & Industry SaaS",
    count: 10,
    color: "#A78BFA",
    bg: "rgba(139,92,246,0.12)",
    desc: "AR/VR applications, spatial computing platforms, and vertical SaaS for healthcare, real estate, and industrial sectors.",
    products: ["SpaceForge AR", "MedSpatial", "RealityLayer", "IndustrialAR", "CasinoOS", "UrbanMesh"],
  },
  {
    icon: Cpu,
    emoji: "⚙️",
    title: "IoT & Hardware",
    count: 8,
    color: "#60A5FA",
    bg: "rgba(59,130,246,0.12)",
    desc: "Connected device firmware, edge computing platforms, and hardware-software integration for smart environments.",
    products: ["EdgeNode", "SmartHome OS", "SensorMesh", "FirmwareForge", "IoTGateway", "HardwareKit"],
  },
];

const highlights = [
  { value: "77+", label: "Active Products", color: "#818CF8" },
  { value: "8", label: "Business Verticals", color: "#FBBF24" },
  { value: "2018", label: "Year Founded", color: "#34D399" },
  { value: "28+", label: "Roadmap Products", color: "#F87171" },
];

export default function AGLPage() {
  return (
    <div style={{ background: "#070B14", color: "white", minHeight: "100vh" }}>
      <Navigation />

      {/* ── Hero ──────────────────────────────────────────────────────────── */}
      <section className="relative pt-36 pb-24 overflow-hidden">
        <div className="absolute inset-0" style={{ background: "radial-gradient(ellipse at 15% 60%, rgba(99,102,241,0.18), transparent 55%)" }} />
        <div className="absolute inset-0" style={{ background: "radial-gradient(ellipse at 85% 30%, rgba(245,158,11,0.07), transparent 50%)" }} />
        <div className="absolute inset-0 opacity-[0.025]" style={{ backgroundImage: "linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)", backgroundSize: "80px 80px" }} />

        <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-10">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-indigo-500/25 bg-indigo-500/8 text-indigo-300 text-xs font-semibold uppercase tracking-widest mb-8">
              <Building2 className="w-3.5 h-3.5" /> 🇺🇸 Headquarters · Santa Clara, California · S-Corp
            </div>
            <h1 className="font-black text-white mb-6 tracking-tight" style={{ fontFamily: "Sora, sans-serif", fontSize: "clamp(3rem, 7vw, 6rem)" }}>
              American Group LLC
            </h1>
            <p className="text-xl text-slate-300 max-w-3xl leading-relaxed mb-4">
              The parent organization — a California-based S-Corp technology company shipping <strong className="text-white">77 products</strong> across Mobile, Enterprise AI, FinTech, CyberSecurity, Spatial Computing, and IoT & Hardware.
            </p>
            <p className="text-slate-500 text-base max-w-2xl mb-10">
              With our India engineering office, SafeCodeX Research Center, we operate as a single unified organization across two continents.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link href="/products">
                <button className="flex items-center gap-2 px-7 py-3.5 rounded-xl font-bold text-white transition-all duration-300 hover:scale-105" style={{ background: "linear-gradient(135deg, #6366F1, #4F46E5)", boxShadow: "0 0 30px rgba(99,102,241,0.3)" }}>
                  Explore All 77 Products <ArrowRight className="w-4 h-4" />
                </button>
              </Link>
              <Link href="/contact">
                <button className="flex items-center gap-2 px-7 py-3.5 rounded-xl font-bold border border-white/15 text-white hover:bg-white/8 transition-all duration-300">
                  Request a Demo
                </button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── Stats ─────────────────────────────────────────────────────────── */}
      <section className="py-16 border-y border-white/5">
        <div className="max-w-7xl mx-auto px-6 lg:px-10">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {highlights.map((h, i) => (
              <motion.div
                key={h.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.6 }}
                className="p-6 rounded-2xl border border-white/8 bg-white/[0.025] text-center"
              >
                <div className="text-4xl font-black mb-1" style={{ fontFamily: "Sora, sans-serif", color: h.color }}>{h.value}</div>
                <div className="text-slate-400 text-sm">{h.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── About ─────────────────────────────────────────────────────────── */}
      <section className="py-28">
        <div className="max-w-7xl mx-auto px-6 lg:px-10">
          <div className="grid lg:grid-cols-2 gap-16 items-start">
            <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.7 }}>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-indigo-500/25 bg-indigo-500/8 text-indigo-300 text-xs font-semibold uppercase tracking-widest mb-8">
                About AGL
              </div>
              <h2 className="font-black text-white mb-6 tracking-tight" style={{ fontFamily: "Sora, sans-serif", fontSize: "clamp(2rem, 4vw, 3rem)" }}>
                One Company,<br />
                <span style={{ background: "linear-gradient(135deg, #818CF8, #6366F1)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
                  Many Surfaces
                </span>
              </h2>
              <div className="space-y-4 text-slate-400 leading-relaxed text-base">
                <p>
                  American Group LLC is a California-based S-Corp technology holding company operating across eight distinct business verticals. We build the entire stack — from on-device LLMs and Wear OS apps to multi-cloud control planes and enterprise security platforms.
                </p>
                <p>
                  Our 77 active repositories span Consumer Mobile Apps, Enterprise AI & DevTools, FinTech & E-Commerce, CyberSecurity & Infrastructure, Spatial Computing & Industry SaaS, and IoT & Hardware. Each vertical is engineered to operate independently while sharing a common identity platform, backend gateway, and CI/CD infrastructure.
                </p>
                <p>
                  With a 28-product future roadmap covering AI SaaS, DevTools, and Cybersecurity verticals, American Group LLC is positioned to be a defining force in the next generation of software-driven enterprises.
                </p>
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.7 }}>
              <div className="space-y-4">
                {[
                  { title: "Full-Stack Product Ownership", desc: "We own the entire product lifecycle — from concept and design to engineering, QA, DevOps, and post-launch support." },
                  { title: "Native Mobile Expertise", desc: "40+ iOS apps in Swift/SwiftUI, 45+ Android apps in Kotlin/Jetpack Compose, and 20+ cross-platform Flutter apps." },
                  { title: "Enterprise AI Infrastructure", desc: "Production-grade LLM deployments, RAG pipelines, and cognitive agents built for enterprise scale and reliability." },
                  { title: "Security-First Architecture", desc: "Every product ships with end-to-end encryption, zero-trust principles, and SOC 2-aligned security practices." },
                  { title: "Global Operations", desc: "US headquarters in Santa Clara with India engineering support in Hyderabad — delivering 24/7 global coverage." },
                ].map((item, i) => (
                  <motion.div
                    key={item.title}
                    initial={{ opacity: 0, x: 20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.08, duration: 0.5 }}
                    className="flex gap-4 p-5 rounded-xl border border-white/8 bg-white/[0.025]"
                  >
                    <CheckCircle className="w-5 h-5 text-indigo-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <div className="font-semibold text-white text-sm mb-1">{item.title}</div>
                      <div className="text-slate-500 text-xs leading-relaxed">{item.desc}</div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── Verticals ─────────────────────────────────────────────────────── */}
      <section className="py-28 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-6 lg:px-10">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.7 }} className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-indigo-500/25 bg-indigo-500/8 text-indigo-300 text-xs font-semibold uppercase tracking-widest mb-6">
              Product Portfolio
            </div>
            <h2 className="font-black text-white tracking-tight" style={{ fontFamily: "Sora, sans-serif", fontSize: "clamp(2.2rem, 4.5vw, 3.5rem)" }}>
              Eight business verticals
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {verticals.map((v, i) => {
              const Icon = v.icon;
              return (
                <motion.div
                  key={v.title}
                  initial={{ opacity: 0, y: 25 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08, duration: 0.6 }}
                  className="group p-6 rounded-2xl border border-white/8 bg-white/[0.025] hover:bg-white/[0.04] hover:border-white/15 transition-all duration-300"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl" style={{ background: v.bg }}>
                      {v.emoji}
                    </div>
                    <div>
                      <div className="font-bold text-white text-sm">{v.title}</div>
                      <div className="text-xs font-mono" style={{ color: v.color }}>{v.count} products</div>
                    </div>
                  </div>
                  <p className="text-slate-500 text-sm leading-relaxed mb-4">{v.desc}</p>
                  <div className="flex flex-wrap gap-1.5">
                    {v.products.slice(0, 4).map((p) => (
                      <span key={p} className="px-2 py-0.5 rounded text-xs font-mono text-slate-400 border border-white/8 bg-white/[0.03]">{p}</span>
                    ))}
                    {v.products.length > 4 && (
                      <span className="px-2 py-0.5 rounded text-xs font-mono text-slate-500 border border-white/8 bg-white/[0.03]">+{v.products.length - 4} more</span>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>

          <div className="text-center mt-12">
            <Link href="/products">
              <button className="inline-flex items-center gap-2 px-8 py-4 rounded-xl font-bold text-white transition-all duration-300 hover:scale-105" style={{ background: "linear-gradient(135deg, #6366F1, #4F46E5)", boxShadow: "0 0 30px rgba(99,102,241,0.25)" }}>
                View All 77 Products <ArrowRight className="w-4 h-4" />
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* ── CTA ───────────────────────────────────────────────────────────── */}
      <section className="py-24 border-t border-white/5 relative overflow-hidden">
        <div className="absolute inset-0" style={{ background: "radial-gradient(ellipse at 50% 100%, rgba(99,102,241,0.10), transparent 60%)" }} />
        <div className="relative z-10 max-w-3xl mx-auto px-6 text-center">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.7 }}>
            <h2 className="font-black text-white mb-5 tracking-tight" style={{ fontFamily: "Sora, sans-serif", fontSize: "clamp(2rem, 4vw, 3.5rem)" }}>
              Ready to partner with AGL?
            </h2>
            <p className="text-slate-400 text-lg mb-10">
              Explore our full product portfolio or get in touch to discuss how we can work together.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Link href="/contact">
                <button className="flex items-center gap-2 px-8 py-4 rounded-xl font-bold text-white transition-all duration-300 hover:scale-105" style={{ background: "linear-gradient(135deg, #6366F1, #4F46E5)", boxShadow: "0 0 40px rgba(99,102,241,0.3)" }}>
                  Get in Touch <ArrowRight className="w-4 h-4" />
                </button>
              </Link>
              <Link href="/products">
                <button className="flex items-center gap-2 px-8 py-4 rounded-xl font-bold border border-white/15 text-white hover:bg-white/8 transition-all duration-300">
                  Browse Products
                </button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
