/**
 * FUNCTIONAL TESTS — User Interactions & Business Logic
 * Category: Functional Testing
 * Tests: User flows, form behavior, filter logic, search
 */
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React, { useState } from 'react';

// ── Mock product filter component ─────────────────────────────────────────────
const MOCK_PRODUCTS = [
  { slug: 'cognicore', name: 'CogniCore AI', category: 'Enterprise AI & DevTools', platform: 'Web/API', status: 'Live' },
  { slug: 'myhealth', name: 'MyHealth', category: 'Health & Wellness', platform: 'Android', status: 'Live' },
  { slug: 'aeroswift', name: 'AeroSwift', category: 'Travel & Aviation', platform: 'iOS/Android', status: 'Live' },
  { slug: 'securecore', name: 'SecureCore', category: 'CyberSecurity & Infra', platform: 'Web/API', status: 'Live' },
  { slug: 'budgetpro', name: 'BudgetPro', category: 'FinTech & E-Commerce', platform: 'iOS/Android', status: 'Beta' },
];

const ProductFilter = () => {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');

  const categories = ['All', ...new Set(MOCK_PRODUCTS.map(p => p.category))];
  const filtered = MOCK_PRODUCTS.filter(p => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase());
    const matchCat = category === 'All' || p.category === category;
    return matchSearch && matchCat;
  });

  return (
    <div>
      <input
        data-testid="search-input"
        placeholder="Search products..."
        value={search}
        onChange={e => setSearch(e.target.value)}
        aria-label="Search products"
      />
      <select
        data-testid="category-filter"
        value={category}
        onChange={e => setCategory(e.target.value)}
        aria-label="Filter by category"
      >
        {categories.map(c => <option key={c} value={c}>{c}</option>)}
      </select>
      <div data-testid="product-count">{filtered.length} products</div>
      {filtered.map(p => (
        <div key={p.slug} data-testid={`product-${p.slug}`}>
          <span data-testid={`name-${p.slug}`}>{p.name}</span>
          <span data-testid={`status-${p.slug}`}>{p.status}</span>
        </div>
      ))}
    </div>
  );
};

// ── Mock contact form ─────────────────────────────────────────────────────────
const ContactForm = ({ onSubmit = vi.fn() }: { onSubmit?: (data: any) => void }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);

  const validate = () => {
    const e: Record<string, string> = {};
    if (!name.trim()) e.name = 'Name is required';
    if (!email.trim()) e.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) e.email = 'Invalid email format';
    if (!message.trim()) e.message = 'Message is required';
    else if (message.trim().length < 10) e.message = 'Message must be at least 10 characters';
    return e;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    onSubmit({ name, email, message });
    setSubmitted(true);
  };

  if (submitted) return <div data-testid="success-message">Thank you! We'll be in touch soon.</div>;

  return (
    <form onSubmit={handleSubmit} data-testid="contact-form">
      <input data-testid="name-input" value={name} onChange={e => setName(e.target.value)} placeholder="Your name" aria-label="Your name" />
      {errors.name && <span data-testid="name-error">{errors.name}</span>}
      <input data-testid="email-input" value={email} onChange={e => setEmail(e.target.value)} placeholder="Your email" aria-label="Your email" />
      {errors.email && <span data-testid="email-error">{errors.email}</span>}
      <textarea data-testid="message-input" value={message} onChange={e => setMessage(e.target.value)} placeholder="Your message" aria-label="Your message" />
      {errors.message && <span data-testid="message-error">{errors.message}</span>}
      <button type="submit" data-testid="submit-button">Send Message</button>
    </form>
  );
};

// ── Product filter tests ──────────────────────────────────────────────────────
describe('Product search and filter', () => {
  it('shows all products by default', () => {
    render(<ProductFilter />);
    expect(screen.getByTestId('product-count').textContent).toBe('5 products');
  });

  it('filters products by search term', async () => {
    const user = userEvent.setup();
    render(<ProductFilter />);
    await user.type(screen.getByTestId('search-input'), 'health');
    expect(screen.getByTestId('product-count').textContent).toBe('1 products');
    expect(screen.getByTestId('product-myhealth')).toBeTruthy();
  });

  it('filters are case-insensitive', async () => {
    const user = userEvent.setup();
    render(<ProductFilter />);
    await user.type(screen.getByTestId('search-input'), 'COGNI');
    expect(screen.getByTestId('product-cognicore')).toBeTruthy();
  });

  it('filters by category', async () => {
    const user = userEvent.setup();
    render(<ProductFilter />);
    await user.selectOptions(screen.getByTestId('category-filter'), 'Health & Wellness');
    expect(screen.getByTestId('product-count').textContent).toBe('1 products');
  });

  it('shows 0 results for non-existent search', async () => {
    const user = userEvent.setup();
    render(<ProductFilter />);
    await user.type(screen.getByTestId('search-input'), 'xyznonexistent');
    expect(screen.getByTestId('product-count').textContent).toBe('0 products');
  });

  it('resets to all products when search cleared', async () => {
    const user = userEvent.setup();
    render(<ProductFilter />);
    await user.type(screen.getByTestId('search-input'), 'health');
    await user.clear(screen.getByTestId('search-input'));
    expect(screen.getByTestId('product-count').textContent).toBe('5 products');
  });

  it('combines search and category filter', async () => {
    const user = userEvent.setup();
    render(<ProductFilter />);
    await user.selectOptions(screen.getByTestId('category-filter'), 'Enterprise AI & DevTools');
    await user.type(screen.getByTestId('search-input'), 'cogni');
    expect(screen.getByTestId('product-count').textContent).toBe('1 products');
  });
});

// ── Contact form tests ────────────────────────────────────────────────────────
describe('Contact form validation', () => {
  it('shows error when name is empty', async () => {
    const user = userEvent.setup();
    render(<ContactForm />);
    await user.click(screen.getByTestId('submit-button'));
    expect(screen.getByTestId('name-error').textContent).toBe('Name is required');
  });

  it('shows error when email is empty', async () => {
    const user = userEvent.setup();
    render(<ContactForm />);
    await user.click(screen.getByTestId('submit-button'));
    expect(screen.getByTestId('email-error').textContent).toBe('Email is required');
  });

  it('shows error for invalid email format', async () => {
    const user = userEvent.setup();
    render(<ContactForm />);
    await user.type(screen.getByTestId('name-input'), 'John Doe');
    await user.type(screen.getByTestId('email-input'), 'notanemail');
    await user.type(screen.getByTestId('message-input'), 'Hello this is a test message');
    await user.click(screen.getByTestId('submit-button'));
    expect(screen.getByTestId('email-error').textContent).toBe('Invalid email format');
  });

  it('shows error when message is too short', async () => {
    const user = userEvent.setup();
    render(<ContactForm />);
    await user.type(screen.getByTestId('name-input'), 'John');
    await user.type(screen.getByTestId('email-input'), 'john@example.com');
    await user.type(screen.getByTestId('message-input'), 'Hi');
    await user.click(screen.getByTestId('submit-button'));
    expect(screen.getByTestId('message-error').textContent).toContain('at least 10 characters');
  });

  it('submits successfully with valid data', async () => {
    const mockSubmit = vi.fn();
    const user = userEvent.setup();
    render(<ContactForm onSubmit={mockSubmit} />);
    await user.type(screen.getByTestId('name-input'), 'John Doe');
    await user.type(screen.getByTestId('email-input'), 'john@example.com');
    await user.type(screen.getByTestId('message-input'), 'This is a valid test message');
    await user.click(screen.getByTestId('submit-button'));
    expect(mockSubmit).toHaveBeenCalledWith({
      name: 'John Doe',
      email: 'john@example.com',
      message: 'This is a valid test message',
    });
  });

  it('shows success message after valid submission', async () => {
    const user = userEvent.setup();
    render(<ContactForm />);
    await user.type(screen.getByTestId('name-input'), 'Jane Smith');
    await user.type(screen.getByTestId('email-input'), 'jane@example.com');
    await user.type(screen.getByTestId('message-input'), 'This is a valid test message');
    await user.click(screen.getByTestId('submit-button'));
    expect(screen.getByTestId('success-message')).toBeTruthy();
  });

  it('does not submit with empty fields', async () => {
    const mockSubmit = vi.fn();
    const user = userEvent.setup();
    render(<ContactForm onSubmit={mockSubmit} />);
    await user.click(screen.getByTestId('submit-button'));
    expect(mockSubmit).not.toHaveBeenCalled();
  });
});

// ── Business logic tests ──────────────────────────────────────────────────────
describe('Business logic', () => {
  it('product status badge renders correctly', () => {
    render(<ProductFilter />);
    expect(screen.getByTestId('status-cognicore').textContent).toBe('Live');
    expect(screen.getByTestId('status-budgetpro').textContent).toBe('Beta');
  });

  it('email validation accepts valid formats', () => {
    const isValid = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    expect(isValid('user@example.com')).toBe(true);
    expect(isValid('user.name+tag@domain.co.uk')).toBe(true);
    expect(isValid('user@sub.domain.com')).toBe(true);
  });

  it('email validation rejects invalid formats', () => {
    const isValid = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    expect(isValid('notanemail')).toBe(false);
    expect(isValid('@domain.com')).toBe(false);
    expect(isValid('user@')).toBe(false);
    expect(isValid('')).toBe(false);
  });
});
