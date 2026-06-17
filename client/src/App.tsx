import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import AGLPage from "./pages/AGL";
import SCGPage from "./pages/SCG";
import ProductsPage from "./pages/Products";
import AboutPage from "./pages/About";
import ContactPage from "./pages/Contact";
import CareersPage from "./pages/Careers";
import PrivacyPolicyPage from "./pages/PrivacyPolicy";
import AIChatWidget from "./components/AIChatWidget";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/american-group-llc" component={AGLPage} />
      <Route path="/safecodex-research" component={SCGPage} />
      <Route path="/products" component={ProductsPage} />
      <Route path="/about" component={AboutPage} />
      <Route path="/careers" component={CareersPage} />
      <Route path="/contact" component={ContactPage} />
      <Route path="/privacy-policy" component={PrivacyPolicyPage} />
      <Route path="/404" component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <Toaster />
          <Router />
          <AIChatWidget />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
