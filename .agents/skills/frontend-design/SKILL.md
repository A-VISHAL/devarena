---
name: frontend-design
description: Premium frontend design guidelines, anti-generic UI rules, Midnight & Amber visual hierarchy, motion design principles, and 3D web experience standards.
---

# Premium Frontend Design Skill

## 1. Core Visual Philosophy
- **Anti-Generic UI**: Never produce generic AI SaaS templates with purple/cyan gradient blobs, generic floating geometric circles, or empty cards.
- **Editorial Polish & Restraint**: Every section must feel deliberately designed with distinct layouts, thoughtful whitespace, and crisp visual hierarchy.
- **Midnight & Amber Palette**:
  - Background: `#141719`
  - Deep Dark Background: `#101314`
  - Surface: `#1D2224`
  - Elevated Surface: `#252C2D`
  - Borders: `#30383A`
  - Primary Amber: `#E6A746` (warm, sophisticated gold/amber)
  - Highlight Amber: `#FFBD62`
  - Secondary Sage/Teal: `#83B6A3`
  - Main Text: `#F2F0E9`
  - Muted Text: `#A5AAA5`
  - Subtle Borders & Dividers: `#273032`

## 2. Motion & Interactive 3D Guidelines
- **Purposeful Motion**: Every animation must serve a storytelling or interactive purpose. No gratuitous spinning or bouncing.
- **Depth & Dimension**: Use layered CSS 3D transforms (`perspective`, `rotateX`, `rotateY`, `translateZ`), canvas particle simulations, and pointer-responsive parallax to create tactile depth.
- **Scroll Storytelling**:
  - Reveal content progressively with staggered entry.
  - Interactive split compositions connecting two concepts (e.g., Casual Gaming vs. Competitive Coding).
  - Pinned or sticky demonstration widgets (e.g., live 1v1 duel runner, interactive node roadmap).
- **Performance & Accessibility**:
  - GPU-accelerated transforms (`transform: translate3d(...)`, `will-change: transform`).
  - Strict support for `prefers-reduced-motion: reduce`.
  - Zero layout thrashing or scroll jank on standard laptop displays.

## 3. Product-Centric Storytelling
- **Real Product Fidelity**: Feature authentic previews of actual games (Zip, Word Puzzle, Quick Math) and real Code Arena battle interfaces.
- **Clear Two-Sided Platform Identity**:
  1. *Play for Fun*: Casual brain games, daily puzzles, spatial challenges, multiplayer rooms.
  2. *Compete with Code*: Real-time 1v1 duels, DSA roadmaps, verified Elo ratings, technical community.
- **Seamless Conversion & Flow**:
  - Visitors can immediately explore games, preview interactive mechanics, and enter the actual dashboard with one click.
  - Dedicated public landing route (`/` or marketing state) seamlessly bridging to `/app` or active platform views.
