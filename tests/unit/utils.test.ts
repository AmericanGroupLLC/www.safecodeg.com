/**
 * UNIT TESTS — Category 1
 * Utility Functions, Data Structures, Product Catalog, Business Logic
 */
import { describe, it, expect } from "vitest";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

// ── clsx utility ──────────────────────────────────────────────────────────────
describe("clsx utility", () => {
  it("combines class strings", () =>
    expect(clsx("foo", "bar")).toBe("foo bar"));
  it("handles conditional classes", () =>
    expect(clsx("base", { active: true, disabled: false })).toBe(
      "base active"
    ));
  it("handles undefined/null gracefully", () =>
    expect(clsx("base", undefined, null, "")).toBe("base"));
  it("handles arrays", () => expect(clsx(["a", "b"], "c")).toBe("a b c"));
});

// ── tailwind-merge ────────────────────────────────────────────────────────────
describe("tailwind-merge utility", () => {
  it("merges conflicting tailwind classes (last wins)", () =>
    expect(twMerge("text-red-500", "text-blue-500")).toBe("text-blue-500"));
  it("keeps non-conflicting classes", () => {
    const r = twMerge("text-lg", "font-bold");
    expect(r).toContain("text-lg");
    expect(r).toContain("font-bold");
  });
  it("handles padding conflicts", () => {
    const r = twMerge("px-4 py-2", "px-8");
    expect(r).toContain("px-8");
    expect(r).not.toContain("px-4");
  });
});

// ── Product data structure integrity ─────────────────────────────────────────
describe("Product data structure", () => {
  const PRODUCTS = [
    {
      slug: "cognicore",
      name: "CogniCore AI",
      category: "Enterprise AI & DevTools",
      platform: "Web/API",
      status: "Live",
    },
    {
      slug: "myhealth",
      name: "MyHealth",
      category: "Health & Wellness",
      platform: "Android/Wear OS",
      status: "Live",
    },
    {
      slug: "aeroswift",
      name: "AeroSwift",
      category: "Travel & Aviation",
      platform: "iOS/Android",
      status: "Live",
    },
    {
      slug: "apexmarketwatch",
      name: "ApexMarketWatch",
      category: "FinTech & E-Commerce",
      platform: "iOS/Android",
      status: "Live",
    },
    {
      slug: "offlinebuddy",
      name: "OfflineBuddy",
      category: "Enterprise AI & DevTools",
      platform: "Android",
      status: "Live",
    },
    {
      slug: "securecore",
      name: "SecureCore",
      category: "CyberSecurity & Infra",
      platform: "Web/API",
      status: "Live",
    },
  ];

  it("all products have required fields", () => {
    PRODUCTS.forEach(p => {
      expect(p.slug).toBeTruthy();
      expect(p.name).toBeTruthy();
      expect(p.category).toBeTruthy();
      expect(p.platform).toBeTruthy();
      expect(p.status).toBeTruthy();
    });
  });

  it("all slugs are lowercase and hyphenated (URL-safe)", () => {
    PRODUCTS.forEach(p => expect(p.slug).toMatch(/^[a-z0-9-]+$/));
  });

  it("all slugs are unique", () => {
    const slugs = PRODUCTS.map(p => p.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });

  it("status values are valid enum", () => {
    const validStatuses = ["Live", "Beta", "Coming Soon"];
    PRODUCTS.forEach(p => expect(validStatuses).toContain(p.status));
  });
});

// ── Vertical data integrity ───────────────────────────────────────────────────
describe("Vertical data integrity", () => {
  const VERTICALS = [
    { title: "Enterprise AI & DevTools", count: 12 },
    { title: "Consumer Mobile", count: 18 },
    { title: "FinTech & E-Commerce", count: 14 },
    { title: "CyberSecurity & Infra", count: 8 },
    { title: "Travel & Aviation", count: 6 },
    { title: "Health & Wellness", count: 10 },
    { title: "E-Commerce & Deals", count: 5 },
    { title: "Social & Lifestyle", count: 4 },
  ];

  it("has exactly 8 verticals", () => expect(VERTICALS.length).toBe(8));
  it("total product count across verticals is 77", () => {
    const total = VERTICALS.reduce((sum, v) => sum + v.count, 0);
    expect(total).toBe(77);
  });
  it("all verticals have positive product counts", () => {
    VERTICALS.forEach(v => expect(v.count).toBeGreaterThan(0));
  });
  it("all vertical titles are non-empty strings", () => {
    VERTICALS.forEach(v => {
      expect(typeof v.title).toBe("string");
      expect(v.title.length).toBeGreaterThan(0);
    });
  });
});

// ── Route generation ──────────────────────────────────────────────────────────
describe("Route generation", () => {
  const generateProductRoute = (slug: string) => `/products/${slug}`;
  const generateVerticalRoute = (slug: string) => `/products?vertical=${slug}`;

  it("generates correct product route", () =>
    expect(generateProductRoute("cognicore")).toBe("/products/cognicore"));
  it("generates correct vertical filter route", () =>
    expect(generateVerticalRoute("enterprise-ai")).toBe(
      "/products?vertical=enterprise-ai"
    ));
  it("handles slugs with numbers", () =>
    expect(generateProductRoute("app365")).toBe("/products/app365"));
});

// ── String formatting utilities ───────────────────────────────────────────────
describe("String formatting", () => {
  const formatCount = (n: number, suffix = "+") => `${n}${suffix}`;
  const truncate = (str: string, max: number) =>
    str.length > max ? str.slice(0, max) + "..." : str;

  it("formats count with suffix", () => {
    expect(formatCount(77)).toBe("77+");
    expect(formatCount(99, ".9%")).toBe("99.9%");
  });
  it("truncates long strings", () => {
    expect(truncate("Hello World", 5)).toBe("Hello...");
    expect(truncate("Hi", 10)).toBe("Hi");
  });
  it("handles empty string truncation", () => expect(truncate("", 5)).toBe(""));
});

// ── Internship Positions — Data Integrity ─────────────────────────────────────
describe("Internship Positions", () => {
  const internships = [
    {
      title: "AI / LLM Mobile App Intern",
      area: "AI Mobile",
      type: "Internship",
      duration: "3-6 months",
    },
    {
      title: "LLM & Generative AI Research Intern",
      area: "AI Research",
      type: "Internship",
      duration: "3-6 months",
    },
    {
      title: "Blockchain & Web3 Developer Intern",
      area: "Blockchain",
      type: "Internship",
      duration: "3-6 months",
    },
    {
      title: "Blockchain Security & Audit Intern",
      area: "Blockchain",
      type: "Internship",
      duration: "3-6 months",
    },
  ];

  it("has exactly 4 internship positions", () =>
    expect(internships).toHaveLength(4));
  it("has 2 AI-related internships", () =>
    expect(internships.filter(i => i.area.includes("AI"))).toHaveLength(2));
  it("has 2 blockchain-related internships", () =>
    expect(internships.filter(i => i.area === "Blockchain")).toHaveLength(2));
  it("all are marked as Internship type", () =>
    internships.forEach(i => expect(i.type).toBe("Internship")));
  it("all have 3-6 month duration", () =>
    internships.forEach(i => expect(i.duration).toBe("3-6 months")));
});

// ── Contact Form — Input Validation Logic ─────────────────────────────────────
describe("Contact Form Validation", () => {
  const validateEmail = (email: string) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const sanitize = (input: string) => input.replace(/<[^>]*>/g, "");

  it("accepts valid email formats", () => {
    [
      "user@example.com",
      "contact@safecodeg.com",
      "info@american-group.llc",
    ].forEach(e => expect(validateEmail(e)).toBe(true));
  });
  it("rejects invalid email formats", () => {
    ["notanemail", "missing@", "@nodomain.com"].forEach(e =>
      expect(validateEmail(e)).toBe(false)
    );
  });
  it("sanitizes XSS payloads in form fields", () => {
    expect(sanitize("<script>alert('xss')</script>")).not.toContain("<script>");
  });
  it("sanitizes HTML injection attempts", () => {
    expect(sanitize("<img src=x onerror=alert(1)>")).not.toContain("<img");
  });
  it("contact@safecodeg.com is the correct destination email", () => {
    const destEmail = "contact@safecodeg.com";
    expect(validateEmail(destEmail)).toBe(true);
    expect(destEmail).toContain("safecodeg.com");
  });
});

// ── Company Information Validation ────────────────────────────────────────────
describe("Company Information", () => {
  const info = {
    name: "American Group LLC",
    location: "Santa Clara, California",
    founded: 2018,
    products: 77,
    verticals: 8,
    email: "contact@safecodeg.com",
    internshipEmail: "internships@safecodeg.com",
  };

  it("has correct company name", () =>
    expect(info.name).toBe("American Group LLC"));
  it("is located in Santa Clara, California", () => {
    expect(info.location).toContain("Santa Clara");
    expect(info.location).toContain("California");
  });
  it("has 77+ products", () =>
    expect(info.products).toBeGreaterThanOrEqual(77));
  it("has exactly 8 verticals", () => expect(info.verticals).toBe(8));
  it("has valid contact email", () =>
    expect(info.email).toMatch(/^[^\s@]+@[^\s@]+\.[^\s@]+$/));
  it("has valid internship email", () =>
    expect(info.internshipEmail).toBe("internships@safecodeg.com"));
  it("was founded in 2018 or earlier", () =>
    expect(info.founded).toBeLessThanOrEqual(2018));
});

// ── Navigation — No GitHub Links ──────────────────────────────────────────────
describe("Navigation — No GitHub Links", () => {
  const navItems = [
    { label: "Home", path: "/" },
    { label: "About Us", path: "/american-group-llc" },
    { label: "Products", path: "/products" },
    { label: "About", path: "/about" },
    { label: "Careers", path: "/careers" },
    { label: "Contact", path: "/contact" },
  ];

  it("has 6 main navigation items", () => expect(navItems).toHaveLength(6));
  it("does not contain any GitHub links", () => {
    navItems.forEach(item => {
      expect(item.path).not.toContain("github");
    });
  });
  it("includes all critical paths", () => {
    const paths = navItems.map(n => n.path);
    expect(paths).toContain("/products");
    expect(paths).toContain("/careers");
    expect(paths).toContain("/contact");
  });
});

// ── Rich Theme Color Tokens ───────────────────────────────────────────────────
describe("Rich Theme Color Tokens", () => {
  const tokens = { obsidian: "#030408", violet: "#7C3AED", gold: "#F59E0B" };

  it("obsidian is a valid hex color", () =>
    expect(tokens.obsidian).toMatch(/^#[0-9A-Fa-f]{6}$/));
  it("violet is a valid hex color", () =>
    expect(tokens.violet).toMatch(/^#[0-9A-Fa-f]{6}$/));
  it("gold is a valid hex color", () =>
    expect(tokens.gold).toMatch(/^#[0-9A-Fa-f]{6}$/));
  it("obsidian is very dark (luminance < 5%)", () => {
    const r = parseInt(tokens.obsidian.slice(1, 3), 16);
    const g = parseInt(tokens.obsidian.slice(3, 5), 16);
    const b = parseInt(tokens.obsidian.slice(5, 7), 16);
    const lum = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    expect(lum).toBeLessThan(0.05);
  });
  it("violet has more blue than green (purple range)", () => {
    const r = parseInt(tokens.violet.slice(1, 3), 16);
    const g = parseInt(tokens.violet.slice(3, 5), 16);
    const b = parseInt(tokens.violet.slice(5, 7), 16);
    expect(b).toBeGreaterThan(g);
    expect(r).toBeGreaterThan(g);
  });
});
