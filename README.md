# Signet Tools

**Your AI. Your rules.** The canonical [signet.tools](https://signet.tools/)
website for Signet, the everyday personal-authority project created by
[Jeremy McEntire](https://perardua.dev).

The site presents a concept and preserved research prototype, not a launched
purchasing service. Further implementation is paused. `/concept/` records rings,
separate rules/assets, native R2 CAS, task expiry, client-custody direction and the
proposed controlled-browser/Jev permission gate, with unresolved boundaries named.
Existing interactive examples remain fictional and unchanged in behavior.

## Where to go

- **Understand Signet:** [website](https://signet.tools/).
- **Use or integrate the software:** [product README](https://github.com/jmcentire/signet),
  [usage docs](https://github.com/jmcentire/signet/tree/main/docs), and [/start/](https://signet.tools/start/).
- **Work on this site:** [site docs](docs/README.md) and [brand guidance](docs/brand.md).

This repository owns the Astro website. The separate `jmcentire/signet`
repository owns the Rust product and technical documentation. Its HTML files and
this repository's root `index.html` preserve old GitHub Pages redirects, not a
second website source.

## Local development

```sh
npm ci
npm run dev -- --host 127.0.0.1
npm run build
npm run preview -- --host 127.0.0.1
```

Astro generates static pages; nginx serves them on Fly.io under app `signet-tools`.
Deployment is a separate publication step and is not part of these local commands.

Routes: `/` (nontechnical story and illustrative scenarios), `/concept/` (settled design and open questions), `/start/` (developer
orientation), `/privacy/`, and `/demo/` (separate capabilities-manifest walkthrough
with an optional real external checkout). The homepage does not contact a vault
or issue credentials. Machine-readable documentation lives in `public/llms*.txt`.

MCP proof/query scaffolding, incomplete issuer wiring, and disabled generic
one-time capabilities must remain clear across the website and docs. Do not imply
named customers, endorsements, production custody, or shipped platform integrations.

The local product checkout now includes `signet owner-preview --port 4322` (fictional, no credentials) and the passkey owner app. See [owner approval documentation](https://github.com/jmcentire/signet/blob/main/docs/owner-approval.md) for the real verification boundary and remaining deployment gates.

Exact public source destinations: `jmcentire/Signet-Tools` (this website) and
`jmcentire/signet` (product/docs). Website deployment targets the existing Fly app
`signet-tools`; it is separate from any proposed GCP owner app. No `.github`
deployment workflow is present here. Push and deployment require separate explicit
authorization. The October 11 publication approval covers these two public
repositories and this existing website only; it excludes the new authority app.


For the approved existing-site rollout, use the local Docker builder and update
only the existing machines in `sjc` (shared 1 CPU, 256 MB); do not create spare
machines or allocate new IPs. `fly.toml` retains its earlier `dfw` default, so pass
`--primary-region sjc` explicitly when preserving the current placement. Verify
both repository heads and `https://signet.tools/concept/` after publication.
