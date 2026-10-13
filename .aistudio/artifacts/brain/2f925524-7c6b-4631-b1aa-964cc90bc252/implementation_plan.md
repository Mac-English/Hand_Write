# Unified Floating Tool Dock & Cross-App Editing Reorganization

Standardize and declutter the editing experience across the Assignment Editor and Character Studio by encapsulating all pen tools, brushes, color swatches, paper textures, layout typography, and content actions into a unified, floating sidebar icon group with responsive flyout drawers.

## User Review & Critical Decisions

> [!IMPORTANT]
> The clarifying questions were skipped; recommended design defaults will be adopted to ensure maximum ergonomics and visual clarity across both desktop and mobile viewports.

- **Confirmed Decision (Dock Positioning)**: The unified floating icon dock will be anchored along the right viewport edge on desktop (collapsible to a sleek pill dock) and responsive bottom-docked on smaller screens, keeping the main assignment notebook canvas and character studio grid front and center without clipping margins.
- **Confirmed Decision (Flyout Interaction)**: Clicking an icon smoothly slides open an anchored floating flyout drawer alongside the dock, presenting controls (Pens & Brushes, Ink Palette, Paper Textures, Typography & Layout, Content/AI Studio) without shifting or distorting the underlying document or glyph grid.
- **Confirmed Decision (Cross-App Consistency)**: Both `AssignmentEditorPage` and `CharacterGlyphStudio` will share the same floating icon design system, visual iconography, brush selector components, and active tool indicators, giving users a cohesive studio workflow.

---

## 1. Overview & Core Concept

- **What It Does**: Replaces disjointed floating toolbars, oversized control cards, and scattered brush selectors with an elegant, unified floating sidebar icon dock (`FloatingToolDock`). Users can access all drawing instruments (Ballpoint, Gel, Fountain nib, Painter, Pencil, Marker), custom ink colors, paper styles, typographic controls, and AI drafting from a single non-intrusive icon cluster.
- **Target Audience / Persona**: Students, educators, and creators who need authentic handwritten assignments, notes, and custom character glyphs without fighting confusing and cluttered menus.
- **Key Value**: Delivers an immersive, distraction-free "front-and-center" workspace where the user's handwritten paper and glyph canvases take primary focus, with powerful styling tools instantly accessible on demand.

---

## 2. User Experience & Visual Design

### Key User Flows

1. **Focused Canvas Experience**:
   - The user opens an assignment or the character studio. The primary notebook sheet or glyph table fills the center stage with natural ruled lines and authentic margins.
   - On the right edge floats a minimalist glassmorphic dock holding discrete, recognizable tool icons (Pens/Brushes, Ink Palette, Paper Styles, Font & Spacing, AI & Text).
2. **Instant Flyout Configuration**:
   - Clicking the **Pen Tool** icon expands a slim flyout card displaying the real pen brushes (Ballpoint, Gel, Fountain, Painter, Pencil, Marker) with physical stroke widths and tactile descriptions.
   - Clicking the **Palette** icon switches the flyout to ink presets (Royal Blue, Midnight Navy, Ballpoint Blue, Jet Black, Walnut Sepia, Crimson) and custom hex color controls.
   - Adjusting any slider or brush immediately updates the live assignment pages or character glyph canvas in real time.
3. **Collapsing & Unobtrusive Mode**:
   - Clicking outside the flyout or toggling the active icon collapses the flyout back into the slim icon pill dock.
   - A quick collapse toggle allows the user to minimize the dock entirely into a discreet floating action trigger during long reading or grading sessions.

### Visual Identity & Theme

- **Aesthetic Direction**: Premium academic atelier with warm paper textures, sleek graphite frames, and clean architectural controls.
- **Color Palette & Mood**:
  - Dominant Neutral: Crisp ivory parchment (`#FAFAF8` / `bg-stone-50`), warm slate framing (`bg-stone-100/90`).
  - Structural Surfaces: Floating dock in frosted glass acrylic (`bg-white/95 backdrop-blur-md shadow-xl border border-stone-200/80`).
  - Accent Color: Deep fountain indigo (`#1E3A8A` / `bg-indigo-600`) for active tool indicators and primary actions.
- **Typography & Hierarchy**:
  - Headings & Labels: `Plus Jakarta Sans` for clean modern tooltips and section titles.
  - Handwritten Body: Authentic cursive scripts and user's custom glyphs (`Custom My Hand`).
  - Metrics & Dimensions: Tabular numerals (`font-mono tabular-nums`) for stroke width and line spacing sliders.

---

## 3. Key Product Decisions & Trade-Offs

- **Decision 1: Reusable Floating Dock Component (`FloatingToolDock`)**:
  - *Chosen Approach*: Extract the dock and flyout container into a reusable modular component shared between `AssignmentEditorPage` and `CharacterGlyphStudio`.
  - *Why*: Guarantees unified styling, identical keyboard/click-outside dismiss behavior, consistent responsive mobile behavior, and prevents code duplication across views.
  - *Alternatives Considered*: Independent implementations per page (rejected due to styling divergence and maintenance overhead).
- **Decision 2: Floating Flyout Over Static Sidebar Split**:
  - *Chosen Approach*: Floating overlay flyout that appears alongside the dock without resizing or squishing the notebook page container.
  - *Why*: Maintaining the exact aspect ratio ($210\text{mm} \times 297\text{mm}$ A4) of the notebook page is vital for preview accuracy and zero-crop PDF alignment. Resizing the viewport would trigger layout re-renders.

---

## 4. Technical Architecture & Data Strategy

### Architecture & Component Diagram

```
┌────────────────────────────────────────────────────────────────────────┐
│                         App Workspace View                             │
│                                                                        │
│   ┌──────────────────────────────────────────────┐  ┌──────────────┐  │
│   │                                              │  │ Unified Dock │  │
│   │          Primary Focus Canvas Area           │  │ (Floating)   │  │
│   │                                              │  │              │  │
│   │  Assignment Editor: Paginated Notebook Page  │  │ [✒️ Pen]     │  │
│   │  Character Studio: Glyph Matrix & Grid       │  │ [🎨 Color]   │  │
│   │                                              │  │ [📄 Paper]   │  │
│   │                                              │  │ [📐 Layout]  │  │
│   │                                              │  │ [✨ AI/Edit] │  │
│   │                                              │  └──────┬───────┘  │
│   │                                              │         │ Click    │
│   │                                              │         ▼          │
│   │                                              │  ┌──────────────┐  │
│   │                                              │  │ Tool Flyout  │  │
│   │                                              │  │ Drawer       │  │
│   └──────────────────────────────────────────────┘  └──────────────┘  │
└────────────────────────────────────────────────────────────────────────┘
```

### Component Hierarchy & File Responsibilities

1. `src/components/common/FloatingToolDock.tsx`:
   - Unified floating container supporting custom tool tabs, tooltips, active state styling, and mobile responsive positioning.
   - Handles animated flyout expansion, click-away auto-close, and compact collapse mode.
2. `src/components/assignment/AssignmentEditorPage.tsx`:
   - Integrates `FloatingToolDock` for pen instruments, ink colors, paper textures, typography metrics, and AI text drafting drawer.
   - Keeps the handwritten document preview perfectly centered with full page controls.
3. `src/components/handwriting/CharacterGlyphStudio.tsx`:
   - Adopts `FloatingToolDock` for brush selection (Marker, Ballpoint, Gel, Fountain, Painter, Pencil), ink selection, and drawing settings.
   - Cleans up cluttered top headers and replaces duplicate control strips with the standardized floating dock.
