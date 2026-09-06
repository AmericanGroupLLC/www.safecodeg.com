/**
 * Sophia — AGL's scripted site assistant (not a live person, not AI)
 * Dark enterprise theme, updated product info (77 products, 8 verticals)
 *
 * Honesty note (T-018 rejection, F-1 fix): this widget is a hardcoded regex
 * response engine — there is no network call anywhere in this file. Every
 * visitor-facing surface below must disclose that by default, without the
 * visitor having to ask "are you a bot" first. See TASKS.md Decisions row 17.
 */

import { useState, useRef, useEffect, useCallback } from "react";
import { Bot, X, Send, Minimize2, ChevronDown } from "lucide-react";
import { Link } from "wouter";

/**
 * A flat, short reply delay. Retained only for UX continuity (a reply
 * popping in with zero transition reads as broken), not to simulate human
 * typing cadence — the previous 800–1700ms range scaled with message
 * "complexity" specifically to feel like a person typing, which is exactly
 * the illusion this fix removes. `Math.min(returnedDelay, RESPONSE_DELAY_MS)`
 * below caps every call site at this value regardless of what `sophiaReply`/
 * `handleForm` return.
 */
const RESPONSE_DELAY_MS = 500;

/**
 * Same Web3Forms *access key* used by the site's primary contact form
 * (client/src/pages/Contact.tsx:12) and the same public, front-end-safe
 * value — Web3Forms access keys are designed to be embedded in client code,
 * like a Stripe publishable key, not a secret. Duplicated here rather than
 * imported so this widget stays free of a dependency on a page component;
 * if the key ever needs to change, update both call sites.
 */
const WEB3FORMS_KEY = "97f985ce-75d3-47e8-b941-3e85db2e7395";

interface Message {
  id: string;
  role: "sophia" | "user";
  text: string;
  time: string;
  /**
   * Explicit quick-reply override for this message. When unset, the render
   * layer falls back to re-deriving quick replies from `sophiaReply(text)`
   * (see the `quickReplies` memo below) — that derivation is keyed off
   * incidental keyword matches in the message text, which is unreliable for
   * a message built from arbitrary visitor-supplied data (e.g. an email
   * address that happens to contain "ai"). The contact-form failure message
   * sets this explicitly so its "Visit contact page" route is never at the
   * mercy of that coincidence.
   */
  quick?: string[];
}

interface ConvState {
  stage:
    | "main"
    | "form_name"
    | "form_email"
    | "form_company"
    | "form_message"
    | "form_done";
  formData: {
    name?: string;
    email?: string;
    company?: string;
    message?: string;
  };
  userName?: string;
  count: number;
}

function getTime() {
  return new Date().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

// ── Sophia's response engine ──────────────────────────────────────────────────
function sophiaReply(
  input: string,
  state: ConvState
): { text: string; delay: number; quick?: string[] } {
  const m = input.toLowerCase().trim();

  if (
    /^(hi|hello|hey|good\s*(morning|afternoon|evening)|howdy|sup)\b/.test(m)
  ) {
    const g = [
      `Hey${state.userName ? " " + state.userName : ""}! 😊 Great to hear from you. What can I help you with today?`,
      `Hi there! I'm Sophia, AGL's automated site assistant. What's on your mind?`,
      `Hello! Welcome to American Group LLC. How can I help you today?`,
    ];
    return {
      text: g[Math.floor(Math.random() * g.length)],
      delay: 800,
      quick: [
        "Tell me about your products",
        "I need support",
        "Contact info",
        "Careers",
      ],
    };
  }

  if (
    /how are you|how('?re| are) you doing|what'?s up|how'?s it going/.test(m)
  ) {
    return {
      text: `Doing great, thanks for asking! 😄 Always happy to chat. What brings you by today?`,
      delay: 1100,
    };
  }

  if (
    /your name|who are you|what'?s your name|who am i (talking|chatting) (to|with)/.test(
      m
    )
  ) {
    return {
      text: `I'm Sophia — an automated assistant here on the AGL site, not a person. I answer from a set of preset responses about our products, team, and services, and I'll loop in someone from our actual team for anything else. What can I help you with?`,
      delay: 1300,
    };
  }

  if (
    /are you (a )?(bot|robot|ai|real|human|person)|is this (a )?(bot|ai|automated)/.test(
      m
    )
  ) {
    return {
      text: `Ha, good question! 😄 I'm Sophia — a scripted help assistant here on the AGL site, not AI. I work from a set of preset answers about our products, team, and services, and I'll connect you with a real person on our team for anything I can't handle. What can I help you with?`,
      delay: 1700,
    };
  }

  if (
    /product|app|application|software|what do you (make|build|sell|offer)|portfolio/.test(
      m
    )
  ) {
    return {
      text: `We have 77 products across 8 verticals! 🚀\n\nHighlights:\n• 🧠 Enterprise AI & DevTools (12 products)\n• 📱 Consumer Mobile (18 products)\n• 💳 FinTech & E-Commerce (14 products)\n• 🛡️ CyberSecurity & Infra (8 products)\n• ✈️ Travel & Aviation (6 products)\n• ❤️ Health & Wellness (10 products)\n\nWant details on a specific category?`,
      delay: 1600,
      quick: [
        "Enterprise AI products",
        "Mobile apps",
        "FinTech products",
        "All 77 products",
      ],
    };
  }

  if (/health|wellness|fitness|medical|myhealth|virtuband/.test(m)) {
    return {
      text: `Our Health & Wellness vertical has 10 products! 💪 Highlights: MyHealth (fitness OS for Android & Wear OS), VirtuBand (smart wearable companion), and more. All built with HealthKit, Wear OS, and AI coaching. Want details on any specific one?`,
      delay: 1700,
    };
  }

  if (/ai|machine learning|llm|cognicore|offlinebuddy|verba/.test(m)) {
    return {
      text: `Our Enterprise AI & DevTools vertical has 12 products! 🧠 Highlights: CogniCore AI Platform (enterprise cognitive AI), OfflineBuddy (on-device LLM, works fully offline), Verba (multilingual conversational AI), DocStream Enterprise, DataCore. Want to know more?`,
      delay: 1600,
    };
  }

  if (/fintech|finance|banking|payment|money|invest|apexmarket/.test(m)) {
    return {
      text: `Our FinTech & E-Commerce vertical has 14 products! 💰 Including ApexMarketWatch (real-time markets & hedge fund filings), BudgetBuddy, CryptoCore, PayFlow, and more. All built with bank-grade security. Interested in any specific one?`,
      delay: 1600,
    };
  }

  if (/travel|aviation|flight|aeroswift/.test(m)) {
    return {
      text: `Our Travel & Aviation vertical has 6 products! ✈️ Highlights: AeroSwift (real-time flight tracking & aviation data), TripSync, and more. Perfect for frequent flyers and aviation enthusiasts. Want details?`,
      delay: 1500,
    };
  }

  if (/security|cybersecurity|securecore|threat|zero.?trust/.test(m)) {
    return {
      text: `Our CyberSecurity & Infra vertical has 8 products! 🛡️ Highlights: SecureCore (enterprise security operations), ThreatWatch, ZeroTrust Gateway, CloudArmor, VaultOS. Built for enterprise-grade security. Want to know more?`,
      delay: 1600,
    };
  }

  if (/mobile|android|ios|app store|play store/.test(m)) {
    return {
      text: `Our Consumer Mobile vertical has 18 products! 📱 Including AGCleaner, AGRecorder, MyCard (Wear OS), iMeasure, iMaps, BuddyPlay, and more. Available on iOS, Android, and Wear OS. Want details on any specific app?`,
      delay: 1600,
    };
  }

  if (/service|outsourc|develop|build|hire|custom|project/.test(m)) {
    return {
      text: `We offer end-to-end software development services! 🛠️\n\n• Custom mobile apps (iOS & Android)\n• Web applications & SaaS platforms\n• AI/ML solutions & LLM deployments\n• Cloud architecture & DevOps\n• Tech outsourcing via our India office\n\nWant a free consultation?`,
      delay: 1800,
      quick: [
        "Get a free consultation",
        "Tell me about pricing",
        "India office info",
      ],
    };
  }

  if (/price|pricing|cost|how much|rate|quote|budget/.test(m)) {
    return {
      text: `Pricing varies by project scope. For custom development, we offer free initial consultations. Enterprise licensing starts at $299/month. Our India team (SafeCodeX Research Center) makes outsourcing very cost-effective without compromising quality. Want me to connect you with our sales team?`,
      delay: 1500,
      quick: ["Yes, get a quote", "Talk to sales"],
    };
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
      text: `We're always looking for talented people! 🌟\n\nCurrent openings:\n• Senior AI/ML Engineer\n• iOS Developer (Swift)\n• Full-Stack Engineer (TypeScript)\n• Cybersecurity Engineer\n• Android Developer (Kotlin)\n• DevOps / Cloud Engineer\n\nEmail careers@safecodeg.com or visit our Careers page!`,
      delay: 1600,
      quick: ["Visit Careers page", "Tell me more"],
    };
  }

  if (/privacy|policy|gdpr|ccpa|data|personal information/.test(m)) {
    return {
      text: `Our Privacy Policy is at safecodeg.com/privacy-policy — it covers all 77 apps and is fully compliant with GDPR, CCPA, and COPPA. For privacy questions, email contact@safecodeg.com`,
      delay: 1300,
      quick: ["View Privacy Policy", "Data deletion request"],
    };
  }

  if (/support|help|issue|problem|bug|not working|broken|error|fix/.test(m)) {
    return {
      text: `Oh no, sorry to hear you're having trouble! 😟 Can you tell me:\n1. Which app is this about?\n2. What's happening exactly?\n\nOr email contact@safecodeg.com directly and our support team will get back to you ASAP.`,
      delay: 1500,
      quick: ["Email support", "Visit support page"],
    };
  }

  if (/india|hyderabad|safecodex|safecode/.test(m)) {
    return {
      text: `Our India engineering office — SafeCodeX Research Center Pvt. Ltd. — is in Hyderabad! 🇮🇳 They handle QA, backend delivery, embedded firmware research, and mobile development support. India phone: +91 74168 66689`,
      delay: 1500,
    };
  }

  if (/california|santa clara|silicon valley|usa|us office/.test(m)) {
    return {
      text: `We're based in Santa Clara, California — right in Silicon Valley! 🇺🇸 Our HQ is where leadership, product strategy, and client relations are based. US phone: +1 (510) 458-9059`,
      delay: 1400,
    };
  }

  if (
    /send (a )?(message|email|inquiry)|contact (you|the team)|get in touch|reach out|talk to (someone|a human)/.test(
      m
    )
  ) {
    return {
      text: `Of course! I'll help you get in touch with our team. It'll just take a minute. 😊\n\nFirst — what's your name?`,
      delay: 1200,
    };
  }

  if (/thank|thanks|thx|ty|appreciate|helpful/.test(m)) {
    const r = [
      `You're so welcome! 😊 Anything else I can help you with?`,
      `Happy to help! That's what I'm here for. Anything else?`,
      `Of course! Don't hesitate to reach out anytime. Have a great day! ☀️`,
    ];
    return { text: r[Math.floor(Math.random() * r.length)], delay: 900 };
  }

  if (/bye|goodbye|see you|talk later|gotta go|ttyl/.test(m)) {
    return {
      text: `Take care! 👋 Feel free to come back anytime — I'm here 24/7. Have a wonderful day!`,
      delay: 800,
    };
  }

  if (
    /^(yes|yeah|yep|sure|ok|okay|sounds good|absolutely|definitely|please)\.?$/.test(
      m
    )
  ) {
    return {
      text: `Great! What's your name so I can personalize this for you?`,
      delay: 900,
    };
  }

  if (/77|all products|full list|complete list/.test(m)) {
    return {
      text: `We have 77 products across 8 verticals! Browse the full portfolio at safecodeg.com/products — filterable by category and searchable. Want me to highlight any specific vertical?`,
      delay: 1400,
      quick: ["Health & Wellness", "Enterprise AI", "FinTech", "CyberSecurity"],
    };
  }

  const fallbacks = [
    `That's a good question! 🤔 I want to make sure I give you the right answer — could you tell me a bit more? Or I can connect you directly with our team.`,
    `Hmm, I might not have all the details on that one, but our team definitely would. Want me to help you reach out to them?`,
    `Great question! That's something our team would be better placed to answer properly. Want me to set up a message for you?`,
    `I hear you! Let me connect you with the right person on our team — they'd know exactly what you need. Shall I help you send them a message?`,
  ];
  return {
    text: fallbacks[Math.floor(Math.random() * fallbacks.length)],
    delay: 1600,
    quick: ["Send a message", "Contact info", "Browse products"],
  };
}

function handleForm(
  input: string,
  state: ConvState
): { text: string; delay: number; newState: Partial<ConvState> } {
  switch (state.stage) {
    case "form_name":
      return {
        text: `Nice to meet you, ${input}! 😊 What's your email address so we can get back to you?`,
        delay: 1000,
        newState: {
          stage: "form_email",
          formData: { ...state.formData, name: input },
          userName: input,
        },
      };
    case "form_email":
      if (!input.includes("@"))
        return {
          text: `Hmm, that doesn't look like a valid email — could you double-check it? I want to make sure our team can reach you!`,
          delay: 1000,
          newState: {},
        };
      return {
        text: `Got it! And what company or organization are you with? (Or just say "individual" if it's personal)`,
        delay: 1100,
        newState: {
          stage: "form_company",
          formData: { ...state.formData, email: input },
        },
      };
    case "form_company":
      return {
        text: `Perfect. Last thing — what's your message or question for the team? Take your time!`,
        delay: 1000,
        newState: {
          stage: "form_message",
          formData: { ...state.formData, company: input },
        },
      };
    case "form_message":
      return {
        text: `Got it! Here's what I'm sending:\n\n👤 ${state.formData.name}\n📧 ${state.formData.email}\n🏢 ${state.formData.company}\n💬 "${input}"\n\nShall I send this to the AGL team?`,
        delay: 1400,
        newState: {
          stage: "form_done",
          formData: { ...state.formData, message: input },
        },
      };
    case "form_done":
      // The confirming ("yes"/"send"/...) branch used to live here and
      // unconditionally rendered a hardcoded success message — no network
      // call was ever made anywhere in this file, so every confirmed
      // inquiry was silently discarded while the visitor was told it had
      // been delivered. That branch is now handled in `send()` (see
      // `submitContactForm`), not here, because reporting success honestly
      // requires awaiting a real Web3Forms response before saying anything.
      // This function only ever sees the case where that regex did NOT
      // match, i.e. the decline path.
      return {
        text: `No worries! Message discarded. Is there anything else I can help you with?`,
        delay: 900,
        newState: { stage: "main", formData: {} },
      };
    default:
      return { text: "", delay: 0, newState: {} };
  }
}

/**
 * Renders as a Bot icon on a gradient circle rather than a photo — deliberate:
 * a robot glyph cannot be mistaken for a human staff photo, and it needs no
 * externally hosted asset that can 404 (the previous `/manus-storage/
 * sophia-avatar_9b8b67b1.png` resolved nowhere in this repo's build output).
 */
function SophiaAvatar({ className }: { className: string }) {
  return (
    <div
      className={`rounded-full flex items-center justify-center flex-shrink-0 ${className}`}
      style={{ background: "linear-gradient(135deg, #6366F1, #4F46E5)" }}
    >
      <Bot className="w-[60%] h-[60%] text-white" aria-hidden="true" />
    </div>
  );
}

function TypingDots() {
  return (
    <div className="flex items-end gap-2 mb-3">
      <SophiaAvatar className="w-7 h-7 ring-2 ring-indigo-500/30" />
      <div
        className="rounded-2xl rounded-bl-sm px-4 py-3"
        style={{
          background: "rgba(255,255,255,0.08)",
          border: "1px solid rgba(255,255,255,0.1)",
        }}
      >
        <div className="flex gap-1 items-center h-4">
          {[0, 150, 300].map(d => (
            <span
              key={d}
              className="w-2 h-2 rounded-full bg-indigo-400 animate-bounce"
              style={{ animationDelay: `${d}ms` }}
            />
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
  const [conv, setConv] = useState<ConvState>({
    stage: "main",
    formData: {},
    count: 0,
  });
  // True only while the real Web3Forms submission (see submitContactForm)
  // is in flight — drives the disabled input/placeholder and blocks a
  // second confirmation from firing a second request.
  const [submitting, setSubmitting] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typing]);
  useEffect(() => {
    if (isOpen && !minimized) setTimeout(() => inputRef.current?.focus(), 300);
  }, [isOpen, minimized]);
  useEffect(() => {
    const t = setTimeout(() => setPulse(false), 10000);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (isOpen && !greeted) {
      setGreeted(true);
      setTyping(true);
      setTimeout(() => {
        setTyping(false);
        setMessages([
          {
            id: "g0",
            role: "sophia",
            text: `Hi! 👋 I'm Sophia, an automated assistant for the AGL site — not a live person. I can help with products, support, partnerships, or general questions, and I'll connect you with our team for anything else.\n\nWhat can I help you with today?`,
            time: getTime(),
          },
        ]);
      }, RESPONSE_DELAY_MS);
    }
  }, [isOpen, greeted]);

  const addSophia = useCallback(
    (text: string, delay: number) => {
      setTyping(true);
      setTimeout(
        () => {
          setTyping(false);
          setMessages(p => [
            ...p,
            {
              id: Date.now().toString(),
              role: "sophia",
              text,
              time: getTime(),
            },
          ]);
          if (!isOpen || minimized) setUnread(c => c + 1);
        },
        Math.min(delay, RESPONSE_DELAY_MS)
      );
    },
    [isOpen, minimized]
  );

  /**
   * Actually delivers the reviewed inquiry — the fix for the fabricated
   * "Done! ✅ ... has been sent" confirmation this widget used to render
   * unconditionally. Reuses Contact.tsx's own working pattern exactly: POST
   * to https://api.web3forms.com/submit with the same WEB3FORMS_KEY, a
   * `botcheck` honeypot, and the same field shape; read `data.success`; only
   * report success once that is confirmed; otherwise throw and show an
   * honest failure with a route that still works.
   */
  const submitContactForm = useCallback(
    async (formData: ConvState["formData"]) => {
      setSubmitting(true);
      setTyping(true);
      try {
        const res = await fetch("https://api.web3forms.com/submit", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({
            access_key: WEB3FORMS_KEY,
            subject: `New Contact: Chat Widget Inquiry — from ${formData.name ?? "a website visitor"}`,
            from_name: "safecodeg.com Chat Widget (Sophia)",
            name: formData.name ?? "",
            email: formData.email ?? "",
            company: formData.company || "Not provided",
            message: formData.message ?? "",
            botcheck: "",
          }),
        });
        const data = await res.json();
        if (!data.success) throw new Error(data.message || "Submission failed");
        setMessages(p => [
          ...p,
          {
            id: Date.now().toString(),
            role: "sophia",
            // "1–2 business days" matches Contact.tsx's own success wording
            // (and server/contactRouter.ts's) rather than inventing a tighter
            // SLA this widget has no basis to promise.
            text: `Done! ✅ Your message has been sent to the AGL team. They'll respond to you at ${formData.email} within 1–2 business days.\n\nIs there anything else I can help you with?`,
            time: getTime(),
          },
        ]);
      } catch (err) {
        console.error("[AIChatWidget] Web3Forms submission failed:", err);
        setMessages(p => [
          ...p,
          {
            id: Date.now().toString(),
            role: "sophia",
            text: `I'm sorry — that didn't go through, so nothing was sent. Please email us directly at 📧 contact@safecodeg.com, or use the option below, and our team will get back to you within 1–2 business days.`,
            time: getTime(),
            quick: ["Visit contact page"],
          },
        ]);
      } finally {
        setTyping(false);
        setSubmitting(false);
        setConv(p => ({ ...p, stage: "main", formData: {} }));
      }
    },
    []
  );

  const send = useCallback(
    (text?: string) => {
      const t = (text || inputVal).trim();
      if (!t) return;
      if (submitting) return; // a real submission is already in flight
      setInputVal("");
      setMessages(p => [
        ...p,
        { id: Date.now().toString(), role: "user", text: t, time: getTime() },
      ]);
      const newCount = conv.count + 1;

      // Confirming the reviewed message is handled here, not by handleForm —
      // it performs the real network call above and must await the response
      // before saying anything happened.
      if (
        conv.stage === "form_done" &&
        /yes|send|confirm|go ahead|sure|ok/.test(t.toLowerCase())
      ) {
        setConv(p => ({ ...p, count: newCount }));
        void submitContactForm(conv.formData);
        return;
      }

      if (
        [
          "form_name",
          "form_email",
          "form_company",
          "form_message",
          "form_done",
        ].includes(conv.stage)
      ) {
        const { text: rt, delay, newState } = handleForm(t, conv);
        if (rt) {
          setConv(p => ({ ...p, ...newState, count: newCount }));
          addSophia(rt, delay);
        }
        return;
      }

      if (
        /send (a )?(message|email|inquiry)|contact (you|the team)|get in touch|reach out|talk to (someone|a human)/.test(
          t.toLowerCase()
        )
      ) {
        setConv(p => ({ ...p, stage: "form_name", count: newCount }));
        addSophia(
          `Of course! I'll help you get in touch with our team. 😊\n\nFirst — what's your name?`,
          1200
        );
        return;
      }

      const { text: rt, delay } = sophiaReply(t, { ...conv, count: newCount });
      setConv(p => ({ ...p, stage: "main", count: newCount }));
      setTyping(true);
      setTimeout(
        () => {
          setTyping(false);
          setMessages(p => [
            ...p,
            {
              id: Date.now().toString(),
              role: "sophia",
              text: rt,
              time: getTime(),
            },
          ]);
        },
        Math.min(delay, RESPONSE_DELAY_MS)
      );
    },
    [inputVal, conv, addSophia, submitting, submitContactForm]
  );

  const open = () => {
    setIsOpen(true);
    setMinimized(false);
    setUnread(0);
  };

  // Get quick replies from last sophia message. `msg.quick`, when set, is an
  // explicit override (see the Message interface) — otherwise fall back to
  // the original re-derivation from the message text.
  const lastSophia = [...messages].reverse().find(m => m.role === "sophia");
  const quickReplies =
    lastSophia && !typing
      ? (lastSophia.quick ?? sophiaReply(lastSophia.text, conv).quick)
      : undefined;

  const fmt = (text: string) =>
    text.split("\n").map((line, i, arr) => (
      <span key={i}>
        {line}
        {i < arr.length - 1 && <br />}
      </span>
    ));

  const navQuicks: Record<string, string> = {
    "View Privacy Policy": "/privacy-policy",
    "Visit contact page": "/contact",
    "Visit support page": "/support",
    "Visit Careers page": "/careers",
    "All 77 products": "/products",
  };

  return (
    <>
      {/* Chat window */}
      {isOpen && (
        <div
          className={`fixed bottom-24 right-5 z-50 flex flex-col shadow-2xl rounded-2xl overflow-hidden transition-all duration-300 ${minimized ? "h-16" : "h-[560px]"}`}
          style={{
            width: "360px",
            maxWidth: "calc(100vw - 2.5rem)",
            background: "#0A0F1E",
            border: "1px solid rgba(255,255,255,0.1)",
            boxShadow:
              "0 25px 80px rgba(0,0,0,0.7), 0 0 40px rgba(99,102,241,0.1)",
          }}
        >
          {/* Header */}
          <div
            className="flex items-center gap-3 px-4 py-3 flex-shrink-0"
            style={{
              background: "rgba(99,102,241,0.15)",
              borderBottom: "1px solid rgba(255,255,255,0.08)",
            }}
          >
            <div className="relative">
              <SophiaAvatar className="w-10 h-10 ring-2 ring-indigo-500/40" />
              <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-[#0A0F1E] bg-indigo-400" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-white text-sm">Sophia</div>
              <div className="text-xs flex items-center gap-1 text-indigo-400">
                <span className="w-1.5 h-1.5 rounded-full bg-current inline-block" />
                Automated assistant · AGL
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setMinimized(v => !v)}
                className="p-1.5 rounded-lg text-white/50 hover:text-white hover:bg-white/10 transition-all"
                aria-label="Minimize"
              >
                {minimized ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <Minimize2 className="h-4 w-4" />
                )}
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-lg text-white/50 hover:text-white hover:bg-white/10 transition-all"
                aria-label="Close"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {!minimized && (
            <>
              {/* Messages */}
              <div
                className="flex-1 overflow-y-auto px-4 py-4"
                style={{ background: "#070B14" }}
              >
                {messages.map(msg => (
                  <div
                    key={msg.id}
                    className={`flex items-end gap-2 mb-3 ${msg.role === "user" ? "flex-row-reverse" : ""}`}
                  >
                    {msg.role === "sophia" && (
                      <SophiaAvatar className="w-7 h-7 ring-2 ring-indigo-500/30" />
                    )}
                    <div
                      className={`flex flex-col gap-1 max-w-[78%] ${msg.role === "user" ? "items-end" : "items-start"}`}
                    >
                      <div
                        className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${msg.role === "user" ? "rounded-br-sm text-white" : "rounded-bl-sm text-slate-200"}`}
                        style={
                          msg.role === "user"
                            ? {
                                background:
                                  "linear-gradient(135deg, #6366F1, #4F46E5)",
                              }
                            : {
                                background: "rgba(255,255,255,0.07)",
                                border: "1px solid rgba(255,255,255,0.1)",
                              }
                        }
                      >
                        {fmt(msg.text)}
                      </div>
                      <span className="text-xs text-slate-600 px-1">
                        {msg.time}
                      </span>
                    </div>
                  </div>
                ))}

                {typing && <TypingDots />}

                {/* Quick replies */}
                {quickReplies && quickReplies.length > 0 && !typing && (
                  <div className="flex flex-wrap gap-2 mt-2 mb-1">
                    {quickReplies.map(r =>
                      navQuicks[r] ? (
                        <Link
                          key={r}
                          href={navQuicks[r]}
                          onClick={() => setIsOpen(false)}
                          className="text-xs px-3 py-1.5 rounded-full font-medium transition-all hover:scale-105"
                          style={{
                            border: "1px solid rgba(99,102,241,0.4)",
                            color: "#818CF8",
                            background: "rgba(99,102,241,0.1)",
                          }}
                        >
                          {r}
                        </Link>
                      ) : (
                        <button
                          key={r}
                          onClick={() => send(r)}
                          className="text-xs px-3 py-1.5 rounded-full font-medium transition-all hover:scale-105 active:scale-95"
                          style={{
                            border: "1px solid rgba(99,102,241,0.4)",
                            color: "#818CF8",
                            background: "rgba(99,102,241,0.1)",
                          }}
                        >
                          {r}
                        </button>
                      )
                    )}
                  </div>
                )}

                <div ref={endRef} />
              </div>

              {/* Input */}
              <div
                className="px-4 py-3 flex-shrink-0"
                style={{
                  borderTop: "1px solid rgba(255,255,255,0.08)",
                  background: "#0A0F1E",
                }}
              >
                <div className="flex items-center gap-2">
                  <input
                    ref={inputRef}
                    type="text"
                    value={inputVal}
                    onChange={e => setInputVal(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        send();
                      }
                    }}
                    placeholder={
                      submitting ? "Sending your message…" : "Message Sophia..."
                    }
                    disabled={submitting}
                    aria-busy={submitting}
                    className="flex-1 text-sm px-4 py-2.5 rounded-xl outline-none transition-all text-white placeholder-slate-600 disabled:opacity-60"
                    style={{
                      background: "rgba(255,255,255,0.06)",
                      border: "1px solid rgba(255,255,255,0.1)",
                    }}
                    onFocus={e => {
                      e.target.style.borderColor = "rgba(99,102,241,0.5)";
                      e.target.style.boxShadow =
                        "0 0 0 3px rgba(99,102,241,0.1)";
                    }}
                    onBlur={e => {
                      e.target.style.borderColor = "rgba(255,255,255,0.1)";
                      e.target.style.boxShadow = "none";
                    }}
                  />
                  <button
                    onClick={() => send()}
                    disabled={!inputVal.trim() || submitting}
                    className="p-2.5 rounded-xl transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
                    style={{
                      background:
                        inputVal.trim() && !submitting
                          ? "linear-gradient(135deg, #6366F1, #4F46E5)"
                          : "rgba(255,255,255,0.08)",
                      color: "white",
                    }}
                    aria-label="Send"
                  >
                    <Send className="h-4 w-4" />
                  </button>
                </div>
                <div className="text-center mt-2">
                  <span className="text-xs text-slate-600">
                    Sophia · Automated assistant for{" "}
                    <span className="text-indigo-400 font-medium">
                      American Group LLC
                    </span>
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
        className="fixed bottom-5 right-5 z-50 flex items-center gap-2.5 transition-all duration-200 active:scale-95 hover:scale-105"
        style={{
          background: isOpen ? "rgba(7,11,20,0.95)" : "rgba(7,11,20,0.9)",
          borderRadius: "50px",
          padding: isOpen ? "10px 16px 10px 10px" : "6px 16px 6px 6px",
          border: "1px solid rgba(99,102,241,0.35)",
          boxShadow:
            "0 8px 32px rgba(0,0,0,0.5), 0 0 20px rgba(99,102,241,0.15)",
        }}
        aria-label="Chat with Sophia"
      >
        <div className="relative">
          <SophiaAvatar className="w-9 h-9 ring-2 ring-indigo-500/40" />
          {!isOpen && (
            <span
              className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-[#070B14] bg-indigo-400 ${pulse ? "animate-pulse" : ""}`}
            />
          )}
          {unread > 0 && !isOpen && (
            <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full text-white text-xs font-bold flex items-center justify-center bg-red-500">
              {unread}
            </span>
          )}
        </div>
        <span className="text-sm font-semibold pr-1 text-white">
          {isOpen ? "Close" : "Chat with Sophia"}
        </span>
      </button>
    </>
  );
}
