/**
 * About Page — "Luminous Clarity" Design System
 */
import { useEffect } from "react";
import { Link } from "wouter";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { ArrowRight, Globe, Target, Zap, Star, Users, Award } from "lucide-react";

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

const timeline = [
  { year: "2018", title: "Founded in California", desc: "American Group LLC incorporated as an S-Corp in Santa Clara, California with a vision to build world-class software products." },
  { year: "2019", title: "SafeCodeX India Established", desc: "SafeCodeX Research Center Pvt. Ltd. founded in India, creating a binational R&D powerhouse." },
  { year: "2020", title: "First 10 Products Launched", desc: "Initial product portfolio launched across mobile and enterprise verticals, establishing market presence." },
  { year: "2021", title: "AI Research Division", desc: "Dedicated AI research division established, focusing on frontier LLM research and cognitive computing." },
  { year: "2022", title: "50 Active Repositories", desc: "Portfolio expanded to 50+ active repositories across 5 business verticals with global client base." },
  { year: "2023", title: "77 Products Milestone", desc: "Reached 77 active products across 6 verticals — Mobile, AI, FinTech, CyberSecurity, Spatial, and IoT." },
  { year: "2024+", title: "28-Product Roadmap", desc: "Ambitious roadmap of 28 new products in AI SaaS, DevTools, and Cybersecurity verticals underway." },
];

const values = [
  { icon: Target, title: "Mission-Driven", desc: "Every product we build solves a real problem for real people. We don't build for the sake of building." },
  { icon: Zap, title: "Relentless Execution", desc: "77 repositories. Always shipping. We believe in momentum, iteration, and delivering value continuously." },
  { icon: Globe, title: "Global by Default", desc: "Built in California, researched in India, shipped worldwide. Our products are designed for global markets from day one." },
  { icon: Star, title: "Excellence Without Compromise", desc: "We hold ourselves to the highest standards of engineering, design, and user experience." },
  { icon: Users, title: "People First", desc: "Our team is our greatest asset. We invest in talent, culture, and creating an environment where innovation thrives." },
  { icon: Award, title: "Research-Led Innovation", desc: "Our India R&D center ensures we stay at the frontier of AI, IoT, blockchain, and emerging technologies." },
];

export default function AboutPage() {
  useReveal();

  return (
    <div className="min-h-screen bg-white">
      <Navigation />

      {/* Hero */}
      <section className="pt-28 pb-20" style={{ background: "oklch(0.14 0.04 255)" }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-xs font-mono font-semibold uppercase tracking-widest text-white/40 mb-3">About Us</div>
          <h1 className="text-5xl lg:text-7xl font-bold text-white mb-6" style={{ fontFamily: "'Playfair Display', serif" }}>
            Two continents.
            <br />
            <span style={{ color: "oklch(0.78 0.18 75)" }}>One mission.</span>
          </h1>
          <p className="text-xl text-white/60 max-w-2xl">
            We are a binational technology group combining Silicon Valley innovation with India's world-class engineering talent to build the future of software.
          </p>
        </div>
        <div className="relative">
          <svg viewBox="0 0 1440 40" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
            <path d="M0 40L1440 0V40H0Z" fill="white" />
          </svg>
        </div>
      </section>

      {/* Story */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
            <div className="reveal">
              <div className="text-xs font-mono font-semibold uppercase tracking-widest text-slate-400 mb-3">Our Story</div>
              <h2 className="text-4xl font-bold text-slate-900 mb-6" style={{ fontFamily: "'Playfair Display', serif" }}>
                Built for scale from day one
              </h2>
              <div className="space-y-4 text-slate-600 leading-relaxed">
                <p>
                  American Group LLC was founded with a simple but ambitious belief: that the best technology companies are built by combining the best of multiple worlds. Silicon Valley provides the market insight, the ambition, and the access to capital. India provides the engineering depth, the research rigor, and the talent density.
                </p>
                <p>
                  Together, American Group LLC and SafeCodeX Research Center form a uniquely positioned technology group — one that can move with the speed of a startup while delivering the quality and scale of an enterprise.
                </p>
                <p>
                  Today, our 77 active repositories span six distinct business verticals, each engineered to operate independently while sharing a common identity platform, backend gateway, and CI/CD infrastructure. We build the entire stack — from on-device LLMs and Wear OS apps to multi-cloud control planes and orbital edge-cloud orchestrators.
                </p>
              </div>
            </div>
            <div className="reveal reveal-delay-2">
              <div className="text-xs font-mono font-semibold uppercase tracking-widest text-slate-400 mb-3">Our Journey</div>
              <div className="space-y-6">
                {timeline.map((item, i) => (
                  <div key={item.year} className={`reveal reveal-delay-${i + 1} flex gap-4`}>
                    <div className="shrink-0">
                      <div className="h-8 w-16 rounded-lg flex items-center justify-center text-xs font-mono font-bold text-white" style={{ background: "oklch(0.52 0.22 270)" }}>
                        {item.year}
                      </div>
                    </div>
                    <div>
                      <div className="font-semibold text-slate-900 text-sm mb-1">{item.title}</div>
                      <div className="text-xs text-slate-500 leading-relaxed">{item.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-20" style={{ background: "oklch(0.97 0.005 255)" }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14 reveal">
            <div className="text-xs font-mono font-semibold uppercase tracking-widest text-slate-400 mb-3">Our Values</div>
            <h2 className="text-4xl font-bold text-slate-900" style={{ fontFamily: "'Playfair Display', serif" }}>
              What drives us
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {values.map((v, i) => (
              <div key={v.title} className={`reveal reveal-delay-${(i % 3) + 1} p-6 rounded-2xl bg-white border border-slate-100`}>
                <div className="h-12 w-12 rounded-xl bg-indigo-50 flex items-center justify-center mb-4">
                  <v.icon className="h-6 w-6 text-indigo-600" />
                </div>
                <h3 className="font-bold text-slate-900 mb-2">{v.title}</h3>
                <p className="text-sm text-slate-600 leading-relaxed">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>


      {/* CTA */}
      <section className="py-20" style={{ background: "oklch(0.14 0.04 255)" }}>
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center reveal">
          <h2 className="text-4xl font-bold text-white mb-4" style={{ fontFamily: "'Playfair Display', serif" }}>
            Join our journey
          </h2>
          <p className="text-white/60 mb-8">We're always looking for exceptional talent and strategic partners.</p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/careers" className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl font-semibold text-white btn-press" style={{ background: "oklch(0.52 0.22 270)" }}>
              View Careers <ArrowRight className="h-4 w-4" />
            </Link>
            <Link href="/contact" className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl font-semibold text-white border border-white/20 hover:bg-white/10 transition-all btn-press">
              Partner With Us <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
