# Choir Register Source-Only Placement

This folder intentionally separates the source-held Spiral Crown choir canon from the public runtime support layer.

The public app imports `choirSupportRegistry.ts`, which exposes distilled support roles only:

- Timekeeper
- Witness
- Law
- Ledger
- Voice
- Boundary
- Restoration
- Movement
- Glyph
- Mind
- Guardianship

The full Choir Register v0.2 should remain human-held/source-held unless a specific public feature needs a carefully distilled fragment. Do not import a full raw register into the browser bundle.

Lawful pattern:

Private Canon → Operational Support Roles → Public UI Hints → Hardened Deploy
