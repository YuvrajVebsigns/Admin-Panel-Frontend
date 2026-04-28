# Core Media Admin Frontend

A robust, production-ready Next.js 16 (App Router) administration dashboard architecture.

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Styling**: Tailwind CSS v4, `clsx`, `tailwind-merge`
- **State Management**: Zustand (Global state), TanStack React Query (Server state)
- **Language**: TypeScript

---

## Project Structure & Architecture

The application is structured following feature-based modules and strict SOLID principles to ensure maintainability and separation of concerns.

```text
src/
 ├── app/             # Next.js App Router (pages, layouts, error, loading)
 ├── components/      # Reusable UI components
 ├── modules/         # Feature-based domains (e.g., /auth, /users)
 ├── services/        # API abstractions (apiFetch, auth.service)
 ├── hooks/           # Reusable React hooks (useAuth, useDebounce)
 ├── store/           # Zustand global state stores (auth.store)
 ├── lib/             # Utility functions (cn for Tailwind)
 ├── types/           # TypeScript interfaces and models
 ├── constants/       # Global constants (API routes, app configs)
 └── providers/       # Global React Context providers (QueryProvider)
```

---

## Core Principles

1. **No API calls in UI components**: All data fetching must be handled by `services/` and consumed via custom hooks or Server Components.
2. **Predictable State**: Use TanStack Query for server state (caching, refetching) and Zustand for local/global client state.
3. **Robust Error Handling**: Utilize the centralized `apiFetch` wrapper alongside Next.js global `error.tsx` and `not-found.tsx` boundaries.
4. **Strict Security**: The Next.js Edge proxy (`src/proxy.ts`) protects authenticated routes globally.

---

## 🚀 How to Use the API Fetcher

The application utilizes a centralized `apiFetch` wrapper located in `src/services/apiFetch.ts`. It automatically attaches the base URL, parses JSON responses, includes credentials for cookies, and centrally handles generic `ApiError` throwing.

### Step 1: Define endpoints in `constants/api.ts`

```typescript
export const API_ENDPOINTS = {
  USERS: {
    BASE: '/users',
    BY_ID: (id: string) => `/users/${id}`,
  },
} as const;
```

### Step 2: Create a service in `services/`

Create a service file to encapsulate the API request logic.

```typescript
// src/services/user.service.ts
import { apiFetch } from './apiFetch';
import { API_ENDPOINTS } from '@/constants/api';
import { User } from '@/types/user.types';

export const userService = {
  async getUsers(): Promise<User[]> {
    return apiFetch<User[]>(API_ENDPOINTS.USERS.BASE, {
      method: 'GET',
      // requireAuth: true (default) -> sends credentials
    });
  },
};
```

### Step 3: Consume in a Hook (TanStack Query)

Always fetch data through TanStack Query on the client to get caching, retries, and loading states for free.

```typescript
// src/hooks/useUsers.ts
'use client';

import { useQuery } from '@tanstack/react-query';
import { userService } from '@/services/user.service';

export function useUsers() {
  return useQuery({
    queryKey: ['users'],
    queryFn: () => userService.getUsers(),
  });
}
```

### Step 4: Use in a Component

```tsx
'use client';

import { useUsers } from '@/hooks/useUsers';

export function UserList() {
  const { data: users, isLoading, error } = useUsers();

  if (isLoading) return <p>Loading users...</p>;
  if (error) return <p>Error loading users: {error.message}</p>;

  return (
    <ul>
      {users?.map((user) => (
        <li key={user.id}>{user.name}</li>
      ))}
    </ul>
  );
}
```

---

---

## Code Quality & Enforcement

This project enforces strict code quality standards to maintain a production-ready codebase. The build will **fail** if any of these standards are not met.

### 🛡️ Strict Quality Rules

1.  **No `any` Types**: The use of `any` is strictly prohibited. Use `unknown` or define specific interfaces/types.
2.  **No Console Logs**: `console.log` and `console.error` are not allowed in production code. Use a proper logging service if needed.
3.  **Explicit Equality**: Always use `===` and `!==` (`eqeqeq` rule).
4.  **Prettier Formatting**: All code must follow the project's Prettier configuration.
5.  **Strict TypeScript**: `noImplicitAny` and `noUncheckedIndexedAccess` are enabled in `tsconfig.json`.

### ⚙️ Automated Enforcement

- **Pre-commit Hooks**: Husky and `lint-staged` run `eslint --fix` and `prettier --write` on all staged files automatically before every commit.
- **Build-time Validation**: The `yarn build` command runs a full check pipeline:
  ```bash
  yarn lint && yarn type-check && yarn format:check && next build
  ```

---

## 🛠️ Development Commands

| Command             | Description                                            |
| ------------------- | ------------------------------------------------------ |
| `yarn dev`          | Starts the development server                          |
| `yarn lint`         | Runs ESLint to check for code quality issues           |
| `yarn format`       | Automatically formats all files using Prettier         |
| `yarn format:check` | Verifies that all files are correctly formatted        |
| `yarn type-check`   | Runs `tsc` to verify TypeScript type safety            |
| `yarn build`        | Runs all quality checks and creates a production build |
| `yarn start`        | Starts the production server                           |

---

## Setup & Running

1. **Install Dependencies**

   ```bash
   yarn install
   ```

2. **Start Development Server**

   ```bash
   yarn dev
   ```

3. **Production Build**
   ```bash
   yarn build
   yarn start
   ```
