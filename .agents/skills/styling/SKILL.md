# Skill: Strict Tailwind CSS v4 Styling & Theme Separation

This document defines the strict visual design tokens, custom color mapping parameters, typography rules, and contextual dark mode restrictions for the `vilamuzz-yota-frontend` project. AI agents must strictly build interface layouts conforming to these constraints.

---

## 1. Custom Core Design Tokens (Tailwind v4 `@theme`)

Our project leverages custom styling variables defined via the native Tailwind v4 `@theme` configuration layer. AI agents must exclusively prioritize these specific variables over general Tailwind defaults for branding elements.

### A. Branding Color Tokens
- **Primary Accent 200:** `var(--color-primary-200)` $\rightarrow$ `#0eb95b` (Lighter accents, hover states)
- **Primary Accent 300:** `var(--color-primary-300)` $\rightarrow$ `#0e733b` (Base light variant, hover states, accents)
- **Primary Accent 400:** `var(--color-primary-400)` $\rightarrow$ `#0b5c2f` (Standard active elements, links, primary text weights)
- **Primary Accent 500:** `var(--color-primary-500)` $\rightarrow$ `#062e18` (Deep contrast components, heavy headers)
- **System Danger 500:** `var(--color-danger-500)`  $\rightarrow$ `#f43f5e` (Destructive action button elements, validation errors)

```text
Class References: 
- bg-primary-300 | text-primary-400 | border-primary-500
- bg-danger-500  | text-danger-500

```

### B. Font Families

* **System Interface Text:** `font-plus-jakarta-sans` (Plus Jakarta Sans Display) $\rightarrow$ Used for tables, analytical numbers, layouts, dashboard navigation items.
* **Headings & Core Copy:** `font-poppins` (Poppins) $\rightarrow$ Used for major cards, titles, headers, authentication layouts.

---

## 2. Contextual Dark Theme Strategy (Dashboard Only)

Our theme engine utilizes a custom variant configuration setup where dark utilities are resolved cleanly via class selectors added onto layout scopes:

```css
@custom-variant dark (&:where(.dark, .dark *));

```

### ⚠️ Scope Isolation Rule

* **Public Views Layer:** Dark utilities are **strictly prohibited** inside public-facing layout elements (`src/pages/public/`). Public sections must remain consistently light.
* **Dashboard Views Layer:** Dark mode rules are exclusively valid inside dashboard templates (`src/pages/dashboard/`), managed dynamically via the state controlled inside the custom `useTheme` hook mapping a `.dark` class directly onto the dashboard layout or structural `<body>` frame wrapper.

### Component Styling Blueprint

When assembling dashboard modules, write explicit paired variants ensuring seamless adaptive visibility:

```vue
<!-- src/components/molecules/SubscriptionInfo.vue -->
<template>
  <div class="p-6 rounded-xl border font-plus-jakarta-sans transition-colors duration-200 bg-white border-slate-200 text-slate-800 dark:bg-slate-900 dark:border-slate-800 dark:text-slate-100">
    <h4 class="font-poppins text-lg font-medium text-primary-400 dark:text-primary-300 mb-1">
      Detail Langganan Aktif
    </h4>
    <p class="text-sm opacity-80 mb-4">
      Kelola status program sosial foundation secara berkala di sini.
    </p>
    
    <div class="flex items-center gap-2">
      <span class="inline-block w-2 h-2 rounded-full bg-primary-300 animate-pulse" />
      <span class="text-xs font-semibold uppercase tracking-wider text-primary-400 dark:text-primary-300">
        Sinkronisasi Aktif
      </span>
    </div>
  </div>
</template>

```

---

## 3. Component Assembly Layout Guidelines

* **Focus Control Rings:** Forms and input items must feature explicit, accessible input rings pointing to our primary tokens: `focus:ring-2 focus:ring-primary-300 focus:outline-none`.
* **Consistent Rounded Boundaries:** Avoid mixing arbitrary roundings. Use `rounded-lg` for form entry fields and `rounded-xl` for interactive feature display cards.

---

## 4. ❌ FORBIDDEN AI ANTI-PATTERNS (DO NOT GENERATE)

1. **Rogue CSS Properties:** Do not write vanilla CSS inside `<style>` tags or introduce third-party style modules. All visual presentations must be handled directly via native utility utility classes.
2. **Standard Color Defaulting:** Do not utilize default `bg-green-600`, `bg-emerald-500`, or `text-red-500` for core action components. Substitute them with the configured project theme primitives: `bg-primary-400` or `bg-danger-500`.
3. **Public Dark Variants:** Do not attach `dark:` prefixes onto components explicitly loaded inside public paths (e.g., `AboutPage.vue`, `HomePage.vue`).
4. **Arbitrary Pixel Declarations:** Do not generate unmapped absolute size flags (e.g., `w-[321px]` or `p-[19px]`) unless matching an explicit, specific pixel matrix instruction. Trust standard layout scaling constraints (`w-full`, `p-4`).

```