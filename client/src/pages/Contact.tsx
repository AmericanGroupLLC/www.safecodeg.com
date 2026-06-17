/**
 * Contact Page — "Luminous Clarity" Design System
 */
import { useEffect, useState } from "react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Mail, MapPin, Phone, Send, Github, Linkedin, Youtube } from "lucide-react";
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

export default function ContactPage() {
  useReveal();
  const [form, setForm] = useState({ name: "", email: "", company: "", subject: "", message: "" });
  const [sending, setSending] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    setTimeout(() => {
      setSending(false);
      toast.success("Message sent! We'll get back to you within 24 hours.");
      setForm({ name: "", email: "", company: "", subject: "", message: "" });
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-white">
      <Navigation />

      {/* Hero */}
      <section className="pt-28 pb-16" style={{ background: "oklch(0.14 0.04 255)" }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-xs font-mono font-semibold uppercase tracking-widest text-white/40 mb-3">Contact</div>
          <h1 className="text-5xl lg:text-6xl font-bold text-white mb-4" style={{ fontFamily: "'Playfair Display', serif" }}>
            Let's build something
            <br />
            <span style={{ color: "oklch(0.78 0.18 75)" }}>extraordinary together.</span>
          </h1>
          <p className="text-xl text-white/60 max-w-xl">
            Reach out to American Group LLC or SafeCodeX Research Center — we respond within 24 hours.
          </p>
        </div>
        <div className="relative">
          <svg viewBox="0 0 1440 40" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
            <path d="M0 40L1440 0V40H0Z" fill="white" />
          </svg>
        </div>
      </section>

      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-12">
            {/* Contact info */}
            <div className="lg:col-span-2 space-y-8">
              {/* AGL */}
              <div className="reveal p-6 rounded-2xl border border-slate-100 bg-slate-50">
                <div className="flex items-center gap-3 mb-4">
                  <img src="https://d2xsxph8kpxj0f.cloudfront.net/310519663397835904/iKtH34UE32MfRNT3w4zNEC/agl-logo-36D5KR4hiUmfJgg45CfEdv.webp" alt="AGL" className="h-8 w-8 object-contain" />
                  <div>
                    <div className="font-bold text-slate-900 text-sm">American Group LLC</div>
                    <div className="text-xs text-slate-400 font-mono">🇺🇸 S-Corp · California</div>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <MapPin className="h-4 w-4 text-indigo-500 mt-0.5 shrink-0" />
                    <span className="text-sm text-slate-600">Santa Clara, California, USA</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <Phone className="h-4 w-4 text-indigo-500 mt-0.5 shrink-0" />
                    <a href="tel:+15104580959" className="text-sm text-slate-600 hover:text-indigo-600 transition-colors">+1 (510) 458-0959</a>
                  </div>
                  <div className="flex items-start gap-3">
                    <Mail className="h-4 w-4 text-indigo-500 mt-0.5 shrink-0" />
                    <a href="mailto:contact@safecodeg.com" className="text-sm text-slate-600 hover:text-indigo-600 transition-colors">contact@safecodeg.com</a>
                  </div>
                  <div className="flex items-start gap-3">
                    <Github className="h-4 w-4 text-indigo-500 mt-0.5 shrink-0" />
                    <a href="https://github.com/americangroupllc" target="_blank" rel="noopener noreferrer" className="text-sm text-slate-600 hover:text-indigo-600 transition-colors">github.com/americangroupllc</a>
                  </div>
                </div>
              </div>

              {/* SCG */}
              <div className="reveal reveal-delay-1 p-6 rounded-2xl border border-slate-100 bg-slate-50">
                <div className="flex items-center gap-3 mb-4">
                  <img src="https://d2xsxph8kpxj0f.cloudfront.net/310519663397835904/iKtH34UE32MfRNT3w4zNEC/scg-logo-W2HQYWhiqBqMj8z6dwYjXz.webp" alt="SCG" className="h-8 w-8 object-contain" />
                  <div>
                    <div className="font-bold text-slate-900 text-sm">SafeCodeX Research Center</div>
                    <div className="text-xs text-slate-400 font-mono">🇮🇳 Pvt. Ltd. · India</div>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <MapPin className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
                    <span className="text-sm text-slate-600">Hyderabad, India</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <Phone className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
                    <a href="tel:+917416866689" className="text-sm text-slate-600 hover:text-amber-600 transition-colors">+91 74168 66689</a>
                  </div>
                  <div className="flex items-start gap-3">
                    <Mail className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
                    <a href="mailto:contact@safecodeg.com" className="text-sm text-slate-600 hover:text-amber-600 transition-colors">contact@safecodeg.com</a>
                  </div>
                </div>
              </div>

              {/* Social */}
              <div className="reveal reveal-delay-2">
                <div className="text-xs font-mono font-semibold uppercase tracking-widest text-slate-400 mb-3">Follow Us</div>
                <div className="flex gap-3">
                  {[
                    { icon: Github, href: "https://github.com/americangroupllc", label: "GitHub" },
                    { icon: Linkedin, href: "https://linkedin.com", label: "LinkedIn" },
                    { icon: Youtube, href: "https://youtube.com", label: "YouTube" },
                  ].map(({ icon: Icon, href, label }) => (
                    <a
                      key={label}
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={label}
                      className="p-3 rounded-xl border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50 transition-colors text-slate-500 hover:text-indigo-600"
                    >
                      <Icon className="h-5 w-5" />
                    </a>
                  ))}
                </div>
              </div>
            </div>

            {/* Contact form */}
            <div className="lg:col-span-3 reveal reveal-delay-2">
              <div className="p-8 rounded-2xl border border-slate-100 bg-white shadow-sm">
                <h2 className="text-2xl font-bold text-slate-900 mb-6" style={{ fontFamily: "'Playfair Display', serif" }}>
                  Send us a message
                </h2>
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1.5">Full Name *</label>
                      <input
                        type="text"
                        required
                        value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-300 transition-all"
                        placeholder="John Smith"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1.5">Email Address *</label>
                      <input
                        type="email"
                        required
                        value={form.email}
                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-300 transition-all"
                        placeholder="john@company.com"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Company</label>
                    <input
                      type="text"
                      value={form.company}
                      onChange={(e) => setForm({ ...form, company: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-300 transition-all"
                      placeholder="Your Company Name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Subject *</label>
                    <select
                      required
                      value={form.subject}
                      onChange={(e) => setForm({ ...form, subject: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-300 transition-all bg-white"
                    >
                      <option value="">Select a topic...</option>
                      <option value="partnership">Partnership Inquiry</option>
                      <option value="outsourcing">Software Outsourcing</option>
                      <option value="rd">R&D Collaboration</option>
                      <option value="product">Product Inquiry</option>
                      <option value="careers">Careers</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Message *</label>
                    <textarea
                      required
                      rows={5}
                      value={form.message}
                      onChange={(e) => setForm({ ...form, message: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-300 transition-all resize-none"
                      placeholder="Tell us about your project, goals, and how we can help..."
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={sending}
                    className="w-full flex items-center justify-center gap-2 px-6 py-4 rounded-xl font-semibold text-white transition-all btn-press disabled:opacity-60"
                    style={{ background: "oklch(0.52 0.22 270)" }}
                  >
                    {sending ? (
                      <>Sending...</>
                    ) : (
                      <><Send className="h-4 w-4" /> Send Message</>
                    )}
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
