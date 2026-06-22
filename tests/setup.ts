import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mock framer-motion to avoid animation issues in tests
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => {
      const React = require('react');
      return React.createElement('div', props, children);
    },
    h1: ({ children, ...props }: any) => {
      const React = require('react');
      return React.createElement('h1', props, children);
    },
    h2: ({ children, ...props }: any) => {
      const React = require('react');
      return React.createElement('h2', props, children);
    },
    p: ({ children, ...props }: any) => {
      const React = require('react');
      return React.createElement('p', props, children);
    },
    section: ({ children, ...props }: any) => {
      const React = require('react');
      return React.createElement('section', props, children);
    },
    span: ({ children, ...props }: any) => {
      const React = require('react');
      return React.createElement('span', props, children);
    },
    a: ({ children, ...props }: any) => {
      const React = require('react');
      return React.createElement('a', props, children);
    },
  },
  AnimatePresence: ({ children }: any) => children,
  useAnimation: () => ({ start: vi.fn(), stop: vi.fn() }),
  useInView: () => true,
  useScroll: () => ({ scrollY: { get: () => 0 } }),
  useTransform: (_: any, __: any, output: any) => output[0],
}));

// Mock wouter
vi.mock('wouter', () => ({
  Link: ({ children, href }: any) => {
    const React = require('react');
    return React.createElement('a', { href }, children);
  },
  useLocation: () => ['/', vi.fn()],
  useRoute: () => [false, {}],
  Route: ({ children }: any) => children,
  Switch: ({ children }: any) => children,
}));

// Mock IntersectionObserver
global.IntersectionObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
})) as any;

// Mock ResizeObserver
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
})) as any;

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock scrollTo
window.scrollTo = vi.fn() as any;
