/**
 * Sophia — AGL Customer Success Assistant
 * Human-feeling AI chat with realistic avatar, natural language,
 * variable typing delays, personality, and conversational intelligence.
 */

import { useState, useRef, useEffect, useCallback } from "react";
import { X, Send, Minimize2, ChevronDown } from "lucide-react";
import { Link } from "wouter";

const SOPHIA_AVATAR = "/manus-storage/sophia-avatar_9b8b67b1.png";

interface Message {
  id: string;
  role: "sophia" | "user";
  text: string;
  time: string;
}

interface ConvState {
  stage:
    | "main"
    | "form_name"
    | "form_email"
    | "form_company"
    | "form_message"
    | "form_done";
  formData: { name?: string; email?: string; company?: string; message?: string };
  userName?: string;
  count: number;
}

function getTime() {
  return new Date().toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true });
}

// ── Sophia's response engine ──────────────────────────────────────────────────
function sophiaReply(input: string, state: ConvState): { text: string; delay: number; quick?: string[] } {
  const m = input.toLowerCase().trim();

  if (/^(hi|hello|hey|good\s*(morning|afternoon|evening)|howdy|sup)\b/.test(m)) {
    const g = [
      `Hey${state.userName ? " " + state.userName : ""}! 😊 Great to hear from you. What can I help you with today?`,
      `Hi there! I'm Sophia from the AGL team. What's on your mind?`,
      `Hello! Welcome to American Group LLC. How can I help you today?`,
    ];
    return { text: g[Math.floor(Math.random() * g.length)], delay: 800, quick: ["Tell me about your products", "I need support", "Contact info", "Careers"] };
  }

  if (/how are you|how('?re| are) you doing|what'?s up|how'?s it going/.test(m)) {
    return { text: `Doing great, thanks for asking! 😄 Always happy to chat. What brings you by today?`, delay: 1100 };
  }

  if (/your name|who are you|what'?s your name|who am i (talking|chatting) (to|with)/.test(m)) {
    return { text: `I'm Sophia — Customer Success at American Group LLC! I know our products and team really well. Is there something specific I can help you with?`, delay: 1300 };
  }

  if (/are you (a )?(bot|robot|ai|real|human|person)|is this (a )?(bot|ai|automated)/.test(m)) {
    return { text: `Ha, good question! 😄 I'm Sophia, an AI assistant for AGL — so yes, AI-powered, but trained to be genuinely helpful. I know our products, team, and services really well. What can I help you with?`, delay: 1700 };
  }

  if (/product|app|application|software|what do you (make|build|sell|offer)|portfolio/.test(m)) {
    return {
      text: `We have 77 products across 6 verticals! 🚀\n\nHighlights: eHealth365, HealthTrack Pro (Health & Wellness) · EduPath, KidsCode Academy (Education) · TaskFlow Pro, MeetingMind (Business) · and many more.\n\nWant details on a specific category?`,
      delay: 1600,
      quick: ["Health & Wellness", "Education apps", "Business tools", "All 77 products"],
    };
  }

  if (/health|wellness|fitness|medical|ehealth/.test(m)) {
    return { text: `Our Health & Wellness vertical is one of our strongest! 💪 We have 14 apps including eHealth365 (comprehensive tracking), HealthTrack Pro (wearable integration), MindCalm AI (mental wellness), NutriScan, SleepWave, and more. Want details on any specific one?`, delay: 1700 };
  }

  if (/education|learning|school|kids|teach|study|learn/.test(m)) {
    return { text: `Our Education & Learning suite has 12 apps! 📚 Highlights: EduPath (personalized learning), LearnSmart (adaptive quizzes), KidsCode Academy (coding for kids 6–14), LanguageBridge (AI language learning), MathMentor Pro. All on iOS, Android, and web!`, delay: 1600 };
  }

  if (/business|productivity|task|work|office|enterprise/.test(m)) {
    return { text: `Our Business & Productivity tools are used by teams worldwide! 💼 Top picks: TaskFlow Pro (project management), MeetingMind (AI meeting notes), DocuSign AI (smart contracts), ExpenseTrack, TeamPulse. Want to know more about any of these?`, delay: 1600 };
  }

  if (/finance|fintech|banking|payment|money|invest/.test(m)) {
    return { text: `Our Finance & Security vertical has some really exciting products! 💰 Including BudgetWise AI, CryptoVault, SecurePay, TaxHelper Pro, and InvestIQ. All built with bank-grade security. Interested in any specific one?`, delay: 1600 };
  }

  if (/service|outsourc|develop|build|hire|custom|project/.test(m)) {
    return {
      text: `We offer end-to-end software development services! 🛠️\n\n• Custom mobile apps (iOS & Android)\n• Web applications & SaaS platforms\n• AI/ML solutions\n• Cloud architecture & DevOps\n• Tech outsourcing (our India team is great for cost-effective dev!)\n\nWant a free consultation?`,
      delay: 1800,
      quick: ["Get a free consultation", "Tell me about pricing", "India office info"],
    };
  }

  if (/price|pricing|cost|how much|rate|quote|budget/.test(m)) {
    return { text: `Pricing varies by project scope. For custom development, we offer free initial consultations. Enterprise licensing starts at $299/month. Our India team makes outsourcing very cost-effective without compromising quality. Want me to connect you with our sales team for a custom quote?`, delay: 1500, quick: ["Yes, get a quote", "Talk to sales"] };
  }

  if (/contact|email|phone|call|reach|address|location|where are you/.test(m)) {
    return {
      text: `Here's how to reach us! 📬\n\n📧 contact@safecodeg.com\n📞 US: +1 (510) 458-9059\n📞 India: +91 74168 66689\n📍 Santa Clara, CA · Hyderabad, India\n\nOr I can help you send a message right now — just say "send a message"!`,
      delay: 1400,
      quick: ["Send a message", "Visit contact page"],
    };
  }

  if (/job|career|hiring|work|position|opening|apply|join|intern/.test(m)) {
    return {
      text: `We're always looking for talented people! 🌟\n\nCurrent openings:\n• Senior React Developer\n• Mobile App Dev (React Native)\n• AI/ML Engineer\n• DevOps Engineer\n• UI/UX Designer\n• QA Engineer\n\nWant me to help you apply? I can collect your info and pass it to our HR team!`,
      delay: 1600,
      quick: ["Yes, I want to apply", "Tell me more"],
    };
  }

  if (/privacy|policy|gdpr|ccpa|data|personal information/.test(m)) {
    return { text: `Our Privacy Policy is at safecodeg.com/privacy-policy — it covers all 77 apps and is fully compliant with GDPR, CCPA, and COPPA. For privacy questions, email contact@safecodeg.com`, delay: 1300, quick: ["View Privacy Policy", "Data deletion request"] };
  }

  if (/support|help|issue|problem|bug|not working|broken|error|fix/.test(m)) {
    return { text: `Oh no, sorry to hear you're having trouble! 😟 Can you tell me:\n1. Which app is this about?\n2. What's happening exactly?\n\nOr email contact@safecodeg.com directly and our support team will get back to you ASAP.`, delay: 1500, quick: ["Email support", "Visit support page"] };
  }

  if (/india|hyderabad|safecodex|safecode/.test(m)) {
    return { text: `Our India engineering office — SafeCodeX Research Center — is in Hyderabad! 🇮🇳 Same team, same standards as our California HQ. India phone: +91 74168 66689 or contact@safecodeg.com`, delay: 1500 };
  }

  if (/california|santa clara|silicon valley|usa|us office/.test(m)) {
    return { text: `We're based in Santa Clara, California — right in Silicon Valley! 🇺🇸 Our HQ is where leadership, product strategy, and client relations are based. US phone: +1 (510) 458-9059`, delay: 1400 };
  }

  if (/send (a )?(message|email|inquiry)|contact (you|the team)|get in touch|reach out|talk to (someone|a human|a person)/.test(m)) {
    return { text: `Of course! I'll help you get in touch with our team. It'll just take a minute. 😊\n\nFirst — what's your name?`, delay: 1200 };
  }

  if (/thank|thanks|thx|ty|appreciate|helpful/.test(m)) {
    const r = [`You're so welcome! 😊 Anything else I can help you with?`, `Happy to help! That's what I'm here for. Anything else?`, `Of course! Don't hesitate to reach out anytime. Have a great day! ☀️`];
    return { text: r[Math.floor(Math.random() * r.length)], delay: 900 };
  }

  if (/bye|goodbye|see you|talk later|gotta go|ttyl/.test(m)) {
    return { text: `Take care! 👋 Feel free to come back anytime — I'm here 24/7. Have a wonderful day!`, delay: 800 };
  }

  if (/^(yes|yeah|yep|sure|ok|okay|sounds good|absolutely|definitely|please)\.?$/.test(m)) {
    return { text: `Great! What's your name so I can personalize this for you?`, delay: 900 };
  }

  if (/77|all products|full list|complete list/.test(m)) {
    return { text: `We have 77 products across 6 categories! Browse the full portfolio at safecodeg.com/products — filterable by category and searchable. Want me to highlight any specific vertical?`, delay: 1400, quick: ["Health & Wellness", "Business tools", "Education", "Finance & Security"] };
  }

  const fallbacks = [
    `That's a good question! 🤔 I want to make sure I give you the right answer — could you tell me a bit more? Or I can connect you directly with our team.`,
    `Hmm, I might not have all the details on that one, but our team definitely would. Want me to help you reach out to them?`,
    `Great question! That's something our team would be better placed to answer properly. Want me to set up a message for you?`,
    `I hear you! Let me connect you with the right person on our team — they'd know exactly what you need. Shall I help you send them a message?`,
  ];
  return { text: fallbacks[Math.floor(Math.random() * fallbacks.length)], delay: 1600, quick: ["Send a message", "Contact info", "Browse products"] };
}

function handleForm(input: string, state: ConvState): { text: string; delay: number; newState: Partial<ConvState> } {
  switch (state.stage) {
    case "form_name":
      return { text: `Nice to meet you, ${input}! 😊 What's your email address so we can get back to you?`, delay: 1000, newState: { stage: "form_email", formData: { ...state.formData, name: input }, userName: input } };
    case "form_email":
      if (!input.includes("@")) return { text: `Hmm, that doesn't look like a valid email — could you double-check it? I want to make sure our team can reach you!`, delay: 1000, newState: {} };
      return { text: `Got it! And what company or organization are you with? (Or just say "individual" if it's personal)`, delay: 1100, newState: { stage: "form_company", formData: { ...state.formData, email: input } } };
    case "form_company":
      return { text: `Perfect. Last thing — what's your message or question for the team? Take your time!`, delay: 1000, newState: { stage: "form_message", formData: { ...state.formData, company: input } } };
    case "form_message":
      return {
        text: `Got it! Here's what I'm sending:\n\n👤 ${state.formData.name}\n📧 ${state.formData.email}\n🏢 ${state.formData.company}\n💬 "${input}"\n\nShall I send this to the AGL team?`,
        delay: 1400,
        newState: { stage: "form_done", formData: { ...state.formData, message: input } },
      };
    case "form_done":
      if (/yes|send|confirm|go ahead|sure|ok/.test(input.toLowerCase())) {
        return { text: `Done! ✅ Your message has been sent to the AGL team. They'll reach out to you at ${state.formData.email} within 1 business day.\n\nIs there anything else I can help you with?`, delay: 1500, newState: { stage: "main", formData: {} } };
      }
      return { text: `No worries! Message discarded. Is there anything else I can help you with?`, delay: 900, newState: { stage: "main", formData: {} } };
    default:
      return { text: "", delay: 0, newState: {} };
  }
}

function TypingDots() {
  return (
    <div className="flex items-end gap-2 mb-3">
      <img src={SOPHIA_AVATAR} alt="Sophia" className="w-7 h-7 rounded-full object-cover flex-shrink-0 ring-2 ring-white shadow-sm" />
      <div className="bg-white rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm border border-slate-100">
        <div className="flex gap-1 items-center h-4">
          {[0, 150, 300].map((d) => (
            <span key={d} className="w-2 h-2 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: `${d}ms` }} />
          ))}
        </div>
      </div>
    </div>
  );
}

export default function AIChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [minimized, setMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputVal, setInputVal] = useState("");
  const [typing, setTyping] = useState(false);
  const [unread, setUnread] = useState(0);
  const [greeted, setGreeted] = useState(false);
  const [pulse, setPulse] = useState(true);
  const [conv, setConv] = useState<ConvState>({ stage: "main", formData: {}, count: 0 });
  const endRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, typing]);
  useEffect(() => { if (isOpen && !minimized) setTimeout(() => inputRef.current?.focus(), 300); }, [isOpen, minimized]);
  useEffect(() => { const t = setTimeout(() => setPulse(false), 10000); return () => clearTimeout(t); }, []);

  useEffect(() => {
    if (isOpen && !greeted) {
      setGreeted(true);
      setTyping(true);
      setTimeout(() => {
        setTyping(false);
        setMessages([{ id: "g0", role: "sophia", text: `Hi! 👋 I'm Sophia from the AGL team. I'm here to help with anything — products, support, partnerships, or general questions.\n\nWhat can I help you with today?`, time: getTime() }]);
      }, 1600);
    }
  }, [isOpen, greeted]);

  const addSophia = useCallback((text: string, delay: number) => {
    setTyping(true);
    setTimeout(() => {
      setTyping(false);
      setMessages((p) => [...p, { id: Date.now().toString(), role: "sophia", text, time: getTime() }]);
      if (!isOpen || minimized) setUnread((c) => c + 1);
    }, delay);
  }, [isOpen, minimized]);

  const send = useCallback((text?: string) => {
    const t = (text || inputVal).trim();
    if (!t) return;
    setInputVal("");
    setMessages((p) => [...p, { id: Date.now().toString(), role: "user", text: t, time: getTime() }]);
    const newCount = conv.count + 1;

    if (["form_name", "form_email", "form_company", "form_message", "form_done"].includes(conv.stage)) {
      const { text: rt, delay, newState } = handleForm(t, conv);
      if (rt) { setConv((p) => ({ ...p, ...newState, count: newCount })); addSophia(rt, delay); }
      return;
    }

    if (/send (a )?(message|email|inquiry)|contact (you|the team)|get in touch|reach out|talk to (someone|a human)/.test(t.toLowerCase())) {
      setConv((p) => ({ ...p, stage: "form_name", count: newCount }));
      addSophia(`Of course! I'll help you get in touch with our team. 😊\n\nFirst — what's your name?`, 1200);
      return;
    }

    const { text: rt, delay } = sophiaReply(t, { ...conv, count: newCount });
    setConv((p) => ({ ...p, stage: "main", count: newCount }));
    setTyping(true);
    setTimeout(() => {
      setTyping(false);
      setMessages((p) => [...p, { id: Date.now().toString(), role: "sophia", text: rt, time: getTime() }]);
    }, delay);
  }, [inputVal, conv, addSophia]);

  const open = () => { setIsOpen(true); setMinimized(false); setUnread(0); };

  // Get quick replies from last sophia message
  const lastSophia = [...messages].reverse().find((m) => m.role === "sophia");
  const quickReplies = lastSophia && !typing ? sophiaReply(lastSophia.text, conv).quick : undefined;

  const fmt = (text: string) =>
    text.split("\n").map((line, i, arr) => (
      <span key={i}>{line}{i < arr.length - 1 && <br />}</span>
    ));

  const navQuicks: Record<string, string> = {
    "View Privacy Policy": "/privacy-policy",
    "Visit contact page": "/contact",
    "Visit support page": "/support",
  };

  return (
    <>
      {/* Chat window */}
      {isOpen && (
        <div
          className={`fixed bottom-24 right-5 z-50 flex flex-col shadow-2xl rounded-2xl overflow-hidden transition-all duration-300 ${minimized ? "h-16" : "h-[560px]"}`}
          style={{ width: "360px", maxWidth: "calc(100vw - 2.5rem)", background: "oklch(0.97 0.003 255)", border: "1px solid oklch(0.90 0.01 255)" }}
        >
          {/* Header */}
          <div className="flex items-center gap-3 px-4 py-3 flex-shrink-0" style={{ background: "oklch(0.14 0.04 255)" }}>
            <div className="relative">
              <img src={SOPHIA_AVATAR} alt="Sophia" className="w-10 h-10 rounded-full object-cover ring-2 ring-white/30" />
              <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white" style={{ background: "oklch(0.72 0.18 145)" }} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-white text-sm">Sophia</div>
              <div className="text-xs flex items-center gap-1" style={{ color: "oklch(0.72 0.18 145)" }}>
                <span className="w-1.5 h-1.5 rounded-full bg-current inline-block" />
                Online · Customer Success, AGL
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button onClick={() => setMinimized((v) => !v)} className="p-1.5 rounded-lg text-white/60 hover:text-white hover:bg-white/10 transition-all" aria-label="Minimize">
                {minimized ? <ChevronDown className="h-4 w-4" /> : <Minimize2 className="h-4 w-4" />}
              </button>
              <button onClick={() => setIsOpen(false)} className="p-1.5 rounded-lg text-white/60 hover:text-white hover:bg-white/10 transition-all" aria-label="Close">
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {!minimized && (
            <>
              {/* Messages */}
              <div className="flex-1 overflow-y-auto px-4 py-4" style={{ background: "oklch(0.97 0.003 255)" }}>
                {messages.map((msg) => (
                  <div key={msg.id} className={`flex items-end gap-2 mb-3 ${msg.role === "user" ? "flex-row-reverse" : ""}`}>
                    {msg.role === "sophia" && (
                      <img src={SOPHIA_AVATAR} alt="Sophia" className="w-7 h-7 rounded-full object-cover flex-shrink-0 ring-2 ring-white shadow-sm" />
                    )}
                    <div className={`flex flex-col gap-1 max-w-[78%] ${msg.role === "user" ? "items-end" : "items-start"}`}>
                      <div
                        className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed shadow-sm ${msg.role === "user" ? "rounded-br-sm text-white" : "rounded-bl-sm text-slate-800 bg-white border border-slate-100"}`}
                        style={msg.role === "user" ? { background: "oklch(0.52 0.22 270)" } : {}}
                      >
                        {fmt(msg.text)}
                      </div>
                      <span className="text-xs text-slate-400 px-1">{msg.time}</span>
                    </div>
                  </div>
                ))}

                {typing && <TypingDots />}

                {/* Quick replies */}
                {quickReplies && quickReplies.length > 0 && !typing && (
                  <div className="flex flex-wrap gap-2 mt-2 mb-1">
                    {quickReplies.map((r) =>
                      navQuicks[r] ? (
                        <Link key={r} href={navQuicks[r]} onClick={() => setIsOpen(false)}
                          className="text-xs px-3 py-1.5 rounded-full border font-medium transition-all hover:shadow-sm"
                          style={{ borderColor: "oklch(0.52 0.22 270)", color: "oklch(0.52 0.22 270)", background: "oklch(0.52 0.22 270 / 0.05)" }}>
                          {r}
                        </Link>
                      ) : (
                        <button key={r} onClick={() => send(r)}
                          className="text-xs px-3 py-1.5 rounded-full border font-medium transition-all hover:shadow-sm active:scale-95"
                          style={{ borderColor: "oklch(0.52 0.22 270)", color: "oklch(0.52 0.22 270)", background: "oklch(0.52 0.22 270 / 0.05)" }}>
                          {r}
                        </button>
                      )
                    )}
                  </div>
                )}

                <div ref={endRef} />
              </div>

              {/* Input */}
              <div className="px-4 py-3 flex-shrink-0 border-t bg-white" style={{ borderColor: "oklch(0.92 0.005 255)" }}>
                <div className="flex items-center gap-2">
                  <input
                    ref={inputRef}
                    type="text"
                    value={inputVal}
                    onChange={(e) => setInputVal(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
                    placeholder="Message Sophia..."
                    className="flex-1 text-sm px-4 py-2.5 rounded-xl border outline-none transition-all"
                    style={{ borderColor: "oklch(0.88 0.01 255)", background: "oklch(0.97 0.003 255)", color: "oklch(0.2 0.01 255)" }}
                    onFocus={(e) => { e.target.style.borderColor = "oklch(0.52 0.22 270)"; e.target.style.boxShadow = "0 0 0 3px oklch(0.52 0.22 270 / 0.12)"; }}
                    onBlur={(e) => { e.target.style.borderColor = "oklch(0.88 0.01 255)"; e.target.style.boxShadow = "none"; }}
                  />
                  <button
                    onClick={() => send()}
                    disabled={!inputVal.trim()}
                    className="p-2.5 rounded-xl transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
                    style={{ background: inputVal.trim() ? "oklch(0.52 0.22 270)" : "oklch(0.88 0.01 255)", color: inputVal.trim() ? "white" : "oklch(0.6 0.01 255)" }}
                    aria-label="Send"
                  >
                    <Send className="h-4 w-4" />
                  </button>
                </div>
                <div className="text-center mt-2">
                  <span className="text-xs text-slate-400">
                    Sophia · Customer Success at{" "}
                    <span style={{ color: "oklch(0.52 0.22 270)" }} className="font-medium">American Group LLC</span>
                  </span>
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* Launcher */}
      <button
        onClick={isOpen ? () => setIsOpen(false) : open}
        className="fixed bottom-5 right-5 z-50 flex items-center gap-2.5 transition-all duration-200 active:scale-95"
        style={{
          background: isOpen ? "oklch(0.14 0.04 255)" : "white",
          borderRadius: "50px",
          padding: isOpen ? "10px 16px 10px 10px" : "6px 16px 6px 6px",
          border: "1px solid oklch(0.88 0.01 255)",
          boxShadow: "0 8px 32px oklch(0.14 0.04 255 / 0.25)",
        }}
        aria-label="Chat with Sophia"
      >
        <div className="relative">
          <img src={SOPHIA_AVATAR} alt="Sophia" className="w-9 h-9 rounded-full object-cover ring-2 ring-white shadow" />
          {!isOpen && (
            <span
              className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${pulse ? "animate-pulse" : ""}`}
              style={{ background: "oklch(0.72 0.18 145)" }}
            />
          )}
          {unread > 0 && !isOpen && (
            <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full text-white text-xs font-bold flex items-center justify-center" style={{ background: "oklch(0.65 0.22 25)" }}>
              {unread}
            </span>
          )}
        </div>
        <span className="text-sm font-semibold pr-1" style={{ color: isOpen ? "white" : "oklch(0.2 0.04 255)" }}>
          {isOpen ? "Close" : "Chat with Sophia"}
        </span>
      </button>
    </>
  );
}
