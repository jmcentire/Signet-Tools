# Signet identity

The personal authority layer. Core statement: **Your agent. Your authority.**

The seal is Signet's own brand mark, not an external certification. The custom
S sits within a six-sided matrix. The full seal adds engraved concentric rings
and the inscriptions “Personal Authority” and “Authority by Consent.”

- Full seal: `public/seal.svg`, used as the central authority document.
- Small mark: `public/mark.svg`, used beside the wordmark.
- Favicon: `public/favicon.svg`, simplified for small sizes.
- Paper: `#f3f0e7`; ink: `#24342e`; seal red: `#873f32`.
- Display: Libre Caslon Display; body: Instrument Sans; annotations: DM Mono.

Voice: direct, precise, declarative. Explain why agent authority needs an owner
and scope. Keep implementation limits visible where developers choose how to
integrate. Do not imply outside accreditation or shipped production custody.

The homepage is static Astro with a small native script for the tier illustration
and copy buttons. The separate `/demo` page retains its React island. Honor reduced
motion, keyboard navigation, and a readable first render without JavaScript.
