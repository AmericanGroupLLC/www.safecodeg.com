/**
 * SafeCodeX / India Office Page — "Luminous Clarity" Design System
 * Reframed as the India engineering office of American Group LLC.
 * Includes Siddartha Andalu featured profile article.
 */
import { useEffect } from "react";
import { Link } from "wouter";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import {
  ArrowRight, ExternalLink, Code2, Brain, Shield, Globe, Zap, Users,
  CheckCircle, MapPin, Calendar, Tag, ChevronRight, Cpu, Smartphone,
} from "lucide-react";

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

const services = [
  {
    icon: Code2, emoji: "💻",
    title: "Software Outsourcing",
    desc: "End-to-end custom software development tailored to your unique needs — from mobile apps to cloud-based platforms.",
    features: ["Custom Software Development", "Mobile App Solutions", "Cloud-Based Platforms", "API Development & Integration"],
    color: "oklch(0.52 0.22 270)",
  },
  {
    icon: Brain, emoji: "🧠",
    title: "AI & Machine Learning",
    desc: "Frontier research in artificial intelligence, machine learning, and cognitive computing to give your business a competitive edge.",
    features: ["LLM Development & Fine-tuning", "Computer Vision", "NLP Solutions", "AI-Powered Automation"],
    color: "oklch(0.78 0.18 75)",
  },
  {
    icon: Globe, emoji: "🌐",
    title: "IoT & Emerging Tech",
    desc: "Comprehensive IoT solutions, blockchain development, and emerging technology research from smart devices to decentralized systems.",
    features: ["IoT Device Integration", "Blockchain Development", "Edge Computing", "Smart Systems"],
    color: "oklch(0.72 0.14 165)",
  },
  {
    icon: Shield, emoji: "🔐",
    title: "CyberSecurity Research",
    desc: "Advanced security research, vulnerability assessment, and enterprise-grade security solutions with zero-trust architecture.",
    features: ["Security Audits", "Penetration Testing", "Compliance Solutions", "Zero-Trust Architecture"],
    color: "oklch(0.55 0.18 30)",
  },
  {
    icon: Zap, emoji: "⚡",
    title: "R&D Consulting",
    desc: "Strategic research and development consulting to help your organization innovate faster and create breakthrough solutions.",
    features: ["Technology Strategy", "Innovation Workshops", "Proof of Concept", "Technical Due Diligence"],
    color: "oklch(0.65 0.16 310)",
  },
  {
    icon: Users, emoji: "👥",
    title: "IT Staff Augmentation",
    desc: "Access India's top engineering talent on demand. Scale your team quickly with pre-vetted, highly skilled developers.",
    features: ["Dedicated Development Teams", "Staff Augmentation", "Technical Recruitment", "Offshore Development"],
    color: "oklch(0.60 0.15 200)",
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
  useReveal();

  return (
    <div className="min-h-screen bg-white">
      <Navigation />

      {/* Hero — India Office identity */}
      <section
        className="relative pt-28 pb-20 overflow-hidden"
        style={{ background: "oklch(0.14 0.04 255)" }}
      >
        <div className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `url(https://d2xsxph8kpxj0f.cloudfront.net/310519663397835904/iKtH34UE32MfRNT3w4zNEC/scg-section-bg-6MiGbt85QJDHzM3FnDARSD.webp)`,
            backgroundSize: "cover", backgroundPosition: "center",
          }}
        />
        <div className="absolute inset-0" style={{ background: "linear-gradient(135deg, oklch(0.14 0.04 255) 50%, oklch(0.20 0.06 270) 100%)" }} />
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-white/40 text-xs font-mono mb-6">
            <Link href="/" className="hover:text-white/70 transition-colors">American Group LLC</Link>
            <ChevronRight className="h-3 w-3" />
            <span className="text-white/70">India Office — SafeCodeX</span>
          </div>

          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-mono font-semibold mb-6"
            style={{ background: "oklch(0.78 0.18 75 / 0.15)", color: "oklch(0.78 0.18 75)", border: "1px solid oklch(0.78 0.18 75 / 0.3)" }}>
            🇮🇳 India Engineering Office · Private Limited
          </div>

          <h1 className="text-5xl lg:text-7xl font-bold text-white mb-5" style={{ fontFamily: "'Playfair Display', serif" }}>
            SafeCodeX
            <br />
            <span style={{ color: "oklch(0.78 0.18 75)" }}>Research Center</span>
          </h1>
          <p className="text-xl text-white/65 max-w-2xl mb-3 leading-relaxed">
            The India engineering office of <strong className="text-white/90">American Group LLC</strong> — our R&D powerhouse delivering world-class software outsourcing, frontier AI research, and engineering excellence from India.
          </p>
          <p className="text-sm text-white/40 max-w-xl mb-8 font-mono">
            Same organization. Same standards. Two continents.
          </p>
          <div className="flex flex-wrap gap-4">
            <Link href="/contact"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold btn-press"
              style={{ background: "oklch(0.78 0.18 75)", color: "oklch(0.12 0.04 75)" }}>
              Start a Project <ArrowRight className="h-4 w-4" />
            </Link>
            <a href="https://safecodeg.com" target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-white border border-white/20 hover:bg-white/10 transition-all btn-press">
              <ExternalLink className="h-4 w-4" /> Visit SafeCodeG.com
            </a>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 60" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
            <path d="M0 60L1440 0V60H0Z" fill="white" />
          </svg>
        </div>
      </section>

      {/* One Organization Banner */}
      <section className="py-10 bg-white border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center gap-6 p-6 rounded-2xl reveal"
            style={{ background: "oklch(0.97 0.005 255)", border: "1px solid oklch(0.91 0.006 255)" }}>
            <div className="flex items-center gap-4 shrink-0">
              <div className="flex items-center gap-2">
                <span className="text-3xl">🇺🇸</span>
                <div className="h-px w-8 bg-slate-300" />
                <span className="text-3xl">🇮🇳</span>
              </div>
            </div>
            <div className="flex-1 text-center sm:text-left">
              <div className="font-bold text-slate-900 mb-1">One Organization. Two Locations.</div>
              <p className="text-sm text-slate-500">
                SafeCodeX Research Center is the India division of American Group LLC — incorporated as a Private Limited company in India to enable local operations, talent acquisition, and R&D. All products, IP, and strategy are unified under the American Group LLC umbrella.
              </p>
            </div>
            <Link href="/american-group-llc"
              className="shrink-0 inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-white btn-press"
              style={{ background: "oklch(0.52 0.22 270)" }}>
              View AGL <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Mission + Stats */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="reveal">
              <div className="text-xs font-mono font-semibold uppercase tracking-widest text-slate-400 mb-3">Our Mission</div>
              <h2 className="text-4xl font-bold text-slate-900 mb-6" style={{ fontFamily: "'Playfair Display', serif" }}>
                Accelerating your success with
                <span className="gradient-text-gold"> innovative IT solutions</span>
              </h2>
              <p className="text-slate-600 leading-relaxed mb-4">
                At SafeCodeX Research Center, we are dedicated to revolutionizing the way businesses harness the power of technology. As the India engineering arm of American Group LLC, we bring Silicon Valley standards to every line of code written in India.
              </p>
              <p className="text-slate-600 leading-relaxed mb-6">
                Our mission is to empower your organization with cutting-edge solutions that drive growth, efficiency, and innovation. With a team of highly skilled professionals, we provide end-to-end IT software outsourcing services tailored to your unique needs.
              </p>
              <div className="grid grid-cols-2 gap-3">
                {whyUs.map((item) => (
                  <div key={item} className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
                    <span className="text-sm text-slate-600">{item}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="reveal reveal-delay-2">
              <div className="grid grid-cols-2 gap-4">
                {[
                  { value: "10+", label: "Years Experience", color: "oklch(0.78 0.18 75)" },
                  { value: "200+", label: "Projects Delivered", color: "oklch(0.52 0.22 270)" },
                  { value: "50+", label: "Expert Engineers", color: "oklch(0.72 0.14 165)" },
                  { value: "98%", label: "Client Satisfaction", color: "oklch(0.55 0.18 30)" },
                ].map((s, i) => (
                  <div key={i} className="p-6 rounded-2xl border border-slate-100 bg-slate-50 text-center">
                    <div className="text-4xl font-bold stat-number mb-2" style={{ color: s.color }}>{s.value}</div>
                    <div className="text-xs font-medium text-slate-500 uppercase tracking-widest">{s.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── FEATURED ARTICLE: Siddartha Andalu ── */}
      <section className="py-20" style={{ background: "oklch(0.97 0.005 75)" }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section label */}
          <div className="text-center mb-12 reveal">
            <div className="text-xs font-mono font-semibold uppercase tracking-widest text-slate-400 mb-3">Team Spotlight</div>
            <h2 className="text-4xl lg:text-5xl font-bold text-slate-900" style={{ fontFamily: "'Playfair Display', serif" }}>
              People behind the products
            </h2>
            <p className="text-slate-500 mt-3 max-w-xl mx-auto">
              The engineers who ship 77 products across six verticals — meet the talent driving American Group LLC forward.
            </p>
          </div>

          {/* Article Card */}
          <article className="reveal bg-white rounded-3xl border border-slate-100 overflow-hidden shadow-sm" style={{ boxShadow: "0 8px 48px oklch(0.52 0.22 270 / 0.08)" }}>
            {/* Article header band */}
            <div className="px-8 pt-8 pb-6 border-b border-slate-100">
              <div className="flex flex-wrap items-center gap-3 mb-4">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-semibold"
                  style={{ background: "oklch(0.52 0.22 270 / 0.1)", color: "oklch(0.52 0.22 270)" }}>
                  <Tag className="h-3 w-3" /> Featured Profile
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-semibold"
                  style={{ background: "oklch(0.72 0.14 165 / 0.1)", color: "oklch(0.55 0.16 165)" }}>
                  <Cpu className="h-3 w-3" /> Embedded Systems
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-semibold"
                  style={{ background: "oklch(0.78 0.18 75 / 0.12)", color: "oklch(0.60 0.16 75)" }}>
                  <Smartphone className="h-3 w-3" /> Mobile QA
                </span>
                <span className="ml-auto flex items-center gap-1.5 text-xs text-slate-400 font-mono">
                  <Calendar className="h-3.5 w-3.5" /> June 2026
                </span>
              </div>
              <h3 className="text-2xl lg:text-3xl font-bold text-slate-900 mb-2" style={{ fontFamily: "'Playfair Display', serif" }}>
                Shifting Gears from Embedded Systems to Cross-Platform Mobile Developer: A Journey of Technical Excellence
              </h3>
              <div className="flex items-center gap-2 mt-3">
                <div className="h-9 w-9 rounded-full flex items-center justify-center font-bold text-white text-sm"
                  style={{ background: "linear-gradient(135deg, oklch(0.52 0.22 270), oklch(0.65 0.18 270))" }}>
                  SA
                </div>
                <div>
                  <div className="font-semibold text-slate-900 text-sm">Siddartha Andalu</div>
                  <div className="text-xs text-slate-400 flex items-center gap-1">
                    <MapPin className="h-3 w-3" /> India Office · SafeCodeX Research Center
                  </div>
                </div>
              </div>
            </div>

            {/* Article body */}
            <div className="px-8 py-8 lg:px-12">
              {/* Introduction */}
              <p className="text-lg text-slate-700 leading-relaxed mb-8 font-medium border-l-4 pl-5"
                style={{ borderColor: "oklch(0.52 0.22 270)", background: "oklch(0.97 0.005 270)", borderRadius: "0 0.75rem 0.75rem 0", padding: "1.25rem 1.25rem 1.25rem 1.5rem" }}>
                In long-running software and hardware projects, the ability to adapt, evolve, and maintain a high standard of quality is what ultimately determines a product's success. Over the past 12 to 13 months, our team has been deep in the trenches of a highly complex, multi-phased project. Today, we want to highlight a key engineer who has been instrumental in driving this project forward across two distinct technical domains: <strong>Siddartha Andalu</strong>.
              </p>

              {/* Phase 1 */}
              <div className="mb-10">
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex items-center justify-center h-8 w-8 rounded-full font-bold text-white text-sm shrink-0"
                    style={{ background: "oklch(0.52 0.22 270)" }}>1</div>
                  <h4 className="text-xl font-bold text-slate-900" style={{ fontFamily: "'Playfair Display', serif" }}>
                    Building the Foundation in Embedded Firmware
                    <span className="block text-sm font-normal text-slate-400 font-sans mt-0.5">April 2025 – May 2026</span>
                  </h4>
                </div>
                <div className="ml-11 space-y-4 text-slate-600 leading-relaxed">
                  <p>
                    Every great mobile ecosystem connected to hardware relies on an ultra-stable foundation. From April 2025 to May 2026, Siddartha served as our <strong className="text-slate-800">Embedded Firmware Engineer</strong> for this long-running initiative. Embedded development is notoriously unforgiving; code must be optimized for constrained memory, real-time processing, and flawless hardware synchronization.
                  </p>
                  <p>
                    Throughout this 14-month stretch, Siddartha consistently delivered exceptional results. What stood out most was his time-efficient problem-solving. In a project with highly interdependent deadlines, he managed to engineer firmware solutions that were both robust and ahead of schedule. His clean code and rigorous low-level testing ensured that our hardware prototype communicated seamlessly with our external protocols, laying the exact groundwork we needed for commercial scalability.
                  </p>
                  <div className="flex flex-wrap gap-2 pt-1">
                    {["Constrained Memory Optimization", "Real-Time Processing", "Hardware Synchronization", "Low-Level Testing", "Firmware Architecture"].map((tag) => (
                      <span key={tag} className="px-2.5 py-1 rounded-md text-xs bg-slate-50 text-slate-600 border border-slate-100">{tag}</span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Phase 2 */}
              <div className="mb-10">
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex items-center justify-center h-8 w-8 rounded-full font-bold text-white text-sm shrink-0"
                    style={{ background: "oklch(0.78 0.18 75)", color: "oklch(0.12 0.04 75)" }}>2</div>
                  <h4 className="text-xl font-bold text-slate-900" style={{ fontFamily: "'Playfair Display', serif" }}>
                    Pivoting to Mobile App Testing
                    <span className="block text-sm font-normal text-slate-400 font-sans mt-0.5">June 2026 – Present</span>
                  </h4>
                </div>
                <div className="ml-11 space-y-4 text-slate-600 leading-relaxed">
                  <p>
                    As a long-running project matures, the focus naturally shifts from core hardware engineering to the end-user experience. To build the ultimate bridge between our embedded systems and our user-facing software, we needed someone who understood the architecture from the inside out.
                  </p>
                  <p>
                    On June 1st, 2026, Siddartha officially transitioned into his new role as a <strong className="text-slate-800">Mobile App Tester</strong> within our company. Having an engineer with an embedded background test our mobile applications has already proven to be a massive competitive advantage. Siddartha doesn't just look at the mobile app as a standalone UI; he understands exactly how the app interacts with the firmware layer, how data packets are handled, and where potential latency or synchronization bottlenecks might occur.
                  </p>
                  <div className="flex flex-wrap gap-2 pt-1">
                    {["iOS (.ipa) Testing", "Android (.apk/.aab) Testing", "Firmware-App Integration", "Latency Analysis", "Synchronization QA"].map((tag) => (
                      <span key={tag} className="px-2.5 py-1 rounded-md text-xs bg-amber-50 text-amber-700 border border-amber-100">{tag}</span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Why long-running projects thrive */}
              <div className="rounded-2xl p-6 mb-8"
                style={{ background: "oklch(0.14 0.04 255)", color: "white" }}>
                <h4 className="text-lg font-bold mb-3" style={{ fontFamily: "'Playfair Display', serif" }}>
                  Why Long-Running Projects Thrive on Versatility
                </h4>
                <p className="text-white/70 leading-relaxed text-sm mb-4">
                  This project is a marathon, not a sprint. Managing long-term development lifecycle stages requires team members who can carry institutional knowledge from the hardware lab straight into the app stores. Siddartha's journey from April 2025 to the present day reflects the exact culture of growth we foster here.
                </p>
                <p className="text-white/70 leading-relaxed text-sm">
                  His track record of delivering high-quality, time-efficient results in firmware gives us total confidence that our iOS (.ipa) and Android (.apk/.aab) deployment pipelines will meet the highest standards of stability, performance, and user satisfaction.
                </p>
              </div>

              {/* Closing */}
              <p className="text-slate-600 leading-relaxed text-base border-t border-slate-100 pt-6">
                We are incredibly proud of Siddartha's continuous contributions over the last year, and we look forward to reaching our upcoming release milestones under his diligent testing oversight.
              </p>

              {/* Author footer */}
              <div className="mt-8 pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full flex items-center justify-center font-bold text-white"
                    style={{ background: "linear-gradient(135deg, oklch(0.52 0.22 270), oklch(0.65 0.18 270))" }}>
                    SA
                  </div>
                  <div>
                    <div className="font-bold text-slate-900">Siddartha Andalu</div>
                    <div className="text-xs text-slate-400">Embedded Firmware Engineer → Mobile App Tester · SafeCodeX Research Center</div>
                  </div>
                </div>
                <div className="text-xs font-mono text-slate-400 flex items-center gap-1.5">
                  <MapPin className="h-3.5 w-3.5" /> India Office · American Group LLC
                </div>
              </div>
            </div>
          </article>
        </div>
      </section>

      {/* Services */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14 reveal">
            <div className="text-xs font-mono font-semibold uppercase tracking-widest text-slate-400 mb-3">Services</div>
            <h2 className="text-4xl lg:text-5xl font-bold text-slate-900" style={{ fontFamily: "'Playfair Display', serif" }}>
              What SafeCodeX delivers
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((s, i) => (
              <div key={s.title} className={`reveal reveal-delay-${(i % 3) + 1} p-6 rounded-2xl bg-white border border-slate-100 product-card`}>
                <div className="flex items-center gap-3 mb-4">
                  <div className="h-12 w-12 rounded-xl flex items-center justify-center text-2xl"
                    style={{ background: `${s.color.replace(")", " / 0.1)")}` }}>
                    {s.emoji}
                  </div>
                  <h3 className="font-bold text-slate-900 text-sm">{s.title}</h3>
                </div>
                <p className="text-slate-600 text-sm leading-relaxed mb-4">{s.desc}</p>
                <ul className="space-y-1.5">
                  {s.features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-xs text-slate-500">
                      <span className="h-1.5 w-1.5 rounded-full shrink-0" style={{ background: s.color }} />
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20" style={{ background: "oklch(0.14 0.04 255)" }}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center reveal">
          <h2 className="text-4xl font-bold text-white mb-4" style={{ fontFamily: "'Playfair Display', serif" }}>
            Partner with SafeCodeX
          </h2>
          <p className="text-white/60 mb-8 text-lg">
            Unlock the full potential of your projects with our India engineering office.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/contact"
              className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl font-semibold btn-press"
              style={{ background: "oklch(0.78 0.18 75)", color: "oklch(0.12 0.04 75)" }}>
              Get in Touch <ArrowRight className="h-4 w-4" />
            </Link>
            <a href="https://safecodeg.com" target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl font-semibold text-white border border-white/20 hover:bg-white/10 transition-all btn-press">
              <ExternalLink className="h-4 w-4" /> Visit SafeCodeG.com
            </a>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
