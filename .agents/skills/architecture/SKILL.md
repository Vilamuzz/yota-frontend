# Skill: Vue 3 Clean Frontend Architecture (Vite + TS + TailwindCSS v4)

This document enforces the structural rules, directory patterns, and layer separations within the `yota-frontend` workspace. AI tools must match these precise definitions when building components, composables, services, schemas, or types.

---

## 1. Tech Stack

| Tool | Version | Notes |
|---|---|---|
| **Vue** | ^3.5 | `<script setup lang="ts">` only |
| **Vite** | ^7 | Build tool & dev server |
| **TypeScript** | ~5.9 | Strict mode, no `any` |
| **TailwindCSS** | ^4 (via `@tailwindcss/vite`) | Utility-first styling |
| **Pinia** | ^3 | Global state management |
| **TanStack Vue Query** | ^5 | Server state (queries & mutations) |
| **Axios** | ^1 | HTTP client, wrapped in `src/utils/api.ts` |
| **Zod** | ^4 | Form validation schemas |
| **Vue Router** | ^4 | Route management |
| **Lucide Vue Next** | latest | Icon library |
| **Motion V** | ^2 | Animation library |

---

## 2. Directory Blueprint

```text
src/
├── assets/          # Static assets (images, fonts)
├── components/
│   ├── atoms/       # Single-responsibility base UI elements (BaseButton, BaseInput, BaseBadge)
│   ├── molecules/   # Simple groupings of atoms (cards, field groups, modal wrappers)
│   ├── organisms/   # Complex, state-aware structural blocks (tables, dynamic forms, sidebars)
│   └── ui/          # Global layout fixtures (toast, loading overlays, global modals)
├── composables/     # Feature-scoped hooks partitioned by module namespace (e.g., composables/auth/, composables/donationProgram/)
├── const/           # Application constants
│   ├── api.ts       # Centralized API endpoint map (the `API` object)
│   ├── navigation.ts
│   └── roles.ts
├── layouts/         # Full-page layout wrappers (AuthLayout, DashboardLayout, PublicLayout)
├── pages/           # View route assemblies grouped by access context (auth/, dashboard/, public/)
├── router/          # Vue Router configuration (index.ts + routes/)
├── schemas/         # Zod validation schemas (*.schema.ts)
├── services/        # HTTP API request functions (*.service.ts)
├── stores/          # Pinia global stores (auth.ts, foundationProfile.ts)
├── types/           # TypeScript type & interface definitions (*.ts)
├── utils/           # Shared utility helpers (api.ts, format.ts, error.ts, etc.)
└── App.vue
```

---

## 3. Unidirectional Data Flow

```text
[pages/] ──> [composables/] ──> [services/] ──> [utils/api.ts (Axios)]
                  │
                  ├──> [stores/] (Pinia — for auth/global state)
                  └──> [schemas/] (Zod — for form validation)
```

### A. Pages Layer (`src/pages/`)

- **Responsibilities:** Assembling layouts + composable-driven data. Pages are route entry points only.
- **Grouped by:** `auth/`, `dashboard/`, `public/`
- **Constraint:** No direct HTTP calls. All backend interactions go through a composable.

### B. Composables Layer (`src/composables/`)

- **Responsibilities:** Managing reactive state (`ref`, `computed`), TanStack Query (`useQuery`, `useMutation`), passing parameters to services, extracting `validationErrors` from API responses.
- **Naming:** `use<Domain><Action>.ts` — e.g., `useDonationProgramCreate.ts`, `useAuthLogin.ts`.
- **Structure:** Each domain has its own subfolder with an `index.ts` barrel file (e.g., `composables/auth/index.ts`).
- **Constraint:** Must use `useMutation` / `useQuery` from TanStack Vue Query for all async data interactions. Raw `ref` + manual `isLoading` booleans are only acceptable when TanStack Query is not suitable (e.g., navigation callbacks).

### C. Services Layer (`src/services/`)

- **Responsibilities:** Defining all HTTP request functions using the shared `api` Axios instance from `@/utils/api`.
- **Naming:** `<domain>.service.ts` — e.g., `auth.service.ts`, `donationProgram.service.ts`.
- **Pattern:** Export a plain object with async methods, each typed with request/response interfaces from `@/types/`.
- **Endpoint references:** Always import endpoint strings from `@/const/api` (`API` constant). Never hardcode URL strings.

### D. Schemas Layer (`src/schemas/`)

- **Responsibilities:** Defining Zod schemas for form validation.
- **Naming:** `<domain>.schema.ts` — e.g., `auth.schema.ts`.
- **Pattern:** Export both the schema (e.g., `loginSchema`) and its inferred type (e.g., `export type LoginFormData = z.infer<typeof loginSchema>`).

### E. Types Layer (`src/types/`)

- **Responsibilities:** All TypeScript `interface` and `type` definitions for API request/response models.
- **Naming:** `<domain>.ts` — e.g., `auth.ts`, `donationProgram.ts`.
- **Shared types:** `response.ts` holds `ApiResponse<T>` and `ApiError`.

### F. Stores Layer (`src/stores/`)

- **Responsibilities:** Global persistent application state — primarily auth state and foundation profile.
- **Constraint:** Only use Pinia stores for data that is truly global and shared across unrelated components. Feature-specific state belongs in composables.

---

## 4. Naming Conventions

| Layer | Pattern | Example |
|---|---|---|
| Page | `<Feature>Page.vue` | `LoginPage.vue` |
| Layout | `<Name>Layout.vue` | `DashboardLayout.vue` |
| Composable | `use<Domain><Action>.ts` | `useDonationProgramCreate.ts` |
| Service | `<domain>.service.ts` | `donationProgram.service.ts` |
| Schema | `<domain>.schema.ts` | `donationProgram.schema.ts` |
| Type file | `<domain>.ts` | `donationProgram.ts` |
| Store | `<domain>.ts` | `auth.ts` |
| Atom component | `Base<Name>.vue` | `BaseButton.vue`, `BaseInput.vue` |
| Molecule component | `<Name>Card.vue` / `<Name>Form.vue` | `DonationCard.vue` |
| Organism component | `<Name>Table.vue` / `<Name>Section.vue` | `DonationProgramTable.vue` |

---

## 5. Strict Component Syntax & Structural Constraints

All Vue SFCs must use `<script setup lang="ts">`. No Options API.

### Component Blueprint

```vue
<!-- src/components/molecules/DonationCard.vue -->
<script setup lang="ts">
import { computed } from 'vue'

// 1. Strict interface definitions — always inline with the component
interface CardProps {
  title: string
  amountNeeded: number
  amountRaised: number
  isClosed?: boolean
}

// 2. Type-safe compiler macros
const props = withDefaults(defineProps<CardProps>(), {
  isClosed: false,
})

const emit = defineEmits<{
  (e: 'select'): void
}>()

// 3. Computed state
const progressPercentage = computed(() => {
  if (props.amountNeeded === 0) return 0
  return Math.min((props.amountRaised / props.amountNeeded) * 100, 100)
})
</script>

<template>
  <div class="border rounded-lg p-4 shadow-sm bg-white dark:bg-slate-800">
    <h3 class="text-lg font-semibold text-slate-900 dark:text-white mb-2">
      {{ props.title }}
    </h3>

    <div class="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full mb-4">
      <div
        class="bg-emerald-500 h-2 rounded-full transition-all duration-300"
        :style="{ width: `${progressPercentage}%` }"
      />
    </div>

    <button
      :disabled="props.isClosed"
      class="w-full py-2 px-4 rounded font-medium text-white bg-emerald-500 hover:bg-emerald-600 disabled:bg-slate-300 transition-colors"
      @click="emit('select')"
    >
      {{ props.isClosed ? 'Donasi Ditutup' : 'Donasi Sekarang' }}
    </button>
  </div>
</template>
```

### Service Blueprint

```ts
// src/services/donationProgram.service.ts
import { api } from '@/utils/api'
import { API } from '@/const/api'
import type { CreateDonationProgramRequest, DonationProgram } from '@/types/donationProgram'
import type { ApiResponse } from '@/types/response'

export const donationProgramService = {
  createDonationProgram: async (data: CreateDonationProgramRequest): Promise<ApiResponse<DonationProgram>> => {
    const response = await api.post<ApiResponse<DonationProgram>>(API.DONATION_PROGRAMS_ADMIN, data)
    return response.data
  },
}
```

### Composable Blueprint (TanStack Vue Query)

```ts
// src/composables/donationProgram/useDonationProgramCreate.ts
import { computed } from 'vue'
import { useMutation, useQueryClient } from '@tanstack/vue-query'
import { donationProgramService } from '@/services/donationProgram.service'
import type { CreateDonationProgramRequest, DonationProgram } from '@/types/donationProgram'
import type { ApiError, ApiResponse } from '@/types/response'

export const useDonationProgramCreate = () => {
  const queryClient = useQueryClient()

  const createMutation = useMutation<ApiResponse<DonationProgram>, ApiError, CreateDonationProgramRequest>({
    mutationFn: (data) => donationProgramService.createDonationProgram(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['donationPrograms'] })
    },
  })

  // Extracts server-side field validation errors from ApiError response
  const validationErrors = computed(
    () => createMutation.error.value?.response?.data?.validation ?? null,
  )

  return { createMutation, validationErrors }
}
```

---

## 6. Path Aliases

The `@` alias resolves to `src/`. Always use `@/` for internal imports.

```ts
// Correct
import { authService } from '@/services/auth.service'
import type { LoginRequest } from '@/types/auth'
import { API } from '@/const/api'

// Wrong
import { authService } from '../../services/auth.service'
```

---

## 7. FORBIDDEN AI ANTI-PATTERNS (DO NOT GENERATE)

1. **Options API:** Never use `export default defineComponent({ data(), methods{} })`. Always use `<script setup lang="ts">`.
2. **Inline HTTP Calls:** Never put raw `axios`, `fetch`, or `api.get/post` directly inside a Vue SFC or composable. All HTTP calls live in `src/services/*.service.ts`.
3. **Hardcoded Endpoint URLs:** Never write URL strings directly in service files. Always reference the `API` constant from `@/const/api`.
4. **`any` Type:** Never use TypeScript `any`. Use explicit types from `@/types/`, or `unknown` + narrowing when truly necessary.
5. **Atomic Mixing:** Do not put composite multi-element UI inside `components/atoms/`. Atoms are single-element primitives (e.g., `BaseButton`, `BaseInput`). Larger compositions belong in `molecules/` or `organisms/`.
6. **Raw `ref` for server data:** Do not manage API loading/error/data state manually with `ref`. Use `useQuery` or `useMutation` from TanStack Vue Query.
7. **Relative imports across layers:** Never use `../../` to cross layer boundaries. Always use `@/` alias.
8. **Styling without Tailwind:** Do not use inline styles (`style=""`) or `<style>` blocks for layout/theming. Use Tailwind v4 utility classes. Scoped `<style>` blocks are only acceptable for non-Tailwind-expressible CSS (e.g., `will-change`, complex keyframe animations).