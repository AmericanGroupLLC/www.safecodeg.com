/**
 * About Page — MNC Enterprise Dark Theme v5.0
 * Full dark, cinematic hero, timeline, values, world-class design
 */
import { motion } from "framer-motion";
import { Link } from "wouter";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { ArrowRight, Globe, Target, Zap, Star, Users, Award, Building2, CheckCircle } from "lucide-react";

const timeline = [
  { year: "2018", title: "Founded in California", desc: "American Group LLC incorporated as an S-Corp in Santa Clara, California with a vision to build world-class software products." },
  { year: "2019", title: "India Operations Office", desc: "SafeCodeX Research Center Pvt. Ltd. established in Hyderabad, India to support backend delivery, QA, and R&D operations." },
  { year: "2020", title: "First 10 Products Launched", desc: "Initial product portfolio launched across mobile and enterprise verticals, establishing market presence." },
  { year: "2021", title: "AI Research Division", desc: "Dedicated AI research division established, focusing on frontier LLM research and cognitive computing." },
  { year: "2022", title: "50 Active Repositories", desc: "Portfolio expanded to 50+ active repositories across 5 business verticals with global client base." },
  { year: "2023", title: "77 Products Milestone", desc: "Reached 77 active products across 8 verticals — Mobile, AI, FinTech, CyberSecurity, Health, Travel, and more." },
  { year: "2024+", title: "28-Product Roadmap", desc: "Ambitious roadmap of 28 new products in AI SaaS, DevTools, and Cybersecurity verticals underway." },
];

const values = [
  { icon: Target, title: "Mission-Driven", desc: "Every product we build solves a real problem for real people. We don't build for the sake of building.", color: "#6366F1" },
  { icon: Zap, title: "Relentless Execution", desc: "77 repositories. Always shipping. We believe in momentum, iteration, and delivering value continuously.", color: "#FBBF24" },
  { icon: Globe, title: "Global by Default", desc: "Headquartered in California, with backend operations in India. Our products are designed for global markets from day one.", color: "#34D399" },
  { icon: Star, title: "Excellence Without Compromise", desc: "We hold ourselves to the highest standards of engineering, design, and user experience.", color: "#F87171" },
  { icon: Users, title: "People First", desc: "Our team is our greatest asset. We invest in talent, culture, and creating an environment where innovation thrives.", color: "#60A5FA" },
  { icon: Award, title: "Research-Led Innovation", desc: "Our India operations team ensures we stay at the frontier of AI, IoT, blockchain, and emerging technologies.", color: "#A78BFA" },
];

export default function AboutPage() {
  return (
    <div style={{ background: "#070B14", color: "white", minHeight: "100vh" }}>
      <Navigation />

      {/* ── Hero ──────────────────────────────────────────────────────────── */}
      <section className="relative pt-36 pb-24 overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="https://d2xsxph8kpxj0f.cloudfront.net/310519663397835904/iKtH34UE32MfRNT3w4zNEC/agl-about-hero-3xmu7HKa64Q4pDncJzjyd5.webp"
            alt=""
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0" style={{ background: "linear-gradient(135deg, rgba(7,11,20,0.96) 0%, rgba(7,11,20,0.85) 50%, rgba(7,11,20,0.75) 100%)" }} />
          <div className="absolute inset-0" style={{ background: "radial-gradient(ellipse at 20% 60%, rgba(99,102,241,0.15), transparent 55%)" }} />
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-32" style={{ background: "linear-gradient(to bottom, transparent, #070B14)" }} />

        <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-10">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-indigo-500/25 bg-indigo-500/8 text-indigo-300 text-xs font-semibold uppercase tracking-widest mb-8">
              <Building2 className="w-3.5 h-3.5" /> About American Group LLC
            </div>
            <h1 className="font-black text-white mb-6 tracking-tight" style={{ fontFamily: "Sora, sans-serif", fontSize: "clamp(3rem, 7vw, 6rem)" }}>
              Our Story.<br />
              <span style={{ background: "linear-gradient(135deg, #818CF8, #A78BFA)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
                Our Mission.
              </span>
            </h1>
            <p className="text-xl text-slate-300 max-w-2xl leading-relaxed">
              A California-based technology company building world-class software products, enterprise IT solutions, and 77 innovative apps — shipped worldwide from Santa Clara.
            </p>
          </motion.div>
        </div>
      </section>

      {/* ── Story + Timeline ──────────────────────────────────────────────── */}
      <section className="py-28">
        <div className="max-w-7xl mx-auto px-6 lg:px-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
            {/* Story */}
            <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.7 }}>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-indigo-500/25 bg-indigo-500/8 text-indigo-300 text-xs font-semibold uppercase tracking-widest mb-8">
                Our Story
              </div>
              <h2 className="font-black text-white mb-6 tracking-tight" style={{ fontFamily: "Sora, sans-serif", fontSize: "clamp(2rem, 4vw, 3rem)" }}>
                Built for scale<br />
                <span style={{ background: "linear-gradient(135deg, #818CF8, #6366F1)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
                  from day one
                </span>
              </h2>
              <div className="space-y-5 text-slate-400 leading-relaxed text-base">
                <p>
                  American Group LLC was founded with a simple but ambitious belief: that the best technology companies are built by combining the best of multiple worlds. Silicon Valley provides the market insight, the ambition, and the access to capital. India provides the engineering depth, the research rigor, and the talent density.
                </p>
                <p>
                  We are a uniquely positioned technology company — one that moves with the speed of a startup while delivering the quality and scale of an enterprise. Our Hyderabad operations office (SafeCodeX Research Center Pvt. Ltd.) handles backend delivery and QA support.
                </p>
                <p>
                  Today, our 77 active repositories span eight distinct business verticals, each engineered to operate independently while sharing a common identity platform, backend gateway, and CI/CD infrastructure. We build the entire stack — from on-device LLMs and Wear OS apps to multi-cloud control planes.
                </p>
              </div>

              <div className="mt-10 grid grid-cols-2 gap-4">
                {[
                  { label: "🇺🇸 Headquarters", value: "Santa Clara, CA" },
                  { label: "🇮🇳 India Office", value: "Hyderabad, Telangana" },
                  { label: "📅 Founded", value: "2018" },
                  { label: "📦 Products", value: "77+ Active" },
                ].map((item) => (
                  <div key={item.label} className="p-4 rounded-xl border border-white/8 bg-white/[0.025]">
                    <div className="text-slate-500 text-xs mb-1">{item.label}</div>
                    <div className="text-white font-semibold text-sm">{item.value}</div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Timeline */}
            <motion.div initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.7 }}>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-amber-500/25 bg-amber-500/8 text-amber-300 text-xs font-semibold uppercase tracking-widest mb-8">
                Our Journey
              </div>
              <div className="relative pl-6 border-l border-white/10">
                {timeline.map((item, i) => (
                  <motion.div
                    key={item.year}
                    initial={{ opacity: 0, x: 20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.08, duration: 0.5 }}
                    className="relative mb-8 last:mb-0"
                  >
                    {/* Dot */}
                    <div className="absolute -left-[1.65rem] top-1 w-3 h-3 rounded-full border-2 border-indigo-500 bg-indigo-500/30" />
                    <div className="flex items-center gap-3 mb-1.5">
                      <span className="px-2.5 py-1 rounded-lg text-xs font-bold font-mono" style={{ background: "rgba(99,102,241,0.2)", color: "#818CF8" }}>
                        {item.year}
                      </span>
                      <span className="font-semibold text-white text-sm">{item.title}</span>
                    </div>
                    <p className="text-slate-500 text-xs leading-relaxed">{item.desc}</p>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── Values ────────────────────────────────────────────────────────── */}
      <section className="py-28 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-6 lg:px-10">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.7 }} className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-indigo-500/25 bg-indigo-500/8 text-indigo-300 text-xs font-semibold uppercase tracking-widest mb-6">
              Our Values
            </div>
            <h2 className="font-black text-white tracking-tight" style={{ fontFamily: "Sora, sans-serif", fontSize: "clamp(2.2rem, 4.5vw, 3.5rem)" }}>
              What drives us forward
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {values.map((v, i) => {
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
                  <div className="w-11 h-11 rounded-xl flex items-center justify-center mb-4 transition-transform duration-300 group-hover:scale-110" style={{ background: v.color + "20", color: v.color }}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="font-bold text-white text-base mb-2" style={{ fontFamily: "Sora, sans-serif" }}>{v.title}</h3>
                  <p className="text-slate-500 text-sm leading-relaxed">{v.desc}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Two Entities ──────────────────────────────────────────────────── */}
      <section className="py-28 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-6 lg:px-10">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.7 }} className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-indigo-500/25 bg-indigo-500/8 text-indigo-300 text-xs font-semibold uppercase tracking-widest mb-6">
              Our Entities
            </div>
            <h2 className="font-black text-white tracking-tight" style={{ fontFamily: "Sora, sans-serif", fontSize: "clamp(2.2rem, 4.5vw, 3.5rem)" }}>
              One organization.<br />
              <span style={{ background: "linear-gradient(135deg, #818CF8, #FBBF24)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
                Two global locations.
              </span>
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {[
              {
                flag: "🇺🇸",
                title: "American Group LLC",
                sub: "Headquarters · Santa Clara, California",
                color: "#6366F1",
                desc: "The primary legal entity and brand owner. Responsible for product strategy, engineering leadership, client relationships, and all commercial operations. All 77 products are owned and operated by American Group LLC.",
                bullets: ["Product strategy & roadmap", "Engineering leadership", "Client relationships", "Commercial operations", "All 77 products"],
                href: "/american-group-llc",
              },
              {
                flag: "🇮🇳",
                title: "SafeCodeX Research Center Pvt. Ltd.",
                sub: "India Operations · Hyderabad, Telangana",
                color: "#FBBF24",
                desc: "The India-based support entity providing QA testing, embedded firmware research, and mobile app development support. SafeCodeX operates as an integral part of the AGL delivery pipeline under the direction of American Group LLC.",
                bullets: ["QA & testing operations", "Embedded firmware R&D", "Mobile app development support", "Backend delivery support", "Research & development"],
                href: "/safecodex-research",
              },
            ].map((entity, i) => (
              <motion.div
                key={entity.title}
                initial={{ opacity: 0, y: 25 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15, duration: 0.7 }}
                className="p-8 rounded-2xl border border-white/8 bg-white/[0.025] hover:border-white/15 transition-all duration-300"
              >
                <div className="flex items-center gap-4 mb-6">
                  <span className="text-4xl">{entity.flag}</span>
                  <div>
                    <h3 className="font-bold text-white text-lg" style={{ fontFamily: "Sora, sans-serif" }}>{entity.title}</h3>
                    <p className="text-slate-500 text-sm">{entity.sub}</p>
                  </div>
                </div>
                <p className="text-slate-400 text-sm leading-relaxed mb-6">{entity.desc}</p>
                <ul className="space-y-2 mb-8">
                  {entity.bullets.map((b) => (
                    <li key={b} className="flex items-center gap-2 text-slate-400 text-sm">
                      <CheckCircle className="w-4 h-4 flex-shrink-0" style={{ color: entity.color }} />
                      {b}
                    </li>
                  ))}
                </ul>
                <Link href={entity.href}>
                  <button className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition-all duration-300 hover:scale-105" style={{ background: entity.color + "25", border: `1px solid ${entity.color}40`, color: entity.color }}>
                    Learn More <ArrowRight className="w-4 h-4" />
                  </button>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ───────────────────────────────────────────────────────────── */}
      <section className="py-24 border-t border-white/5 relative overflow-hidden">
        <div className="absolute inset-0" style={{ background: "radial-gradient(ellipse at 50% 100%, rgba(99,102,241,0.10), transparent 60%)" }} />
        <div className="relative z-10 max-w-3xl mx-auto px-6 text-center">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.7 }}>
            <h2 className="font-black text-white mb-5 tracking-tight" style={{ fontFamily: "Sora, sans-serif", fontSize: "clamp(2rem, 4vw, 3.5rem)" }}>
              Ready to work with us?
            </h2>
            <p className="text-slate-400 text-lg mb-10">
              Whether you're looking to build a product, explore a partnership, or join our team — we'd love to hear from you.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Link href="/contact">
                <button className="flex items-center gap-2 px-8 py-4 rounded-xl font-bold text-white transition-all duration-300 hover:scale-105" style={{ background: "linear-gradient(135deg, #6366F1, #4F46E5)", boxShadow: "0 0 40px rgba(99,102,241,0.3)" }}>
                  Get in Touch <ArrowRight className="w-4 h-4" />
                </button>
              </Link>
              <Link href="/careers">
                <button className="flex items-center gap-2 px-8 py-4 rounded-xl font-bold border border-white/15 text-white hover:bg-white/8 transition-all duration-300">
                  View Careers
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
