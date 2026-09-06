/**
 * Home Page — World-Class MNC Enterprise Redesign
 * Design: "Apex Dark" — Palantir × Stripe × SAP quality
 * Full dark theme, cinematic hero, animated counters, premium cards
 */
import { useEffect, useRef, useState } from "react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import {
  ArrowRight, Brain, Smartphone, Globe, Shield, Code2, Cpu,
  TrendingUp, Users, Zap, Star, CheckCircle, ChevronRight,
  BarChart3, Lock, Cloud, Layers, Play, Award, Building2,
  MapPin, Phone, Mail, ExternalLink, Box
} from "lucide-react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { DIMENSION_LEVELS, DIMENSION_LEVEL_META } from "@/dimensions/contract";
import { isDimensionLevelLive } from "@/lib/dimensionsAvailability";

// ── Animated counter hook ─────────────────────────────────────────────────────
function useCounter(target: number, duration = 2200, start = false) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!start) return;
    let startTime: number | null = null;
    const step = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 4);
      setCount(Math.floor(eased * target));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [target, duration, start]);
  return count;
}

// ── Data ──────────────────────────────────────────────────────────────────────
const verticals = [
  { icon: Brain, title: "Enterprise AI & DevTools", count: 12, color: "#818CF8", bg: "rgba(99,102,241,0.12)", desc: "LLMs, RAG pipelines, cognitive agents, and developer productivity platforms.", slug: "enterprise-ai" },
  { icon: Smartphone, title: "Consumer Mobile", count: 18, color: "#A78BFA", bg: "rgba(139,92,246,0.12)", desc: "30+ iOS & Android apps — from Wear OS companions to offline-first utilities used by millions.", slug: "mobile" },
  { icon: TrendingUp, title: "FinTech & E-Commerce", count: 14, color: "#34D399", bg: "rgba(16,185,129,0.12)", desc: "Digital banking, algo trading, cross-border payments, and personal finance platforms.", slug: "fintech" },
  { icon: Shield, title: "CyberSecurity & Infra", count: 8, color: "#F87171", bg: "rgba(239,68,68,0.12)", desc: "SIEM, threat hunting, zero-trust networking, and enterprise-grade security infrastructure.", slug: "cybersecurity" },
  { icon: Globe, title: "Travel & Aviation", count: 6, color: "#60A5FA", bg: "rgba(59,130,246,0.12)", desc: "FAA-integrated pilot tools, real-time flight tracking, offline maps, and trip management.", slug: "travel" },
  { icon: Cpu, title: "Health & Wellness", count: 10, color: "#FBBF24", bg: "rgba(245,158,11,0.12)", desc: "Biometric tracking, BLE wearable sync, HealthKit integration, and clinical health algorithms.", slug: "health" },
  { icon: Code2, title: "E-Commerce & Deals", count: 5, color: "#F472B6", bg: "rgba(236,72,153,0.12)", desc: "Smart shopping, deal aggregation, price tracking, and loyalty reward platforms.", slug: "ecommerce" },
  { icon: Users, title: "Social & Lifestyle", count: 4, color: "#22D3EE", bg: "rgba(6,182,212,0.12)", desc: "P2P multiplayer games, global radio streaming, and community-driven mobile experiences.", slug: "social" },
];

const featuredProducts = [
  { slug: "cognicore", name: "CogniCore AI", tagline: "Enterprise cognitive AI platform", icon: "🧠", color: "#818CF8", tag: "Enterprise AI", status: "Live" },
  { slug: "myhealth", name: "MyHealth", tagline: "Personal fitness OS for Android & Wear OS", icon: "❤️", color: "#F87171", tag: "Health", status: "Live" },
  { slug: "aeroswift", name: "AeroSwift", tagline: "Real-time flight tracking & aviation data", icon: "✈️", color: "#60A5FA", tag: "Travel", status: "Live" },
  { slug: "apexmarketwatch", name: "ApexMarketWatch", tagline: "Real-time markets & hedge fund filings", icon: "📈", color: "#FBBF24", tag: "FinTech", status: "Live" },
  { slug: "offlinebuddy", name: "OfflineBuddy", tagline: "On-device LLM — works fully offline", icon: "🤖", color: "#22D3EE", tag: "AI", status: "Live" },
  { slug: "securecore", name: "SecureCore", tagline: "Enterprise security operations platform", icon: "🛡️", color: "#F87171", tag: "Security", status: "Live" },
];

const differentiators = [
  { icon: Zap, title: "Ship in Weeks, Not Years", desc: "Battle-tested product development framework takes ideas from concept to App Store in 6–12 weeks." },
  { icon: Lock, title: "Security by Default", desc: "End-to-end encryption, SOC 2 compliance, and zero-trust architecture built into every product from day one." },
  { icon: Cloud, title: "Cloud-Native Scale", desc: "Serverless, containerized, auto-scaling infrastructure that handles 1 user or 10 million without code changes." },
  { icon: BarChart3, title: "Data-Driven Everything", desc: "Built-in analytics, A/B testing, and ML pipelines in every product so you always know what's working." },
  { icon: Layers, title: "Full-Stack Ownership", desc: "Design, engineering, QA, DevOps, and post-launch support — all under one roof." },
  { icon: Star, title: "Enterprise-Grade Quality", desc: "99.9% uptime SLAs, 24/7 monitoring, and dedicated support for every product we ship." },
];

const stats = [
  { value: 77, suffix: "+", label: "Products Shipped", sub: "Across 8 verticals" },
  { value: 8, suffix: "", label: "Industry Verticals", sub: "AI to CyberSecurity" },
  { value: 50, suffix: "+", label: "Engineers Worldwide", sub: "US, India & Remote" },
  { value: 99, suffix: ".9%", label: "Uptime SLA", sub: "Enterprise guarantee" },
];

const trustBadges = [
  { icon: CheckCircle, label: "iOS & Android" },
  { icon: Shield, label: "SOC 2 Compliant" },
  { icon: Award, label: "Enterprise Ready" },
  { icon: Cloud, label: "99.9% Uptime" },
  { icon: Lock, label: "End-to-End Encrypted" },
];

// ── Stat Card ─────────────────────────────────────────────────────────────────
function StatCard({ value, suffix, label, sub, start }: { value: number; suffix: string; label: string; sub: string; start: boolean }) {
  const count = useCounter(value, 2200, start);
  return (
    <div className="relative group p-8 rounded-2xl transition-all duration-500 overflow-hidden" style={{ background: "rgba(124,58,237,0.06)", border: "1px solid rgba(124,58,237,0.15)", boxShadow: "inset 0 1px 0 rgba(255,255,255,0.04)" }}>
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" style={{ background: "radial-gradient(circle at 50% 0%, rgba(124,58,237,0.15), transparent 60%)" }} />
      <div className="relative z-10">
        <div className="text-5xl lg:text-6xl font-black mb-2 tracking-tight" style={{ fontFamily: "Sora, sans-serif", background: "linear-gradient(135deg, #E9D5FF 0%, #A78BFA 50%, #F59E0B 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
          {count}{suffix}
        </div>
        <div className="font-semibold text-base mb-1" style={{ color: "rgba(255,255,255,0.9)" }}>{label}</div>
        <div className="text-sm" style={{ color: "rgba(167,139,250,0.55)" }}>{sub}</div>
      </div>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function Home() {
  const statsRef = useRef<HTMLDivElement>(null);
  const [statsStarted, setStatsStarted] = useState(false);

  useEffect(() => {
    // Start stats counter after a short delay so numbers are visible on first view
    const timer = setTimeout(() => setStatsStarted(true), 800);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div style={{ background: "#030408", color: "white", minHeight: "100vh" }}>
      <Navigation />
      <main id="main-content">

      {/* ══════════════════════════════════════════════════════════════════════
          HERO — Full-bleed cinematic, massive typography, premium depth
      ══════════════════════════════════════════════════════════════════════ */}
      <section className="relative min-h-screen flex items-center overflow-hidden">
        {/* Background layers — rich aurora mesh */}
        <div className="absolute inset-0">
          <img
            src="https://d2xsxph8kpxj0f.cloudfront.net/310519663397835904/iKtH34UE32MfRNT3w4zNEC/agl-hero-v2-aNA585WnQyWK3EQb4TGCDS.webp"
            alt="American Group LLC enterprise technology background"
            className="w-full h-full object-cover"
          />
          {/* Deep obsidian overlay */}
          <div className="absolute inset-0" style={{ background: "linear-gradient(135deg, rgba(3,4,8,0.97) 0%, rgba(5,6,15,0.92) 45%, rgba(3,4,8,0.82) 100%)" }} />
          {/* Violet aurora glow left */}
          <div className="absolute inset-0" style={{ background: "radial-gradient(ellipse at 10% 55%, rgba(124,58,237,0.22) 0%, transparent 50%)" }} />
          {/* Gold accent top-right */}
          <div className="absolute inset-0" style={{ background: "radial-gradient(ellipse at 90% 20%, rgba(245,158,11,0.12) 0%, transparent 45%)" }} />
          {/* Cyan accent bottom-right */}
          <div className="absolute inset-0" style={{ background: "radial-gradient(ellipse at 80% 90%, rgba(6,182,212,0.07) 0%, transparent 40%)" }} />
        </div>

        {/* Subtle grid overlay */}
        <div className="absolute inset-0 opacity-[0.025]" style={{ backgroundImage: "linear-gradient(rgba(124,58,237,1) 1px, transparent 1px), linear-gradient(90deg, rgba(124,58,237,1) 1px, transparent 1px)", backgroundSize: "80px 80px" }} />

        {/* Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-10 pt-36 pb-24">
          <div className="max-w-5xl">

            {/* Eyebrow badge */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
              <div className="inline-flex items-center gap-2.5 px-5 py-2.5 rounded-full text-sm font-medium mb-10 backdrop-blur-sm" style={{ background: "rgba(124,58,237,0.12)", border: "1px solid rgba(124,58,237,0.3)", color: "rgba(196,181,253,0.95)" }}>
                <span className="w-2 h-2 rounded-full animate-pulse" style={{ background: "#A78BFA" }} />
                American Group LLC · Santa Clara, California · Est. 2018
              </div>
            </motion.div>

            {/* Main headline — massive scale */}
            <motion.h1
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, delay: 0.1, ease: [0.23, 1, 0.32, 1] }}
              className="font-black leading-[1.0] mb-8 tracking-tight"
              style={{ fontFamily: "Sora, sans-serif", fontSize: "clamp(3.2rem, 7.5vw, 6.5rem)" }}
            >
              Building the Future<br />
              <span style={{ background: "linear-gradient(135deg, #A78BFA 0%, #7C3AED 35%, #F59E0B 75%, #FCD34D 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
                of Enterprise Tech
              </span>
            </motion.h1>

            {/* Subheadline */}
            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.25 }}
              className="text-xl lg:text-2xl text-slate-300 leading-relaxed mb-12 max-w-3xl font-light"
            >
              A California-based technology company delivering <strong className="text-white font-semibold">77+ enterprise-grade products</strong> across AI, mobile, FinTech, cybersecurity, and health — trusted by businesses and consumers worldwide.
            </motion.p>

            {/* CTAs */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.35 }}
              className="flex flex-wrap gap-4 mb-16"
            >
              <Link href="/products">
                <button className="group flex items-center gap-3 px-8 py-4 rounded-xl font-bold text-white text-base transition-all duration-300 hover:scale-105 hover:shadow-2xl active:scale-95" style={{ background: "linear-gradient(135deg, #7C3AED 0%, #5B21B6 100%)", boxShadow: "0 0 40px rgba(124,58,237,0.4), inset 0 1px 0 rgba(255,255,255,0.1)" }}>
                  Explore 77 Products
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
              </Link>
              <Link href="/contact">
                <button className="flex items-center gap-3 px-8 py-4 rounded-xl font-bold text-base transition-all duration-300 hover:scale-105" style={{ background: "linear-gradient(135deg, #F59E0B 0%, #D97706 100%)", color: "#1C0A00", boxShadow: "0 0 30px rgba(245,158,11,0.35), inset 0 1px 0 rgba(255,255,255,0.2)" }}>
                  <Play className="w-4 h-4" />
                  Request a Demo
                </button>
              </Link>
            </motion.div>

            {/* Trust badges row */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.5 }}
              className="flex flex-wrap items-center gap-6 pt-8"
              style={{ borderTop: "1px solid rgba(124,58,237,0.15)" }}
            >
              {trustBadges.map(({ icon: Icon, label }) => (
                <div key={label} className="flex items-center gap-2 text-sm" style={{ color: "rgba(196,181,253,0.7)" }}>
                  <Icon className="w-4 h-4" style={{ color: "rgba(167,139,250,0.8)" }} />
                  <span>{label}</span>
                </div>
              ))}
            </motion.div>
          </div>
        </div>

        {/* Bottom fade */}
        <div className="absolute bottom-0 left-0 right-0 h-48" style={{ background: "linear-gradient(to bottom, transparent, #030408)" }} />
      </section>

      {/* ══════════════════════════════════════════════════════════════════════
          TECH MARQUEE — Technology stack ticker strip
      ══════════════════════════════════════════════════════════════════════ */}
      <section className="py-8 overflow-hidden" style={{ background: "rgba(124,58,237,0.04)", borderTop: "1px solid rgba(124,58,237,0.12)", borderBottom: "1px solid rgba(124,58,237,0.12)" }}>
        <div className="overflow-hidden relative">
          {/* Fade edges */}
          <div className="absolute left-0 top-0 bottom-0 w-24 z-10" style={{ background: "linear-gradient(to right, #030408, transparent)" }} />
          <div className="absolute right-0 top-0 bottom-0 w-24 z-10" style={{ background: "linear-gradient(to left, #030408, transparent)" }} />
          <div className="marquee-track gap-12 px-8">
            {[
              { label: "Swift / SwiftUI", icon: "🍎" },
              { label: "Kotlin / Jetpack", icon: "🤖" },
              { label: "Flutter", icon: "💙" },
              { label: "React Native", icon: "⚛️" },
              { label: "Python / FastAPI", icon: "🐍" },
              { label: "Node.js", icon: "🟢" },
              { label: "TypeScript", icon: "🔷" },
              { label: "TensorFlow / PyTorch", icon: "🧠" },
              { label: "LangChain / LLMs", icon: "🤖" },
              { label: "AWS / GCP / Azure", icon: "☁️" },
              { label: "Kubernetes", icon: "⚙️" },
              { label: "PostgreSQL", icon: "🐘" },
              { label: "Redis", icon: "🔴" },
              { label: "Wear OS", icon: "⌚" },
              { label: "CoreML / Vision", icon: "👁️" },
              { label: "Stripe / Plaid", icon: "💳" },
              // Duplicate for seamless loop
              { label: "Swift / SwiftUI", icon: "🍎" },
              { label: "Kotlin / Jetpack", icon: "🤖" },
              { label: "Flutter", icon: "💙" },
              { label: "React Native", icon: "⚛️" },
              { label: "Python / FastAPI", icon: "🐍" },
              { label: "Node.js", icon: "🟢" },
              { label: "TypeScript", icon: "🔷" },
              { label: "TensorFlow / PyTorch", icon: "🧠" },
              { label: "LangChain / LLMs", icon: "🤖" },
              { label: "AWS / GCP / Azure", icon: "☁️" },
              { label: "Kubernetes", icon: "⚙️" },
              { label: "PostgreSQL", icon: "🐘" },
              { label: "Redis", icon: "🔴" },
              { label: "Wear OS", icon: "⌚" },
              { label: "CoreML / Vision", icon: "👁️" },
              { label: "Stripe / Plaid", icon: "💳" },
            ].map((tech, i) => (
              <div key={i} className="flex items-center gap-2.5 whitespace-nowrap text-sm font-medium flex-shrink-0" style={{ color: "rgba(167,139,250,0.55)" }}>
                <span className="text-base">{tech.icon}</span>
                <span>{tech.label}</span>
                {i < 31 && <span className="ml-6 text-white/10">·</span>}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════════
          STATS — Animated counters with premium card design
      ══════════════════════════════════════════════════════════════════════ */}
      <section className="py-24" ref={statsRef} style={{ borderTop: "1px solid rgba(124,58,237,0.1)", borderBottom: "1px solid rgba(124,58,237,0.1)", background: "linear-gradient(180deg, rgba(124,58,237,0.04) 0%, transparent 100%)" }}>
        <div className="max-w-7xl mx-auto px-6 lg:px-10">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
            {stats.map((s, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.6, ease: [0.23, 1, 0.32, 1] }}
              >
                <StatCard {...s} start={statsStarted} />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════════
          PRODUCT VERTICALS — 8-column grid with hover depth
      ══════════════════════════════════════════════════════════════════════ */}
      <section className="py-28" style={{ background: "linear-gradient(180deg, transparent 0%, rgba(124,58,237,0.03) 50%, transparent 100%)" }}>
        <div className="max-w-7xl mx-auto px-6 lg:px-10">
          {/* Section header */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="mb-20"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold uppercase tracking-widest mb-6" style={{ background: "rgba(124,58,237,0.1)", border: "1px solid rgba(124,58,237,0.25)", color: "rgba(196,181,253,0.9)" }}>
              <Layers className="w-3.5 h-3.5" /> Product Portfolio
            </div>
            <h2 className="font-black text-white mb-5 tracking-tight" style={{ fontFamily: "Sora, sans-serif", fontSize: "clamp(2.5rem, 5vw, 4rem)" }}>
              8 Verticals.<br />
              <span style={{ background: "linear-gradient(135deg, #A78BFA 0%, #7C3AED 40%, #F59E0B 80%, #FCD34D 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>77+ Products.</span>
            </h2>
            <p className="text-slate-400 text-xl max-w-2xl leading-relaxed">
              From AI infrastructure to consumer mobile apps, AGL builds and ships enterprise-grade software across every major technology vertical.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {verticals.map((v, i) => {
              const Icon = v.icon;
              return (
                <Link key={v.slug} href={`/products`}>
                  <motion.div
                    initial={{ opacity: 0, y: 25 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.07, duration: 0.6, ease: [0.23, 1, 0.32, 1] }}
                    className="group relative p-6 rounded-2xl cursor-pointer overflow-hidden transition-all duration-400"
                    style={{ background: "rgba(124,58,237,0.05)", border: "1px solid rgba(124,58,237,0.12)", boxShadow: "inset 0 1px 0 rgba(255,255,255,0.03)" }}
                    whileHover={{ y: -6, borderColor: v.color + "50" }}
                  >
                    {/* Hover glow */}
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" style={{ background: `radial-gradient(circle at 0% 0%, ${v.color}15, transparent 65%)` }} />
                    {/* Top accent line */}
                    <div className="absolute top-0 left-0 right-0 h-px opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{ background: `linear-gradient(90deg, transparent, ${v.color}60, transparent)` }} />

                    <div className="relative z-10">
                      <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-5 transition-transform duration-300 group-hover:scale-110" style={{ background: v.bg, color: v.color }}>
                        <Icon className="w-6 h-6" />
                      </div>
                      <div className="text-3xl font-black mb-1 transition-colors duration-300" style={{ fontFamily: "Sora, sans-serif", color: v.color }}>
                        {v.count}
                      </div>
                      <h3 className="font-bold text-white text-sm mb-2.5 leading-snug">{v.title}</h3>
                      <p className="text-slate-500 text-xs leading-relaxed line-clamp-2">{v.desc}</p>
                      <div className="flex items-center gap-1 mt-4 text-xs font-semibold opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-1 group-hover:translate-y-0" style={{ color: v.color }}>
                        View Products <ChevronRight className="w-3 h-3" />
                      </div>
                    </div>
                  </motion.div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════════
          DIMENSIONAL STACK TEASER — 3D–7D, honestly marked (T-013)
          Static markup only: CSS-transform (framer-motion) cards + one inline
          SVG. No canvas, no WebGL, no reference into client/src/dimensions/
          beyond the zero-import contract module. ARCHITECTURE-DIMENSIONS.md §9.7.
      ══════════════════════════════════════════════════════════════════════ */}
      <section
        className="py-28 overflow-hidden"
        data-testid="dimensions-teaser"
        style={{ borderTop: "1px solid rgba(124,58,237,0.1)", background: "linear-gradient(180deg, transparent 0%, rgba(124,58,237,0.05) 50%, transparent 100%)" }}
      >
        <div className="max-w-7xl mx-auto px-6 lg:px-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="mb-16 flex flex-col lg:flex-row lg:items-end lg:justify-between gap-8"
          >
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold uppercase tracking-widest mb-6" style={{ background: "rgba(124,58,237,0.1)", border: "1px solid rgba(124,58,237,0.25)", color: "rgba(196,181,253,0.9)" }}>
                <Box className="w-3.5 h-3.5" /> Dimensional Capability Stack
              </div>
              <h2 className="font-black text-white mb-5 tracking-tight" style={{ fontFamily: "Sora, sans-serif", fontSize: "clamp(2.2rem, 4.5vw, 3.5rem)" }}>
                Five levels.<br />
                <span style={{ background: "linear-gradient(135deg, #A78BFA 0%, #7C3AED 40%, #F59E0B 80%, #FCD34D 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
                  One evolving stage.
                </span>
              </h2>
              <p className="text-slate-400 text-lg leading-relaxed">
                From a real 3D model you can orbit, to a shared session two people edit together
                live. Each level below is marked exactly as it stands today — nothing here is shown
                as running before it genuinely is.
              </p>
            </div>

            {/* Decorative isometric wireframe — static inline SVG, part of the HTML, no canvas */}
            <svg aria-hidden="true" focusable="false" width="96" height="96" viewBox="0 0 100 100" className="hidden sm:block flex-shrink-0 opacity-70">
              <polygon points="50,8 83,29 83,71 50,92 17,71 17,29" fill="none" stroke="#A78BFA" strokeWidth="2" />
              <line x1="50" y1="50" x2="50" y2="8" stroke="#A78BFA" strokeWidth="1.5" opacity="0.6" />
              <line x1="50" y1="50" x2="83" y2="71" stroke="#A78BFA" strokeWidth="1.5" opacity="0.6" />
              <line x1="50" y1="50" x2="17" y2="71" stroke="#A78BFA" strokeWidth="1.5" opacity="0.6" />
              <line x1="50" y1="50" x2="83" y2="29" stroke="#F59E0B" strokeWidth="1.5" opacity="0.5" />
              <line x1="50" y1="50" x2="17" y2="29" stroke="#F59E0B" strokeWidth="1.5" opacity="0.5" />
            </svg>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-12">
            {DIMENSION_LEVELS.map((level, i) => {
              const meta = DIMENSION_LEVEL_META[level];
              const live = isDimensionLevelLive(level);
              return (
                <motion.div
                  key={level}
                  data-testid={`dimension-teaser-card-${level}`}
                  initial={{ opacity: 0, y: 25 }}
                  whileInView={{ opacity: 1, y: i * 4 }}
                  whileHover={{ y: i * 4 - 6 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08, duration: 0.6, ease: [0.23, 1, 0.32, 1] }}
                  className="relative p-5 rounded-2xl"
                  style={{
                    background: "rgba(17,19,39,0.6)",
                    border: live ? "1px solid rgba(124,58,237,0.35)" : "1px solid rgba(255,255,255,0.08)",
                  }}
                >
                  <div className="flex items-center justify-between mb-3 gap-2">
                    <span className="text-xl font-black" style={{ fontFamily: "Sora, sans-serif", color: live ? "#C4B5FD" : "rgba(255,255,255,0.7)" }}>
                      {level}
                    </span>
                    <span
                      className="text-[9px] uppercase tracking-widest font-mono px-2 py-0.5 rounded-full whitespace-nowrap"
                      style={{
                        background: live ? "rgba(52,211,153,0.15)" : "rgba(255,255,255,0.06)",
                        color: live ? "#34D399" : "rgba(255,255,255,0.6)",
                      }}
                    >
                      {live ? "Live" : "Not yet available"}
                    </span>
                  </div>
                  <div className="font-bold text-white text-sm mb-1.5">{meta.short}</div>
                  <p className="text-slate-400 text-xs leading-relaxed">{meta.summary}</p>
                </motion.div>
              );
            })}
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center"
          >
            <Link
              href="/dimensions"
              data-testid="dimensions-teaser-cta"
              className="inline-flex items-center gap-3 px-8 py-4 rounded-xl font-bold text-white text-base transition-all duration-300 hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:ring-offset-2 focus-visible:ring-offset-[#030408]"
              style={{ background: "linear-gradient(135deg, #7C3AED 0%, #5B21B6 100%)", boxShadow: "0 0 40px rgba(124,58,237,0.35)" }}
            >
              Open the live 3D–7D stage
              <ArrowRight className="w-5 h-5" />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════════
          FEATURED PRODUCTS — Flagship app showcase
      ══════════════════════════════════════════════════════════════════════ */}
      <section className="py-28" style={{ background: "linear-gradient(180deg, #030408 0%, #07050F 50%, #030408 100%)" }}>
        <div className="max-w-7xl mx-auto px-6 lg:px-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-16"
          >
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold uppercase tracking-widest mb-6" style={{ background: "rgba(245,158,11,0.1)", border: "1px solid rgba(245,158,11,0.25)", color: "rgba(253,230,138,0.9)" }}>
                <Star className="w-3.5 h-3.5" /> Flagship Applications
              </div>
              <h2 className="font-black text-white tracking-tight" style={{ fontFamily: "Sora, sans-serif", fontSize: "clamp(2.2rem, 4.5vw, 3.5rem)" }}>
                Products that define<br />
                <span style={{ background: "linear-gradient(135deg, #F59E0B 0%, #FCD34D 50%, #A78BFA 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
                  categories
                </span>
              </h2>
            </div>
            <Link href="/products">
              <button className="flex items-center gap-2 text-slate-400 hover:text-white text-sm font-medium transition-colors group whitespace-nowrap">
                View all 77 products
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </Link>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {featuredProducts.map((p, i) => (
              <Link key={p.slug} href={`/products/${p.slug}`}>
                <motion.div
                  initial={{ opacity: 0, y: 25 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08, duration: 0.6 }}
                  className="group relative p-6 rounded-2xl cursor-pointer overflow-hidden transition-all duration-400"
                  style={{ background: "rgba(124,58,237,0.05)", border: "1px solid rgba(124,58,237,0.12)", boxShadow: "inset 0 1px 0 rgba(255,255,255,0.03)" }}
                  whileHover={{ y: -5 }}
                >
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" style={{ background: `radial-gradient(circle at 0% 100%, ${p.color}10, transparent 60%)` }} />

                  <div className="relative z-10">
                    <div className="flex items-start justify-between mb-5">
                      <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl" style={{ background: p.color + "20" }}>
                        {p.icon}
                      </div>
                      <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold" style={{ background: "rgba(16,185,129,0.15)", color: "#34D399" }}>
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        {p.status}
                      </div>
                    </div>

                    <div className="mb-1">
                      <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: p.color }}>{p.tag}</span>
                    </div>
                    <h3 className="text-lg font-bold text-white mb-2" style={{ fontFamily: "Sora, sans-serif" }}>{p.name}</h3>
                    <p className="text-slate-400 text-sm leading-relaxed mb-5">{p.tagline}</p>

                    <div className="flex items-center gap-1.5 text-sm font-semibold opacity-60 group-hover:opacity-100 transition-all duration-300" style={{ color: p.color }}>
                      Learn more <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </motion.div>
              </Link>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mt-12"
          >
              <Link href="/products">
              <button className="inline-flex items-center gap-2 px-8 py-4 rounded-xl font-semibold text-white transition-all duration-300 hover:scale-105" style={{ background: "rgba(124,58,237,0.1)", border: "1px solid rgba(124,58,237,0.25)" }}>
                Browse All 77 Products →
              </button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════════
          WHY AGL — Differentiators grid
      ══════════════════════════════════════════════════════════════════════ */}
      <section className="py-28" style={{ borderTop: "1px solid rgba(124,58,237,0.1)" }}>
        <div className="max-w-7xl mx-auto px-6 lg:px-10">
          <div className="grid lg:grid-cols-2 gap-16 items-start">
            {/* Left: headline + CTAs */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold uppercase tracking-widest mb-8" style={{ background: "rgba(124,58,237,0.1)", border: "1px solid rgba(124,58,237,0.25)", color: "rgba(196,181,253,0.9)" }}>
                <Building2 className="w-3.5 h-3.5" /> Why American Group LLC
              </div>
              <h2 className="font-black text-white mb-6 tracking-tight leading-tight" style={{ fontFamily: "Sora, sans-serif", fontSize: "clamp(2.2rem, 4vw, 3.5rem)" }}>
                Enterprise quality.<br />
                <span style={{ background: "linear-gradient(135deg, #A78BFA 0%, #7C3AED 50%, #F59E0B 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
                  Startup velocity.
                </span>
              </h2>
              <p className="text-slate-400 text-lg leading-relaxed mb-10">
                We combine the engineering rigor of a Fortune 500 technology company with the speed and agility of a startup. Every product we ship is battle-tested, secure, and built to scale.
              </p>
              <ul className="space-y-3 mb-10">
                {["Full-stack product teams from concept to launch", "Native iOS, Android, and cross-platform Flutter expertise", "Enterprise AI/ML integrations with production-grade stability", "Dedicated QA, DevOps, and post-launch support teams"].map((item) => (
                  <li key={item} className="flex items-start gap-3 text-slate-300 text-sm">
                    <CheckCircle className="w-5 h-5 text-indigo-400 mt-0.5 flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
              <div className="flex flex-wrap gap-4">
                <Link href="/american-group-llc">
                  <button className="flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-white transition-all duration-300 hover:scale-105 text-sm" style={{ background: "linear-gradient(135deg, #7C3AED 0%, #5B21B6 100%)", boxShadow: "0 0 20px rgba(124,58,237,0.3)" }}>
                    About AGL <ArrowRight className="w-4 h-4" />
                  </button>
                </Link>
                <Link href="/contact">
                  <button className="flex items-center gap-2 px-6 py-3 rounded-xl font-semibold border border-white/15 text-white hover:bg-white/8 transition-all duration-300 text-sm">
                    Get in Touch
                  </button>
                </Link>
              </div>
            </motion.div>

            {/* Right: differentiator cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {differentiators.map((d, i) => {
                const Icon = d.icon;
                return (
                  <motion.div
                    key={d.title}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.08, duration: 0.6 }}
                    className="p-5 rounded-xl transition-all duration-300"
                    style={{ background: "rgba(124,58,237,0.05)", border: "1px solid rgba(124,58,237,0.12)" }}
                  >
                    <div className="w-9 h-9 rounded-lg flex items-center justify-center mb-3" style={{ background: "rgba(124,58,237,0.15)", color: "#A78BFA" }}>
                      <Icon className="w-4.5 h-4.5" />
                    </div>
                    <h4 className="font-bold text-white text-sm mb-1.5">{d.title}</h4>
                    <p className="text-slate-500 text-xs leading-relaxed">{d.desc}</p>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════════
          PLATFORM SECTION — Mobile-first with visual showcase
      ══════════════════════════════════════════════════════════════════════ */}
      <section className="py-28 overflow-hidden" style={{ borderTop: "1px solid rgba(124,58,237,0.1)" }}>
        <div className="max-w-7xl mx-auto px-6 lg:px-10">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left: image */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="relative"
            >
              <div className="rounded-3xl overflow-hidden" style={{ border: "1px solid rgba(124,58,237,0.2)", boxShadow: "0 40px 80px rgba(0,0,0,0.6), 0 0 60px rgba(124,58,237,0.2)" }}>
                <img
                  src="https://d2xsxph8kpxj0f.cloudfront.net/310519663397835904/iKtH34UE32MfRNT3w4zNEC/agl-products-bg-Us6fz7efmAJiYnk273pQms.webp"
                  alt="AGL Mobile Products"
                  className="w-full h-72 lg:h-96 object-cover"
                />
                <div className="absolute inset-0 rounded-3xl" style={{ background: "linear-gradient(to top, rgba(7,11,20,0.6), transparent 50%)" }} />
              </div>
              {/* Floating stat badge */}
              <div className="absolute -bottom-5 -right-5 px-6 py-4 rounded-2xl backdrop-blur-xl" style={{ background: "rgba(5,6,15,0.95)", border: "1px solid rgba(124,58,237,0.25)", boxShadow: "0 8px 32px rgba(0,0,0,0.5)" }}>
                <div className="text-3xl font-black text-white" style={{ fontFamily: "Sora, sans-serif" }}>40+</div>
                <div className="text-slate-400 text-xs">Native iOS Apps</div>
              </div>
            </motion.div>

            {/* Right: content */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold uppercase tracking-widest mb-8" style={{ background: "rgba(124,58,237,0.1)", border: "1px solid rgba(124,58,237,0.25)", color: "rgba(196,181,253,0.9)" }}>
                <Smartphone className="w-3.5 h-3.5" /> Mobile First
              </div>
              <h2 className="font-black text-white mb-6 tracking-tight" style={{ fontFamily: "Sora, sans-serif", fontSize: "clamp(2rem, 4vw, 3rem)" }}>
                Available on<br />
                <span style={{ background: "linear-gradient(135deg, #C4B5FD 0%, #7C3AED 50%, #F59E0B 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
                  Every Platform
                </span>
              </h2>
              <p className="text-slate-400 text-lg leading-relaxed mb-10">
                Our mobile apps are built with native iOS (Swift), native Android (Kotlin), and cross-platform Flutter — delivering pixel-perfect experiences on every device.
              </p>
              <div className="grid grid-cols-3 gap-4 mb-10">
                {[
                  { count: "40+", label: "iOS Apps", sub: "Swift, SwiftUI" },
                  { count: "45+", label: "Android Apps", sub: "Kotlin, Jetpack" },
                  { count: "20+", label: "Cross-Platform", sub: "Flutter, React Native" },
                ].map((item) => (
                  <div key={item.label} className="text-center p-4 rounded-xl" style={{ background: "rgba(124,58,237,0.07)", border: "1px solid rgba(124,58,237,0.15)" }}>
                    <div className="text-2xl font-black text-white mb-1" style={{ fontFamily: "Sora, sans-serif" }}>{item.count}</div>
                    <div className="text-white/80 text-xs font-semibold mb-0.5">{item.label}</div>
                    <div className="text-slate-500 text-xs">{item.sub}</div>
                  </div>
                ))}
              </div>
              <Link href="/products">
                <button className="flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-white transition-all duration-300 hover:scale-105 text-sm" style={{ background: "linear-gradient(135deg, #7C3AED 0%, #5B21B6 100%)", boxShadow: "0 0 20px rgba(124,58,237,0.3)" }}>
                  Browse All Apps <ArrowRight className="w-4 h-4" />
                </button>
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════════
          HIRING TEASER — We're growing
      ══════════════════════════════════════════════════════════════════════ */}
      <section className="py-20" style={{ borderTop: "1px solid rgba(124,58,237,0.1)", background: "linear-gradient(180deg, transparent 0%, rgba(124,58,237,0.03) 50%, transparent 100%)" }}>
        <div className="max-w-7xl mx-auto px-6 lg:px-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="text-center mb-12"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold uppercase tracking-widest mb-6" style={{ background: "rgba(245,158,11,0.1)", border: "1px solid rgba(245,158,11,0.25)", color: "rgba(253,230,138,0.9)" }}>
              <Users className="w-3.5 h-3.5" /> We're Hiring
            </div>
            <h2 className="font-black text-white mb-4 tracking-tight" style={{ fontFamily: "Sora, sans-serif", fontSize: "clamp(2rem, 4vw, 3rem)" }}>
              Join the team building{" "}
              <span style={{ background: "linear-gradient(135deg, #F59E0B 0%, #FCD34D 50%, #A78BFA 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
                the future
              </span>
            </h2>
            <p className="text-slate-400 text-lg max-w-2xl mx-auto leading-relaxed">
              We're growing across all 8 verticals. Open roles in AI, mobile, FinTech, cybersecurity, health tech, and more — full-time and internships.
            </p>
          </motion.div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-10">
            {[
              { label: "Enterprise AI", count: "3 roles", color: "#818CF8" },
              { label: "Consumer Mobile", count: "3 roles", color: "#A78BFA" },
              { label: "FinTech", count: "3 roles", color: "#34D399" },
              { label: "CyberSecurity", count: "3 roles", color: "#F87171" },
              { label: "Health & Wellness", count: "2 roles", color: "#F43F5E" },
              { label: "Travel & Aviation", count: "2 roles", color: "#0EA5E9" },
              { label: "Social & Lifestyle", count: "2 roles", color: "#8B5CF6" },
              { label: "Internships", count: "7 roles", color: "#F472B6" },
            ].map((v, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05, duration: 0.5 }}
                className="p-4 rounded-xl text-center"
                style={{ background: "rgba(255,255,255,0.03)", border: `1px solid ${v.color}25` }}
              >
                <div className="text-lg font-black mb-1" style={{ color: v.color }}>{v.count}</div>
                <div className="text-xs text-slate-400 font-medium">{v.label}</div>
              </motion.div>
            ))}
          </div>
          <div className="text-center">
            <Link href="/careers">
              <button className="group inline-flex items-center gap-3 px-10 py-4 rounded-xl font-bold text-white text-base transition-all duration-300 hover:scale-105" style={{ background: "linear-gradient(135deg, #7C3AED 0%, #5B21B6 100%)", boxShadow: "0 0 40px rgba(124,58,237,0.35)" }}>
                View All Open Positions
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
            </Link>
          </div>
        </div>
      </section>
      {/* ══════════════════════════════════════════════════════════════════════
          INDIA OPS BANNER — SafeCodeX mention
      ══════════════════════════════════════════════════════════════════════ */}
      <section className="py-12" style={{ borderTop: "1px solid rgba(124,58,237,0.1)" }}>
        <div className="max-w-7xl mx-auto px-6 lg:px-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="flex flex-col lg:flex-row items-center justify-between gap-6 p-6 lg:p-8 rounded-2xl"
            style={{ background: "linear-gradient(135deg, rgba(124,58,237,0.1) 0%, rgba(5,6,15,0.8) 100%)", border: "1px solid rgba(124,58,237,0.2)", boxShadow: "inset 0 1px 0 rgba(255,255,255,0.04)" }}
          >
            <div className="flex items-center gap-5">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0" style={{ background: "rgba(124,58,237,0.18)", border: "1px solid rgba(124,58,237,0.25)" }}>
                🇮🇳
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-white font-bold">SafeCodeX Research Center</span>
                  <span className="px-2 py-0.5 rounded-full text-xs font-semibold" style={{ background: "rgba(124,58,237,0.2)", color: "rgba(196,181,253,0.9)" }}>India Operations</span>
                </div>
                <p className="text-slate-400 text-sm">Our Hyderabad-based engineering support office handles QA testing, embedded firmware research, and mobile app development operations from Santa Clara. SafeCodeX operates as an integral part of the AGL delivery pipeline.</p>
              </div>
            </div>
            <Link href="/safecodex-research" className="flex-shrink-0">
              <button className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-white/15 text-white text-sm font-semibold hover:bg-white/8 transition-all whitespace-nowrap">
                Learn More <ExternalLink className="w-3.5 h-3.5" />
              </button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════════
          CTA SECTION — Full-bleed premium call to action
      ══════════════════════════════════════════════════════════════════════ */}
      <section className="py-32 relative overflow-hidden" style={{ borderTop: "1px solid rgba(124,58,237,0.1)" }}>
        {/* Rich CTA aurora background */}
        <div className="absolute inset-0" style={{ background: "radial-gradient(ellipse at 50% 100%, rgba(124,58,237,0.18) 0%, transparent 60%), radial-gradient(ellipse at 20% 50%, rgba(245,158,11,0.06) 0%, transparent 50%)" }} />
        <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold uppercase tracking-widest mb-8" style={{ background: "rgba(124,58,237,0.1)", border: "1px solid rgba(124,58,237,0.25)", color: "rgba(196,181,253,0.9)" }}>
              <Zap className="w-3.5 h-3.5" /> Start Building
            </div>
            <h2 className="font-black text-white mb-6 tracking-tight" style={{ fontFamily: "Sora, sans-serif", fontSize: "clamp(2.5rem, 5vw, 4.5rem)" }}>
              Ready to build something{" "}
              <span style={{ background: "linear-gradient(135deg, #C4B5FD 0%, #7C3AED 35%, #F59E0B 70%, #FCD34D 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
                extraordinary?
              </span>
            </h2>
            <p className="text-slate-400 text-xl leading-relaxed mb-12 max-w-2xl mx-auto">
              Whether you need a custom enterprise application, a mobile app for millions of users, or an AI integration for your business — AGL delivers.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Link href="/contact">
                <button className="group flex items-center gap-3 px-10 py-5 rounded-xl font-bold text-white text-base transition-all duration-300 hover:scale-105 hover:shadow-2xl active:scale-95" style={{ background: "linear-gradient(135deg, #7C3AED 0%, #5B21B6 100%)", boxShadow: "0 0 50px rgba(124,58,237,0.4), inset 0 1px 0 rgba(255,255,255,0.1)" }}>
                  Start a Project
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
              </Link>
              <Link href="/products">
                <button className="flex items-center gap-3 px-10 py-5 rounded-xl font-bold text-base transition-all duration-300 hover:scale-105" style={{ background: "linear-gradient(135deg, #F59E0B 0%, #D97706 100%)", color: "#1C0A00", boxShadow: "0 0 30px rgba(245,158,11,0.3)" }}>
                  Browse Products
                </button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      </main>
      <Footer />
    </div>
  );
}
