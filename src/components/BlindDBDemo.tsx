import { useState, useEffect, useRef } from "react";
import { motion, useInView } from "framer-motion";

async function sha256(message: string): Promise<string> {
  const msgBuffer = new TextEncoder().encode(message);
  const hashBuffer = await crypto.subtle.digest("SHA-256", msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

async function fakeEncrypt(value: string): Promise<string> {
  const combined = value + "|encrypted|" + Date.now();
  const hash = await sha256(combined);
  return hash.slice(0, 44);
}

export default function BlindDBDemo() {
  const [label, setLabel] = useState("email");
  const [value, setValue] = useState("alice@example.com");
  const [recordId, setRecordId] = useState("");
  const [encrypted, setEncrypted] = useState("");
  const [masterSecret] = useState("a7f2b9c1d8e4f6a3b5c7d9e1f3a5b7c9");
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });

  useEffect(() => {
    const compute = async () => {
      if (label && value) {
        const id = await sha256(masterSecret + "||" + label + "||0");
        const enc = await fakeEncrypt(value);
        setRecordId(id);
        setEncrypted(enc);
      } else {
        setRecordId("");
        setEncrypted("");
      }
    };
    compute();
  }, [label, value, masterSecret]);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 24 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="rounded-xl border border-border bg-card overflow-hidden"
    >
      <div className="grid grid-cols-1 lg:grid-cols-2">
        {/* What you see */}
        <div className="p-6 border-b lg:border-b-0 lg:border-r border-border">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-2 h-2 rounded-full bg-allow" />
            <span className="font-mono text-xs uppercase tracking-widest text-allow">What you see</span>
          </div>

          <div className="space-y-3">
            <div>
              <label className="block font-mono text-xs text-muted mb-1">Label</label>
              <input
                type="text"
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                className="w-full bg-code-bg border border-border rounded-lg px-3 py-2 font-code text-sm text-foreground focus:outline-none focus:border-gold/50 transition-colors"
                placeholder="e.g., email"
              />
            </div>
            <div>
              <label className="block font-mono text-xs text-muted mb-1">Value</label>
              <input
                type="text"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                className="w-full bg-code-bg border border-border rounded-lg px-3 py-2 font-code text-sm text-foreground focus:outline-none focus:border-gold/50 transition-colors"
                placeholder="e.g., alice@example.com"
              />
            </div>
            <div className="bg-code-bg rounded-lg p-3 border border-border">
              <span className="font-mono text-[10px] text-muted block mb-1">MASTER SECRET (client-side only)</span>
              <code className="font-code text-xs text-gold break-all">{masterSecret}</code>
            </div>
          </div>
        </div>

        {/* What the server sees */}
        <div className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-2 h-2 rounded-full bg-tier3" />
            <span className="font-mono text-xs uppercase tracking-widest text-tier3">What the server sees</span>
          </div>

          <div className="space-y-3">
            <div className="bg-code-bg rounded-lg p-3 border border-border">
              <span className="font-mono text-[10px] text-muted block mb-1">RECORD ID</span>
              <code className="font-code text-xs text-secondary break-all">
                {recordId ? (
                  <motion.span
                    key={recordId}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                  >
                    {recordId}
                  </motion.span>
                ) : (
                  <span className="text-muted italic">type a label...</span>
                )}
              </code>
            </div>
            <div className="bg-code-bg rounded-lg p-3 border border-border">
              <span className="font-mono text-[10px] text-muted block mb-1">ENCRYPTED DATA</span>
              <code className="font-code text-xs text-secondary break-all">
                {encrypted ? (
                  <motion.span
                    key={encrypted}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                  >
                    &lt;encrypted {new TextEncoder().encode(value).length} bytes&gt;
                    <br />
                    <span className="text-muted">{encrypted}...</span>
                  </motion.span>
                ) : (
                  <span className="text-muted italic">type a value...</span>
                )}
              </code>
            </div>
            <div className="bg-tier3-dim border border-tier3/20 rounded-lg p-3">
              <p className="font-mono text-xs text-tier3 mb-1">Server cannot determine:</p>
              <ul className="text-xs text-secondary space-y-0.5">
                <li className="flex items-start gap-1.5">
                  <span className="text-tier3 font-mono font-bold">?</span>
                  <span>What "{label || "..."}" means</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="text-tier3 font-mono font-bold">?</span>
                  <span>Who this record belongs to</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="text-tier3 font-mono font-bold">?</span>
                  <span>Which other records are related</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="text-tier3 font-mono font-bold">?</span>
                  <span>Whether this is real or seed data</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-border px-6 py-3 bg-code-bg">
        <p className="font-mono text-[11px] text-muted text-center">
          SHA-256 via Web Crypto API. Record ID = SHA-256(master_secret || label || index). Real Signet uses AES-256-GCM envelope encryption.
        </p>
      </div>
    </motion.div>
  );
}
