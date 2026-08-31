# 🎨 Memento — Figma Design Suite & Import Guide

Welcome to the **Memento Figma Design Suite**. This package provides everything you need to open, inspect, customize, and edit the complete Memento UI system and design tokens directly inside [Figma](https://figma.com).

---

## 📦 What's Included in `/figma`

| File | Type | Description |
| :--- | :--- | :--- |
| [`memento-figma-canvas.html`](./memento-figma-canvas.html) | **HTML to Design Master Canvas** | Standalone 1-click import canvas containing all artboards, modals, tokens, and responsive screens. |
| [`memento-screens.svg`](./memento-screens.svg) | **Vector Artboard Mockup** | 100% scalable vector graphic containing the full Desktop Dashboard, 60FPS Video Recorder Studio, and Design Palette. |
| [`memento-design-tokens.json`](./memento-design-tokens.json) | **Figma Tokens Studio JSON** | W3C-standard token definitions for Brand Colors, Dark/Light Themes, Typography, Elevation Shadows, and Border Radii. |

---

## 🚀 3 Ways to Open in Figma

### 🌟 Method 1: 1-Click Import via `html.to.design` (Recommended)
This method imports the full web design with **native Figma Auto-Layout frames, typography, and editable components**:

1. Open your Figma canvas or create a new file.
2. Go to **Plugins** → Search for **`html.to.design`** (or **`HTML to Figma`**).
3. Select **Import HTML file** or **Raw HTML**.
4. Choose or drag [`memento-figma-canvas.html`](./memento-figma-canvas.html).
5. Click **Import** — Figma will generate fully layered, styled, and editable artboards!

---

### ⚡ Method 2: Direct Drag-and-Drop (Instant SVG Vector)
1. Open any Figma canvas.
2. Drag and drop [`memento-screens.svg`](./memento-screens.svg) directly from your file explorer into Figma.
3. Figma will immediately render all vector artboards, icons, typography, and layout containers.

---

### 🎨 Method 3: Import Design Tokens with `Tokens Studio for Figma`
To import all colors, light/dark variables, and typography styles:

1. In Figma, open the **Tokens Studio for Figma** plugin (formerly *Figma Tokens*).
2. Click **Settings** → **Import token file**.
3. Select [`memento-design-tokens.json`](./memento-design-tokens.json).
4. Click **Apply to Selection** to sync all variables across your designs.

---

## 📐 Included Design Specifications

### 1. Color System
- **Brand Primary**: `#6C4FF6` (Electric Indigo) / `#5B3FD4` (Dark / Hover)
- **Primary Tint**: `#F1EEFF` (Soft Purple)
- **Modality Accents**:
  - 🎤 Audio / Voice: `#6C4FF6`
  - ✍️ Note / Text: `#48D7E8` (Cyan)
  - 📹 Video Journal: `#D95CFF` (Fuchsia)
  - 📷 Photo Journal: `#48B884` (Emerald)
  - ☀️ Warmth / Reflection: `#F4B740` (Amber)
  - 💖 Favorite / Destruction: `#E65C6A` (Rose)

### 2. Video Studio Features
- **Frame Rate**: `60 FPS` / `30 FPS` / `24 FPS`
- **Resolution**: `1080p Full HD` (1920×1080) / `720p HD` / `480p SD`
- **Bitrate Presets**: `High` (4.5 Mbps) / `Standard` (2.5 Mbps) / `Economy` (0.9 Mbps)
- **Speech-to-Text**: Real-time live subtitle stream overlay on camera viewfinder

---

✨ *Crafted for Memento v2.0*
