# Signet website documentation

The shared message is **Your AI. Your rules.** Signet proposes
personal authority for everyday people and their chosen agents, created by Jeremy McEntire.

## Three audiences, one story

- **Website:** explain the personal value without assuming technical knowledge.
  A person's life crosses services; their chosen agent should represent them
  with specific permission and minimal disclosure.
- **README:** give everyone a high-level orientation and clear paths to evaluate,
  integrate, or contribute.
- **Product docs:** provide working examples, actual tool behavior, trust
  boundaries, source links and remaining implementation work for humans and agents.

Technical source of truth: [Signet integration guide](https://github.com/jmcentire/signet/blob/main/docs/integration.md).
Brand system: [brand.md](brand.md).

## Website structure

`src/pages/index.astro` owns the homepage. `site.css` supplies the shared site
identity; `SiteHeader`, `SiteFooter` and `BaseLayout` provide chrome and metadata.
The scenario tabs are native HTML/JavaScript and illustrate fictional data.
`/start/` bridges into the product docs. The separate React book demo is a
capabilities-manifest example, not proof of Signet payments.

## Review before publication

Run `npm run build`. Inspect desktop and narrow mobile widths, keyboard tab
navigation, focus, copy-command feedback, source/doc links, and reduced-motion
behavior. Keep local preview bound to loopback. Check nginx redirects and MIME
behavior separately when publishing; an Astro preview does not verify the Fly
proxy configuration.

Check every product claim against source. In particular, MCP `get_proof` returns
placeholder bytes, `query` has scaffolded responses, and direct dispatch does not
imply full middleware enforcement. Capability requests fail closed or remain
pending; neither is a grant. Generic one-time issuance/acceptance is disabled.
New product documentation links become public only after the corresponding
product repository changes are published.

The consumer story centers standing rules, conditional reorders, and temporary
permission. A $75 purchase exception never raises a $50 standing limit. A recurring
baseline is approved from defensible history and never ratchets automatically.
Exact rule additions, edits and removals require separate one-time management
authority. The agent cannot expand its own limits. The homepage is a local
simulation, not the production authority service.

The separate authority core implements owner-signature verification, versioned rules,
atomic single-use grants, executor reservations and receipt-backed baselines. It
requires a trusted owner surface, isolated service custody and merchant adapters.
It does not enable the legacy generic one-time capability path.
Authority contract: https://github.com/jmcentire/signet/blob/main/docs/authority-service.md

The local product checkout now includes `signet owner-preview --port 4322` (fictional, no credentials) and the passkey owner app. See [owner approval documentation](https://github.com/jmcentire/signet/blob/main/docs/owner-approval.md) for the real verification boundary and remaining deployment gates.

## October 11 concept checkpoint

Present Signet as a concept and preserved research prototype. Further development
is paused. `/concept/` records the complete intended design; technical status and
open work live in the product docs. Do not promise a launch, universal browser
enforcement, live platform/provider integration, raw-secret expiry or external
endorsement. Keep creator attribution and dated revision context. Existing
interactive scenarios remain fictional; no new product behavior is added here.
