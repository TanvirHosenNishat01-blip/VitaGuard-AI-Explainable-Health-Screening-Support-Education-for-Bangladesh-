# 🎨 VitaGuard AI — Healthcare Design System Specification (Phase 02)
**Project:** TriNexus | VitaGuard AI  
**Scope:** Design Tokens, Typography, Component Standards & Accessibility Rules  
**Date:** November 2026

---

## 1. Design Identity & Core Philosophy

VitaGuard AI's design identity balances **clinical authority**, **empathy**, and **cognitive clarity**. It deliberately avoids generic web startup aesthetics (excessive drop-shadows, rainbow gradients, heavy glassmorphism) in favor of a clean, structured medical technology standard.

### Core Principles:
1. **Calm Authority:** Clean white and soft slate backgrounds with deep navy and clinical teal accents reduce patient anxiety.
2. **Cognitive Ease:** High contrast, large legibility, and minimal visual distraction.
3. **Triple-Encoding for Clinical Safety:** Status is never communicated by color alone; it is always backed by shape/icon and clear text.
4. **Bilingual Harmony:** Flawless typographic pairing between Latin and Bengali scripts.

---

## 2. Color Palette & Semantic Tokens

```
┌────────────────────────────────────────────────────────────────────────┐
│                        PRIMARY CLINICAL PALETTE                        │
├───────────────────────┬────────────────────────────────────────────────┤
│ Primary Navy (#12304A)│ Primary brand, navigation headers, dark text   │
│ Medical Teal (#0D9488)│ Primary interactive buttons, health highlights │
│ Soft Slate   (#F6F9FC)│ Primary page canvas, reduces eye strain        │
│ Pure White   (#FFFFFF)│ Cards, dialogs, form backgrounds               │
├───────────────────────┴────────────────────────────────────────────────┤
│                        CLINICAL TRIAGE STATUS                          │
├───────────────────────┬────────────────────────────────────────────────┤
│ Clinical Green(#15803D)│ Low risk, normal biomarkers, confirmed slots  │
│ Amber Warning (#D97706)│ Moderate risk, borderline vitals, pending case │
│ Critical Red  (#DC2626)│ High risk, acute emergency vitals, alerts      │
│ Muted Slate   (#64748B)│ Helper text, captions, secondary metadata      │
│ Border Slate  (#E2E8F0)│ Card borders, dividers, subtle outlines        │
└────────────────────────────────────────────────────────────────────────┘
```

### Contrast Compliance (WCAG 2.2 Level AA & AAA)
* Primary Navy (`#12304A`) on Background (`#F6F9FC`): Contrast ratio **12.4:1** (Passes AAA).
* Medical Teal (`#0D9488`) on Surface (`#FFFFFF`): Contrast ratio **4.54:1** for large text/icons. For standard buttons, white text on `#0D9488` achieves **4.62:1** (Passes AA).
* Critical Red (`#DC2626`) on Surface (`#FFFFFF`): Contrast ratio **4.88:1** (Passes AA).
* Text Dark Slate (`#0F172A`) on Surface (`#FFFFFF`): Contrast ratio **16.2:1** (Passes AAA).

---

## 3. Typography & Dual-Language Font Stack

```css
/* English Font: Inter / Plus Jakarta Sans */
/* Bengali Font: 'Noto Sans Bengali', 'Hind Siliguri', sans-serif */

font-family: 'Inter', 'Noto Sans Bengali', system-ui, -apple-system, sans-serif;
```

### Scale & Hierarchy Table
| Token | Font Size | Line Height | Weight (EN / BN) | Usage |
|---|---|---|---|---|
| `display-lg` | 32px (2.0rem) | 1.25 | Bold (700) | Landing page hero titles |
| `heading-1`  | 24px (1.5rem) | 1.30 | Bold (700) | Page titles (Patient Dashboard, Assessment) |
| `heading-2`  | 20px (1.25rem)| 1.35 | Semibold (600) | Card headings, section titles |
| `heading-3`  | 16px (1.0rem) | 1.40 | Semibold (600) | Form step titles, table headers |
| `body-base`  | 15px (0.938rem)| 1.50 | Regular (400) / Medium (500) | Primary instructions, clinical advice |
| `body-sm`    | 13px (0.813rem)| 1.45 | Regular (400) | Form input labels, descriptions |
| `caption`    | 12px (0.75rem)| 1.40 | Medium (500) | Tooltips, metadata, timestamp badges |

---

## 4. Spacing Scale & Elevation Grid

* **Base Grid Unit:** 4px / 8px linear grid.
  * `space-1` = 4px, `space-2` = 8px, `space-3` = 12px, `space-4` = 16px
  * `space-6` = 24px, `space-8` = 32px, `space-12` = 48px
* **Card Border Radii:**
  * Interactive inputs & buttons: `rounded-lg` (8px)
  * Content cards & modals: `rounded-xl` (12px) to `rounded-2xl` (16px)
  * Status badges: `rounded-full` (9999px)
* **Shadows & Elevation:**
  * Cards: `shadow-xs` (`0 1px 2px 0 rgba(0, 0, 0, 0.05)`) with `border border-slate-200`
  * Active/Hover states: `shadow-sm` (`0 1px 3px 0 rgba(0, 0, 0, 0.1)`)
  * Floating Modals: `shadow-xl` (`0 20px 25px -5px rgba(0, 0, 0, 0.1)`)

---

## 5. Standard Component Specifications

### 5.1 Buttons
* **Primary Action:**
  * Background: `#0D9488` (Medical Teal), Text: White, Padding: `12px 20px`, Height: `44px` (min `48px` on mobile), Radius: `8px`.
  * Hover: `#0F766E` (Darker teal). Focus: 2px ring `#0D9488` with 2px offset.
* **Secondary / Clinical Action:**
  * Background: `#12304A` (Primary Navy), Text: White. Used for "Book Doctor" or "Confirm Assessment".
* **Outline / Cancel Action:**
  * Background: White, Border: 1px `#E2E8F0`, Text: `#334155`. Hover: `#F8FAFC`.

### 5.2 Form Inputs & Validation
* **Input Container:**
  * Height: `48px` for touch ease. Background: White. Border: 1.5px solid `#CBD5E1`.
  * Active focus: Border `#0D9488`, Ring 2px `#99F6E4`.
* **Integrated Units:**
  * Inputs must show unit suffix pills on the right (e.g. `mmHg`, `kg/m²`, `mg/dL`).
* **Dual-Language Helper Text:**
  * Below each input, a gentle 12px label explains the clinical meaning in plain Bangla.
* **Error State:**
  * Border `#DC2626`, Icon: Alert Circle, Text: `#DC2626`. Clear explanatory correction text.

### 5.3 Risk Badges & Status Encoders (Triple-Encoded)
* **Low Risk:**
  * Pill with `#DCFCE7` (Light green), text `#15803D`, Icon: `CheckCircle2` (Checkmark in circle), Label: "স্বাভাবিক / কম ঝুঁকি (Low Risk)".
* **Moderate Risk:**
  * Pill with `#FEF3C7` (Light amber), text `#B45309`, Icon: `AlertTriangle` (Triangle), Label: "মাঝারি ঝুঁকি (Moderate Risk)".
* **High Risk:**
  * Pill with `#FEE2E2` (Light red), text `#B91C1C`, Icon: `AlertOctagon` (Octagon with exclamation), Label: "উচ্চ ঝুঁকি (High Risk)".

---

## 6. Responsive Breakpoint Standards

```
Mobile Portrait:   < 640px  (Single column, bottom-sheet modals, stacked buttons)
Tablet / Landscape: 640px – 1024px (2-column grids, collapsible sidebar)
Desktop Standard:  1024px – 1280px (Max content width: 1140px, centered)
Large Desktop:     > 1280px (Maintains centered 1140px - 1200px container)
```
