/**
 * Careers Page — "Luminous Clarity" Design System
 */
import { useEffect } from "react";
import { Link } from "wouter";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { ArrowRight, MapPin, Clock, Briefcase, Code2, Brain, Shield, Smartphone } from "lucide-react";
import { toast } from "sonner";

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

const openings = [
  {
    title: "Senior AI/ML Engineer",
    dept: "Enterprise AI",
    location: "Santa Clara, CA / Remote",
    type: "Full-time",
    icon: Brain,
    color: "oklch(0.52 0.22 270)",
    desc: "Build frontier AI systems including LLMs, RAG pipelines, and cognitive agents for enterprise deployments.",
    tags: ["Python", "PyTorch", "LLM", "RAG"],
  },
  {
    title: "iOS Developer (Swift)",
    dept: "Consumer Mobile",
    location: "India / Remote",
    type: "Full-time",
    icon: Smartphone,
    color: "oklch(0.72 0.14 165)",
    desc: "Build world-class iOS apps including on-device AI, Wear OS integration, and offline-first experiences.",
    tags: ["Swift", "SwiftUI", "CoreML", "Wear OS"],
  },
  {
    title: "Full-Stack Engineer (TypeScript)",
    dept: "FinTech",
    location: "Remote",
    type: "Full-time",
    icon: Code2,
    color: "oklch(0.78 0.18 75)",
    desc: "Build scalable FinTech platforms including digital banking, payment processing, and trading systems.",
    tags: ["TypeScript", "React", "Node.js", "PostgreSQL"],
  },
  {
    title: "CyberSecurity Researcher",
    dept: "CyberSecurity",
    location: "India / Remote",
    type: "Full-time",
    icon: Shield,
    color: "oklch(0.55 0.18 30)",
    desc: "Conduct security research, vulnerability assessments, and build enterprise-grade security platforms.",
    tags: ["Python", "Security", "Penetration Testing", "Zero Trust"],
  },
  {
    title: "React Native Developer",
    dept: "Consumer Mobile",
    location: "Remote",
    type: "Full-time",
    icon: Smartphone,
    color: "oklch(0.65 0.16 310)",
    desc: "Build cross-platform mobile apps for iOS and Android with a focus on performance and user experience.",
    tags: ["React Native", "TypeScript", "iOS", "Android"],
  },
  {
    title: "DevOps / Infrastructure Engineer",
    dept: "Infrastructure",
    location: "Remote",
    type: "Full-time",
    icon: Code2,
    color: "oklch(0.60 0.15 200)",
    desc: "Manage and scale our CI/CD infrastructure, cloud deployments, and developer tooling across 77 repositories.",
    tags: ["Kubernetes", "AWS", "Terraform", "GitHub Actions"],
  },
];

const perks = [
  { emoji: "🌍", title: "Remote-First", desc: "Work from anywhere. We have team members across the US, India, and beyond." },
  { emoji: "🚀", title: "Ship Real Products", desc: "Your work ships to real users. 77 active products, always building." },
  { emoji: "🧠", title: "Frontier Tech", desc: "Work on cutting-edge AI, spatial computing, and emerging technologies." },
  { emoji: "📈", title: "Growth Opportunities", desc: "Fast-growing company with opportunities to lead and grow your career." },
  { emoji: "💰", title: "Competitive Compensation", desc: "Market-rate salaries, equity participation, and performance bonuses." },
  { emoji: "🎓", title: "Learning Budget", desc: "Annual learning budget for courses, conferences, and certifications." },
];

export default function CareersPage() {
  useReveal();

  return (
    <div className="min-h-screen bg-white">
      <Navigation />

      {/* Hero */}
      <section className="pt-28 pb-16" style={{ background: "oklch(0.14 0.04 255)" }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-xs font-mono font-semibold uppercase tracking-widest text-white/40 mb-3">Careers</div>
          <h1 className="text-5xl lg:text-6xl font-bold text-white mb-4" style={{ fontFamily: "'Playfair Display', serif" }}>
            Build the future
            <br />
            <span style={{ color: "oklch(0.78 0.18 75)" }}>with us.</span>
          </h1>
          <p className="text-xl text-white/60 max-w-xl">
            Join American Group LLC or SafeCodeX Research Center and work on 77 products that ship to users worldwide.
          </p>
        </div>
        <div className="relative">
          <svg viewBox="0 0 1440 40" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
            <path d="M0 40L1440 0V40H0Z" fill="white" />
          </svg>
        </div>
      </section>

      {/* Perks */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 reveal">
            <h2 className="text-3xl font-bold text-slate-900" style={{ fontFamily: "'Playfair Display', serif" }}>Why join us?</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {perks.map((perk, i) => (
              <div key={perk.title} className={`reveal reveal-delay-${(i % 3) + 1} p-5 rounded-2xl border border-slate-100 bg-slate-50`}>
                <div className="text-3xl mb-3">{perk.emoji}</div>
                <div className="font-bold text-slate-900 mb-1">{perk.title}</div>
                <div className="text-sm text-slate-600">{perk.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Open Positions */}
      <section className="py-16" style={{ background: "oklch(0.97 0.005 255)" }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-10 reveal">
            <div className="text-xs font-mono font-semibold uppercase tracking-widest text-slate-400 mb-3">Open Positions</div>
            <h2 className="text-3xl font-bold text-slate-900" style={{ fontFamily: "'Playfair Display', serif" }}>
              {openings.length} open roles
            </h2>
          </div>
          <div className="space-y-4">
            {openings.map((job, i) => (
              <div
                key={job.title}
                className={`reveal reveal-delay-${(i % 3) + 1} p-6 rounded-2xl bg-white border border-slate-100 product-card`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                  <div className="h-12 w-12 rounded-xl flex items-center justify-center shrink-0" style={{ background: `${job.color.replace(")", " / 0.1)")}` }}>
                    <job.icon className="h-6 w-6" style={{ color: job.color }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <h3 className="font-bold text-slate-900">{job.title}</h3>
                      <span className="px-2 py-0.5 rounded-md text-xs font-mono font-bold" style={{ background: `${job.color.replace(")", " / 0.1)")}`, color: job.color }}>
                        {job.dept}
                      </span>
                    </div>
                    <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 mb-2">
                      <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{job.location}</span>
                      <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{job.type}</span>
                      <span className="flex items-center gap-1"><Briefcase className="h-3 w-3" />AGL & SafeCodeX</span>
                    </div>
                    <p className="text-sm text-slate-600 mb-3">{job.desc}</p>
                    <div className="flex flex-wrap gap-1.5">
                      {job.tags.map((tag) => (
                        <span key={tag} className="px-2 py-0.5 rounded-md text-xs bg-slate-50 text-slate-600 border border-slate-100">{tag}</span>
                      ))}
                    </div>
                  </div>
                  <button
                    onClick={() => toast.info("Application portal coming soon! Email careers@safecodeg.com")}
                    className="shrink-0 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-white text-sm btn-press"
                    style={{ background: "oklch(0.52 0.22 270)" }}
                  >
                    Apply <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20" style={{ background: "oklch(0.14 0.04 255)" }}>
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center reveal">
          <h2 className="text-4xl font-bold text-white mb-4" style={{ fontFamily: "'Playfair Display', serif" }}>
            Don't see the right role?
          </h2>
          <p className="text-white/60 mb-8">
            We're always looking for exceptional talent. Send us your resume and tell us how you'd like to contribute.
          </p>
          <Link
            href="/contact"
            className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl font-semibold text-white btn-press"
            style={{ background: "oklch(0.52 0.22 270)" }}
          >
            Get in Touch <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}
