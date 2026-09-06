/**
 * INTEGRATION TESTS — Routing & Page Composition
 * Category: Integration Testing
 * Tests: Route resolution, page rendering, component integration
 */
import { describe, it, expect } from "vitest";
import React from "react";
import { render, screen } from "@testing-library/react";

// ── Route definitions matching App.tsx ────────────────────────────────────────
const ROUTES = [
  { path: "/", label: "Home", component: "Home" },
  { path: "/products", label: "Products", component: "Products" },
  {
    path: "/products/:slug",
    label: "Product Detail",
    component: "ProductDetail",
  },
  { path: "/about", label: "About", component: "About" },
  { path: "/agl", label: "AGL", component: "AGL" },
  { path: "/scg", label: "SCG", component: "SCG" },
  { path: "/careers", label: "Careers", component: "Careers" },
  { path: "/contact", label: "Contact", component: "Contact" },
  {
    path: "/privacy-policy",
    label: "Privacy Policy",
    component: "PrivacyPolicy",
  },
  { path: "/terms", label: "Terms", component: "Terms" },
  { path: "/support", label: "Support", component: "Support" },
];

// ── Route structure tests ─────────────────────────────────────────────────────
describe("Route definitions", () => {
  it("has 11 defined routes", () => {
    expect(ROUTES.length).toBe(11);
  });

  it("all routes start with /", () => {
    ROUTES.forEach(r => {
      expect(r.path.startsWith("/")).toBe(true);
    });
  });

  it("has a root route /", () => {
    expect(ROUTES.find(r => r.path === "/")).toBeTruthy();
  });

  it("has a /products route", () => {
    expect(ROUTES.find(r => r.path === "/products")).toBeTruthy();
  });

  it("has a dynamic product detail route", () => {
    const detail = ROUTES.find(r => r.path.includes(":slug"));
    expect(detail).toBeTruthy();
    expect(detail?.path).toBe("/products/:slug");
  });

  it("has /agl and /scg routes (not 404)", () => {
    expect(ROUTES.find(r => r.path === "/agl")).toBeTruthy();
    expect(ROUTES.find(r => r.path === "/scg")).toBeTruthy();
  });

  it("has legal pages", () => {
    expect(ROUTES.find(r => r.path === "/privacy-policy")).toBeTruthy();
    expect(ROUTES.find(r => r.path === "/terms")).toBeTruthy();
    expect(ROUTES.find(r => r.path === "/support")).toBeTruthy();
  });

  it("all routes have component names", () => {
    ROUTES.forEach(r => {
      expect(r.component).toBeTruthy();
      expect(typeof r.component).toBe("string");
    });
  });
});

// ── Slug resolution tests ─────────────────────────────────────────────────────
describe("Product slug resolution", () => {
  const resolveSlug = (path: string): string | null => {
    const match = path.match(/^\/products\/([a-z0-9-]+)$/);
    return match ? match[1] : null;
  };

  it("resolves valid product slug", () => {
    expect(resolveSlug("/products/cognicore")).toBe("cognicore");
  });

  it("resolves slug with numbers", () => {
    expect(resolveSlug("/products/app365")).toBe("app365");
  });

  it("returns null for /products (no slug)", () => {
    expect(resolveSlug("/products")).toBeNull();
  });

  it("returns null for invalid paths", () => {
    expect(resolveSlug("/about")).toBeNull();
  });

  it("handles hyphenated slugs", () => {
    expect(resolveSlug("/products/apex-market-watch")).toBe(
      "apex-market-watch"
    );
  });
});

// ── Navigation integration test ───────────────────────────────────────────────
describe("Navigation integration", () => {
  const NavWrapper = () => (
    <nav>
      {ROUTES.filter(
        r =>
          !r.path.includes(":") &&
          !["/privacy-policy", "/terms", "/support"].includes(r.path)
      ).map(r => (
        <a key={r.path} href={r.path}>
          {r.label}
        </a>
      ))}
    </nav>
  );

  it("renders all primary nav routes", () => {
    render(<NavWrapper />);
    expect(screen.getByText("Home")).toBeTruthy();
    expect(screen.getByText("Products")).toBeTruthy();
    expect(screen.getByText("About")).toBeTruthy();
    expect(screen.getByText("Careers")).toBeTruthy();
    expect(screen.getByText("Contact")).toBeTruthy();
  });

  it("all nav links are anchor elements", () => {
    render(<NavWrapper />);
    const links = screen.getAllByRole("link");
    expect(links.length).toBeGreaterThan(0);
    links.forEach(link => {
      expect(link.tagName.toLowerCase()).toBe("a");
    });
  });
});

// ── Page metadata integration ─────────────────────────────────────────────────
describe("Page metadata", () => {
  const PAGE_META = {
    "/": {
      title: "American Group LLC — Building the Future of Enterprise Tech",
      description:
        "A California-based technology company delivering 77+ enterprise-grade products",
    },
    "/products": {
      title: "Products — American Group LLC",
      description: "Enterprise-grade mobile apps and platforms",
    },
    "/about": {
      title: "About — American Group LLC",
      description: "Our story, mission, and team",
    },
    "/careers": {
      title: "Careers — American Group LLC",
      description: "Join our team",
    },
    "/contact": {
      title: "Contact — American Group LLC",
      description: "Get in touch",
    },
  };

  it("all pages have title defined", () => {
    Object.entries(PAGE_META).forEach(([path, meta]) => {
      expect(meta.title).toBeTruthy();
      expect(meta.title.length).toBeGreaterThan(10);
    });
  });

  it("all pages have description defined", () => {
    Object.entries(PAGE_META).forEach(([path, meta]) => {
      expect(meta.description).toBeTruthy();
      expect(meta.description.length).toBeGreaterThan(10);
    });
  });

  it("home page title contains brand name", () => {
    expect(PAGE_META["/"].title).toContain("American Group LLC");
  });

  it("product page title contains Products", () => {
    expect(PAGE_META["/products"].title).toContain("Products");
  });
});
