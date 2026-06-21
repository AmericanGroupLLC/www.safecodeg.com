/**
 * Home Page — Enterprise-Grade Redesign
 * Design: Dark premium, cinematic hero, Fortune 500 quality
 * AGL-dominant: 90% American Group LLC, 10% SafeCodeX ops
 */
import { useEffect, useRef, useState } from "react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import {
  ArrowRight, Brain, Smartphone, Globe, Shield, Code2, Cpu,
  TrendingUp, Users, Zap, Star, CheckCircle, ChevronRight,
  BarChart3, Lock, Cloud, Layers
} from "lucide-react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";

// Animated counter hook
function useCounter(target: number, duration = 2000, start = false) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!start) return;
    let startTime: number | null = null;
    const step = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(eased * target));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [target, duration, start]);
  return count;
}

// Scroll reveal hook
function useReveal() {
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => entries.forEach(e => { if (e.isIntersecting) e.target.classList.add("visible"); }),
      { threshold: 0.08, rootMargin: "0px 0px -40px 0px" }
    );
    document.querySelectorAll(".reveal").forEach(el => observer.observe(el));
    return () => observer.disconnect();
  }, []);
}

const verticals = [
  { icon: <Brain className="w-6 h-6" />, title: "Enterprise AI & DevTools", count: 12, color: "#6366F1", desc: "LLMs, RAG pipelines, cognitive agents, and developer productivity platforms.", slug: "enterprise-ai" },
  { icon: <Smartphone className="w-6 h-6" />, title: "Consumer Mobile", count: 18, color: "#8B5CF6", desc: "Cross-platform iOS & Android apps serving millions of daily active users.", slug: "mobile" },
  { icon: <TrendingUp className="w-6 h-6" />, title: "FinTech & E-Commerce", count: 14, color: "#10B981", desc: "Personal finance, market intelligence, payments, and commerce platforms.", slug: "fintech" },
  { icon: <Shield className="w-6 h-6" />, title: "CyberSecurity & Infra", count: 8, color: "#EF4444", desc: "SIEM, threat hunting, zero-trust networking, and enterprise infrastructure.", slug: "cybersecurity" },
  { icon: <Globe className="w-6 h-6" />, title: "Travel & Aviation", count: 6, color: "#3B82F6", desc: "Real-time flight tracking, trip management, and aviation intelligence.", slug: "travel" },
  { icon: <Cpu className="w-6 h-6" />, title: "Health & Wellness", count: 10, color: "#F59E0B", desc: "Fitness OS, nutrition tracking, mental wellness, and Wear OS integration.", slug: "health" },
  { icon: <Code2 className="w-6 h-6" />, title: "E-Commerce & Deals", count: 5, color: "#EC4899", desc: "Smart shopping, deal aggregation, price tracking, and loyalty platforms.", slug: "ecommerce" },
  { icon: <Users className="w-6 h-6" />, title: "Social & Lifestyle", count: 4, color: "#06B6D4", desc: "P2P gaming, social experiences, and community-driven mobile applications.", slug: "social" },
];

const featuredProducts = [
  { slug: "cognicore", name: "CogniCore AI", tagline: "Enterprise cognitive AI platform", icon: "🧠", color: "#6366F1", tag: "Enterprise AI" },
  { slug: "myhealth", name: "MyHealth", tagline: "Personal fitness OS for Android & Wear OS", icon: "❤️", color: "#EF4444", tag: "Health" },
  { slug: "aeroswift", name: "AeroSwift", tagline: "Real-time flight tracking & aviation data", icon: "✈️", color: "#3B82F6", tag: "Travel" },
  { slug: "apexmarketwatch", name: "ApexMarketWatch", tagline: "Real-time markets & hedge fund filings", icon: "📈", color: "#F59E0B", tag: "FinTech" },
  { slug: "offlinebuddy", name: "OfflineBuddy", tagline: "On-device LLM — works fully offline", icon: "🤖", color: "#06B6D4", tag: "AI" },
  { slug: "securecore", name: "SecureCore", tagline: "Enterprise security operations platform", icon: "🛡️", color: "#EF4444", tag: "Security" },
];

const differentiators = [
  { icon: <Zap className="w-5 h-5" />, title: "Ship in Weeks, Not Years", desc: "Our battle-tested product development framework takes ideas from concept to App Store in 6–12 weeks." },
  { icon: <Lock className="w-5 h-5" />, title: "Security by Default", desc: "Every product is built with end-to-end encryption, SOC 2 compliance, and zero-trust architecture from day one." },
  { icon: <Cloud className="w-5 h-5" />, title: "Cloud-Native Scale", desc: "Serverless, containerized, auto-scaling infrastructure that handles 1 user or 10 million without code changes." },
  { icon: <BarChart3 className="w-5 h-5" />, title: "Data-Driven Everything", desc: "Built-in analytics, A/B testing, and ML pipelines in every product so you always know what's working." },
  { icon: <Layers className="w-5 h-5" />, title: "Full-Stack Ownership", desc: "We own the entire stack — design, engineering, QA, DevOps, and post-launch support under one roof." },
  { icon: <Star className="w-5 h-5" />, title: "Enterprise-Grade Quality", desc: "99.9% uptime SLAs, 24/7 monitoring, and dedicated support for every product we ship." },
];

const stats = [
  { value: 77, suffix: "+", label: "Products Shipped", icon: "📦" },
  { value: 8, suffix: "", label: "Industry Verticals", icon: "🏭" },
  { value: 6, suffix: "+", label: "Years of Excellence", icon: "🏆" },
  { value: 99, suffix: ".9%", label: "Uptime SLA", icon: "⚡" },
];

function StatCard({ value, suffix, label, icon, start }: { value: number; suffix: string; label: string; icon: string; start: boolean }) {
  const count = useCounter(value, 2200, start);
  return (
    <div className="text-center p-8 rounded-2xl border border-white/8 bg-white/[0.03] hover:bg-white/[0.06] transition-all">
      <div className="text-3xl mb-3">{icon}</div>
      <div className="text-5xl font-bold text-white mb-2" style={{ fontFamily: "Sora, sans-serif" }}>
        {count}{suffix}
      </div>
      <div className="text-slate-400 text-sm font-medium">{label}</div>
    </div>
  );
}

export default function Home() {
  useReveal();
  const statsRef = useRef<HTMLDivElement>(null);
  const [statsStarted, setStatsStarted] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setStatsStarted(true); },
      { threshold: 0.3 }
    );
    if (statsRef.current) observer.observe(statsRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div className="min-h-screen" style={{ background: "#070B14", color: "white" }}>
      <Navigation />

      {/* ── HERO ─────────────────────────────────────────── */}
      <section className="relative min-h-screen flex items-center overflow-hidden">
        {/* Background image */}
        <div className="absolute inset-0">
          <img
            src="/manus-storage/agl-hero-enterprise_4169f7a3.jpg"
            alt="AGL Hero"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0" style={{ background: "linear-gradient(135deg, rgba(7,11,20,0.97) 0%, rgba(7,11,20,0.85) 50%, rgba(7,11,20,0.75) 100%)" }} />
          <div className="absolute inset-0" style={{ background: "radial-gradient(ellipse at 20% 50%, rgba(99,102,241,0.15), transparent 60%)" }} />
        </div>

        {/* Animated grid */}
        <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: "linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)", backgroundSize: "60px 60px" }} />

        <div className="relative z-10 max-w-7xl mx-auto px-6 pt-32 pb-20">
          <div className="max-w-4xl">
            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 text-indigo-300 text-sm font-medium mb-8">
                <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse" />
                Santa Clara, California · Est. 2018
              </div>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.1 }}
              className="font-bold leading-[1.05] mb-6"
              style={{ fontFamily: "Sora, sans-serif", fontSize: "clamp(2.8rem, 6vw, 5rem)" }}
            >
              Building the Future of{" "}
              <span style={{ background: "linear-gradient(135deg, #818CF8, #6366F1, #A78BFA)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                Enterprise Technology
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-xl text-slate-300 leading-relaxed mb-10 max-w-2xl"
            >
              American Group LLC is a California-based technology company delivering 77+ enterprise-grade products across AI, mobile, FinTech, cybersecurity, and health — trusted by businesses and consumers worldwide.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.3 }}
              className="flex flex-wrap gap-4"
            >
              <Link href="/products">
                <button className="group flex items-center gap-2 px-8 py-4 rounded-xl font-semibold text-white transition-all duration-200 hover:scale-105 active:scale-95" style={{ background: "linear-gradient(135deg, #6366F1, #4F46E5)" }}>
                  Explore 77 Products
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
              </Link>
              <Link href="/contact">
                <button className="flex items-center gap-2 px-8 py-4 rounded-xl font-semibold border border-white/15 text-white hover:bg-white/10 transition-all duration-200">
                  Request a Demo
                </button>
              </Link>
            </motion.div>

            {/* Trust badges */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.5 }}
              className="flex flex-wrap items-center gap-6 mt-12 pt-10 border-t border-white/8"
            >
              {["iOS & Android", "Enterprise Ready", "SOC 2 Compliant", "99.9% Uptime"].map((badge) => (
                <div key={badge} className="flex items-center gap-2 text-slate-400 text-sm">
                  <CheckCircle className="w-4 h-4 text-indigo-400" />
                  {badge}
                </div>
              ))}
            </motion.div>
          </div>
        </div>

        {/* Bottom fade */}
        <div className="absolute bottom-0 left-0 right-0 h-32" style={{ background: "linear-gradient(to bottom, transparent, #070B14)" }} />
      </section>

      {/* ── STATS ────────────────────────────────────────── */}
      <section className="py-20 border-y border-white/5" ref={statsRef}>
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {stats.map((s, i) => (
              <StatCard key={i} {...s} start={statsStarted} />
            ))}
          </div>
        </div>
      </section>

      {/* ── PRODUCT VERTICALS ────────────────────────────── */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="reveal mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-indigo-500/30 bg-indigo-500/10 text-indigo-300 text-xs font-medium mb-4">
              <Layers className="w-3 h-3" /> Product Portfolio
            </div>
            <h2 className="text-4xl lg:text-5xl font-bold text-white mb-4" style={{ fontFamily: "Sora, sans-serif" }}>
              8 Verticals. 77+ Products.
            </h2>
            <p className="text-slate-400 text-lg max-w-2xl">
              From AI infrastructure to consumer mobile apps, AGL builds and ships enterprise-grade software across every major technology vertical.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {verticals.map((v, i) => (
              <Link key={v.slug} href={`/products#${v.slug}`}>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.06 }}
                  className="group p-6 rounded-2xl border border-white/8 bg-white/[0.03] hover:bg-white/[0.06] hover:border-white/15 transition-all duration-300 cursor-pointer relative overflow-hidden"
                >
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" style={{ background: `radial-gradient(circle at 0% 0%, ${v.color}12, transparent 60%)` }} />
                  <div className="relative z-10">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110" style={{ background: `${v.color}20`, color: v.color }}>
                      {v.icon}
                    </div>
                    <div className="text-2xl font-bold text-white mb-1" style={{ fontFamily: "Sora, sans-serif", color: v.color }}>{v.count}</div>
                    <h3 className="font-semibold text-white text-sm mb-2 leading-tight">{v.title}</h3>
                    <p className="text-slate-500 text-xs leading-relaxed line-clamp-2">{v.desc}</p>
                    <div className="flex items-center gap-1 mt-4 text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: v.color }}>
                      View Products <ChevronRight className="w-3 h-3" />
                    </div>
                  </div>
                </motion.div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURED PRODUCTS ────────────────────────────── */}
      <section className="py-24 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-end justify-between mb-12 reveal">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-indigo-500/30 bg-indigo-500/10 text-indigo-300 text-xs font-medium mb-4">
                <Star className="w-3 h-3" /> Featured Products
              </div>
              <h2 className="text-4xl font-bold text-white" style={{ fontFamily: "Sora, sans-serif" }}>
                Flagship Applications
              </h2>
            </div>
            <Link href="/products">
              <button className="hidden md:flex items-center gap-2 text-indigo-400 hover:text-indigo-300 text-sm font-medium transition-colors group">
                View all 77 <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {featuredProducts.map((p, i) => (
              <Link key={p.slug} href={`/products/${p.slug}`}>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08 }}
                  className="group p-6 rounded-2xl border border-white/8 bg-white/[0.03] hover:bg-white/[0.07] hover:border-white/20 transition-all duration-300 cursor-pointer relative overflow-hidden"
                >
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" style={{ background: `radial-gradient(circle at 20% 20%, ${p.color}12, transparent 60%)` }} />
                  <div className="absolute top-0 left-0 right-0 h-px opacity-0 group-hover:opacity-100 transition-opacity" style={{ background: `linear-gradient(90deg, transparent, ${p.color}60, transparent)` }} />
                  <div className="relative z-10">
                    <div className="flex items-start justify-between mb-5">
                      <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl" style={{ background: `${p.color}15`, border: `1px solid ${p.color}25` }}>
                        {p.icon}
                      </div>
                      <span className="text-xs px-2.5 py-1 rounded-full font-medium" style={{ background: `${p.color}20`, color: p.color }}>{p.tag}</span>
                    </div>
                    <h3 className="font-bold text-white text-lg mb-2 group-hover:text-indigo-200 transition-colors" style={{ fontFamily: "Sora, sans-serif" }}>{p.name}</h3>
                    <p className="text-slate-400 text-sm mb-4">{p.tagline}</p>
                    <div className="flex items-center gap-1 text-xs font-medium" style={{ color: p.color }}>
                      Learn More <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </motion.div>
              </Link>
            ))}
          </div>

          <div className="text-center mt-10">
            <Link href="/products">
              <button className="inline-flex items-center gap-2 px-8 py-4 rounded-xl border border-white/10 text-slate-300 hover:bg-white/5 hover:border-white/20 font-semibold transition-all">
                Browse All 77 Products <ArrowRight className="w-4 h-4" />
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* ── WHY AGL ──────────────────────────────────────── */}
      <section className="py-24 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="reveal">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-indigo-500/30 bg-indigo-500/10 text-indigo-300 text-xs font-medium mb-6">
                <Zap className="w-3 h-3" /> Why American Group LLC
              </div>
              <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6 leading-tight" style={{ fontFamily: "Sora, sans-serif" }}>
                Enterprise quality.<br />Startup velocity.
              </h2>
              <p className="text-slate-400 text-lg leading-relaxed mb-8">
                We combine the engineering rigor of a Fortune 500 technology company with the speed and agility of a startup. Every product we ship is battle-tested, secure, and built to scale.
              </p>
              <div className="space-y-3">
                {["Full-stack product development from concept to launch", "Native iOS, Android, and cross-platform Flutter expertise", "Enterprise AI/ML integration with production-grade reliability", "Dedicated QA, DevOps, and post-launch support teams"].map((item) => (
                  <div key={item} className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-indigo-400 mt-0.5 flex-shrink-0" />
                    <span className="text-slate-300 text-sm">{item}</span>
                  </div>
                ))}
              </div>
              <div className="mt-8 flex gap-4">
                <Link href="/about">
                  <button className="flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-white transition-all hover:scale-105" style={{ background: "linear-gradient(135deg, #6366F1, #4F46E5)" }}>
                    About AGL <ArrowRight className="w-4 h-4" />
                  </button>
                </Link>
                <Link href="/contact">
                  <button className="flex items-center gap-2 px-6 py-3 rounded-xl border border-white/10 text-slate-300 hover:bg-white/5 font-semibold transition-all">
                    Get in Touch
                  </button>
                </Link>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 reveal reveal-delay-1">
              {differentiators.map((d, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 15 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.07 }}
                  className="p-5 rounded-2xl border border-white/8 bg-white/[0.03] hover:bg-white/[0.06] transition-all"
                >
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-3 text-indigo-400" style={{ background: "rgba(99,102,241,0.15)" }}>
                    {d.icon}
                  </div>
                  <h4 className="font-semibold text-white text-sm mb-1.5">{d.title}</h4>
                  <p className="text-slate-500 text-xs leading-relaxed">{d.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── MOBILE APPS SHOWCASE ─────────────────────────── */}
      <section className="py-24 border-t border-white/5 relative overflow-hidden">
        <div className="absolute inset-0">
          <img src="/manus-storage/agl-mobile-apps-bg_8be1d965.jpg" alt="" className="w-full h-full object-cover opacity-10" />
          <div className="absolute inset-0" style={{ background: "linear-gradient(to right, #070B14 0%, rgba(7,11,20,0.7) 50%, #070B14 100%)" }} />
        </div>
        <div className="relative z-10 max-w-7xl mx-auto px-6">
          <div className="text-center mb-16 reveal">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-indigo-500/30 bg-indigo-500/10 text-indigo-300 text-xs font-medium mb-4">
              <Smartphone className="w-3 h-3" /> Mobile-First
            </div>
            <h2 className="text-4xl lg:text-5xl font-bold text-white mb-4" style={{ fontFamily: "Sora, sans-serif" }}>
              Available on Every Platform
            </h2>
            <p className="text-slate-400 text-lg max-w-2xl mx-auto">
              Our mobile apps are built with native iOS (Swift), native Android (Kotlin), and cross-platform Flutter — delivering pixel-perfect experiences on every device.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { platform: "iOS", icon: "🍎", color: "#6366F1", desc: "Native Swift development with HealthKit, Core ML, ARKit, and full Apple ecosystem integration.", count: "40+" },
              { platform: "Android", icon: "🤖", color: "#10B981", desc: "Native Kotlin with Jetpack Compose, Wear OS, Google Health Connect, and Material You design.", count: "45+" },
              { platform: "Cross-Platform", icon: "⚡", color: "#F59E0B", desc: "Flutter and React Native for maximum reach with a single codebase and native performance.", count: "20+" },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="p-8 rounded-2xl border border-white/8 bg-white/[0.04] text-center"
              >
                <div className="text-4xl mb-4">{item.icon}</div>
                <div className="text-3xl font-bold mb-1" style={{ color: item.color, fontFamily: "Sora, sans-serif" }}>{item.count}</div>
                <h3 className="font-bold text-white text-lg mb-3">{item.platform} Apps</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── INDIA OPS (10%) ──────────────────────────────── */}
      <section className="py-16 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-6">
          <div className="p-8 rounded-3xl border border-amber-500/15 bg-amber-500/5 reveal">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0" style={{ background: "rgba(245,158,11,0.15)", border: "1px solid rgba(245,158,11,0.3)" }}>
                🇮🇳
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="font-bold text-white text-lg" style={{ fontFamily: "Sora, sans-serif" }}>SafeCodeX Research Center — Hyderabad, India</h3>
                  <span className="text-xs px-2.5 py-1 rounded-full font-medium bg-amber-500/20 text-amber-400 border border-amber-500/30">India Operations</span>
                </div>
                <p className="text-slate-400 text-sm leading-relaxed max-w-3xl">
                  Our Hyderabad-based engineering support office handles QA testing, embedded firmware research, and mobile app testing — supporting AGL's primary product development operations from Santa Clara. SafeCodeX operates as an integral part of the AGL delivery pipeline.
                </p>
              </div>
              <Link href="/safecodex-research">
                <button className="flex-shrink-0 flex items-center gap-2 px-5 py-2.5 rounded-xl border border-amber-500/30 text-amber-400 hover:bg-amber-500/10 text-sm font-medium transition-all">
                  Learn More <ChevronRight className="w-4 h-4" />
                </button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────── */}
      <section className="py-28 border-t border-white/5 relative overflow-hidden">
        <div className="absolute inset-0" style={{ background: "radial-gradient(ellipse at 50% 50%, rgba(99,102,241,0.12), transparent 70%)" }} />
        <div className="relative z-10 max-w-4xl mx-auto px-6 text-center reveal">
          <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6" style={{ fontFamily: "Sora, sans-serif" }}>
            Ready to build something<br />
            <span style={{ background: "linear-gradient(135deg, #818CF8, #6366F1)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              extraordinary?
            </span>
          </h2>
          <p className="text-slate-400 text-xl mb-10 max-w-2xl mx-auto">
            Whether you need a custom enterprise application, a mobile app for millions of users, or AI infrastructure for your business — AGL delivers.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/contact">
              <button className="group flex items-center gap-2 px-10 py-4 rounded-xl font-semibold text-white transition-all hover:scale-105 active:scale-95" style={{ background: "linear-gradient(135deg, #6366F1, #4F46E5)" }}>
                Start a Project
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </Link>
            <Link href="/products">
              <button className="flex items-center gap-2 px-10 py-4 rounded-xl border border-white/10 text-slate-300 hover:bg-white/5 font-semibold transition-all">
                Browse Products
              </button>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
