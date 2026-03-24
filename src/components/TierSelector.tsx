import { useState, useRef } from "react";
import { motion, useInView, AnimatePresence } from "framer-motion";

const tiers = [
  {
    id: 1,
    label: "Tier 1",
    title: "Freely Provable",
    color: "tier1",
    borderClass: "border-tier1/40",
    bgClass: "bg-tier1-dim",
    textClass: "text-tier1",
    summary: '"Are you over 21?" Your agent answers instantly with a cryptographic proof. No data leaves the vault. The answer is yes or no, mathematically guaranteed, with no way to learn anything else.',
    example: "Age verification, preferences, public profile",
    expanded: {
      whatHappens: "Your agent derives a ZK proof from your vault data. The proof proves the claim (e.g., age >= 21) without revealing the underlying value (e.g., your actual birthdate). The verifier gets a boolean result backed by cryptographic certainty.",
      dataFlow: "Vault derives proof locally. Proof sent to verifier. Verifier checks math. No raw data transmitted.",
      keyInput: "SHA-256(username + server_salt) — survives password reset",
    },
  },
  {
    id: 2,
    label: "Tier 2",
    title: "Agent-Internal",
    color: "tier2",
    borderClass: "border-tier2/40",
    bgClass: "bg-tier2-dim",
    textClass: "text-tier2",
    summary: '"What shelves did they order last time?" Your agent knows. It uses that knowledge to reason and act on your behalf. But it never exports the raw data. External services get conclusions, not facts.',
    example: "Purchase history, browsing context, recommendations",
    expanded: {
      whatHappens: "Your agent holds a session key derived from the vault sealing key. It can read Tier 2 data to reason about your preferences, history, and context. But the MCP middleware pipeline blocks any tool call that would export raw Tier 2 values to external services.",
      dataFlow: "Vault decrypts to agent memory. Agent reasons internally. External services receive conclusions and recommendations, never source data.",
      keyInput: "SHA-256(username + password + \"master\") — does not survive password reset",
    },
  },
  {
    id: 3,
    label: "Tier 3",
    title: "Capability-Gated",
    color: "tier3",
    borderClass: "border-tier3/40",
    bgClass: "bg-tier3-dim",
    textClass: "text-tier3",
    summary: 'Your credit card. Your passport. Your medical records. Your agent literally cannot read them without your explicit, one-time authorization. It knows they exist. It can ask. It cannot proceed without you.',
    example: "Payment, identity documents, medical data",
    expanded: {
      whatHappens: "Tier 3 keys are structurally isolated from the vault sealing key. The agent session cannot derive them. When a service needs Tier 3 data, the agent sends you an authorization request. You approve (or deny) via the notify channel. A one-time capability token is generated, scoped to exactly one operation.",
      dataFlow: "Agent requests capability. You approve via HMAC-signed webhook. One-time PASETO token issued. Token used exactly once, then discarded.",
      keyInput: "random_key() (OsRng, 256-bit) — unrecoverable by design",
    },
  },
];

export default function TierSelector() {
  const [active, setActive] = useState<number | null>(null);
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });

  return (
    <div ref={ref} className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-12">
      {tiers.map((tier, i) => {
        const isActive = active === tier.id;
        return (
          <motion.div
            key={tier.id}
            initial={{ opacity: 0, y: 24 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: i * 0.1, ease: "easeOut" }}
          >
            <button
              onClick={() => setActive(isActive ? null : tier.id)}
              className={`
                w-full text-left rounded-xl border transition-all duration-300 cursor-pointer
                ${isActive
                  ? `${tier.borderClass} ${tier.bgClass} shadow-lg`
                  : "bg-card border-border hover:border-border-bright hover:bg-card-hover"
                }
              `}
            >
              <div className="p-6">
                <div className={`font-mono text-xs uppercase tracking-widest mb-2 ${tier.textClass}`}>
                  {tier.label}
                </div>
                <h4 className="text-lg font-semibold mb-3">{tier.title}</h4>
                <p className="text-secondary text-sm leading-relaxed">{tier.summary}</p>
                <p className="font-mono text-xs text-muted mt-4 pt-4 border-t border-border">
                  {tier.example}
                </p>

                <div className={`flex items-center justify-center mt-4 text-xs ${tier.textClass}`}>
                  <svg
                    className={`w-4 h-4 transition-transform duration-300 ${isActive ? "rotate-180" : ""}`}
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </div>
              </div>

              <AnimatePresence>
                {isActive && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                  >
                    <div className="px-6 pb-6 border-t border-border/50">
                      <div className="mt-4 space-y-4">
                        <div>
                          <h5 className={`font-mono text-xs uppercase tracking-wider mb-1.5 ${tier.textClass}`}>What Happens</h5>
                          <p className="text-secondary text-sm leading-relaxed">{tier.expanded.whatHappens}</p>
                        </div>
                        <div>
                          <h5 className={`font-mono text-xs uppercase tracking-wider mb-1.5 ${tier.textClass}`}>Data Flow</h5>
                          <p className="text-secondary text-sm leading-relaxed">{tier.expanded.dataFlow}</p>
                        </div>
                        <div className="bg-code-bg rounded-lg p-3 border border-border">
                          <span className="font-mono text-xs text-muted block mb-1">Key Input</span>
                          <code className="font-code text-xs text-foreground">{tier.expanded.keyInput}</code>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </button>
          </motion.div>
        );
      })}
    </div>
  );
}
