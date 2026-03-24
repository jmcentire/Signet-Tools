import { useState, useRef } from "react";
import { motion, useInView } from "framer-motion";

const DEFAULT_POLICY = `rules:
  - name: no-destructive-commands
    action: deny
    conditions:
      - type: command_contains
        values: ["rm -rf", "DROP TABLE", "git push --force"]
    message: "Destructive command blocked by policy"

  - name: allow-read-tools
    action: allow
    conditions:
      - type: tool_name
        values: [Read, Glob, Grep]

  - name: block-network-tools
    action: deny
    conditions:
      - type: tool_name
        values: [curl, wget, fetch]
    message: "Network access blocked by policy"`;

interface EvalResult {
  decision: "ALLOW" | "DENY";
  rule: string | null;
  message: string;
}

function evaluatePolicy(yaml: string, toolName: string, command: string): EvalResult {
  // Simple parser: extract rules from YAML-like text
  const rules: Array<{
    name: string;
    action: string;
    conditions: Array<{ type: string; values: string[] }>;
    message?: string;
  }> = [];

  const ruleBlocks = yaml.split(/^\s{2}- name:/m);
  for (let i = 1; i < ruleBlocks.length; i++) {
    const block = "  - name:" + ruleBlocks[i];
    const nameMatch = block.match(/name:\s*(.+)/);
    const actionMatch = block.match(/action:\s*(\w+)/);
    const messageMatch = block.match(/message:\s*"([^"]+)"/);

    if (!nameMatch || !actionMatch) continue;

    const conditions: Array<{ type: string; values: string[] }> = [];
    const condBlocks = block.split(/^\s{6}- type:/m);
    for (let j = 1; j < condBlocks.length; j++) {
      const cblock = "      - type:" + condBlocks[j];
      const typeMatch = cblock.match(/type:\s*(\S+)/);
      const valuesMatch = cblock.match(/values:\s*\[([^\]]+)\]/);
      if (typeMatch && valuesMatch) {
        const vals = valuesMatch[1]
          .split(",")
          .map((v) => v.trim().replace(/^["']|["']$/g, ""));
        conditions.push({ type: typeMatch[1], values: vals });
      }
    }

    rules.push({
      name: nameMatch[1].trim(),
      action: actionMatch[1].trim().toLowerCase(),
      conditions,
      message: messageMatch?.[1],
    });
  }

  // Evaluate rules in order (first match wins)
  for (const rule of rules) {
    let allMatch = true;
    for (const cond of rule.conditions) {
      switch (cond.type) {
        case "command_contains":
          if (!cond.values.some((v) => command.toLowerCase().includes(v.toLowerCase()))) {
            allMatch = false;
          }
          break;
        case "tool_name":
          if (!cond.values.some((v) => v.toLowerCase() === toolName.toLowerCase())) {
            allMatch = false;
          }
          break;
        default:
          allMatch = false;
      }
      if (!allMatch) break;
    }

    if (allMatch) {
      return {
        decision: rule.action === "allow" ? "ALLOW" : "DENY",
        rule: rule.name,
        message: rule.message || `Matched rule: ${rule.name}`,
      };
    }
  }

  return {
    decision: "ALLOW",
    rule: null,
    message: "No matching rule — default allow",
  };
}

export default function PolicyPlayground() {
  const [policy, setPolicy] = useState(DEFAULT_POLICY);
  const [toolName, setToolName] = useState("Bash");
  const [command, setCommand] = useState("rm -rf /tmp/old-cache");
  const [result, setResult] = useState<EvalResult | null>(null);
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });

  const evaluate = () => {
    const res = evaluatePolicy(policy, toolName, command);
    setResult(res);
  };

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 24 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="rounded-xl border border-border bg-card overflow-hidden"
    >
      <div className="grid grid-cols-1 lg:grid-cols-2">
        {/* Policy editor */}
        <div className="p-6 border-b lg:border-b-0 lg:border-r border-border">
          <div className="flex items-center gap-2 mb-4">
            <span className="font-mono text-xs uppercase tracking-widest text-gold">policy.yaml</span>
          </div>
          <textarea
            value={policy}
            onChange={(e) => {
              setPolicy(e.target.value);
              setResult(null);
            }}
            className="w-full h-72 bg-code-bg border border-border rounded-lg px-4 py-3 font-code text-xs text-foreground leading-relaxed focus:outline-none focus:border-gold/50 transition-colors resize-none"
            spellCheck={false}
          />
        </div>

        {/* Tool call input + result */}
        <div className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <span className="font-mono text-xs uppercase tracking-widest text-secondary">Simulate Tool Call</span>
          </div>

          <div className="space-y-3 mb-6">
            <div>
              <label className="block font-mono text-xs text-muted mb-1">Tool Name</label>
              <input
                type="text"
                value={toolName}
                onChange={(e) => {
                  setToolName(e.target.value);
                  setResult(null);
                }}
                className="w-full bg-code-bg border border-border rounded-lg px-3 py-2 font-code text-sm text-foreground focus:outline-none focus:border-gold/50 transition-colors"
                placeholder="e.g., Bash, Read, Grep"
              />
            </div>
            <div>
              <label className="block font-mono text-xs text-muted mb-1">Command / Arguments</label>
              <input
                type="text"
                value={command}
                onChange={(e) => {
                  setCommand(e.target.value);
                  setResult(null);
                }}
                className="w-full bg-code-bg border border-border rounded-lg px-3 py-2 font-code text-sm text-foreground focus:outline-none focus:border-gold/50 transition-colors"
                placeholder="e.g., rm -rf /tmp/data"
              />
            </div>

            <button
              onClick={evaluate}
              className="w-full py-2.5 bg-gold text-background font-semibold text-sm rounded-lg hover:bg-gold-bright transition-colors cursor-pointer"
            >
              Evaluate Policy
            </button>
          </div>

          {result && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.2 }}
              className={`rounded-lg border p-4 ${
                result.decision === "ALLOW"
                  ? "bg-allow/[0.06] border-allow/30"
                  : "bg-deny/[0.06] border-deny/30"
              }`}
            >
              <div className="flex items-center gap-3 mb-2">
                <span
                  className={`font-mono text-lg font-bold ${
                    result.decision === "ALLOW" ? "text-allow" : "text-deny"
                  }`}
                >
                  {result.decision}
                </span>
                {result.rule && (
                  <span className="font-mono text-xs text-muted bg-code-bg px-2 py-0.5 rounded">
                    {result.rule}
                  </span>
                )}
              </div>
              <p className="text-sm text-secondary">{result.message}</p>
            </motion.div>
          )}

          {!result && (
            <div className="rounded-lg border border-border/50 p-4 bg-code-bg">
              <p className="font-mono text-xs text-muted text-center">
                Try these:
              </p>
              <div className="mt-2 space-y-1">
                {[
                  { tool: "Bash", cmd: "rm -rf /tmp/old-cache", expect: "DENY" },
                  { tool: "Read", cmd: "src/main.rs", expect: "ALLOW" },
                  { tool: "curl", cmd: "https://api.example.com", expect: "DENY" },
                  { tool: "Grep", cmd: "pattern *.rs", expect: "ALLOW" },
                ].map((ex) => (
                  <button
                    key={ex.tool + ex.cmd}
                    onClick={() => {
                      setToolName(ex.tool);
                      setCommand(ex.cmd);
                      setResult(null);
                    }}
                    className="w-full text-left px-3 py-1.5 rounded text-xs hover:bg-card-hover transition-colors cursor-pointer"
                  >
                    <span className="font-code text-gold">{ex.tool}</span>
                    <span className="text-muted"> — {ex.cmd}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="border-t border-border px-6 py-3 bg-code-bg">
        <p className="font-mono text-[11px] text-muted text-center">
          Client-side simulation. Real signet-eval is a compiled Rust binary evaluating in ~2 microseconds.
        </p>
      </div>
    </motion.div>
  );
}
