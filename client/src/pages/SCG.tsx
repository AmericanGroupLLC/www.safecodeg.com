/**
 * SafeCodeX Research Center Page — MNC Enterprise Dark Theme v5.0
 * India operations of American Group LLC — full dark design
 */
import { motion } from "framer-motion";
import { Link } from "wouter";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import {
  ArrowRight,
  Code2,
  Brain,
  Shield,
  Globe,
  Zap,
  Users,
  CheckCircle,
  MapPin,
  ChevronRight,
  Cpu,
  Smartphone,
} from "lucide-react";

const services = [
  {
    icon: Code2,
    emoji: "💻",
    title: "Software Outsourcing",
    desc: "End-to-end custom software development tailored to your unique needs — from mobile apps to cloud-based platforms.",
    features: [
      "Custom Software Development",
      "Mobile App Solutions",
      "Cloud-Based Platforms",
      "API Development & Integration",
    ],
    color: "#818CF8",
  },
  {
    icon: Brain,
    emoji: "🧠",
    title: "AI & Machine Learning",
    desc: "Frontier research in artificial intelligence, machine learning, and cognitive computing to give your business a competitive edge.",
    features: [
      "LLM Development & Fine-tuning",
      "Computer Vision",
      "NLP Solutions",
      "AI-Powered Automation",
    ],
    color: "#FBBF24",
  },
  {
    icon: Globe,
    emoji: "🌐",
    title: "IoT & Emerging Tech",
    desc: "Comprehensive IoT solutions, blockchain development, and emerging technology research from smart devices to decentralized systems.",
    features: [
      "IoT Device Integration",
      "Blockchain Development",
      "Edge Computing",
      "Smart Systems",
    ],
    color: "#34D399",
  },
  {
    icon: Shield,
    emoji: "🔐",
    title: "CyberSecurity Research",
    desc: "Advanced security research, vulnerability assessment, and enterprise-grade security solutions with zero-trust architecture.",
    features: [
      "Security Audits",
      "Penetration Testing",
      "Compliance Solutions",
      "Zero-Trust Architecture",
    ],
    color: "#F87171",
  },
  {
    icon: Zap,
    emoji: "⚡",
    title: "R&D Consulting",
    desc: "Strategic research and development consulting to help your organization innovate faster and create breakthrough solutions.",
    features: [
      "Technology Strategy",
      "Innovation Workshops",
      "Proof of Concept",
      "Technical Due Diligence",
    ],
    color: "#A78BFA",
  },
  {
    icon: Users,
    emoji: "👥",
    title: "IT Staff Augmentation",
    desc: "Access India's top engineering talent on demand. Scale your team quickly with pre-vetted, highly skilled developers.",
    features: [
      "Dedicated Development Teams",
      "Staff Augmentation",
      "Technical Recruitment",
      "Offshore Development",
    ],
    color: "#60A5FA",
  },
];

const whyUs = [
  "Dedicated team of world-class experts",
  "Commitment to innovation and quality",
  "End-to-end project ownership",
  "On-time, within-budget delivery",
  "Cutting-edge technology stack",
  "Transparent communication",
  "Agile development methodology",
  "24/7 support and maintenance",
];

export default function SCGPage() {
  return (
    <div style={{ background: "#030408", color: "white", minHeight: "100vh" }}>
      <Navigation />

      {/* ── Hero ──────────────────────────────────────────────────────────── */}
      <section className="relative pt-36 pb-24 overflow-hidden">
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse at 15% 60%, rgba(245,158,11,0.12), transparent 55%)",
          }}
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse at 85% 30%, rgba(124,58,237,0.2), transparent 50%)",
          }}
        />
        <div
          className="absolute inset-0 opacity-[0.025]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)",
            backgroundSize: "80px 80px",
          }}
        />

        <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-slate-500 text-xs font-mono mb-6">
              <Link href="/" className="hover:text-white transition-colors">
                American Group LLC
              </Link>
              <ChevronRight className="w-3 h-3" />
              <span className="text-slate-400">India Office — SafeCodeX</span>
            </div>

            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold text-xs font-semibold uppercase tracking-widest mb-8">
              🇮🇳 India Engineering Office · Private Limited
            </div>
            <h1
              className="font-black text-white mb-6 tracking-tight"
              style={{
                fontFamily: "Sora, sans-serif",
                fontSize: "clamp(3rem, 7vw, 6rem)",
              }}
            >
              SafeCodeX
              <br />
              <span
                style={{
                  background: "linear-gradient(135deg, #FBBF24, #F59E0B)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                Research Center
              </span>
            </h1>
            <p className="text-xl text-slate-300 max-w-3xl leading-relaxed mb-4">
              The India engineering office of{" "}
              <strong className="text-white">American Group LLC</strong> — our
              R&D powerhouse delivering world-class software outsourcing,
              frontier AI research, and engineering excellence from Hyderabad.
            </p>
            <p className="text-slate-500 text-base max-w-2xl mb-10">
              SafeCodeX Research Center Pvt. Ltd. operates under the direction
              of American Group LLC, providing QA, backend delivery, embedded
              firmware research, and mobile development support.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link href="/contact">
                <button
                  className="flex items-center gap-2 px-7 py-3.5 rounded-xl font-bold text-white transition-all duration-300 hover:scale-105"
                  style={{
                    background: "linear-gradient(135deg, #F59E0B, #D97706)",
                    boxShadow: "0 0 30px rgba(245,158,11,0.3)",
                  }}
                >
                  Work With Us <ArrowRight className="w-4 h-4" />
                </button>
              </Link>
              <Link href="/american-group-llc">
                <button className="flex items-center gap-2 px-7 py-3.5 rounded-xl font-bold border border-white/15 text-white hover:bg-white/8 transition-all duration-300">
                  View Parent Company
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
            {[
              {
                value: "10%",
                label: "of AGL Delivery Pipeline",
                color: "#FBBF24",
              },
              { value: "HYD", label: "Hyderabad, Telangana", color: "#34D399" },
              { value: "2019", label: "Year Established", color: "#818CF8" },
              { value: "24/7", label: "Global Coverage", color: "#F87171" },
            ].map((h, i) => (
              <motion.div
                key={h.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.6 }}
                className="p-6 rounded-2xl rounded-2xl text-center"
              >
                <div
                  className="text-3xl font-black mb-1"
                  style={{ fontFamily: "Sora, sans-serif", color: h.color }}
                >
                  {h.value}
                </div>
                <div className="text-slate-400 text-sm">{h.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Services ──────────────────────────────────────────────────────── */}
      <section className="py-28">
        <div className="max-w-7xl mx-auto px-6 lg:px-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="text-center mb-16"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold text-xs font-semibold uppercase tracking-widest mb-6">
              Our Services
            </div>
            <h2
              className="font-black text-white tracking-tight"
              style={{
                fontFamily: "Sora, sans-serif",
                fontSize: "clamp(2.2rem, 4.5vw, 3.5rem)",
              }}
            >
              What we deliver
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {services.map((svc, i) => {
              const Icon = svc.icon;
              return (
                <motion.div
                  key={svc.title}
                  initial={{ opacity: 0, y: 25 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08, duration: 0.6 }}
                  className="group p-6 rounded-2xl rounded-2xl hover:bg-white/[0.04] hover:border-white/15 transition-all duration-300"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
                      style={{ background: svc.color + "20" }}
                    >
                      {svc.emoji}
                    </div>
                    <h3
                      className="font-bold text-white text-sm"
                      style={{ fontFamily: "Sora, sans-serif" }}
                    >
                      {svc.title}
                    </h3>
                  </div>
                  <p className="text-slate-500 text-sm leading-relaxed mb-4">
                    {svc.desc}
                  </p>
                  <ul className="space-y-1.5">
                    {svc.features.map(f => (
                      <li
                        key={f}
                        className="flex items-center gap-2 text-slate-400 text-xs"
                      >
                        <CheckCircle
                          className="w-3.5 h-3.5 flex-shrink-0"
                          style={{ color: svc.color }}
                        />
                        {f}
                      </li>
                    ))}
                  </ul>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Why Us ────────────────────────────────────────────────────────── */}
      <section className="py-28">
        <div className="max-w-7xl mx-auto px-6 lg:px-10">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold text-xs font-semibold uppercase tracking-widest mb-8">
                Why Choose Us
              </div>
              <h2
                className="font-black text-white mb-6 tracking-tight"
                style={{
                  fontFamily: "Sora, sans-serif",
                  fontSize: "clamp(2rem, 4vw, 3rem)",
                }}
              >
                Engineering excellence
                <br />
                <span
                  style={{
                    background: "linear-gradient(135deg, #FBBF24, #F59E0B)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                  }}
                >
                  from India's best
                </span>
              </h2>
              <p className="text-slate-400 leading-relaxed mb-8">
                SafeCodeX Research Center combines India's world-class
                engineering talent with the product vision and market access of
                American Group LLC. The result is a delivery organization that
                operates at the quality bar of Silicon Valley with the scale and
                depth of India's best engineering teams.
              </p>
              <div className="flex items-center gap-3 text-sm text-slate-400">
                <MapPin className="w-4 h-4 text-amber-400" />
                Hyderabad, Telangana, India · Est. 2019
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {whyUs.map((item, i) => (
                  <motion.div
                    key={item}
                    initial={{ opacity: 0, y: 15 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.06, duration: 0.5 }}
                    className="flex items-center gap-3 p-4 rounded-xl rounded-2xl"
                  >
                    <CheckCircle className="w-4 h-4 text-amber-400 flex-shrink-0" />
                    <span className="text-slate-300 text-sm">{item}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── CTA ───────────────────────────────────────────────────────────── */}
      <section className="py-24 relative overflow-hidden">
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse at 50% 100%, rgba(245,158,11,0.08), transparent 60%)",
          }}
        />
        <div className="relative z-10 max-w-3xl mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
            <h2
              className="font-black text-white mb-5 tracking-tight"
              style={{
                fontFamily: "Sora, sans-serif",
                fontSize: "clamp(2rem, 4vw, 3.5rem)",
              }}
            >
              Ready to work with
              <br />
              SafeCodeX?
            </h2>
            <p className="text-slate-400 text-lg mb-10">
              Whether you need software outsourcing, AI research, or engineering
              talent — we're ready to deliver.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Link href="/contact">
                <button
                  className="flex items-center gap-2 px-8 py-4 rounded-xl font-bold text-white transition-all duration-300 hover:scale-105"
                  style={{
                    background: "linear-gradient(135deg, #F59E0B, #D97706)",
                    boxShadow: "0 0 40px rgba(245,158,11,0.25)",
                  }}
                >
                  Get in Touch <ArrowRight className="w-4 h-4" />
                </button>
              </Link>
              <Link href="/american-group-llc">
                <button className="flex items-center gap-2 px-8 py-4 rounded-xl font-bold border border-white/15 text-white hover:bg-white/8 transition-all duration-300">
                  View Parent Company
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
