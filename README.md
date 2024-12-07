# Project Name

## Table of Contents

- [Overview](#overview)
- [Project Structure](#project-structure)
- [Critical Project Rules](#critical-project-rules)
- [Technical Stack](#technical-stack)
- [Development Setup](#development-setup)
- [Code Review Checklist](#code-review-checklist)
- [Troubleshooting](#troubleshooting)
- [Support](#support)

## Overview

Next.js 15 application using React Server Components, prioritizing server-side rendering, type safety, and maintainable code patterns.

## Project Structure

```
project-root/
├── actions/               # Server actions
├── app/
│   ├── api/              # API routes
│   ├── components/       # Shared components
│   │   ├── server/      # Server Components
│   │   └── client/      # Client Components
│   └── [feature]/       # Feature routes
├── lib/                  # Utilities and types
└── prisma/               # Database schema
```

## Critical Project Rules

### 1. Style and Code Preservation Rule (HIGHEST PRIORITY)

#### Style Preservation

- Never modify existing CSS classes, Tailwind configs, component styles, tokens, or theme values
- For changes:
  1. Document needed modifications
  2. Explain necessity
  3. Submit proposal
  4. Await approval
  5. Document changes

#### Code Preservation

- Existing code modification criteria:

  - Bug fixes
  - Security updates
  - Performance improvements
  - Approved feature enhancements

- Code modification process:
  1. Document current implementation
  2. Demonstrate issue/need
  3. Create isolated test case
  4. Submit change proposal
  5. Implement with backward compatibility
  6. Add deprecation notices when needed

### 2. REM Units Rule

Use REM units via Tailwind classes except for padding, borders, shadows:

```typescript
// Correct
<div className="w-64 h-32 text-lg mt-8 rounded-xl p-4 border">

// Incorrect
<div className="w-[256px] h-[128px] text-[16px]">
```

### 3. Server-Side Validation Rule

Use Zod's safeParseAsync for all validations:

```typescript
const schema = z.object({}).strict();
const result = await schema.safeParseAsync(data);
```

### 4. Server Components Rule

Default to Server Components; use Client Components only when necessary:

```typescript
// Default approach
export default function Component() {
  return <ServerComponent />;
}

// Only when needed
("use client");
export default function InteractiveComponent() {
  // Client-side logic
}
```

### 5. Route Parameters Rule

Await all searchParams and params in server components:

```typescript
export default async function Page({ params, searchParams }) {
  const category = await params.category;
  const sort = await searchParams.sort;
}
```

### 6. UI Components Rule

Use shadcn UI components as primary building blocks.

### 7. Development Environment Rule

Standardized configurations for formatting, styles, TypeScript.

### 8. Server Action Error Handling Rule

Handle errors gracefully with structured responses:

```typescript
type ServerResponse<T> = {
  success: boolean;
  data?: T;
  message?: string;
  errors?: Record<string, string[]>;
};
```

### 9. Component Reusability Rule

#### Design Principles

- Extract common patterns into shared components
- Build for 80% use cases
- Single responsibility focus
- Prefer composition over configuration

#### Implementation Pattern

```typescript
interface Props {
  // Required props
  data: DataType;
  // Optional props with defaults
  variant?: "default" | "compact" = "default";
  className?: string;
}

export function ReusableComponent({
  data,
  variant = "default",
  className,
}: Props) {
  // Use composition pattern
  return (
    <div className={cn("base-styles", variantStyles[variant], className)}>
      <ComponentA />
      <ComponentB />
    </div>
  );
}

// Usage
<ReusableComponent data={data} variant="compact" className="custom-styles" />;
```

## Technical Stack

- Core: Next.js 15, React Server Components, TypeScript
- Data: PostgreSQL, Prisma
- UI: shadcn UI, Tailwind CSS, Sonner
- Auth/Validation: NextAuth, Zod

## Development Setup

Prerequisites:

- Node.js (LTS)
- Docker Desktop
- VSCode
- Git

Setup steps:

1. Clone and install
2. Set environment variables
3. Start PostgreSQL
4. Initialize Prisma
5. Configure VSCode

## Code Review Checklist

- REM units usage
- Awaited route parameters
- Server Component usage
- Component reusability
- Data fetching placement
- Suspense boundaries
- UI component consistency
- Validation implementation
- Style preservation
- Error handling
- Documentation updates

## Troubleshooting

Common issues and solutions:

- Environment setup problems
- Build/deployment errors
- Framework limitations
- Component debugging
- Style conflicts
- Server/client state issues

## Support

1. Issue tracker
2. Team chat
3. Project maintainers
