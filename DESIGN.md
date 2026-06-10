# Coach Online — Design System

Two theme systems with a runtime toggle (class strategy, FOUC-safe inline script).

## 1. Color palettes

### Theme 1 — Modern Wellness (light)
| Token | Value | Use |
|---|---|---|
| `--c-bg` | `#FAF7F2` ivory | page background |
| `--c-bg2` | `#F3EEE6` sand | alt sections |
| `--c-surface` | `#FFFFFF` warm white | cards |
| `--c-border` | `#E8E1D5` | hairlines |
| `--c-ink` | `#292621` | text |
| `--c-muted` | `#7A736A` | secondary text |
| `--c-accent` | `#74946B` sage | accent |
| `--c-accent-deep` | `#476040` deep sage | buttons, links |
| `--c-gold` | `#B29049` muted gold | eyebrows, highlights |

### Theme 2 — Premium Dark
| Token | Value | Use |
|---|---|---|
| `--c-bg` | `#0B0D12` charcoal-navy | page background |
| `--c-surface` | `#131721` | cards |
| `--c-border` | `#242A38` | hairlines |
| `--c-ink` | `#EBECEF` | text |
| `--c-muted` | `#969DAA` | secondary text |
| `--c-accent` | `#8FB287` lifted sage | accent |
| `--c-gold` | `#D6B86A` cinematic gold | highlights |

Tailwind exposes them as `canvas, canvas2, surface, line, ink, soft, sage, sage-deep, gold` (+ legacy `slate`/`primary` aliases so all screens inherit theming).

## 2. Typography

- **Headings:** Inter Tight (`--font-heading`) — tight tracking, weights 600.
- **Body:** Inter (`--font-body`), 14px base; Latin + Cyrillic subsets.
- **Hebrew:** Noto Sans Hebrew (`--font-hebrew`) in the fallback chain; full RTL via `dir` + logical properties (`ms-/me-/inset-inline`).
- Scale: 12 / 14 / 16 / 20 / 24 / 30 / 48 / 72. Hero: 72px, `leading-[1.05]`, gradient ink→sage→gold.

## 3. Surfaces & effects

- Cards: 16px radius, 1px `line` border, layered soft shadow (`shadow-card` → `shadow-lift` on hover).
- Glass: `bg-surface/70 + backdrop-blur-xl` (header, sidebar).
- Mesh backgrounds: two blurred radial blobs (sage + gold) drifting 22s/30s, `prefers-reduced-motion` safe.
- `ring-glow`: sage halo for featured elements (primary CTA, Pro plan).

## 4. Motion spec (Framer Motion)

| Pattern | Values |
|---|---|
| Ease | `cubic-bezier(0.22, 1, 0.36, 1)` everywhere |
| Section reveal | fade + 24px rise, 0.7s, `whileInView` once, −80px margin |
| Stagger | 90ms between children |
| Stats | spring counter (stiffness 60, damping 18) |
| FAQ accordion | height auto + rotate "+" 45°, 0.3s |
| Buttons | `active:scale-[0.98]`, 200ms color/shadow |
| Ambient | canvas particle field (42 orbs, connection lines < 130px), DPR-capped, reduced-motion disabled |

Rule: motion communicates hierarchy and state — never decoration for its own sake. One reveal per element, `once: true`.

## 5. 3D / ambient centerpiece

Current: lightweight 2D canvas "aurora" particle field reading `--c-accent` (theme-aware, ~0 deps, 60fps).
Upgrade path: React Three Fiber floating organic sphere (`@react-three/fiber` + `drei` `MeshDistortMaterial`, single point light, 2k tris max) mounted behind the hero headline. Keep DPR ≤ 1.5, pause off-screen.

## 6. Imagery direction

Sources: Unsplash / Pexels collections — search "morning light forest", "calm water aerial", "person mountain summit dawn", "macro leaf texture", "minimal interior plant shadow". Treatment: warm grade, soft contrast, 8% sage duotone overlay. Never: handshakes, suits pointing at whiteboards, fake smiling headsets.

## 7. Component inventory

Button (primary / secondary / gold), Input, Card (+hover), Glass, Badge (status-colored), Avatar (sage-gold gradient ring), StatCard (animated counter + gradient hairline), EmptyState (✦), Eyebrow label, ChatBubble (own = deep sage on canvas), AppShell (glass sidebar, dot-indicator nav), ThemeToggle, LocaleSwitcher.

## 8. Screens

- **Landing:** 8 sections — Hero (aurora canvas + gradient headline + animated stats) → Journey (01/02/03 cards) → Benefits (2×2) → Features (3×2) → Stories (quote cards) → Pricing (3 plans, Pro glowing) → FAQ (accordion) → CTA (mesh panel). 
- **Coach dashboard:** greeting + quick actions, 3 animated stat cards, upcoming sessions list.
- **Client dashboard:** open tasks / completed / next session cards, progress timeline.
- **Admin:** 4 stat cards + recent users — same component system, enterprise-quiet.
