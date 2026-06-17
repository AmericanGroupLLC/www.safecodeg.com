/**
 * AI Chat Assistant Widget — American Group LLC & SafeCodeX
 * "Luminous Clarity" Design System
 *
 * Floating corner chat bot that:
 * - Greets visitors and answers common questions
 * - Guides users through filling the contact form
 * - Submits the form on their behalf via conversational UI
 */
import { useState, useRef, useEffect } from "react";
import {
  MessageCircle, X, Send, Bot, User, ChevronDown,
  Loader2, CheckCircle, Sparkles,
} from "lucide-react";
import { toast } from "sonner";

// ── Types ──────────────────────────────────────────────────────────────────
type Role = "bot" | "user";
type Step =
  | "greeting"
  | "ask_intent"
  | "ask_name"
  | "ask_email"
  | "ask_company"
  | "ask_subject"
  | "ask_message"
  | "confirm"
  | "submitted"
  | "faq";

interface Message {
  id: number;
  role: Role;
  text: string;
  options?: string[];
  typing?: boolean;
}

interface FormData {
  name: string;
  email: string;
  company: string;
  subject: string;
  message: string;
}

// ── FAQ answers ────────────────────────────────────────────────────────────
const FAQ: Record<string, string> = {
  "what do you do":
    "American Group LLC is a US-based software company with 77 products across 6 verticals — Enterprise AI, Consumer Mobile, FinTech, CyberSecurity, Spatial SaaS, and IoT. Our India engineering office, SafeCodeX Research Center, is based in Hyderabad.",
  "where are you located":
    "We have two offices:\n🇺🇸 Santa Clara, California, USA — +1 (510) 458-0959\n🇮🇳 Hyderabad, India — +91 74168 66689\n📧 contact@safecodeg.com",
  "how can i contact you":
    "You can reach us at contact@safecodeg.com, call +1 (510) 458-0959 (USA) or +91 74168 66689 (India). Or I can help you send a message right now!",
  "what products do you have":
    "We have 77 products across 6 verticals. Visit our Products page for the full list, or ask me about a specific category like FinTech, AI tools, health apps, or cybersecurity.",
  "do you offer outsourcing":
    "Yes! Software outsourcing is one of our core services. We can handle full-stack development, mobile apps, AI/ML, and more. Want me to send a message to our team?",
  "careers":
    "We're hiring! We have open roles in Software Engineering, AI/ML Research, Mobile Development, and more. Visit our Careers page or I can connect you with our HR team.",
  "privacy policy":
    "Our full Privacy Policy is available at /privacy-policy. It covers all 77 of our apps and is compliant with Google Play, Apple App Store, GDPR, CCPA, and COPPA.",
};

function matchFAQ(input: string): string | null {
  const lower = input.toLowerCase();
  for (const [key, answer] of Object.entries(FAQ)) {
    if (lower.includes(key)) return answer;
  }
  return null;
}

// ── Helpers ────────────────────────────────────────────────────────────────
let msgId = 0;
function makeMsg(role: Role, text: string, options?: string[]): Message {
  return { id: ++msgId, role, text, options };
}

const SUBJECTS = [
  "Partnership Inquiry",
  "Software Outsourcing",
  "R&D Collaboration",
  "Product Inquiry",
  "Careers",
  "Other",
];

// ── Main component ─────────────────────────────────────────────────────────
export default function AIChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [step, setStep] = useState<Step>("greeting");
  const [form, setForm] = useState<FormData>({ name: "", email: "", company: "", subject: "", message: "" });
  const [botTyping, setBotTyping] = useState(false);
  const [unread, setUnread] = useState(1);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Initial greeting
  useEffect(() => {
    const timer = setTimeout(() => {
      pushBot(
        "👋 Hi there! I'm the AGL Assistant. I can answer questions about American Group LLC & SafeCodeX, or help you send a message to our team.\n\nWhat would you like to do?",
        ["Send us a message", "Ask a question", "Contact info"]
      );
    }, 800);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, botTyping]);

  useEffect(() => {
    if (open) {
      setUnread(0);
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [open]);

  function pushBot(text: string, options?: string[]) {
    setBotTyping(true);
    const delay = Math.min(600 + text.length * 8, 1800);
    setTimeout(() => {
      setBotTyping(false);
      setMessages((prev) => [...prev, makeMsg("bot", text, options)]);
      if (!open) setUnread((n) => n + 1);
    }, delay);
  }

  function pushUser(text: string) {
    setMessages((prev) => [...prev, makeMsg("user", text)]);
  }

  function handleSend(value?: string) {
    const text = (value ?? input).trim();
    if (!text) return;
    setInput("");
    pushUser(text);
    processInput(text);
  }

  function processInput(text: string) {
    const lower = text.toLowerCase();

    switch (step) {
      // ── Greeting / intent ──────────────────────────────────────────────
      case "greeting":
      case "ask_intent": {
        if (lower.includes("send") || lower.includes("message") || lower.includes("contact")) {
          setStep("ask_name");
          pushBot("Great! Let's get your message to the right person. 😊\n\nFirst, what's your full name?");
        } else if (lower.includes("question") || lower.includes("ask") || lower.includes("info") || lower.includes("faq")) {
          setStep("faq");
          pushBot(
            "Sure! Ask me anything about our company, products, services, or locations. Or pick a topic:",
            ["What do you do?", "Where are you located?", "What products do you have?", "Do you offer outsourcing?"]
          );
        } else if (lower.includes("contact")) {
          setStep("faq");
          pushBot(
            "📞 You can reach us at:\n\n🇺🇸 USA: +1 (510) 458-0959\n🇮🇳 India: +91 74168 66689\n📧 contact@safecodeg.com\n\nOr I can help you send a message right now!",
            ["Send a message", "Ask something else"]
          );
        } else {
          // Try FAQ match first
          const faqAnswer = matchFAQ(text);
          if (faqAnswer) {
            setStep("faq");
            pushBot(faqAnswer, ["Send a message", "Ask something else"]);
          } else {
            setStep("ask_intent");
            pushBot(
              "I can help with that! Would you like to send a message to our team, or do you have a question I can answer?",
              ["Send a message", "Ask a question"]
            );
          }
        }
        break;
      }

      // ── FAQ mode ───────────────────────────────────────────────────────
      case "faq": {
        if (lower.includes("send") || lower.includes("message")) {
          setStep("ask_name");
          pushBot("Of course! Let's send a message to our team.\n\nWhat's your full name?");
        } else {
          const faqAnswer = matchFAQ(text);
          if (faqAnswer) {
            pushBot(faqAnswer, ["Send a message", "Ask something else"]);
          } else {
            pushBot(
              "I'm not sure about that specific question, but our team would love to help! Want me to connect you with them?",
              ["Yes, send a message", "No thanks"]
            );
          }
        }
        break;
      }

      // ── Form collection ────────────────────────────────────────────────
      case "ask_name": {
        if (text.length < 2) {
          pushBot("Please enter your full name (at least 2 characters).");
          return;
        }
        setForm((f) => ({ ...f, name: text }));
        setStep("ask_email");
        pushBot(`Nice to meet you, ${text.split(" ")[0]}! 👋\n\nWhat's your email address so we can reply to you?`);
        break;
      }

      case "ask_email": {
        const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRe.test(text)) {
          pushBot("That doesn't look like a valid email. Please try again (e.g. john@company.com).");
          return;
        }
        setForm((f) => ({ ...f, email: text }));
        setStep("ask_company");
        pushBot("Got it! What company or organization are you from? (You can skip this by typing 'skip')");
        break;
      }

      case "ask_company": {
        const company = lower === "skip" ? "" : text;
        setForm((f) => ({ ...f, company }));
        setStep("ask_subject");
        pushBot(
          "What's the topic of your inquiry?",
          SUBJECTS
        );
        break;
      }

      case "ask_subject": {
        const matched = SUBJECTS.find((s) => s.toLowerCase() === lower) ?? text;
        setForm((f) => ({ ...f, subject: matched }));
        setStep("ask_message");
        pushBot(`Perfect — ${matched}. Now, please describe your inquiry in a few sentences. The more detail, the better!`);
        break;
      }

      case "ask_message": {
        if (text.length < 10) {
          pushBot("Please provide a bit more detail so our team can help you effectively (at least 10 characters).");
          return;
        }
        const updatedForm = { ...form, message: text };
        setForm(updatedForm);
        setStep("confirm");
        pushBot(
          `Here's a summary of your message:\n\n👤 Name: ${updatedForm.name}\n📧 Email: ${updatedForm.email}${updatedForm.company ? `\n🏢 Company: ${updatedForm.company}` : ""}\n📌 Topic: ${updatedForm.subject}\n💬 Message: ${updatedForm.message}\n\nShall I send this to the AGL team?`,
          ["✅ Yes, send it!", "✏️ Edit something", "❌ Cancel"]
        );
        break;
      }

      case "confirm": {
        if (lower.includes("yes") || lower.includes("send") || lower.includes("✅")) {
          submitForm();
        } else if (lower.includes("edit") || lower.includes("✏️")) {
          setStep("ask_name");
          pushBot("No problem! Let's start over. What's your full name?");
        } else if (lower.includes("cancel") || lower.includes("❌")) {
          setStep("ask_intent");
          pushBot("Okay, cancelled! Is there anything else I can help you with?", ["Send a message", "Ask a question"]);
        } else {
          pushBot("Please choose an option:", ["✅ Yes, send it!", "✏️ Edit something", "❌ Cancel"]);
        }
        break;
      }

      case "submitted": {
        setStep("ask_intent");
        pushBot("Is there anything else I can help you with?", ["Send another message", "Ask a question"]);
        break;
      }

      default:
        break;
    }
  }

  function submitForm() {
    setBotTyping(true);
    // Simulate form submission (in production, wire to real API)
    setTimeout(() => {
      setBotTyping(false);
      setStep("submitted");
      setMessages((prev) => [
        ...prev,
        makeMsg(
          "bot",
          `✅ Your message has been sent successfully!\n\nOur team will get back to you at **${form.email}** within 24 hours.\n\nThank you for reaching out to American Group LLC! 🙏`,
          ["Ask another question", "Close chat"]
        ),
      ]);
      toast.success("Message sent via AI Assistant!");
      setForm({ name: "", email: "", company: "", subject: "", message: "" });
    }, 1800);
  }

  function handleOption(option: string) {
    const lower = option.toLowerCase();
    if (lower.includes("close")) {
      setOpen(false);
      return;
    }
    handleSend(option);
  }

  return (
    <>
      {/* Floating button */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-2">
        {/* Teaser bubble */}
        {!open && (
          <div
            className="px-4 py-2 rounded-2xl rounded-br-sm text-sm font-medium text-white shadow-lg cursor-pointer animate-bounce-slow"
            style={{ background: "oklch(0.52 0.22 270)", maxWidth: "200px" }}
            onClick={() => setOpen(true)}
          >
            <span className="flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5" />
              How can I help?
            </span>
          </div>
        )}

        <button
          onClick={() => setOpen((v) => !v)}
          className="relative h-14 w-14 rounded-full shadow-2xl flex items-center justify-center transition-all duration-200 hover:scale-105 active:scale-95"
          style={{ background: open ? "oklch(0.35 0.10 255)" : "oklch(0.52 0.22 270)" }}
          aria-label="Open AI Chat"
        >
          {open ? (
            <ChevronDown className="h-6 w-6 text-white" />
          ) : (
            <MessageCircle className="h-6 w-6 text-white" />
          )}
          {/* Unread badge */}
          {!open && unread > 0 && (
            <span
              className="absolute -top-1 -right-1 h-5 w-5 rounded-full flex items-center justify-center text-xs font-bold text-white"
              style={{ background: "oklch(0.55 0.18 30)" }}
            >
              {unread}
            </span>
          )}
        </button>
      </div>

      {/* Chat window */}
      {open && (
        <div
          className="fixed bottom-24 right-6 z-50 w-[360px] max-w-[calc(100vw-2rem)] rounded-2xl shadow-2xl flex flex-col overflow-hidden"
          style={{
            background: "white",
            border: "1px solid oklch(0.92 0.004 286.32)",
            height: "520px",
            maxHeight: "calc(100vh - 120px)",
          }}
        >
          {/* Header */}
          <div
            className="flex items-center justify-between px-4 py-3 shrink-0"
            style={{ background: "oklch(0.14 0.04 255)" }}
          >
            <div className="flex items-center gap-3">
              <div
                className="h-9 w-9 rounded-full flex items-center justify-center"
                style={{ background: "oklch(0.52 0.22 270 / 0.3)" }}
              >
                <Bot className="h-5 w-5 text-white" />
              </div>
              <div>
                <div className="text-sm font-semibold text-white">AGL Assistant</div>
                <div className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-green-400 animate-pulse" />
                  <span className="text-xs text-white/50">Online · Replies instantly</span>
                </div>
              </div>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="p-1.5 rounded-lg hover:bg-white/10 transition-colors text-white/60 hover:text-white"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 bg-slate-50">
            {messages.map((msg) => (
              <div key={msg.id} className={`flex gap-2 ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}>
                {/* Avatar */}
                <div
                  className="h-7 w-7 rounded-full flex items-center justify-center shrink-0 mt-0.5"
                  style={{
                    background: msg.role === "bot" ? "oklch(0.52 0.22 270 / 0.15)" : "oklch(0.78 0.18 75 / 0.2)",
                  }}
                >
                  {msg.role === "bot" ? (
                    <Bot className="h-3.5 w-3.5" style={{ color: "oklch(0.52 0.22 270)" }} />
                  ) : (
                    <User className="h-3.5 w-3.5" style={{ color: "oklch(0.65 0.16 75)" }} />
                  )}
                </div>
                <div className={`flex flex-col gap-2 max-w-[80%] ${msg.role === "user" ? "items-end" : "items-start"}`}>
                  {/* Bubble */}
                  <div
                    className="px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap"
                    style={
                      msg.role === "bot"
                        ? { background: "white", border: "1px solid oklch(0.92 0.004 286.32)", color: "oklch(0.235 0.015 65)" }
                        : { background: "oklch(0.52 0.22 270)", color: "white" }
                    }
                  >
                    {msg.text}
                  </div>
                  {/* Quick-reply options */}
                  {msg.options && msg.options.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {msg.options.map((opt) => (
                        <button
                          key={opt}
                          onClick={() => handleOption(opt)}
                          className="px-3 py-1.5 rounded-full text-xs font-medium transition-all hover:scale-105 active:scale-95"
                          style={{
                            background: "oklch(0.52 0.22 270 / 0.08)",
                            border: "1px solid oklch(0.52 0.22 270 / 0.25)",
                            color: "oklch(0.52 0.22 270)",
                          }}
                        >
                          {opt}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}

            {/* Typing indicator */}
            {botTyping && (
              <div className="flex gap-2 items-center">
                <div
                  className="h-7 w-7 rounded-full flex items-center justify-center shrink-0"
                  style={{ background: "oklch(0.52 0.22 270 / 0.15)" }}
                >
                  <Bot className="h-3.5 w-3.5" style={{ color: "oklch(0.52 0.22 270)" }} />
                </div>
                <div
                  className="px-4 py-3 rounded-2xl flex items-center gap-1"
                  style={{ background: "white", border: "1px solid oklch(0.92 0.004 286.32)" }}
                >
                  {[0, 1, 2].map((i) => (
                    <span
                      key={i}
                      className="h-2 w-2 rounded-full"
                      style={{
                        background: "oklch(0.52 0.22 270 / 0.5)",
                        animation: `bounce 1.2s ease-in-out ${i * 0.2}s infinite`,
                      }}
                    />
                  ))}
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div
            className="px-3 py-3 shrink-0 flex items-center gap-2"
            style={{ borderTop: "1px solid oklch(0.92 0.004 286.32)", background: "white" }}
          >
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
              placeholder="Type a message..."
              className="flex-1 text-sm px-3.5 py-2.5 rounded-xl outline-none transition-all"
              style={{
                background: "oklch(0.97 0.005 255)",
                border: "1px solid oklch(0.92 0.004 286.32)",
                color: "oklch(0.235 0.015 65)",
              }}
            />
            <button
              onClick={() => handleSend()}
              disabled={!input.trim() || botTyping}
              className="h-10 w-10 rounded-xl flex items-center justify-center transition-all hover:scale-105 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
              style={{ background: "oklch(0.52 0.22 270)" }}
            >
              {botTyping ? (
                <Loader2 className="h-4 w-4 text-white animate-spin" />
              ) : (
                <Send className="h-4 w-4 text-white" />
              )}
            </button>
          </div>

          {/* Powered by */}
          <div
            className="text-center py-1.5 text-xs shrink-0"
            style={{ background: "oklch(0.985 0 0)", color: "oklch(0.65 0.01 286)", borderTop: "1px solid oklch(0.95 0 0)" }}
          >
            Powered by <span className="font-semibold" style={{ color: "oklch(0.52 0.22 270)" }}>AGL AI Assistant</span>
          </div>
        </div>
      )}

      <style>{`
        @keyframes bounce {
          0%, 60%, 100% { transform: translateY(0); }
          30% { transform: translateY(-6px); }
        }
        .animate-bounce-slow {
          animation: bounceSlow 2s ease-in-out infinite;
        }
        @keyframes bounceSlow {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-4px); }
        }
      `}</style>
    </>
  );
}
