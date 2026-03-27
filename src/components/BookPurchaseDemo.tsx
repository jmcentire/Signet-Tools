import { useState, useRef, useCallback } from "react";
import { motion, useInView, AnimatePresence } from "framer-motion";

// The actual manifest from cageandmirror.com — embedded at build time.
// In production, an agent fetches this from /.well-known/capabilities.yaml
const MANIFEST = {
  domain: {
    name: "Cage and Mirror Publishing",
    url: "https://cageandmirror.com",
    description:
      "Publishing house for books on organizational theory, software craft, leadership, and privacy. Catalog of 7 titles. Limited edition pre-orders with Stripe checkout.",
  },
  read: [
    {
      id: "books",
      path: "/books/",
      description: "Complete book catalog with descriptions and cover images",
      auth: "public",
      cache: { signal: "stable", ttl: 86400 },
    },
    {
      id: "book",
      path: "/{slug}/",
      description: "Individual book page with synopsis and purchase options",
      auth: "public",
    },
  ],
  write: [
    {
      id: "checkout",
      path: "/api/create-checkout-session",
      method: "POST",
      description: "Initiate Stripe checkout for limited edition book pre-order",
      auth: "public",
      payment: { provider: "stripe", flow: "redirect", currency: "usd" },
      side_effects: [
        "Creates Stripe checkout session",
        "Redirects to Stripe payment page",
        "On completion: creates order, charges payment, sends confirmation",
      ],
    },
    {
      id: "contact",
      path: "/api/contact",
      method: "POST",
      description: "Submit a general inquiry",
      auth: "public",
      side_effects: ["Stores inquiry", "Sends email to contact@cageandmirror.com"],
    },
  ],
};

type Step = {
  label: string;
  description: string;
  action: string;
  output: string[];
  highlight?: "read" | "write" | "payment";
};

const STEPS: Step[] = [
  {
    label: "Discover",
    description: "Agent fetches the capabilities manifest",
    action: "GET https://cageandmirror.com/.well-known/capabilities.yaml",
    output: [
      `domain: "${MANIFEST.domain.name}"`,
      `description: "${MANIFEST.domain.description.slice(0, 80)}..."`,
      `read: ${MANIFEST.read.length} endpoints`,
      `write: ${MANIFEST.write.length} endpoints`,
    ],
    highlight: "read",
  },
  {
    label: "Explore",
    description: "Agent reads the book catalog",
    action: "GET https://cageandmirror.com/books/",
    output: [
      "Found 7 books:",
      "  The Cage and the Mirror",
      "  Beyond Code (#1 International Best Seller)",
      "  Organizational Physics",
      "  Privacy: The Architecture of Forgetting",
      "  Uncommon Leadership",
      "  City of Mercy (forthcoming)",
      "  Introduction to Applied Synthesis (forthcoming)",
    ],
    highlight: "read",
  },
  {
    label: "Identify",
    description: 'Agent finds the book page for "The Cage and the Mirror"',
    action: "GET https://cageandmirror.com/cage-and-mirror/",
    output: [
      "Title: The Cage and the Mirror",
      "Edition: Artifact Edition (limited to 1,000 copies)",
      "Details: Signed, numbered, cloth cover, silver gilding, slipcase",
      "Price: $50.00",
      "Shipping: US, Canada, Europe, International",
      "",
      'Write endpoint available: "checkout"',
      "  method: POST /api/create-checkout-session",
      "  payment: stripe (redirect)",
    ],
    highlight: "read",
  },
  {
    label: "Confirm",
    description: "Agent presents side effects and asks user for approval",
    action: "SIDE EFFECTS (requires user confirmation):",
    output: [
      "The following will happen:",
      "",
      "  1. Creates Stripe checkout session",
      "  2. Redirects to Stripe payment page",
      "  3. On completion: creates order, charges $50.00,",
      "     sends confirmation email",
      "",
      "Proceed? [user approves]",
    ],
    highlight: "payment",
  },
  {
    label: "Execute",
    description: "Agent calls the checkout endpoint",
    action: 'POST /api/create-checkout-session {"region": "us"}',
    output: [
      "Response: { url: https://checkout.stripe.com/c/pay/... }",
      "",
      "Redirecting to Stripe checkout...",
    ],
    highlight: "write",
  },
];

export default function BookPurchaseDemo() {
  const [currentStep, setCurrentStep] = useState(-1);
  const [isRunning, setIsRunning] = useState(false);
  const [completed, setCompleted] = useState(false);
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });

  const runDemo = useCallback(() => {
    if (isRunning) return;
    setIsRunning(true);
    setCompleted(false);
    setCurrentStep(0);

    let step = 0;
    const interval = setInterval(() => {
      step++;
      if (step >= STEPS.length) {
        clearInterval(interval);
        setIsRunning(false);
        setCompleted(true);
      } else {
        setCurrentStep(step);
      }
    }, 2500);
  }, [isRunning]);

  const reset = useCallback(() => {
    setCurrentStep(-1);
    setCompleted(false);
    setIsRunning(false);
  }, []);

  const executePurchase = useCallback(async () => {
    try {
      const resp = await fetch(
        "https://cageandmirror.com/api/create-checkout-session",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ region: "us" }),
        }
      );
      const data = await resp.json();
      if (data.url) {
        window.location.href = data.url;
      }
    } catch {
      // Fallback: direct link to the book page
      window.location.href = "https://cageandmirror.com/cage-and-mirror/reserve";
    }
  }, []);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 24 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="rounded-xl border border-border bg-card overflow-hidden"
    >
      {/* Header */}
      <div className="border-b border-border px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-gold" />
          <span className="font-mono text-xs uppercase tracking-widest text-gold">
            Agent Demo
          </span>
          <span className="font-mono text-[10px] text-muted ml-2">
            Buying a book through a capabilities manifest
          </span>
        </div>
        <div className="flex gap-2">
          {!isRunning && !completed && (
            <button
              onClick={runDemo}
              className="px-4 py-1.5 bg-gold text-background font-semibold text-xs rounded-lg hover:bg-gold-bright transition-colors cursor-pointer"
            >
              Run Demo
            </button>
          )}
          {completed && (
            <button
              onClick={reset}
              className="px-4 py-1.5 border border-border text-secondary text-xs rounded-lg hover:border-border-bright hover:text-foreground transition-colors cursor-pointer"
            >
              Reset
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr]">
        {/* Step list */}
        <div className="border-b lg:border-b-0 lg:border-r border-border p-4 space-y-1">
          {STEPS.map((step, i) => {
            const isActive = i === currentStep;
            const isDone = i < currentStep;
            const isPending = i > currentStep;

            return (
              <div
                key={i}
                className={`flex items-start gap-3 px-3 py-2.5 rounded-lg transition-all duration-300 ${
                  isActive
                    ? "bg-gold/[0.08] border border-gold/20"
                    : isDone
                      ? "opacity-60"
                      : isPending
                        ? "opacity-30"
                        : ""
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 text-[10px] font-bold transition-colors ${
                    isActive
                      ? "bg-gold text-background"
                      : isDone
                        ? "bg-allow/20 text-allow"
                        : "bg-code-bg text-muted border border-border"
                  }`}
                >
                  {isDone ? "\u2713" : i + 1}
                </div>
                <div>
                  <div
                    className={`font-mono text-xs font-semibold ${
                      isActive ? "text-gold" : "text-foreground"
                    }`}
                  >
                    {step.label}
                  </div>
                  <div className="text-[11px] text-muted leading-snug">
                    {step.description}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Terminal output */}
        <div className="p-5 min-h-[340px] bg-code-bg/50">
          <AnimatePresence mode="wait">
            {currentStep === -1 ? (
              <motion.div
                key="idle"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="h-full flex flex-col items-center justify-center text-center py-12"
              >
                <p className="text-muted text-sm mb-2">
                  This demo shows an AI agent discovering and purchasing a book
                </p>
                <p className="text-muted text-sm mb-1">
                  using only the{" "}
                  <code className="font-code text-xs text-gold bg-gold/[0.08] px-1.5 py-0.5 rounded">
                    capabilities.yaml
                  </code>{" "}
                  manifest
                </p>
                <p className="text-muted/60 text-xs mt-4">
                  No custom integration. No API documentation. No prior knowledge.
                </p>
              </motion.div>
            ) : (
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.3 }}
              >
                {/* Action line */}
                <div className="mb-4">
                  <span className="font-mono text-[10px] text-muted block mb-1">
                    {STEPS[currentStep].highlight === "write"
                      ? "WRITE"
                      : STEPS[currentStep].highlight === "payment"
                        ? "CONFIRM"
                        : "READ"}
                  </span>
                  <code
                    className={`font-code text-xs break-all ${
                      STEPS[currentStep].highlight === "write"
                        ? "text-tier3"
                        : STEPS[currentStep].highlight === "payment"
                          ? "text-tier2"
                          : "text-tier1"
                    }`}
                  >
                    {STEPS[currentStep].action}
                  </code>
                </div>

                {/* Output lines */}
                <div className="bg-code-bg rounded-lg border border-border p-4 space-y-0.5">
                  {STEPS[currentStep].output.map((line, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -4 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.08, duration: 0.2 }}
                    >
                      <code className="font-code text-xs text-secondary block whitespace-pre">
                        {line || "\u00A0"}
                      </code>
                    </motion.div>
                  ))}
                </div>

                {/* Manifest source callout */}
                {currentStep === 0 && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="mt-3 text-[11px] text-muted"
                  >
                    Source:{" "}
                    <a
                      href="https://cageandmirror.com/.well-known/capabilities.yaml"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gold hover:underline"
                    >
                      cageandmirror.com/.well-known/capabilities.yaml
                    </a>
                  </motion.div>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Purchase button appears after demo completes */}
          {completed && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="mt-6 pt-4 border-t border-border"
            >
              <p className="text-secondary text-sm mb-3">
                That's it. Five steps. One manifest. No custom integration.
              </p>
              <button
                onClick={executePurchase}
                className="px-6 py-2.5 bg-gold text-background font-semibold text-sm rounded-lg hover:bg-gold-bright hover:shadow-[0_0_30px_rgba(201,162,39,0.3)] transition-all cursor-pointer"
              >
                Buy the Book (Live Checkout)
              </button>
              <p className="text-muted text-[11px] mt-2">
                This calls the real checkout endpoint. Stripe handles payment.
              </p>
            </motion.div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-border px-6 py-3 bg-code-bg flex items-center justify-between">
        <p className="font-mono text-[11px] text-muted">
          Spec:{" "}
          <a
            href="https://perardua.dev/specs/capabilities"
            target="_blank"
            rel="noopener noreferrer"
            className="text-gold hover:underline"
          >
            perardua.dev/specs/capabilities
          </a>
        </p>
        <p className="font-mono text-[11px] text-muted">
          {currentStep >= 0 && !completed && (
            <span>
              Step {currentStep + 1} of {STEPS.length}
            </span>
          )}
          {completed && <span className="text-allow">Complete</span>}
        </p>
      </div>
    </motion.div>
  );
}
