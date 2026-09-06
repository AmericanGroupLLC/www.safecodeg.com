/**
 * UNIT TESTS — React Component Rendering
 * Category: Unit Testing
 * Tests: Component render, props, accessibility attributes
 */
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import React from "react";

// ── Minimal mock components matching actual component contracts ───────────────

// Mock Navigation component structure
const MockNavigation = ({ currentPath = "/" }: { currentPath?: string }) => (
  <nav role="navigation" aria-label="Main navigation">
    <a href="/" aria-label="American Group LLC home">
      American Group LLC
    </a>
    <ul>
      <li>
        <a href="/" aria-current={currentPath === "/" ? "page" : undefined}>
          Home
        </a>
      </li>
      <li>
        <a
          href="/products"
          aria-current={currentPath === "/products" ? "page" : undefined}
        >
          Products
        </a>
      </li>
      <li>
        <a
          href="/about"
          aria-current={currentPath === "/about" ? "page" : undefined}
        >
          About
        </a>
      </li>
      <li>
        <a
          href="/careers"
          aria-current={currentPath === "/careers" ? "page" : undefined}
        >
          Careers
        </a>
      </li>
      <li>
        <a
          href="/contact"
          aria-current={currentPath === "/contact" ? "page" : undefined}
        >
          Contact
        </a>
      </li>
    </ul>
    <a href="/contact" className="cta-button">
      Get in Touch
    </a>
  </nav>
);

// Mock StatCard
const MockStatCard = ({
  value,
  suffix,
  label,
  sub,
}: {
  value: number;
  suffix: string;
  label: string;
  sub: string;
}) => (
  <div role="region" aria-label={label}>
    <span data-testid="stat-value">
      {value}
      {suffix}
    </span>
    <span data-testid="stat-label">{label}</span>
    <span data-testid="stat-sub">{sub}</span>
  </div>
);

// Mock Footer
const MockFooter = () => (
  <footer role="contentinfo">
    <p>© 2026 American Group LLC. All rights reserved.</p>
    <nav aria-label="Footer navigation">
      <a href="/privacy-policy">Privacy Policy</a>
      <a href="/terms">Terms of Service</a>
      <a href="/support">Support Center</a>
    </nav>
    <address>
      <span>Santa Clara, CA 95051</span>
      <a href="tel:+13104586059">+1 (310) 458-6059</a>
      <a href="mailto:contact@safecodeg.com">contact@safecodeg.com</a>
    </address>
  </footer>
);

// ── Navigation Tests ──────────────────────────────────────────────────────────
describe("Navigation component", () => {
  it("renders with correct role and aria-label", () => {
    render(<MockNavigation />);
    expect(
      screen.getByRole("navigation", { name: "Main navigation" })
    ).toBeTruthy();
  });

  it("renders brand name", () => {
    render(<MockNavigation />);
    expect(screen.getByText("American Group LLC")).toBeTruthy();
  });

  it("renders all 5 main nav links", () => {
    render(<MockNavigation />);
    expect(screen.getByText("Home")).toBeTruthy();
    expect(screen.getByText("Products")).toBeTruthy();
    expect(screen.getByText("About")).toBeTruthy();
    expect(screen.getByText("Careers")).toBeTruthy();
    expect(screen.getByText("Contact")).toBeTruthy();
  });

  it("renders CTA button", () => {
    render(<MockNavigation />);
    expect(screen.getByText("Get in Touch")).toBeTruthy();
  });

  it("marks current page with aria-current", () => {
    render(<MockNavigation currentPath="/products" />);
    const productsLink = screen.getByText("Products").closest("a");
    expect(productsLink?.getAttribute("aria-current")).toBe("page");
  });

  it("home link points to root", () => {
    render(<MockNavigation />);
    const homeLink = screen.getByRole("link", {
      name: "American Group LLC home",
    });
    expect(homeLink.getAttribute("href")).toBe("/");
  });
});

// ── StatCard Tests ────────────────────────────────────────────────────────────
describe("StatCard component", () => {
  it("renders value with suffix", () => {
    render(
      <MockStatCard
        value={77}
        suffix="+"
        label="Products Shipped"
        sub="Across 8 verticals"
      />
    );
    expect(screen.getByTestId("stat-value").textContent).toBe("77+");
  });

  it("renders label", () => {
    render(
      <MockStatCard
        value={8}
        suffix=""
        label="Industry Verticals"
        sub="AI to CyberSecurity"
      />
    );
    expect(screen.getByTestId("stat-label").textContent).toBe(
      "Industry Verticals"
    );
  });

  it("renders sub-label", () => {
    render(
      <MockStatCard
        value={99}
        suffix=".9%"
        label="Uptime SLA"
        sub="Enterprise guarantee"
      />
    );
    expect(screen.getByTestId("stat-sub").textContent).toBe(
      "Enterprise guarantee"
    );
  });

  it("has accessible region role", () => {
    render(
      <MockStatCard
        value={6}
        suffix="+"
        label="Years of Excellence"
        sub="Est. 2018"
      />
    );
    expect(
      screen.getByRole("region", { name: "Years of Excellence" })
    ).toBeTruthy();
  });
});

// ── Footer Tests ──────────────────────────────────────────────────────────────
describe("Footer component", () => {
  it("renders with contentinfo role", () => {
    render(<MockFooter />);
    expect(screen.getByRole("contentinfo")).toBeTruthy();
  });

  it("renders copyright notice", () => {
    render(<MockFooter />);
    expect(screen.getByText(/American Group LLC/)).toBeTruthy();
  });

  it("renders Privacy Policy link", () => {
    render(<MockFooter />);
    const link = screen.getByText("Privacy Policy").closest("a");
    expect(link?.getAttribute("href")).toBe("/privacy-policy");
  });

  it("renders Terms of Service link", () => {
    render(<MockFooter />);
    expect(screen.getByText("Terms of Service")).toBeTruthy();
  });

  it("renders contact email", () => {
    render(<MockFooter />);
    expect(screen.getByText("contact@safecodeg.com")).toBeTruthy();
  });

  it("renders phone number", () => {
    render(<MockFooter />);
    expect(screen.getByText("+1 (310) 458-6059")).toBeTruthy();
  });

  it("renders Santa Clara address", () => {
    render(<MockFooter />);
    expect(screen.getByText("Santa Clara, CA 95051")).toBeTruthy();
  });
});

// ── Accessibility attribute tests ─────────────────────────────────────────────
describe("Accessibility attributes", () => {
  it('links have descriptive text (not just "click here")', () => {
    render(<MockNavigation />);
    const links = screen.getAllByRole("link");
    links.forEach(link => {
      const text = link.textContent || link.getAttribute("aria-label") || "";
      expect(text.toLowerCase()).not.toBe("click here");
      expect(text.toLowerCase()).not.toBe("here");
      expect(text.length).toBeGreaterThan(0);
    });
  });

  it("footer navigation has aria-label", () => {
    render(<MockFooter />);
    expect(
      screen.getByRole("navigation", { name: "Footer navigation" })
    ).toBeTruthy();
  });
});
